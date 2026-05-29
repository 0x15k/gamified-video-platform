import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireRateLimit } from "@/lib/security/api-guard";
import { applySecurityHeaders } from "@/lib/security/headers";

export async function GET(request: NextRequest) {
  const limited = await requireRateLimit(request, "api");
  if (limited) return limited;

  const user = await requireAuth(request);
  if (user instanceof NextResponse) return user;

  const latest = await prisma.userProgress.findFirst({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    include: {
      videoNode: { select: { id: true, title: true } },
    },
  });

  if (!latest) {
    const root = await prisma.videoNode.findFirst({
      where: { parentNodeId: null },
      orderBy: { createdAt: "asc" },
      select: { id: true, title: true },
    });
    return applySecurityHeaders(NextResponse.json({ continue: root }));
  }

  return applySecurityHeaders(
    NextResponse.json({
      continue: {
        nodeId: latest.videoNodeId,
        title: latest.videoNode.title,
        status: latest.status,
        lastPositionSec: latest.lastPositionSec,
      },
    }),
  );
}
