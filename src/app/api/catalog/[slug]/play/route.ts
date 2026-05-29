import { NextRequest, NextResponse } from "next/server";
import { getNodeBySlug } from "@/lib/catalog/queries";
import {
  getAuthUser,
  deductTokensForNode,
  requireRateLimit,
  jsonError,
} from "@/lib/security/api-guard";
import { hasPremiumPlan } from "@/lib/rbac/permissions";
import { issueMediaToken } from "@/lib/security/media-token";
import { applySecurityHeaders } from "@/lib/security/headers";

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  const limited = await requireRateLimit(request, "media");
  if (limited) return limited;

  const { slug } = await context.params;
  const node = await getNodeBySlug(slug);
  if (!node) return jsonError("Not found", 404);

  const user = await getAuthUser(request);
  const clientIp =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "guest";

  let previewSec: number | null = null;
  let userId = `guest:${clientIp}`;

  if (user) {
    userId = user.id;
    if (node.isPremium && !hasPremiumPlan(user.plan)) {
      const access = await deductTokensForNode(user.id, node);
      if (!access.ok) {
        previewSec = node.previewSec;
        userId = `guest:${clientIp}`;
      }
    }
  } else if (node.isPremium) {
    previewSec = node.previewSec;
  }

  const streamToken = await issueMediaToken({
    fileName: `${node.urlHash}.mp4`,
    userId,
    nodeId: node.id,
  });

  const baseUrl = request.nextUrl.origin;
  const streamUrl = `${baseUrl}/api/media/stream?token=${encodeURIComponent(streamToken)}`;

  return applySecurityHeaders(
    NextResponse.json({
      streamUrl,
      previewSec,
      isPremium: node.isPremium,
      requiresLogin: !user && node.isPremium,
      plan: user?.plan ?? null,
    }),
  );
}
