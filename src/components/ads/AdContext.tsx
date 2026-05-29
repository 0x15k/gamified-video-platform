"use client";

import { createContext, useContext } from "react";
import type { AdNetworkConfig } from "@/lib/ads/config";

const AdContext = createContext<AdNetworkConfig>({ enabled: false, zones: {} });

export function AdProvider({
  config,
  children,
}: {
  config: AdNetworkConfig;
  children: React.ReactNode;
}) {
  return <AdContext.Provider value={config}>{children}</AdContext.Provider>;
}

export function useAdConfig() {
  return useContext(AdContext);
}
