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
import { redis } from "../utils/redis.js";
import {
  ensureMessageFlushJob,
  parseStoredMessage,
  restoreProcessingMessages,
  tripMessageRedisKeys,
} from "../utils/chatRedis.js";

await connectDB();

console.log("Worker started");

new Worker(
  "messageQueue",
  async (job) => {
    const { tripId } = job.data;
    const { pending: redisKey, processing: processingKey } =
      tripMessageRedisKeys(tripId);

    console.log(`Processing trip ${tripId}`);

    try {
      const exists = await redis.exists(redisKey);

      if (!exists) {
        console.log(`No pending messages for trip ${tripId}`);
        return;
      }

      await redis.rename(redisKey, processingKey);

      const messages = await redis.lrange(processingKey, 0, -1);

      if (!messages.length) {
        await redis.del(processingKey);
        return;
      }

      const docs = messages
        .map((msg) => {
          const parsed = parseStoredMessage(msg);
          if (!parsed) return null;

          return {
            tripId,
            sender:
              typeof parsed.sender === "object"
                ? parsed.sender._id
                : parsed.sender,
            text: parsed.text,
            timestamp: new Date(parsed.timestamp || Date.now()),
          };
        })
        .filter(Boolean);

      if (!docs.length) {
        await redis.del(processingKey);
        return;
      }

      await Message.insertMany(docs);

      console.log(`Inserted ${docs.length} messages for trip ${tripId}`);

      await redis.del(processingKey);

      const remaining = await redis.llen(redisKey);

      if (remaining > 0) {
        await ensureMessageFlushJob(tripId);
        console.log(
          `Rescheduled flush for ${remaining} new messages on trip ${tripId}`,
        );
      }
    } catch (err) {
      console.error(`Worker failed for trip ${tripId}:`, err);
      await restoreProcessingMessages(redis, tripId);
      throw err;
    }
  },
  {
    connection: redis,
    concurrency: 5,
  },
);

console.log("Worker ready");
