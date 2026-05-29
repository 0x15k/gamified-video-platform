import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireRateLimit, requireRole, jsonError } from "@/lib/security/api-guard";
import { applySecurityHeaders } from "@/lib/security/headers";

const nodeSchema = z.object({
  title: z.string().min(1).max(200),
  summary: z.string().max(500).optional(),
  urlHash: z.string().min(1).max(120),
  parentNodeId: z.string().nullable().optional(),
  isPremium: z.boolean().optional(),
  tokenCost: z.number().int().min(0).optional(),
  durationSec: z.number().int().positive().optional(),
  vertical: z.enum(["NEUTRAL", "EDUCATION", "ADULT"]).optional(),
});

export async function GET(request: NextRequest) {
  const limited = await requireRateLimit(request, "api");
  if (limited) return limited;

  const user = await requireAuth(request);
  if (user instanceof NextResponse) return user;
  const denied = requireRole(user, ["ADMIN"]);
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
  const denied = requireRole(user, ["ADMIN"]);
  if (denied) return denied;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON", 400);
  }

  const parsed = nodeSchema.safeParse(body);
  if (!parsed.success) return jsonError("Invalid input", 400);

  const node = await prisma.videoNode.create({ data: parsed.data });

  return applySecurityHeaders(NextResponse.json({ node }, { status: 201 }));
}
