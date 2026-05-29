import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { getPopularTags } from "@/lib/catalog/queries";
import { getSiteUrl } from "@/lib/platform/site-url";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const now = new Date();

  const [nodes, tags, models] = await Promise.all([
    prisma.videoNode.findMany({
      where: { published: true, parentNodeId: null },
      select: { slug: true, createdAt: true },
      orderBy: { viewCount: "desc" },
      take: 5000,
    }),
    getPopularTags(50),
    prisma.aiModel.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true },
      take: 500,
    }),
  ]);

  return [
    { url: base, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${base}/catalog`, lastModified: now, changeFrequency: "hourly", priority: 0.9 },
    { url: `${base}/models`, lastModified: now, changeFrequency: "daily", priority: 0.85 },
    ...models.map((m) => ({
      url: `${base}/model/${m.slug}`,
      lastModified: m.updatedAt ?? now,
      changeFrequency: "weekly" as const,
      priority: 0.75,
    })),
    ...nodes.map((n) => ({
      url: `${base}/watch/${n.slug}`,
      lastModified: n.createdAt ?? now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...tags.map((t) => ({
      url: `${base}/catalog?tag=${encodeURIComponent(t.tag)}`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.6,
    })),
  ];
}
