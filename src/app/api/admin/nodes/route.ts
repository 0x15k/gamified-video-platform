import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { buildNodeSlug } from "@/lib/catalog/slug";
import { canonicalizeEmbedUrl, isAiTagged } from "@/lib/video/embed";
import { requireAuth, requireRateLimit, requireAdmin, jsonError } from "@/lib/security/api-guard";
import { applySecurityHeaders } from "@/lib/security/headers";
import { randomUUID } from "crypto";

const nodeSchema = z
  .object({
    title: z.string().min(1).max(200),
    summary: z.string().max(500).optional(),
    sourceType: z.enum(["FILE", "EMBED"]).optional(),
    urlHash: z.string().min(1).max(120).optional(),
    embedUrl: z.string().max(2000).optional(),
    slug: z.string().min(2).max(120).optional(),
    tags: z.array(z.string().min(1).max(40)).max(12).optional(),
    parentNodeId: z.string().nullable().optional(),
    isPremium: z.boolean().optional(),
    tokenCost: z.number().int().min(0).optional(),
    durationSec: z.number().int().positive().optional(),
    previewSec: z.number().int().min(0).max(300).optional(),
    published: z.boolean().optional(),
    vertical: z.enum(["NEUTRAL", "EDUCATION", "ADULT"]).optional(),
  })
  .superRefine((data, ctx) => {
    const tags = data.tags?.map((t) => t.toLowerCase().trim()) ?? [];
    if (data.sourceType === "EMBED" && !isAiTagged(tags)) {
      ctx.addIssue({
        code: "custom",
        message: "Los embeds deben incluir tag ai (o animation, 3d, etc.)",
        path: ["tags"],
      });
    }
    if (data.sourceType === "EMBED" && !data.embedUrl) {
      ctx.addIssue({
        code: "custom",
        message: "embedUrl requerido para fuente EMBED",
        path: ["embedUrl"],
      });
    }
  });

export async function GET(request: NextRequest) {
  const limited = await requireRateLimit(request, "api");
  if (limited) return limited;

  const user = await requireAuth(request);
  if (user instanceof NextResponse) return user;
  const denied = requireAdmin(user);
  if (denied) return denied;

  const nodes = await prisma.videoNode.findMany({
    orderBy: { createdAt: "asc" },
    include: { _count: { select: { progress: true, bookmarks: true } } },
  });

  return applySecurityHeaders(NextResponse.json({ nodes }));
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

  const parsed = nodeSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid input", 400);
  }

  const idSuffix = randomUUID().replace(/-/g, "");
  const slug = parsed.data.slug ?? buildNodeSlug(parsed.data.title, idSuffix);
  const tags = parsed.data.tags?.map((t) => t.toLowerCase().trim()) ?? ["ai"];
  const sourceType = parsed.data.sourceType ?? "EMBED";

  let embedUrl: string | null = null;
  if (sourceType === "EMBED") {
    const normalized = canonicalizeEmbedUrl(parsed.data.embedUrl ?? "");
    if (!normalized) return jsonError("URL de embed no válida o dominio no permitido", 400);
    embedUrl = normalized;
  }

  const node = await prisma.videoNode.create({
    data: {
      title: parsed.data.title,
      summary: parsed.data.summary,
      slug,
      tags,
      sourceType,
      urlHash: parsed.data.urlHash ?? (sourceType === "EMBED" ? "embed" : "intro"),
      embedUrl,
      parentNodeId: parsed.data.parentNodeId ?? null,
      isPremium: parsed.data.isPremium ?? false,
      tokenCost: parsed.data.tokenCost ?? 0,
      durationSec: parsed.data.durationSec,
      previewSec: parsed.data.previewSec ?? 30,
      published: parsed.data.published ?? true,
      vertical: parsed.data.vertical ?? "ADULT",
    },
  });

  return applySecurityHeaders(NextResponse.json({ node }, { status: 201 }));
}
