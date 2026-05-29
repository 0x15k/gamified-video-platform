import { NextRequest, NextResponse } from "next/server";
import { listModels } from "@/lib/catalog/models";
import { applySecurityHeaders } from "@/lib/security/headers";

export async function GET(request: NextRequest) {
  const liveOnly = request.nextUrl.searchParams.get("live") === "1";
  const limit = Number(request.nextUrl.searchParams.get("limit") ?? "24");

  const models = await listModels({ liveOnly, limit });

  return applySecurityHeaders(
    NextResponse.json({
      models: models.map((m) => ({
        slug: m.slug,
        name: m.name,
        bio: m.bio,
        avatarUrl: m.avatarUrl ?? `/api/model/${m.slug}/avatar`,
        tags: m.tags,
        isLive: m.isLive,
        viewCount: m.viewCount,
        videoCount: m._count.videos,
      })),
    }),
  );
}
