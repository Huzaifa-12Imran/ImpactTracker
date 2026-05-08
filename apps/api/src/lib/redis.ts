import Redis from "ioredis";

let redis: Redis | null = null;

export function getRedis(): Redis {
  if (redis) return redis;

  const rawUrl = process.env.REDIS_URL ?? "redis://localhost:6379";

  // Log the URL (masking the password) so we can see what's being used
  const maskedUrl = rawUrl.replace(/:([^@]+)@/, ":***@");
  console.log(`[Redis] Connecting to: ${maskedUrl}`);

  // Parse the URL into explicit options so we can force db:0.
  // Upstash only supports DB 0; passing it via URL path is unreliable.
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    // Fallback: connect with raw URL if parsing fails
    redis = new Redis(rawUrl, { maxRetriesPerRequest: null, enableReadyCheck: false });
    return redis;
  }

  const isTls = parsed.protocol === "rediss:";
  const password = parsed.password ? decodeURIComponent(parsed.password) : undefined;
  const username = parsed.username ? decodeURIComponent(parsed.username) : undefined;

  redis = new Redis({
    host: parsed.hostname,
    port: parseInt(parsed.port || (isTls ? "6380" : "6379"), 10),
    username,
    password,
    db: 0,  // Always use DB 0 — Upstash only supports this
    tls: isTls ? {} : undefined,
    maxRetriesPerRequest: null, // Required for BullMQ
    enableReadyCheck: false,
    retryStrategy: (times: number) => {
      if (times > 10) return null;
      return Math.min(times * 200, 5000);
    },
  });

  redis.on("error", (err) => {
    console.error("[Redis] Connection error:", err.message);
  });

  redis.on("connect", () => {
    console.log("[Redis] Connected successfully to DB 0");
  });

  return redis;
}

export async function closeRedis(): Promise<void> {
  if (redis) {
    await redis.quit();
    redis = null;
  }
}
