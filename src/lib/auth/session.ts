import { randomUUID } from "crypto";
import { getRedis } from "@/lib/redis";
import { signAccessToken, signRefreshToken } from "@/lib/auth/jwt";
import { AUTH_COOKIE_OPTIONS, ACCESS_COOKIE, REFRESH_COOKIE } from "@/lib/auth/cookies";

const REFRESH_TTL_SEC = 7 * 24 * 60 * 60;

export async function createSession(user: {
  id: string;
  email: string;
  role: string;
}): Promise<{ accessToken: string; refreshToken: string; cookies: ReturnType<typeof buildAuthCookies> }> {
  const jti = randomUUID();
  const redis = getRedis();
  await redis.setex(`session:${user.id}:${jti}`, REFRESH_TTL_SEC, "1");

  const accessToken = await signAccessToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });
  const refreshToken = await signRefreshToken(user.id, jti);
  const cookies = buildAuthCookies(accessToken, refreshToken);

  return { accessToken, refreshToken, cookies };
}

export async function revokeSession(userId: string, jti: string): Promise<void> {
  const redis = getRedis();
  await redis.del(`session:${userId}:${jti}`);
}

export async function isSessionActive(userId: string, jti: string): Promise<boolean> {
  const redis = getRedis();
  const val = await redis.get(`session:${userId}:${jti}`);
  return val === "1";
}

export async function rotateRefreshSession(user: {
  id: string;
  email: string;
  role: string;
}, oldJti: string): Promise<ReturnType<typeof createSession>> {
  await revokeSession(user.id, oldJti);
  return createSession(user);
}

function buildAuthCookies(accessToken: string, refreshToken: string) {
  return [
    { name: ACCESS_COOKIE, value: accessToken, options: AUTH_COOKIE_OPTIONS },
    { name: REFRESH_COOKIE, value: refreshToken, options: { ...AUTH_COOKIE_OPTIONS, maxAge: REFRESH_TTL_SEC } },
  ];
}

export function clearAuthCookies() {
  return [
    { name: ACCESS_COOKIE, value: "", options: { ...AUTH_COOKIE_OPTIONS, maxAge: 0 } },
    { name: REFRESH_COOKIE, value: "", options: { ...AUTH_COOKIE_OPTIONS, maxAge: 0 } },
  ];
}
