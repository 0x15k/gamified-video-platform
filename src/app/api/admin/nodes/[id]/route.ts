import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { canonicalizeEmbedUrl } from "@/lib/video/embed";
import { requireAuth, requireRateLimit, requireAdmin, jsonError } from "@/lib/security/api-guard";
import { applySecurityHeaders } from "@/lib/security/headers";

const patchSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  summary: z.string().max(500).nullable().optional(),
  sourceType: z.enum(["FILE", "EMBED"]).optional(),
  embedUrl: z.string().max(2000).nullable().optional(),
  urlHash: z.string().min(1).max(120).optional(),
  slug: z.string().min(2).max(120).optional(),
  tags: z.array(z.string().min(1).max(40)).max(12).optional(),
  parentNodeId: z.string().nullable().optional(),
  isPremium: z.boolean().optional(),
  tokenCost: z.number().int().min(0).optional(),
  durationSec: z.number().int().positive().nullable().optional(),
  previewSec: z.number().int().min(0).max(300).optional(),
  published: z.boolean().optional(),
  thumbnailUrl: z.string().url().nullable().optional(),
  vertical: z.enum(["NEUTRAL", "EDUCATION", "ADULT"]).optional(),
});

type RouteContext = { params: Promise<{ id: string }> };

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

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return jsonError("Invalid input", 400);

  const data: Record<string, unknown> = {
    ...parsed.data,
    ...(parsed.data.tags
      ? { tags: parsed.data.tags.map((t) => t.toLowerCase().trim()) }
      : {}),
  };

  if (parsed.data.embedUrl !== undefined) {
    if (parsed.data.embedUrl === null) {
      data.embedUrl = null;
    } else {
      const normalized = canonicalizeEmbedUrl(parsed.data.embedUrl);
      if (!normalized) return jsonError("URL de embed no válida", 400);
      data.embedUrl = normalized;
    }
  }

  const node = await prisma.videoNode.update({
    where: { id },
    data,
  });

  return applySecurityHeaders(NextResponse.json({ node }));
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const limited = await requireRateLimit(request, "api");
  if (limited) return limited;

  const user = await requireAuth(request);
  if (user instanceof NextResponse) return user;
  const denied = requireAdmin(user);
  if (denied) return denied;

  const { id } = await context.params;
  await prisma.videoNode.delete({ where: { id } });

  return applySecurityHeaders(NextResponse.json({ ok: true }));
}
