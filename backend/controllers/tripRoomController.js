import Message from "../models/TripRooms.js";
import { redis } from "../utils/redis.js";

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

const normalizeRedisMessage = (value) => {
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

const getTripRoomMessage = async (req, res) => {
  try {
    const userId = req.auth?.userId;
    const { tripId } = req.params;
    // const { cursor, limit = 30 } = req.query;

    if (!tripId) {
      res.status(400).json({
        message: "TripId is required",
      });
    }

    const databaseMessages = await Message.find({ tripId }).populate({
      path: "sender",
      select: "name email",
    });

    const redisKey = `trip:${tripId}:messages`;
    const redisMessagesRaw = await redis.lrange(redisKey, 0, -1);
    const redisMessages = redisMessagesRaw
      .map(normalizeRedisMessage)
      .filter(Boolean)
      .map(normalizeMessage);

    const mergedMessages = [
      ...databaseMessages.map(normalizeMessage),
      ...redisMessages,
    ];
    const uniqueMessages = Array.from(
      new Map(
        mergedMessages.map((message) => {
          const senderId = message.sender?._id
            ? String(message.sender._id)
            : "";
          const timeValue = new Date(message.timestamp).getTime();
          const dedupeKey = `${senderId}|${message.text ?? message.message ?? ""}|${timeValue}`;
          return [dedupeKey, message];
        }),
      ).values(),
    ).sort(
      (first, second) =>
        new Date(first.timestamp).getTime() -
        new Date(second.timestamp).getTime(),
    );

    return res.status(200).json({
      source: "database+redis",
      messages: uniqueMessages,
    });

    // const redisKey = `trip:${tripId}:messages`;
    // if (!cursor) {
    //     const cachedMessages = await redis.lrange(redisKey, -limit, -1);
    //     console.log('Redis cached messages count:', cachedMessages.length);

    //     if (cachedMessages.length > 0) {
    //         return res.status(200).json({
    //         source: "redis",
    //         messages: cachedMessages.map(JSON.parse),
    //     });
    //   }
    // }

    // const tripObjectId = new mongoose.Types.ObjectId(tripId);
    // const query = { tripId: tripObjectId };

    // console.log('Database query before cursor:', query);
    // if (cursor) {
    //   query.createdAt = { $lt: new Date(cursor) };
    //   console.log('Database query after cursor:', query);
    // }
    // console.log('Final query:', JSON.stringify(query, null, 2));

    // const messages = await Message.find({ query })
    //   .sort({ createdAt: -1 })
    //   .limit(Number(limit))
    //   .lean();

    // console.log(messages);

    // return res.status(200).json({
    //   source: "database",
    //   messages,
    // });
  } catch (err) {
    console.error("getTripRoomMessages error:", err);
    res.status(500).json({ message: "Failed to fetch messages" });
  }
};

const tripRoomController = {
  getTripRoomMessage,
};

export default tripRoomController;
