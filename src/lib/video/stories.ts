import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

export type StoryScene = {
  id: string;
  title: string;
  choiceLabel: string | null;
  parentNodeId: string | null;
  urlHash: string;
  sourceType: string;
  isPremium: boolean;
  tokenCost: number;
  published: boolean;
  durationSec: number | null;
  hasVideo: boolean;
};

export async function listStoryRoots() {
  return prisma.videoNode.findMany({
    where: { contentKind: "STORY", parentNodeId: null },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      slug: true,
      title: true,
      summary: true,
      published: true,
      urlHash: true,
      model: { select: { id: true, name: true, slug: true } },
      _count: { select: { childNodes: true } },
    },
  });
}

export async function listPublishedStories(limit = 24) {
  return prisma.videoNode.findMany({
    where: {
      contentKind: "STORY",
      parentNodeId: null,
      published: true,
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      slug: true,
      title: true,
      summary: true,
      tags: true,
      viewCount: true,
      model: { select: { slug: true, name: true } },
      _count: {
        select: {
          childNodes: true,
        },
      },
    },
  });
}

export async function getStoryTree(rootId: string) {
  const root = await prisma.videoNode.findFirst({
    where: { id: rootId, contentKind: "STORY", parentNodeId: null },
    include: {
      model: { select: { id: true, name: true, slug: true } },
    },
  });
  if (!root) return null;

  const ids = new Set<string>([rootId]);
  let frontier = [rootId];
  while (frontier.length > 0) {
    const children = await prisma.videoNode.findMany({
      where: { parentNodeId: { in: frontier }, contentKind: "STORY" },
      select: { id: true },
    });
    frontier = [];
    for (const c of children) {
      if (!ids.has(c.id)) {
        ids.add(c.id);
        frontier.push(c.id);
      }
    }
  }

  const scenes = await prisma.videoNode.findMany({
    where: { id: { in: [...ids] } },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      title: true,
      choiceLabel: true,
      parentNodeId: true,
      urlHash: true,
      sourceType: true,
      isPremium: true,
      tokenCost: true,
      published: true,
      durationSec: true,
      contentKind: true,
    },
  });

  const { videoFileExists } = await import("@/lib/video/upload");

  const mapped: StoryScene[] = scenes.map((s) => ({
    id: s.id,
    title: s.title,
    choiceLabel: s.choiceLabel,
    parentNodeId: s.parentNodeId,
    urlHash: s.urlHash,
    sourceType: s.sourceType,
    isPremium: s.isPremium,
    tokenCost: s.tokenCost,
    published: s.published,
    durationSec: s.durationSec,
    hasVideo: s.sourceType === "FILE" && videoFileExists(s.urlHash),
  }));

  return { root, scenes: mapped };
}

export async function getStoryScenesInTree(rootId: string) {
  const tree = await getStoryTree(rootId);
  return tree?.scenes ?? [];
}

export function storyWhereRoot(): Prisma.VideoNodeWhereInput {
  return { contentKind: "STORY", parentNodeId: null };
}
