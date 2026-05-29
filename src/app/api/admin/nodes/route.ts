import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { buildNodeSlug } from "@/lib/catalog/slug";
import { requireAuth, requireRateLimit, requireAdmin, jsonError } from "@/lib/security/api-guard";
import { applySecurityHeaders } from "@/lib/security/headers";
import { randomUUID } from "crypto";

const nodeSchema = z.object({
  title: z.string().min(1).max(200),
  summary: z.string().max(500).optional(),
  urlHash: z.string().min(1).max(120),
  slug: z.string().min(2).max(120).optional(),
  tags: z.array(z.string().min(1).max(40)).max(12).optional(),
  parentNodeId: z.string().nullable().optional(),
  isPremium: z.boolean().optional(),
  tokenCost: z.number().int().min(0).optional(),
  durationSec: z.number().int().positive().optional(),
  previewSec: z.number().int().min(0).max(300).optional(),
  published: z.boolean().optional(),
  vertical: z.enum(["NEUTRAL", "EDUCATION", "ADULT"]).optional(),
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
  if (!parsed.success) return jsonError("Invalid input", 400);

  const idSuffix = randomUUID().replace(/-/g, "");
  const slug = parsed.data.slug ?? buildNodeSlug(parsed.data.title, idSuffix);
  const tags = parsed.data.tags?.map((t) => t.toLowerCase().trim()) ?? [];

  const node = await prisma.videoNode.create({
    data: {
      ...parsed.data,
      slug,
      tags,
    },
  });

  return applySecurityHeaders(NextResponse.json({ node }, { status: 201 }));
}
