import { redis } from "../utils/redis.js";
import {
  ensureMessageFlushJob,
  touchMessageKeyTtl,
  tripMessageRedisKeys,
} from "../utils/chatRedis.js";

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

        if (!tripId || !sender?._id || !text) {
          return;
        }

        io.to(tripId).emit("receive-msg", {
          text,
          tripId,
          sender,
        });

        const { pending: redisKey } = tripMessageRedisKeys(tripId);

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
        await touchMessageKeyTtl(redis, redisKey);
        await ensureMessageFlushJob(tripId);

        console.log(`Cached message and scheduled flush for trip ${tripId}`);
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
