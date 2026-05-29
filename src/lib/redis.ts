import Redis from "ioredis";
import { env } from "@/lib/env";

const globalForRedis = globalThis as unknown as { redis: Redis | undefined };

export function getRedis(): Redis {
  if (!globalForRedis.redis) {
    globalForRedis.redis = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: 3,
    });
  }
  return globalForRedis.redis;
}
