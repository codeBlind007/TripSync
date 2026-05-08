import Redis from "ioredis";
import { messageQueue } from "../queues/messageQueue.js";
import { redis } from "../utils/redis.js";

const normalizeRedisMessage = (value) => {
  // Upstash may return already-deserialized objects for list values.
  if (value && typeof value === "object") {
    return value;
  }

  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return { raw: value };
    }
  }

  return { raw: value };
};

export const socketController = (io) => {
  io.on("connection", (socket) => {
    console.log("User connected");
    console.log("Id:", socket.id);

    // Emit a welcome message to the new socket
    socket.emit("welcome", { message: "Welcome to the TripSync" });

    // Handle message events
    socket.on("message", async (data) => {
      console.log(data);
      const { tripId, sender, text } = data;

      io.to(tripId).emit("recieve-msg", {
        text,
        tripId,
        sender,
      });

      const redisKey = `trip:${tripId}:messages`;

      const payload = JSON.stringify({
        tripId,
        sender: {
          _id: sender._id,
          name: sender.name,
          email: sender.email,
        },
        text,
        timestamp: Date.now(),
      });

      await redis.rpush(redisKey, payload);

      const messages = await redis.lrange(redisKey, 0, -1);
      const parsed = messages.map((m) => normalizeRedisMessage(m));

      console.log("msg from redis: ", parsed);

      const ttl = await redis.ttl(redisKey);
      if (ttl === -1) {
        await redis.expire(redisKey, 3600);
      }
      await messageQueue.retryJobs({ state: "failed" });
      await messageQueue.add(
        "flush-tripRoom-messages",
        { tripId },
        {
          jobId: `trip-${tripId}`,
          removeOnComplete: true,
        },
      );

      const counts = await messageQueue.getJobCounts();
      console.log(counts);

      const failedJobs = await messageQueue.getFailed();

      for (const job of failedJobs) {
        console.log({
          id: job.id,
          name: job.name,
          data: job.data,
          failedReason: job.failedReason,
        });
      }

      const jobs = await messageQueue.getWaiting();
      jobs.forEach((job) => {
        console.log(job.id, job.name, job.data);
      });
    });

    // Handle joining a room
    socket.on("join-room", (room) => {
      socket.join(room);
      console.log(`${socket.id} joined room: ${room}`);
    });

    // Optional: Handle disconnection
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
};
