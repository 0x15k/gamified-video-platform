import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireRateLimit, jsonError } from "@/lib/security/api-guard";
import { applySecurityHeaders } from "@/lib/security/headers";
import { trackEvent } from "@/lib/analytics/track";
import { notifyUser } from "@/lib/notifications/create";

const upsertSchema = z.object({
  videoNodeId: z.string().min(1),
  status: z.enum(["STARTED", "COMPLETED"]),
  lastPositionSec: z.number().int().min(0).optional(),
});

export async function GET(request: NextRequest) {
  const limited = await requireRateLimit(request, "api");
  if (limited) return limited;

  const user = await requireAuth(request);
  if (user instanceof NextResponse) return user;

  const items = await prisma.userProgress.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    include: {
      videoNode: { select: { id: true, title: true, isPremium: true } },
    },
  });

  const totalNodes = await prisma.videoNode.count();
  const completed = items.filter((i) => i.status === "COMPLETED").length;

  return applySecurityHeaders(
    NextResponse.json({
      items,
      summary: {
        completed,
        totalNodes,
        percent: totalNodes > 0 ? Math.round((completed / totalNodes) * 100) : 0,
      },
    }),
  );
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

  const parsed = upsertSchema.safeParse(body);
  if (!parsed.success) return jsonError("Invalid input", 400);

  const node = await prisma.videoNode.findUnique({
    where: { id: parsed.data.videoNodeId },
  });
  if (!node) return jsonError("Node not found", 404);

  const progress = await prisma.userProgress.upsert({
    where: {
      userId_videoNodeId: { userId: user.id, videoNodeId: parsed.data.videoNodeId },
    },
    create: {
      userId: user.id,
      videoNodeId: parsed.data.videoNodeId,
      status: parsed.data.status,
      lastPositionSec: parsed.data.lastPositionSec,
      completedAt: parsed.data.status === "COMPLETED" ? new Date() : null,
    },
    update: {
      status: parsed.data.status,
      lastPositionSec: parsed.data.lastPositionSec,
      completedAt: parsed.data.status === "COMPLETED" ? new Date() : undefined,
    },
  });

  await trackEvent(`progress_${parsed.data.status.toLowerCase()}`, user.id, {
    videoNodeId: node.id,
    title: node.title,
  });

  if (parsed.data.status === "COMPLETED") {
    await notifyUser(
      user.id,
      "Capítulo completado",
      `Has completado «${node.title}».`,
    );
  }

  return applySecurityHeaders(NextResponse.json({ progress }));
}
