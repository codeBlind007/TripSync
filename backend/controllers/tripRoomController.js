import Message from "../models/TripRooms.js";
import { redis } from "../utils/redis.js";
import {
  parseStoredMessage,
  readPendingRedisMessages,
} from "../utils/chatRedis.js";

const normalizeMessage = (message) => {
  const sender =
    message.sender && typeof message.sender === "object"
      ? message.sender
      : { _id: String(message.sender || ""), name: "", email: "" };

  const timestampValue =
    message.timestamp ?? message.timeStamp ?? message.createdAt ?? Date.now();
  const text = message.text ?? message.message ?? "";

  return {
    ...message,
    sender,
    text,
    timestamp: new Date(timestampValue),
    createdAt: message.createdAt
      ? new Date(message.createdAt)
      : new Date(timestampValue),
  };
};

const dedupeMessages = (messages) =>
  Array.from(
    new Map(
      messages.map((message) => {
        const senderId = message.sender?._id
          ? String(message.sender._id)
          : "";
        const timeValue = new Date(message.timestamp).getTime();
        const dedupeKey = `${senderId}|${message.text ?? ""}|${timeValue}`;
        return [dedupeKey, message];
      }),
    ).values(),
  ).sort(
    (first, second) =>
      new Date(first.timestamp).getTime() -
      new Date(second.timestamp).getTime(),
  );

const getTripRoomMessage = async (req, res) => {
  try {
    const { tripId } = req.params;

    if (!tripId) {
      return res.status(400).json({
        message: "TripId is required",
      });
    }

    const [databaseMessages, redisMessagesRaw] = await Promise.all([
      Message.find({ tripId }).populate({
        path: "sender",
        select: "name email",
      }),
      readPendingRedisMessages(redis, tripId),
    ]);

    const redisMessages = redisMessagesRaw
      .map(parseStoredMessage)
      .filter(Boolean)
      .map(normalizeMessage);

    const uniqueMessages = dedupeMessages([
      ...databaseMessages.map(normalizeMessage),
      ...redisMessages,
    ]);

    return res.status(200).json({
      source: "database+redis",
      messages: uniqueMessages,
    });
  } catch (err) {
    console.error("getTripRoomMessages error:", err);
    return res.status(500).json({ message: "Failed to fetch messages" });
  }
};

const tripRoomController = {
  getTripRoomMessage,
};

export default tripRoomController;
