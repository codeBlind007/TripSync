import { messageQueue } from "../queues/messageQueue.js";

export const FLUSH_JOB_NAME = "flush-tripRoom-messages";
export const FLUSH_DELAY_MS = 2 * 60 * 1000;
export const MESSAGE_KEY_TTL_SEC = 3600;

export function tripMessageRedisKeys(tripId) {
  const pending = `trip:${tripId}:messages`;
  return {
    pending,
    processing: `${pending}:processing`,
  };
}

export function parseStoredMessage(value) {
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
}

export async function touchMessageKeyTtl(redisClient, key) {
  const ttl = await redisClient.ttl(key);
  if (ttl === -1) {
    await redisClient.expire(key, MESSAGE_KEY_TTL_SEC);
  }
}

/**
 * Schedule at most one delayed flush per trip. Re-schedules after failed jobs.
 */
export async function ensureMessageFlushJob(tripId) {
  const jobId = `trip-${tripId}`;
  const existing = await messageQueue.getJob(jobId);

  if (existing) {
    const state = await existing.getState();
    if (state === "failed") {
      await existing.remove();
    } else if (
      ["delayed", "waiting", "active", "paused"].includes(state)
    ) {
      return;
    }
  }

  await messageQueue.add(
    FLUSH_JOB_NAME,
    { tripId },
    {
      jobId,
      delay: FLUSH_DELAY_MS,
      removeOnComplete: true,
      removeOnFail: true,
    },
  );
}

/**
 * Move a failed processing batch back to the pending list so nothing is lost.
 */
export async function restoreProcessingMessages(redisClient, tripId) {
  const { pending, processing } = tripMessageRedisKeys(tripId);
  const processingExists = await redisClient.exists(processing);

  if (!processingExists) {
    return;
  }

  const pendingExists = await redisClient.exists(pending);

  if (pendingExists) {
    const batch = await redisClient.lrange(processing, 0, -1);
    if (batch.length) {
      await redisClient.rpush(pending, ...batch);
    }
    await redisClient.del(processing);
  } else {
    await redisClient.rename(processing, pending);
  }
}

export async function readPendingRedisMessages(redisClient, tripId) {
  const { pending, processing } = tripMessageRedisKeys(tripId);
  const [pendingRaw, processingRaw] = await Promise.all([
    redisClient.lrange(pending, 0, -1),
    redisClient.lrange(processing, 0, -1),
  ]);

  return [...pendingRaw, ...processingRaw];
}
