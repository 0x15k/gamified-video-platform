import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireRateLimit } from "@/lib/security/api-guard";
import { applySecurityHeaders } from "@/lib/security/headers";

export async function GET(request: NextRequest) {
  const limited = await requireRateLimit(request, "api");
  if (limited) return limited;

  const user = await requireAuth(request);
  if (user instanceof NextResponse) return user;

  const nodes = await prisma.videoNode.findMany({
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      title: true,
      isPremium: true,
      tokenCost: true,
      durationSec: true,
      parentNodeId: true,
    },
  });

  return applySecurityHeaders(NextResponse.json({ nodes }));
}
