import { NextRequest, NextResponse } from "next/server";
import { listCatalog, getPopularTags } from "@/lib/catalog/queries";
import type { CatalogSort } from "@/lib/catalog/queries";
import { getPlatformSettings } from "@/lib/platform/settings";
import { requireRateLimit } from "@/lib/security/api-guard";
import { applySecurityHeaders } from "@/lib/security/headers";

export async function GET(request: NextRequest) {
  const limited = await requireRateLimit(request, "api");
  if (limited) return limited;

  const { searchParams } = request.nextUrl;
  const sort = (searchParams.get("sort") as CatalogSort | null) ?? "trending";
  const page = Number(searchParams.get("page") ?? "1");

  const platform = await getPlatformSettings();
  const aiOnly = platform.vertical === "ADULT";

  const [catalog, tags] = await Promise.all([
    listCatalog({
      q: searchParams.get("q") ?? undefined,
      tag: searchParams.get("tag") ?? undefined,
      sort: ["trending", "recent", "duration"].includes(sort) ? sort : "trending",
      page: Number.isFinite(page) ? page : 1,
      aiOnly,
    }),
    getPopularTags(20, aiOnly),
  ]);

  return applySecurityHeaders(NextResponse.json({ ...catalog, tags }));
}
