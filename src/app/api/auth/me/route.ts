import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireRateLimit } from "@/lib/security/api-guard";
import { applySecurityHeaders } from "@/lib/security/headers";

export async function GET(request: NextRequest) {
  const limited = await requireRateLimit(request, "api");
  if (limited) return limited;

  const user = await requireAuth(request);
  if (user instanceof NextResponse) return user;

  return applySecurityHeaders(
    NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        bio: user.bio,
        role: user.role,
        tokensBalance: user.tokensBalance,
        avatarData: user.avatarData,
      },
    }),
  );
}
