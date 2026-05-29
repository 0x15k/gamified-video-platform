import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { loginSchema, verifyPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { requireRateLimit, jsonError } from "@/lib/security/api-guard";
import { applySecurityHeaders } from "@/lib/security/headers";

export async function POST(request: NextRequest) {
  const limited = await requireRateLimit(request, "auth");
  if (limited) return limited;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON", 400);
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Invalid credentials", 401);
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email.toLowerCase() },
  });

  if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
    return jsonError("Invalid credentials", 401);
  }

  const session = await createSession({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  const response = NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      tokensBalance: user.tokensBalance,
      avatarData: user.avatarData,
    },
  });

  for (const cookie of session.cookies) {
    response.cookies.set(cookie.name, cookie.value, cookie.options);
  }

  return applySecurityHeaders(response);
}
