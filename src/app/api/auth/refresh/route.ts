import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyRefreshToken } from "@/lib/auth/jwt";
import { REFRESH_COOKIE } from "@/lib/auth/cookies";
import { isSessionActive, rotateRefreshSession } from "@/lib/auth/session";
import { requireRateLimit, jsonError } from "@/lib/security/api-guard";
import { applySecurityHeaders } from "@/lib/security/headers";

export async function POST(request: NextRequest) {
  const limited = await requireRateLimit(request, "auth");
  if (limited) return limited;

  const refresh = request.cookies.get(REFRESH_COOKIE)?.value;
  if (!refresh) return jsonError("Unauthorized", 401);

  const payload = await verifyRefreshToken(refresh);
  if (!payload?.sub || !payload.jti) return jsonError("Unauthorized", 401);

  const active = await isSessionActive(payload.sub, payload.jti);
  if (!active) return jsonError("Unauthorized", 401);

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { id: true, email: true, role: true },
  });
  if (!user) return jsonError("Unauthorized", 401);

  const session = await rotateRefreshSession(user, payload.jti);

  const response = NextResponse.json({ ok: true });
  for (const cookie of session.cookies) {
    response.cookies.set(cookie.name, cookie.value, cookie.options);
  }
  return applySecurityHeaders(response);
}
