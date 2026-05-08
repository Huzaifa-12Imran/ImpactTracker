import Redis from "ioredis";

let redis: Redis | null = null;

export function getRedis(): Redis {
  if (redis) return redis;

  const rawUrl = process.env.REDIS_URL ?? "redis://localhost:6379";
  // Upstash only supports DB 0. Strip any trailing /<number> from the URL.
  const url = rawUrl.replace(/\/\d+$/, "");

  redis = new Redis(url, {
    maxRetriesPerRequest: null, // Required for BullMQ
    enableReadyCheck: false,
    db: 0, // Upstash only supports DB 0
    retryStrategy: (times: number) => {
      if (times > 10) return null; // Stop retrying after 10 attempts
      return Math.min(times * 200, 5000);
    },
  });

  redis.on("error", (err) => {
    console.error("[Redis] Connection error:", err.message);
  });

  redis.on("connect", () => {
    console.log("[Redis] Connected");
  });

  return redis;
}

export async function closeRedis(): Promise<void> {
  if (redis) {
    await redis.quit();
    redis = null;
  }
}
