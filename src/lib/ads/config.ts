export type AdPlacement =
  | "catalog_top"
  | "catalog_inline"
  | "catalog_sidebar"
  | "watch_top"
  | "watch_preroll"
  | "watch_sidebar"
  | "watch_bottom";

export type AdNetworkConfig = {
  enabled: boolean;
  /** ExoClick, TrafficJunky, etc. — script URL from your ad network dashboard */
  scriptUrl?: string;
  zones: Partial<Record<AdPlacement, string>>;
};

export function getAdConfig(): AdNetworkConfig {
  const enabled = process.env.ADS_ENABLED === "true";
  return {
    enabled,
    scriptUrl: process.env.ADS_SCRIPT_URL || undefined,
    zones: {
      catalog_top: process.env.ADS_ZONE_CATALOG_TOP,
      catalog_inline: process.env.ADS_ZONE_CATALOG_INLINE,
      catalog_sidebar: process.env.ADS_ZONE_CATALOG_SIDEBAR,
      watch_top: process.env.ADS_ZONE_WATCH_TOP,
      watch_preroll: process.env.ADS_ZONE_WATCH_PREROLL,
      watch_sidebar: process.env.ADS_ZONE_WATCH_SIDEBAR,
      watch_bottom: process.env.ADS_ZONE_WATCH_BOTTOM,
    },
  };
}
