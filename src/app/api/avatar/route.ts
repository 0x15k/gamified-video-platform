import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireRateLimit, jsonError } from "@/lib/security/api-guard";
import { applySecurityHeaders } from "@/lib/security/headers";

const avatarSchema = z.object({
  hairColor: z.string().max(32),
  skinTone: z.string().max(32),
  outfitColor: z.string().max(32),
});

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

  const parsed = avatarSchema.safeParse(body);
  if (!parsed.success) return jsonError("Invalid avatar data", 400);

  const serialized = JSON.stringify(parsed.data);
  if (serialized.length > 4096) return jsonError("Payload too large", 413);

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { avatarData: parsed.data },
    select: { avatarData: true },
  });

  return applySecurityHeaders(
    NextResponse.json({ avatarData: updated.avatarData }),
  );
}
