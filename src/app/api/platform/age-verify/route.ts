import { NextResponse } from "next/server";
import { AGE_GATE_COOKIE, AGE_GATE_COOKIE_OPTIONS } from "@/lib/auth/age-gate";
import { applySecurityHeaders } from "@/lib/security/headers";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(AGE_GATE_COOKIE, "1", AGE_GATE_COOKIE_OPTIONS);
  return applySecurityHeaders(response);
}
