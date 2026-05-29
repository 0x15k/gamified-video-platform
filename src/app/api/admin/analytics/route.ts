import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireRateLimit, requireAdmin } from "@/lib/security/api-guard";
import { applySecurityHeaders } from "@/lib/security/headers";

export async function GET(request: NextRequest) {
  const limited = await requireRateLimit(request, "api");
  if (limited) return limited;

  const user = await requireAuth(request);
  if (user instanceof NextResponse) return user;
  const denied = requireAdmin(user);
  if (denied) return denied;

  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [eventsByType, totalUsers, completedProgress, tokenPurchases] = await Promise.all([
    prisma.analyticsEvent.groupBy({
      by: ["eventType"],
      where: { createdAt: { gte: since } },
      _count: { eventType: true },
    }),
    prisma.user.count(),
    prisma.userProgress.count({ where: { status: "COMPLETED" } }),
    prisma.transaction.count({
      where: { status: "COMPLETED", createdAt: { gte: since } },
    }),
  ]);

  return applySecurityHeaders(
    NextResponse.json({
      since: since.toISOString(),
      totalUsers,
      completedProgress,
      tokenPurchases,
      eventsByType: eventsByType.map((e) => ({
        eventType: e.eventType,
        count: e._count.eventType,
      })),
    }),
  );
}
