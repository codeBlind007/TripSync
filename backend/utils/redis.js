import { Redis } from "@upstash/redis";
import dotenv from "dotenv";
dotenv.config();

if (
  !process.env.UPSTASH_REDIS_REST_URL ||
  !process.env.UPSTASH_REDIS_REST_TOKEN
) {
  console.warn(
    "Warning: UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN not set",
  );
}

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// Test connection on startup
redis
  .ping()
  .then(() => console.log("Redis connected"))
  .catch((err) => console.error("Redis connection error:", err));
