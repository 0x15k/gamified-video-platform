import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

export async function trackEvent(
  eventType: string,
  userId: string | null,
  metadata: Record<string, unknown> = {},
) {
  await prisma.analyticsEvent.create({
    data: {
      eventType,
      userId: userId ?? undefined,
      metadata: metadata as Prisma.InputJsonValue,
    },
  });
}
