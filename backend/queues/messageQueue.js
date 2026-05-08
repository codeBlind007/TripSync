import {Queue} from "bullmq";
import { connection } from "../utils/bullmqRedis.js";


export const messageQueue = new Queue("messageQueue", {
  connection,
});