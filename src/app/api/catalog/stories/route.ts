import { NextResponse } from "next/server";
import { listPublishedStories } from "@/lib/video/stories";
import { applySecurityHeaders } from "@/lib/security/headers";

export async function GET() {
  const stories = await listPublishedStories(48);
  return applySecurityHeaders(
    NextResponse.json({
      stories: stories.map((s) => ({
        id: s.id,
        slug: s.slug,
        title: s.title,
        summary: s.summary,
        tags: s.tags,
        viewCount: s.viewCount,
        model: s.model,
        branchCount: s._count.childNodes,
      })),
    }),
  );
}
