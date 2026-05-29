import { NextRequest, NextResponse } from "next/server";
import { getModelBySlug, listModelVideos } from "@/lib/catalog/models";
import { applySecurityHeaders } from "@/lib/security/headers";
import { jsonError } from "@/lib/security/api-guard";

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  const { slug } = await context.params;
  const model = await getModelBySlug(slug);
  if (!model) return jsonError("Not found", 404);

  const videos = await listModelVideos(model.id);

  return applySecurityHeaders(
    NextResponse.json({
      model: {
        slug: model.slug,
        name: model.name,
        bio: model.bio,
        avatarUrl: model.avatarUrl ?? `/api/model/${model.slug}/avatar`,
        tags: model.tags,
        isLive: model.isLive,
        viewCount: model.viewCount,
        videoCount: model._count.videos,
      },
      videos,
    }),
  );
}
