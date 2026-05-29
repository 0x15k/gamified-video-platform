import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireRateLimit, jsonError } from "@/lib/security/api-guard";
import { applySecurityHeaders } from "@/lib/security/headers";

const bookmarkSchema = z.object({
  videoNodeId: z.string().min(1),
});

export async function GET(request: NextRequest) {
  const limited = await requireRateLimit(request, "api");
  if (limited) return limited;

  const user = await requireAuth(request);
  if (user instanceof NextResponse) return user;

  const bookmarks = await prisma.userBookmark.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      videoNode: {
        select: { id: true, title: true, summary: true, isPremium: true, tokenCost: true },
      },
    },
  });

  return applySecurityHeaders(NextResponse.json({ bookmarks }));
}

export async function POST(request: NextRequest) {
  const limited = await requireRateLimit(request, "api");
  if (limited) return limited;

  const user = await requireAuth(request);
  if (user instanceof NextResponse) return user;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON", 400);
  }

  const parsed = bookmarkSchema.safeParse(body);
  if (!parsed.success) return jsonError("Invalid input", 400);

  const bookmark = await prisma.userBookmark.upsert({
    where: {
      userId_videoNodeId: { userId: user.id, videoNodeId: parsed.data.videoNodeId },
    },
    create: { userId: user.id, videoNodeId: parsed.data.videoNodeId },
    update: {},
    include: { videoNode: { select: { id: true, title: true } } },
  });

  return applySecurityHeaders(NextResponse.json({ bookmark }, { status: 201 }));
}

export async function DELETE(request: NextRequest) {
  const limited = await requireRateLimit(request, "api");
  if (limited) return limited;

  const user = await requireAuth(request);
  if (user instanceof NextResponse) return user;

  const nodeId = request.nextUrl.searchParams.get("videoNodeId");
  if (!nodeId) return jsonError("videoNodeId required", 400);

  await prisma.userBookmark.deleteMany({
    where: { userId: user.id, videoNodeId: nodeId },
  });

  return applySecurityHeaders(NextResponse.json({ ok: true }));
}
