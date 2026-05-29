import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireRateLimit, requireAdmin, jsonError } from "@/lib/security/api-guard";
import { applySecurityHeaders } from "@/lib/security/headers";

const patchSchema = z.object({
  name: z.string().min(1).max(80).optional(),
  bio: z.string().max(500).nullable().optional(),
  tags: z.array(z.string().min(1).max(40)).max(12).optional(),
  isLive: z.boolean().optional(),
  published: z.boolean().optional(),
  avatarUrl: z.string().url().nullable().optional(),
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

  const data = {
    ...parsed.data,
    ...(parsed.data.tags
      ? { tags: parsed.data.tags.map((t) => t.toLowerCase()) }
      : {}),
  };

  const model = await prisma.aiModel.update({ where: { id }, data });
  return applySecurityHeaders(NextResponse.json({ model }));
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const limited = await requireRateLimit(request, "api");
  if (limited) return limited;

  const user = await requireAuth(request);
  if (user instanceof NextResponse) return user;
  const denied = requireAdmin(user);
  if (denied) return denied;

  const { id } = await context.params;
  await prisma.aiModel.delete({ where: { id } });

  return applySecurityHeaders(NextResponse.json({ ok: true }));
}
