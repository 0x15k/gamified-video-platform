import { NextRequest, NextResponse } from "next/server";
import { getRootVideoNode } from "@/lib/video/tree";
import { requireAuth, requireRateLimit } from "@/lib/security/api-guard";
import { applySecurityHeaders } from "@/lib/security/headers";

export async function GET(request: NextRequest) {
  const limited = await requireRateLimit(request, "api");
  if (limited) return limited;

  const user = await requireAuth(request);
  if (user instanceof NextResponse) return user;

  const root = await getRootVideoNode();
  if (!root) {
    return applySecurityHeaders(
      NextResponse.json({ error: "No root node" }, { status: 404 }),
    );
  }

  return applySecurityHeaders(NextResponse.json({ rootId: root.id }));
}
