import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { slugifyTitle } from "@/lib/catalog/slug";
import { requireAuth, requireRateLimit, requireAdmin, jsonError } from "@/lib/security/api-guard";
import { applySecurityHeaders } from "@/lib/security/headers";
import { randomUUID } from "crypto";

const modelSchema = z.object({
  name: z.string().min(1).max(80),
  slug: z.string().min(2).max(80).optional(),
  bio: z.string().max(500).optional(),
  tags: z.array(z.string().min(1).max(40)).max(12).optional(),
  isLive: z.boolean().optional(),
  published: z.boolean().optional(),
});

export async function GET(request: NextRequest) {
  const limited = await requireRateLimit(request, "api");
  if (limited) return limited;

  const user = await requireAuth(request);
  if (user instanceof NextResponse) return user;
  const denied = requireAdmin(user);
  if (denied) return denied;

  const models = await prisma.aiModel.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { videos: true } } },
  });

  return applySecurityHeaders(NextResponse.json({ models }));
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

  const parsed = modelSchema.safeParse(body);
  if (!parsed.success) return jsonError("Invalid input", 400);

  const idSuffix = randomUUID().replace(/-/g, "");
  const slug =
    parsed.data.slug ??
    `${slugifyTitle(parsed.data.name)}-${idSuffix.slice(0, 6)}`;

  const model = await prisma.aiModel.create({
    data: {
      name: parsed.data.name,
      slug,
      bio: parsed.data.bio,
      tags: parsed.data.tags?.map((t) => t.toLowerCase()) ?? ["ai"],
      isLive: parsed.data.isLive ?? false,
      published: parsed.data.published ?? true,
    },
  });

  return applySecurityHeaders(NextResponse.json({ model }, { status: 201 }));
}
