import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { ACCESS_COOKIE } from "@/lib/auth/cookies";
import { checkRateLimit, type RateLimitTier } from "@/lib/security/rate-limit";
import { applySecurityHeaders } from "@/lib/security/headers";
import type { User, VideoNode, UserRole } from "@/generated/prisma/client";

export type AuthUser = Pick<User, "id" | "email" | "role" | "tokensBalance" | "avatarData">;

export function jsonError(message: string, status: number) {
  return applySecurityHeaders(
    NextResponse.json({ error: message }, { status }),
  );
}

export async function requireRateLimit(
  request: NextRequest,
  tier: RateLimitTier,
  keySuffix?: string,
): Promise<NextResponse | null> {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";
  const key = keySuffix ? `${ip}:${keySuffix}` : ip;
  const { allowed, remaining } = await checkRateLimit(tier, key);

  if (!allowed) {
    return applySecurityHeaders(
      NextResponse.json(
        { error: "Too many requests" },
        { status: 429, headers: { "X-RateLimit-Remaining": String(remaining) } },
      ),
    );
  }
  return null;
}

export async function getAuthUser(request: NextRequest): Promise<AuthUser | null> {
  const headerUserId = request.headers.get("x-user-id");
  if (headerUserId) {
    const user = await prisma.user.findUnique({
      where: { id: headerUserId },
      select: { id: true, email: true, role: true, tokensBalance: true, avatarData: true },
    });
    return user;
  }

  const token = request.cookies.get(ACCESS_COOKIE)?.value;
  if (!token) return null;

  const payload = await verifyAccessToken(token);
  if (!payload?.sub) return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { id: true, email: true, role: true, tokensBalance: true, avatarData: true },
  });
  return user;
}

export async function requireAuth(request: NextRequest): Promise<AuthUser | NextResponse> {
  const user = await getAuthUser(request);
  if (!user) return jsonError("Unauthorized", 401);
  return user;
}

export function requireRole(user: AuthUser, roles: UserRole[]): NextResponse | null {
  if (!roles.includes(user.role)) {
    return jsonError("Forbidden", 403);
  }
  return null;
}

export async function requirePremiumAccess(
  user: AuthUser,
  node: Pick<VideoNode, "isPremium" | "tokenCost">,
): Promise<NextResponse | null> {
  if (!node.isPremium) return null;
  if (user.role === "PREMIUM" || user.role === "WHALE") return null;
  if (user.tokensBalance >= node.tokenCost) return null;
  return jsonError("Insufficient tokens", 402);
}

export async function deductTokensForNode(
  userId: string,
  node: Pick<VideoNode, "id" | "isPremium" | "tokenCost">,
): Promise<{ ok: true; user: AuthUser } | { ok: false; response: NextResponse }> {
  if (!node.isPremium) {
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { id: true, email: true, role: true, tokensBalance: true, avatarData: true },
    });
    return { ok: true, user };
  }

  const result = await prisma.$transaction(async (tx) => {
    const current = await tx.user.findUnique({ where: { id: userId } });
    if (!current) return null;
    if (current.role === "PREMIUM" || current.role === "WHALE") return current;
    if (current.tokensBalance < node.tokenCost) return null;

    const updated = await tx.user.update({
      where: { id: userId, tokensBalance: { gte: node.tokenCost } },
      data: { tokensBalance: { decrement: node.tokenCost } },
      select: { id: true, email: true, role: true, tokensBalance: true, avatarData: true },
    });

    await tx.transaction.create({
      data: {
        userId,
        amount: node.tokenCost,
        currency: "TOKENS",
        status: "COMPLETED",
        gateway: "INTERNAL",
        metadata: { videoNodeId: node.id, type: "premium_access" },
      },
    });

    return updated;
  });

  if (!result) {
    return { ok: false, response: jsonError("Insufficient tokens", 402) };
  }
  return { ok: true, user: result };
}
