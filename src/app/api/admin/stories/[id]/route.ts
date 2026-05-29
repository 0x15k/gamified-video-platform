import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getStoryTree } from "@/lib/video/stories";
import { videoFileExists } from "@/lib/video/upload";
import { requireAuth, requireRateLimit, requireAdmin, jsonError } from "@/lib/security/api-guard";
import { applySecurityHeaders } from "@/lib/security/headers";

type RouteContext = { params: Promise<{ id: string }> };

const patchStorySchema = z.object({
  title: z.string().min(1).max(200).optional(),
  summary: z.string().max(500).nullable().optional(),
  published: z.boolean().optional(),
  modelId: z.string().nullable().optional(),
});

const patchSceneSchema = z.object({
  sceneId: z.string().min(1),
  title: z.string().min(1).max(200).optional(),
  choiceLabel: z.string().min(1).max(120).nullable().optional(),
  urlHash: z.string().min(8).max(120).optional(),
  isPremium: z.boolean().optional(),
  tokenCost: z.number().int().min(0).optional(),
  published: z.boolean().optional(),
  durationSec: z.number().int().positive().optional(),
});

export async function GET(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const tree = await getStoryTree(id);
  if (!tree) return jsonError("Not found", 404);
  return applySecurityHeaders(NextResponse.json(tree));
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const limited = await requireRateLimit(request, "api");
  if (limited) return limited;

  const user = await requireAuth(request);
  if (user instanceof NextResponse) return user;
  const denied = requireAdmin(user);
  if (denied) return denied;

  const { id } = await context.params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON", 400);
  }

  const scenePatch = patchSceneSchema.safeParse(body);
  if (scenePatch.success) {
    const data = scenePatch.data;
    if (data.urlHash && !videoFileExists(data.urlHash)) {
      return jsonError("Vídeo no encontrado en storage", 400);
    }

    const scene = await prisma.videoNode.update({
      where: { id: data.sceneId },
      data: {
        ...(data.title !== undefined ? { title: data.title } : {}),
        ...(data.choiceLabel !== undefined ? { choiceLabel: data.choiceLabel } : {}),
        ...(data.urlHash !== undefined ? { urlHash: data.urlHash, sourceType: "FILE" } : {}),
        ...(data.isPremium !== undefined ? { isPremium: data.isPremium } : {}),
        ...(data.tokenCost !== undefined ? { tokenCost: data.tokenCost } : {}),
        ...(data.published !== undefined ? { published: data.published } : {}),
        ...(data.durationSec !== undefined ? { durationSec: data.durationSec } : {}),
      },
    });

    return applySecurityHeaders(NextResponse.json({ scene }));
  }

  const storyPatch = patchStorySchema.safeParse(body);
  if (!storyPatch.success) return jsonError("Invalid input", 400);

  const story = await prisma.videoNode.update({
    where: { id },
    data: storyPatch.data,
  });

  return applySecurityHeaders(NextResponse.json({ story }));
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const user = await requireAuth(_request);
  if (user instanceof NextResponse) return user;
  const denied = requireAdmin(user);
  if (denied) return denied;

  const { id } = await context.params;

  async function deleteRecursive(nodeId: string) {
    const children = await prisma.videoNode.findMany({
      where: { parentNodeId: nodeId },
      select: { id: true },
    });
    for (const c of children) {
      await deleteRecursive(c.id);
    }
    await prisma.videoNode.delete({ where: { id: nodeId } });
  }

  await deleteRecursive(id);
  return applySecurityHeaders(NextResponse.json({ ok: true }));
}
