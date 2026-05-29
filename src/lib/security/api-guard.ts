import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { ACCESS_COOKIE } from "@/lib/auth/cookies";
import { checkRateLimit, type RateLimitTier } from "@/lib/security/rate-limit";
import { applySecurityHeaders } from "@/lib/security/headers";
import { hasPremiumPlan, isAdmin } from "@/lib/rbac/permissions";
import type { User, VideoNode } from "@/generated/prisma/client";

export type AuthUser = Pick<
  User,
  | "id"
  | "email"
  | "accountType"
  | "plan"
  | "tokensBalance"
  | "avatarData"
  | "displayName"
  | "bio"
>;

const userSelect = {
  id: true,
  email: true,
  accountType: true,
  plan: true,
  tokensBalance: true,
  avatarData: true,
  displayName: true,
  bio: true,
} as const;

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
    return prisma.user.findUnique({
      where: { id: headerUserId },
      select: userSelect,
    });
  }

  const token = request.cookies.get(ACCESS_COOKIE)?.value;
  if (!token) return null;

  const payload = await verifyAccessToken(token);
  if (!payload?.sub) return null;

  return prisma.user.findUnique({
    where: { id: payload.sub },
    select: userSelect,
  });
}

export async function requireAuth(request: NextRequest): Promise<AuthUser | NextResponse> {
  const user = await getAuthUser(request);
  if (!user) return jsonError("Unauthorized", 401);
  return user;
}

/** Solo staff de plataforma (no usuarios finales). */
export function requireAdmin(user: AuthUser): NextResponse | null {
  if (!isAdmin(user.accountType)) {
    return jsonError("Forbidden", 403);
  }
  return null;
}

export async function requirePremiumAccess(
  user: AuthUser,
  node: Pick<VideoNode, "isPremium" | "tokenCost">,
): Promise<NextResponse | null> {
  if (!node.isPremium) return null;
  if (hasPremiumPlan(user.plan)) return null;
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
      select: userSelect,
    });
    return { ok: true, user };
  }

  const alreadyUnlocked = await prisma.transaction.findFirst({
    where: {
      userId,
      status: "COMPLETED",
      gateway: "INTERNAL",
      metadata: { path: ["videoNodeId"], equals: node.id },
    },
  });

  if (alreadyUnlocked) {
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: userSelect,
    });
    return { ok: true, user };
  }

  const result = await prisma.$transaction(async (tx) => {
    const current = await tx.user.findUnique({ where: { id: userId } });
    if (!current) return null;
    if (hasPremiumPlan(current.plan)) return current;

    const prior = await tx.transaction.findFirst({
      where: {
        userId,
        status: "COMPLETED",
        gateway: "INTERNAL",
        metadata: { path: ["videoNodeId"], equals: node.id },
      },
    });
    if (prior) return current;

    if (current.tokensBalance < node.tokenCost) return null;

    const updated = await tx.user.update({
      where: { id: userId, tokensBalance: { gte: node.tokenCost } },
      data: { tokensBalance: { decrement: node.tokenCost } },
      select: userSelect,
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
