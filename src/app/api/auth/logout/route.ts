import { NextRequest, NextResponse } from "next/server";
import { clearAuthCookies } from "@/lib/auth/session";
import { verifyRefreshToken } from "@/lib/auth/jwt";
import { revokeSession } from "@/lib/auth/session";
import { REFRESH_COOKIE } from "@/lib/auth/cookies";
import { requireAuth } from "@/lib/security/api-guard";
import { applySecurityHeaders } from "@/lib/security/headers";

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  const refresh = request.cookies.get(REFRESH_COOKIE)?.value;
  if (refresh) {
    const payload = await verifyRefreshToken(refresh);
    if (payload?.sub && payload.jti) {
      await revokeSession(payload.sub, payload.jti);
    }
  }

  const response = NextResponse.json({ ok: true });
  for (const cookie of clearAuthCookies()) {
    response.cookies.set(cookie.name, cookie.value, cookie.options);
  }
  return applySecurityHeaders(response);
}
