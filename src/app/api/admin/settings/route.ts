import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireRateLimit, requireAdmin, jsonError } from "@/lib/security/api-guard";
import { applySecurityHeaders } from "@/lib/security/headers";

const patchSchema = z.object({
  siteName: z.string().min(2).max(80).optional(),
  vertical: z.enum(["NEUTRAL", "EDUCATION", "ADULT"]).optional(),
  ageGateEnabled: z.boolean().optional(),
  adsEnabled: z.boolean().optional(),
});

export async function GET(request: NextRequest) {
  const limited = await requireRateLimit(request, "api");
  if (limited) return limited;

  const user = await requireAuth(request);
  if (user instanceof NextResponse) return user;
  const denied = requireAdmin(user);
  if (denied) return denied;

  const settings = await prisma.platformSettings.findUnique({ where: { id: "default" } });
  return applySecurityHeaders(NextResponse.json({ settings }));
}

export async function PATCH(request: NextRequest) {
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

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return jsonError("Invalid input", 400);

  const data = { ...parsed.data };
  if (data.vertical === "ADULT" && data.adsEnabled === undefined) {
    data.adsEnabled = true;
    if (data.ageGateEnabled === undefined) data.ageGateEnabled = true;
  }

  const settings = await prisma.platformSettings.upsert({
    where: { id: "default" },
    create: { id: "default", ...data },
    update: data,
  });

  return applySecurityHeaders(NextResponse.json({ settings }));
}
