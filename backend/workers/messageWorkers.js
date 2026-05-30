import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({
  path: resolve(__dirname, "../.env"),
});

import { Worker } from "bullmq";
import Message from "../models/TripRooms.js";
import { connectDB } from "../utils/db.js";
import { connection } from "../utils/bullmqRedis.js";

const parseWorkerMessage = (value) => {
  if (value && typeof value === "object") {
    return value;
  }

  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  }

  return null;
};

await connectDB();

console.log("Worker started");

new Worker(
  "messageQueue",
  async (job) => {
    const { tripId } = job.data;

    const redisKey = `trip:${tripId}:messages`;
    const processingKey = `${redisKey}:processing`;

    console.log(`Processing trip ${tripId}`);

    try {
      const exists = await connection.exists(redisKey);

      if (!exists) {
        console.log(
          `No pending messages for trip ${tripId}`
        );
        return;
      }

      /**
       * Move current batch to processing key.
       *
       * Any new messages arriving after this point
       * will go into the original redisKey and won't
       * be lost.
       */
      await connection.rename(redisKey, processingKey);

      const messages = await connection.lrange(
        processingKey,
        0,
        -1
      );

      if (!messages.length) {
        await connection.del(processingKey);
        return;
      }

      const docs = messages
        .map((msg) => {
          const parsed = parseWorkerMessage(msg);

          if (!parsed) return null;

          return {
            tripId,
            sender:
              typeof parsed.sender === "object"
                ? parsed.sender._id
                : parsed.sender,
            text: parsed.text,
            timestamp: new Date(
              parsed.timestamp || Date.now()
            ),
          };
        })
        .filter(Boolean);

      if (!docs.length) {
        await connection.del(processingKey);
        return;
      }

      await Message.insertMany(docs);

      console.log(
        `Inserted ${docs.length} messages for trip ${tripId}`
      );

      await connection.del(processingKey);

      /**
       * IMPORTANT
       *
       * Messages may have arrived while we were
       * inserting to MongoDB.
       *
       * If so, schedule another flush.
       */
      const remaining = await connection.llen(redisKey);

      if (remaining > 0) {
        await job.queue.add(
          "flush-tripRoom-messages",
          { tripId },
          {
            jobId: `trip-${tripId}`,
            delay: 2 * 60 * 1000,
            removeOnComplete: true,
          }
        );

        console.log(
          `Rescheduled flush for ${remaining} new messages`
        );
      }
    } catch (err) {
      console.error(
        `Worker failed for trip ${tripId}:`,
        err
      );

      try {
        await connection.del(processingKey);
      } catch (_) {}
    }
  },
  {
    connection,
    concurrency: 5,
  }
);

console.log("Worker ready");