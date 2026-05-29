import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireRateLimit, jsonError } from "@/lib/security/api-guard";
import { applySecurityHeaders } from "@/lib/security/headers";

const profileSchema = z.object({
  displayName: z.string().min(1).max(64).optional(),
  bio: z.string().max(500).optional(),
});

export async function GET(request: NextRequest) {
  const limited = await requireRateLimit(request, "api");
  if (limited) return limited;

  const user = await requireAuth(request);
  if (user instanceof NextResponse) return user;

  const profile = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      email: true,
      displayName: true,
      bio: true,
      role: true,
      tokensBalance: true,
      avatarData: true,
    },
  });

  return applySecurityHeaders(NextResponse.json({ profile }));
}

export async function PATCH(request: NextRequest) {
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

  const parsed = profileSchema.safeParse(body);
  if (!parsed.success) return jsonError("Invalid input", 400);

  const profile = await prisma.user.update({
    where: { id: user.id },
    data: parsed.data,
    select: {
      id: true,
      email: true,
      displayName: true,
      bio: true,
      role: true,
      tokensBalance: true,
      avatarData: true,
    },
  });

  return applySecurityHeaders(NextResponse.json({ profile }));
}
