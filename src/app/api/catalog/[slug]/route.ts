import { NextRequest, NextResponse } from "next/server";
import { getNodeBySlug, getRelatedNodes } from "@/lib/catalog/queries";
import { requireRateLimit } from "@/lib/security/api-guard";
import { applySecurityHeaders } from "@/lib/security/headers";

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  const limited = await requireRateLimit(request, "api");
  if (limited) return limited;

  const { slug } = await context.params;
  const node = await getNodeBySlug(slug);
  if (!node) {
    return applySecurityHeaders(
      NextResponse.json({ error: "Not found" }, { status: 404 }),
    );
  }

  const related = await getRelatedNodes(node.id, node.tags);

  return applySecurityHeaders(
    NextResponse.json({
      node: {
        id: node.id,
        slug: node.slug,
        title: node.title,
        summary: node.summary,
        tags: node.tags,
        durationSec: node.durationSec,
        viewCount: node.viewCount,
        isPremium: node.isPremium,
        tokenCost: node.tokenCost,
        previewSec: node.previewSec,
        thumbnailUrl: node.thumbnailUrl,
        children: node.childNodes,
      },
      related,
    }),
  );
}
