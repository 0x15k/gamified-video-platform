import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildModelAvatarSvg } from "@/lib/catalog/model-avatar-svg";
import { applySecurityHeaders } from "@/lib/security/headers";

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  const { slug } = await context.params;
  const model = await prisma.aiModel.findFirst({
    where: { slug, published: true },
    select: { name: true, avatarUrl: true },
  });

  if (model?.avatarUrl) {
    return NextResponse.redirect(model.avatarUrl, 302);
  }

  const svg = buildModelAvatarSvg(model?.name ?? slug, slug);
  const response = new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
    },
  });
  return applySecurityHeaders(response);
}
