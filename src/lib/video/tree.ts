import { prisma } from "@/lib/prisma";

export async function getVideoNodeWithChildren(id: string) {
  return prisma.videoNode.findUnique({
    where: { id },
    include: {
      childNodes: {
        select: {
          id: true,
          title: true,
          choiceLabel: true,
          urlHash: true,
          isPremium: true,
          tokenCost: true,
          durationSec: true,
        },
      },
    },
  });
}

export async function getRootVideoNode() {
  return prisma.videoNode.findFirst({
    where: { parentNodeId: null, contentKind: "STORY", published: true },
    orderBy: { createdAt: "asc" },
  });
}
