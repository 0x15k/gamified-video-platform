import { jwtVerify, type JWTPayload } from "jose";

export type AccessTokenPayload = JWTPayload & {
  sub: string;
  email: string;
  accountType: string;
  plan: string;
  type: "access";
};

/** Edge-safe JWT verify (no Prisma/env schema — middleware only). */
export async function verifyAccessTokenEdge(
  token: string,
): Promise<AccessTokenPayload | null> {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) return null;

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
    if (payload.type !== "access" || !payload.sub) return null;
    return payload as AccessTokenPayload;
  } catch {
    return null;
  }
}
