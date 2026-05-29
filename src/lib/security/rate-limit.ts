import { getRedis } from "@/lib/redis";

export type RateLimitTier = "auth" | "media" | "api";

const LIMITS: Record<RateLimitTier, { max: number; windowSec: number }> = {
  auth: { max: 5, windowSec: 60 },
  media: { max: 30, windowSec: 60 },
  api: { max: 100, windowSec: 60 },
};

export async function checkRateLimit(
  tier: RateLimitTier,
  key: string,
): Promise<{ allowed: boolean; remaining: number }> {
  const { max, windowSec } = LIMITS[tier];

  try {
    const redis = getRedis();
    const redisKey = `ratelimit:${tier}:${key}`;
    const count = await redis.incr(redisKey);

    if (count === 1) {
      await redis.expire(redisKey, windowSec);
    }

    const allowed = count <= max;
    return { allowed, remaining: Math.max(0, max - count) };
  } catch {
    // Dev-friendly: if Redis is down, do not block login entirely.
    if (process.env.NODE_ENV === "development") {
      return { allowed: true, remaining: max };
    }
    return { allowed: false, remaining: 0 };
  }
}
