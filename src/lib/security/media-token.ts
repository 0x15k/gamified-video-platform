import { createHmac, randomUUID } from "crypto";
import path from "path";
import { env } from "@/lib/env";
import { getRedis } from "@/lib/redis";

const MEDIA_PREFIX = "media:token:";

export type MediaTokenPayload = {
  fileName: string;
  userId: string;
  nodeId: string;
};

export async function issueMediaToken(payload: MediaTokenPayload): Promise<string> {
  const redis = getRedis();
  const jti = randomUUID();
  const key = `${MEDIA_PREFIX}${jti}`;
  const data = JSON.stringify(payload);
  await redis.setex(key, env.MEDIA_TOKEN_TTL_SEC, data);

  const sig = createHmac("sha256", env.MEDIA_SIGNING_SECRET).update(jti).digest("hex");
  return `${jti}.${sig}`;
}

export async function consumeMediaToken(
  token: string,
  clientIp: string,
): Promise<MediaTokenPayload | null> {
  const [jti, sig] = token.split(".");
  if (!jti || !sig) return null;

  const expected = createHmac("sha256", env.MEDIA_SIGNING_SECRET).update(jti).digest("hex");
  if (sig !== expected) return null;

  const redis = getRedis();
  const ipKey = `${MEDIA_PREFIX}${jti}:ip`;
  const existingIp = await redis.get(ipKey);
  if (existingIp && existingIp !== clientIp) {
    await redis.del(`${MEDIA_PREFIX}${jti}`);
    return null;
  }
  if (!existingIp) {
    await redis.setex(ipKey, env.MEDIA_TOKEN_TTL_SEC, clientIp);
  }

  const key = `${MEDIA_PREFIX}${jti}`;
  const raw = await redis.get(key);
  if (!raw) return null;

  return JSON.parse(raw) as MediaTokenPayload;
}

export function resolveVideoPath(fileName: string): string | null {
  const base = path.resolve(env.VIDEO_STORAGE_PATH);
  const resolved = path.resolve(base, fileName);
  if (!resolved.startsWith(base + path.sep) && resolved !== base) {
    return null;
  }
  return resolved;
}
