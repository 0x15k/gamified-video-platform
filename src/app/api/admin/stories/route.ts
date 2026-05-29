import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { buildNodeSlug } from "@/lib/catalog/slug";
import { listStoryRoots, getStoryTree } from "@/lib/video/stories";
import { videoFileExists } from "@/lib/video/upload";
import { requireAuth, requireRateLimit, requireAdmin, jsonError } from "@/lib/security/api-guard";
import { applySecurityHeaders } from "@/lib/security/headers";
import { randomUUID } from "crypto";

const createStorySchema = z.object({
  title: z.string().min(1).max(200),
  summary: z.string().max(500).optional(),
  modelId: z.string().optional(),
  urlHash: z.string().min(8).max(120),
  durationSec: z.number().int().positive().optional(),
  published: z.boolean().optional(),
});

const addChoiceSchema = z.object({
  parentSceneId: z.string().min(1),
  choiceLabel: z.string().min(1).max(120),
  title: z.string().min(1).max(200),
  urlHash: z.string().min(8).max(120),
  isPremium: z.boolean().optional(),
  tokenCost: z.number().int().min(0).optional(),
  durationSec: z.number().int().positive().optional(),
});

export async function GET(request: NextRequest) {
  const limited = await requireRateLimit(request, "api");
  if (limited) return limited;

  const user = await requireAuth(request);
  if (user instanceof NextResponse) return user;
  const denied = requireAdmin(user);
  if (denied) return denied;

  const storyId = request.nextUrl.searchParams.get("id");
  if (storyId) {
    const tree = await getStoryTree(storyId);
    if (!tree) return jsonError("Historia no encontrada", 404);
    return applySecurityHeaders(NextResponse.json(tree));
  }

  const roots = await listStoryRoots();
  return applySecurityHeaders(
    NextResponse.json({
      stories: roots.map((s) => ({
        id: s.id,
        slug: s.slug,
        title: s.title,
        summary: s.summary,
        published: s.published,
        model: s.model,
        sceneCount: s._count.childNodes + 1,
        hasVideo: videoFileExists(s.urlHash),
      })),
    }),
  );
}

export async function POST(request: NextRequest) {
  const limited = await requireRateLimit(request, "api");
  if (limited) return limited;

  const user = await requireAuth(request);
  if (user instanceof NextResponse) return user;
  const denied = requireAdmin(user);
  if (denied) return denied;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON", 400);
  }

  const action = (body as { action?: string })?.action;

  if (action === "addChoice") {
    const parsed = addChoiceSchema.safeParse(body);
    if (!parsed.success) return jsonError("Datos inválidos", 400);
    if (!videoFileExists(parsed.data.urlHash)) {
      return jsonError("Sube el vídeo de la escena antes de guardar", 400);
    }

    const parent = await prisma.videoNode.findUnique({
      where: { id: parsed.data.parentSceneId },
    });
    if (!parent || parent.contentKind !== "STORY") {
      return jsonError("Escena padre no encontrada", 404);
    }

    const idSuffix = randomUUID().replace(/-/g, "");
    const scene = await prisma.videoNode.create({
      data: {
        title: parsed.data.title,
        slug: buildNodeSlug(parsed.data.title, idSuffix),
        choiceLabel: parsed.data.choiceLabel,
        summary: null,
        contentKind: "STORY",
        sourceType: "FILE",
        urlHash: parsed.data.urlHash,
        parentNodeId: parent.id,
        tags: ["ai", "story", "interactive"],
        vertical: "ADULT",
        modelId: parent.modelId,
        durationSec: parsed.data.durationSec ?? 30,
        isPremium: parsed.data.isPremium ?? false,
        tokenCost: parsed.data.tokenCost ?? 0,
        published: true,
      },
    });

    return applySecurityHeaders(NextResponse.json({ scene }, { status: 201 }));
  }

  const parsed = createStorySchema.safeParse(body);
  if (!parsed.success) return jsonError("Datos inválidos", 400);
  if (!videoFileExists(parsed.data.urlHash)) {
    return jsonError("Sube el vídeo intro antes de crear la historia", 400);
  }

  const idSuffix = randomUUID().replace(/-/g, "");
  const story = await prisma.videoNode.create({
    data: {
      title: parsed.data.title,
      slug: buildNodeSlug(parsed.data.title, idSuffix),
      summary: parsed.data.summary,
      contentKind: "STORY",
      sourceType: "FILE",
      urlHash: parsed.data.urlHash,
      parentNodeId: null,
      tags: ["ai", "story", "interactive"],
      vertical: "ADULT",
      modelId: parsed.data.modelId ?? null,
      durationSec: parsed.data.durationSec ?? 45,
      published: parsed.data.published ?? false,
    },
  });

  return applySecurityHeaders(NextResponse.json({ story }, { status: 201 }));
}
