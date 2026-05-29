import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

export type CatalogSort = "trending" | "recent" | "duration";

export type CatalogListParams = {
  q?: string;
  tag?: string;
  sort?: CatalogSort;
  page?: number;
  pageSize?: number;
  /** Catálogo adulto: solo entradas con tags de contenido IA. */
  aiOnly?: boolean;
};

export const listSelect = {
  id: true,
  slug: true,
  title: true,
  summary: true,
  tags: true,
  sourceType: true,
  durationSec: true,
  viewCount: true,
  isPremium: true,
  thumbnailUrl: true,
  createdAt: true,
} as const;

export async function listCatalog(params: CatalogListParams) {
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(48, Math.max(12, params.pageSize ?? 24));
  const skip = (page - 1) * pageSize;

  const where: Prisma.VideoNodeWhereInput = {
    published: true,
    parentNodeId: null,
    contentKind: "CLIP",
  };

  const aiTags = ["ai", "ia", "animation", "animated", "3d", "cgi", "generated"];

  if (params.aiOnly && params.tag) {
    where.AND = [
      { tags: { hasSome: aiTags } },
      { tags: { has: params.tag.toLowerCase() } },
    ];
  } else if (params.aiOnly) {
    where.tags = { hasSome: aiTags };
  } else if (params.tag) {
    where.tags = { has: params.tag.toLowerCase() };
  }

  if (params.q?.trim()) {
    const q = params.q.trim();
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { summary: { contains: q, mode: "insensitive" } },
      { tags: { has: q.toLowerCase() } },
    ];
  }

  const orderBy: Prisma.VideoNodeOrderByWithRelationInput[] =
    params.sort === "recent"
      ? [{ createdAt: "desc" }]
      : params.sort === "duration"
        ? [{ durationSec: "desc" }]
        : [{ viewCount: "desc" }, { createdAt: "desc" }];

  const [items, total] = await Promise.all([
    prisma.videoNode.findMany({
      where,
      orderBy,
      skip,
      take: pageSize,
      select: listSelect,
    }),
    prisma.videoNode.count({ where }),
  ]);

  return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export async function getPopularTags(limit = 20, aiOnly = false) {
  const aiTags = ["ai", "ia", "animation", "animated", "3d", "cgi", "generated"];
  const nodes = await prisma.videoNode.findMany({
    where: {
      published: true,
      parentNodeId: null,
      ...(aiOnly ? { tags: { hasSome: aiTags } } : {}),
    },
    select: { tags: true },
    take: 500,
  });
  const counts = new Map<string, number>();
  for (const n of nodes) {
    for (const t of n.tags) {
      const key = t.toLowerCase();
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([tag, count]) => ({ tag, count }));
}

export async function getNodeBySlug(slug: string) {
  return prisma.videoNode.findFirst({
    where: { slug, published: true },
    include: {
      model: {
        select: { slug: true, name: true, avatarUrl: true, isLive: true },
      },
      childNodes: {
        where: { published: true },
        select: {
          id: true,
          slug: true,
          title: true,
          isPremium: true,
          tokenCost: true,
          durationSec: true,
        },
      },
    },
  });
}

export async function getRelatedNodes(nodeId: string, tags: string[], limit = 8) {
  if (tags.length === 0) {
    return prisma.videoNode.findMany({
      where: { published: true, parentNodeId: null, id: { not: nodeId } },
      orderBy: { viewCount: "desc" },
      take: limit,
      select: listSelect,
    });
  }
  return prisma.videoNode.findMany({
    where: {
      published: true,
      parentNodeId: null,
      id: { not: nodeId },
      tags: { hasSome: tags },
    },
    orderBy: { viewCount: "desc" },
    take: limit,
    select: listSelect,
  });
}

export async function incrementViewCount(nodeId: string) {
  return prisma.videoNode.update({
    where: { id: nodeId },
    data: { viewCount: { increment: 1 } },
    select: { viewCount: true },
  });
}
