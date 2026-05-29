import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildThumbnailSvg } from "@/lib/catalog/thumbnail-svg";
import { applySecurityHeaders } from "@/lib/security/headers";

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  const { slug } = await context.params;
  const node = await prisma.videoNode.findFirst({
    where: { slug, published: true },
    select: { title: true, tags: true, thumbnailUrl: true },
  });

  if (node?.thumbnailUrl) {
    return NextResponse.redirect(node.thumbnailUrl, 302);
  }

  const svg = buildThumbnailSvg(node?.title ?? slug, node?.tags ?? []);
  const response = new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
    },
  });
  return applySecurityHeaders(response);
}
