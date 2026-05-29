import { NextRequest, NextResponse } from "next/server";
import {
  requireAuth,
  requireRateLimit,
  deductTokensForNode,
} from "@/lib/security/api-guard";
import { getVideoNodeWithChildren } from "@/lib/video/tree";
import { issueMediaToken } from "@/lib/security/media-token";
import { applySecurityHeaders } from "@/lib/security/headers";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  const limited = await requireRateLimit(request, "api");
  if (limited) return limited;

  const user = await requireAuth(request);
  if (user instanceof NextResponse) return user;

  const { id } = await context.params;
  const node = await getVideoNodeWithChildren(id);
  if (!node) {
    return applySecurityHeaders(
      NextResponse.json({ error: "Not found" }, { status: 404 }),
    );
  }

  const access = await deductTokensForNode(user.id, node);
  if (!access.ok) return access.response;
  const activeUser = access.user;

  const streamToken = await issueMediaToken({
    fileName: `${node.urlHash}.mp4`,
    userId: activeUser.id,
    nodeId: node.id,
  });

  const baseUrl = request.nextUrl.origin;
  const streamUrl = `${baseUrl}/api/media/stream?token=${encodeURIComponent(streamToken)}`;

  const children = await Promise.all(
    node.childNodes.map(async (child) => {
      const childToken = await issueMediaToken({
        fileName: `${child.urlHash}.mp4`,
        userId: activeUser.id,
        nodeId: child.id,
      });
      return {
        id: child.id,
        title: child.title,
        isPremium: child.isPremium,
        tokenCost: child.tokenCost,
        durationSec: child.durationSec,
        streamUrl: `${baseUrl}/api/media/stream?token=${encodeURIComponent(childToken)}`,
      };
    }),
  );

  return applySecurityHeaders(
    NextResponse.json({
      node: {
        id: node.id,
        title: node.title,
        isPremium: node.isPremium,
        tokenCost: node.tokenCost,
        durationSec: node.durationSec,
        streamUrl,
      },
      children,
      user: {
        tokensBalance: activeUser.tokensBalance,
        role: activeUser.role,
      },
    }),
  );
}
