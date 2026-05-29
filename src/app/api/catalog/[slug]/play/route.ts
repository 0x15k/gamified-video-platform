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
import { canonicalizeEmbedUrl } from "@/lib/video/embed";
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
  let locked = false;

  if (node.sourceType === "EMBED") {
    if (!node.embedUrl) {
      return jsonError("Embed URL not configured", 503);
    }

    const embedUrl = canonicalizeEmbedUrl(node.embedUrl);
    if (!embedUrl) {
      return jsonError(
        "URL de embed no válida. Usa el enlace «Embed» (ej. https://www.pornhub.com/embed/…), no la página del vídeo.",
        503,
      );
    }

    if (user) {
      if (node.isPremium && !hasPremiumPlan(user.plan)) {
        const access = await deductTokensForNode(user.id, node);
        if (!access.ok) locked = true;
      }
    } else if (node.isPremium) {
      locked = true;
    }

    return applySecurityHeaders(
      NextResponse.json({
        sourceType: "EMBED",
        embedUrl: locked ? null : embedUrl,
        previewSec: locked ? node.previewSec : null,
        isPremium: node.isPremium,
        locked,
        requiresLogin: !user && node.isPremium,
        plan: user?.plan ?? null,
      }),
    );
  }

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
      sourceType: "FILE",
      streamUrl,
      previewSec,
      isPremium: node.isPremium,
      locked: false,
      requiresLogin: !user && node.isPremium,
      plan: user?.plan ?? null,
    }),
  );
}
