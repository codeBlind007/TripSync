// config/bullmqRedis.js

import IORedis from "ioredis";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, "../.env") });

export const connection = new IORedis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
});
