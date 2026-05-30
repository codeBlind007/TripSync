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

    socket.emit("welcome", {
      message: "Welcome to TripSync",
    });

    socket.on("message", async (data) => {
      try {
        const { tripId, sender, text } = data;

        // Real-time delivery
        io.to(tripId).emit("receive-msg", {
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

        // Store in Redis
        await redis.rpush(redisKey, payload);

        // Optional TTL
        const ttl = await redis.ttl(redisKey);

        if (ttl === -1) {
          await redis.expire(redisKey, 3600);
        }

        // Create only ONE delayed flush job per trip
        const jobId = `trip-${tripId}`;

        const existingJob = await messageQueue.getJob(jobId);

        if (!existingJob) {
          await messageQueue.add(
            "flush-tripRoom-messages",
            { tripId },
            {
              jobId,
              delay: 2 * 60 * 1000, // 2 minutes
              removeOnComplete: true,
              removeOnFail: false,
            }
          );

          console.log(
            `Scheduled flush job for trip ${tripId}`
          );
        }
      } catch (err) {
        console.error("Socket message error:", err);
      }
    });

    socket.on("join-room", (room) => {
      socket.join(room);
      console.log(`${socket.id} joined room: ${room}`);
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
};
