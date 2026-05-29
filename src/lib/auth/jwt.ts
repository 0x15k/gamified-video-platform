import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { env } from "@/lib/env";

const ACCESS_TTL = "15m";
const REFRESH_TTL = "7d";

export type AccessTokenPayload = JWTPayload & {
  sub: string;
  email: string;
  accountType: string;
  plan: string;
  type: "access";
};

export type RefreshTokenPayload = JWTPayload & {
  sub: string;
  jti: string;
  type: "refresh";
};

function accessSecret() {
  return new TextEncoder().encode(env.JWT_SECRET);
}

function refreshSecret() {
  return new TextEncoder().encode(env.JWT_REFRESH_SECRET);
}

export async function signAccessToken(payload: {
  userId: string;
  email: string;
  accountType: string;
  plan: string;
}): Promise<string> {
  return new SignJWT({
    email: payload.email,
    accountType: payload.accountType,
    plan: payload.plan,
    type: "access",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.userId)
    .setIssuedAt()
    .setExpirationTime(ACCESS_TTL)
    .sign(accessSecret());
}

export async function signRefreshToken(userId: string, jti: string): Promise<string> {
  return new SignJWT({ jti, type: "refresh" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(REFRESH_TTL)
    .sign(refreshSecret());
}

export async function verifyAccessToken(token: string): Promise<AccessTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, accessSecret());
    if (payload.type !== "access" || !payload.sub) return null;
    return payload as AccessTokenPayload;
  } catch {
    return null;
  }
}

export async function verifyRefreshToken(token: string): Promise<RefreshTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, refreshSecret());
    if (payload.type !== "refresh" || !payload.sub || !payload.jti) return null;
    return payload as RefreshTokenPayload;
  } catch {
    return null;
  }
}
