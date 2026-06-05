import IORedis from "ioredis";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, "../.env") });
console.log("process.env.REDIS_URL: ", process.env.UPSTASH_REDIS_URL);
const redisUrl =
  process.env.UPSTASH_REDIS_URL || process.env.REDIS_URL;

if (!redisUrl) {
  console.warn(
    "Warning: UPSTASH_REDIS_URL (or REDIS_URL) is not set. Set the Upstash Redis TCP URL from your Upstash dashboard.",
  );
}

/** Single Upstash Redis connection (TCP) for cache, sockets, and BullMQ. */
export const redis = new IORedis(redisUrl, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  enableOfflineQueue: true,
  retryStrategy: (times) => Math.min(times * 50, 2000),
  reconnectOnError: (err) => err.message.includes("READONLY"),
});

/** BullMQ expects a connection named `connection`. */
export const connection = redis;

redis.on("error", (err) => {
  console.error("Redis connection error:", err);
});

redis.on("connect", () => {
  console.log("Upstash Redis connected");
});
