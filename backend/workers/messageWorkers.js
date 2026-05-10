import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, "../.env") });

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

console.log("worker started");

new Worker(
  "messageQueue",
  async (job) => {
    const { tripId } = job.data;

    console.log("Processing trip:", tripId);

    const redisKey = `trip:${tripId}:messages`;

    const messages = await connection.lrange(redisKey, 0, -1);

    await connection.del(redisKey);

    if (!messages.length) return;

    const docs = messages
      .map((m) => {
        const parsed = parseWorkerMessage(m);

        if (!parsed) {
          return null;
        }

        const senderId =
          typeof parsed.sender === "object"
            ? parsed.sender?._id
            : parsed.sender;
        const timestampValue =
          parsed.timestamp ?? parsed.timeStamp ?? Date.now();

        console.log(parsed);
        return {
          tripId,
          sender: senderId,
          text: parsed.text,
          timestamp: new Date(timestampValue),
        };
      })
      .filter(Boolean);

    try {
      if (docs.length) {
        await Message.insertMany(docs);
        console.log(`Inserted ${docs.length} messages for trip ${tripId}`);
      } else {
        console.log(`No docs to insert for trip ${tripId}`);
      }
    } catch (err) {
      console.error("Failed to insert messages:", err, "docs:", docs);
    }
  },
  {
    connection,
    concurrency: 5,
  },
);

console.log("worker done the job");
