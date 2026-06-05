import { Queue } from "bullmq";
import { connection } from "../utils/redis.js";

export const messageQueue = new Queue("messageQueue", {
  connection,
});
