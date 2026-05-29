import { prisma } from "@/lib/prisma";
import type { PlatformVertical } from "@/generated/prisma/client";
export type { PlatformVerticalKey } from "@/lib/platform/labels";

export type PlatformConfig = {
  siteName: string;
  vertical: PlatformVertical;
  ageGateEnabled: boolean;
};

const DEFAULTS: PlatformConfig = {
  siteName: "Gamified Platform",
  vertical: "NEUTRAL",
  ageGateEnabled: false,
};

export async function getPlatformSettings(): Promise<PlatformConfig> {
  const row = await prisma.platformSettings.findUnique({ where: { id: "default" } });
  if (!row) return DEFAULTS;
  return {
    siteName: row.siteName,
    vertical: row.vertical,
    ageGateEnabled: row.ageGateEnabled,
  };
}
