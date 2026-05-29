import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireRateLimit } from "@/lib/security/api-guard";
import { applySecurityHeaders } from "@/lib/security/headers";

export async function GET(request: NextRequest) {
  const limited = await requireRateLimit(request, "api");
  if (limited) return limited;

  const user = await requireAuth(request);
  if (user instanceof NextResponse) return user;

  const transactions = await prisma.transaction.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: {
      id: true,
      amount: true,
      currency: true,
      status: true,
      gateway: true,
      createdAt: true,
    },
  });

  return applySecurityHeaders(NextResponse.json({ transactions }));
}
