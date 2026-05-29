"use client";

import { useEffect, useRef } from "react";
import type { AdPlacement } from "@/lib/ads/config";

type Props = {
  placement: AdPlacement;
  zoneId?: string;
  scriptUrl?: string;
  className?: string;
  label?: string;
};

/**
 * Renders an ad zone. In production, paste your network's ins tag or loader script.
 * Zone IDs come from env (ExoClick, TrafficJunky, etc.).
 */
export function AdSlot({ placement, zoneId, scriptUrl, className = "", label }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!zoneId || !scriptUrl || !ref.current) return;
    // Networks vary; this hook point loads a global script once per page if needed.
    const existing = document.querySelector(`script[data-ad-loader="${scriptUrl}"]`);
    if (!existing) {
      const s = document.createElement("script");
      s.src = scriptUrl;
      s.async = true;
      s.dataset.adLoader = scriptUrl;
      document.body.appendChild(s);
    }
  }, [scriptUrl, zoneId]);

  if (!zoneId) {
    return (
      <div
        className={`flex min-h-[90px] items-center justify-center rounded-lg border border-dashed border-zinc-700 bg-zinc-900/40 text-xs text-zinc-500 ${className}`}
        data-ad-placement={placement}
      >
        {label ?? `Ad · ${placement}`}
        <span className="ml-1 hidden sm:inline">(configura ADS_ZONE_* en .env)</span>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={`ad-slot min-h-[90px] overflow-hidden rounded-lg bg-zinc-900/60 ${className}`}
      data-ad-placement={placement}
      data-ad-zone={zoneId}
      id={`ad-${placement}-${zoneId}`}
    />
  );
}
