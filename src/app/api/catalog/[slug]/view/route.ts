import { NextRequest, NextResponse } from "next/server";
import { getNodeBySlug, incrementViewCount } from "@/lib/catalog/queries";
import { requireRateLimit, jsonError } from "@/lib/security/api-guard";
import { applySecurityHeaders } from "@/lib/security/headers";

type RouteContext = { params: Promise<{ slug: string }> };

export async function POST(request: NextRequest, context: RouteContext) {
  const limited = await requireRateLimit(request, "api", "catalog-view");
  if (limited) return limited;

  const { slug } = await context.params;
  const node = await getNodeBySlug(slug);
  if (!node) return jsonError("Not found", 404);

  const updated = await incrementViewCount(node.id);

  return applySecurityHeaders(
    NextResponse.json({ viewCount: updated.viewCount }),
  );
}
