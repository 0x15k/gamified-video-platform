import { prisma } from "@/lib/prisma";
import { listSelect } from "@/lib/catalog/queries";

export const modelListSelect = {
  id: true,
  slug: true,
  name: true,
  bio: true,
  avatarUrl: true,
  tags: true,
  isLive: true,
  viewCount: true,
  _count: { select: { videos: { where: { published: true, parentNodeId: null } } } },
} as const;

export async function listModels(params?: { limit?: number; liveOnly?: boolean }) {
  const limit = Math.min(48, Math.max(1, params?.limit ?? 24));

  return prisma.aiModel.findMany({
    where: {
      published: true,
      ...(params?.liveOnly ? { isLive: true } : {}),
    },
    orderBy: [{ viewCount: "desc" }, { name: "asc" }],
    take: limit,
    select: modelListSelect,
  });
}

export async function getModelBySlug(slug: string) {
  return prisma.aiModel.findFirst({
    where: { slug, published: true },
    select: {
      ...modelListSelect,
      createdAt: true,
    },
  });
}

export async function listModelVideos(modelId: string, limit = 48) {
  return prisma.videoNode.findMany({
    where: {
      modelId,
      published: true,
      parentNodeId: null,
    },
    orderBy: [{ viewCount: "desc" }, { createdAt: "desc" }],
    take: limit,
    select: listSelect,
  });
}

export async function refreshModelViewCount(modelId: string) {
  const agg = await prisma.videoNode.aggregate({
    where: { modelId, published: true, parentNodeId: null },
    _sum: { viewCount: true },
  });
  const total = agg._sum.viewCount ?? 0;
  return prisma.aiModel.update({
    where: { id: modelId },
    data: { viewCount: total },
    select: { viewCount: true },
  });
}
