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

export function AdSlot({ placement, zoneId, scriptUrl, className = "", label }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!zoneId || !scriptUrl || !ref.current) return;
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
        className={`flex min-h-[90px] flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-[var(--border)] bg-[var(--bg-card)] text-center text-[11px] text-[var(--text-dim)] ${className}`}
        data-ad-placement={placement}
      >
        <span className="font-medium uppercase tracking-wider text-[var(--text-muted)]">
          {label ?? "Publicidad"}
        </span>
        <span className="opacity-70">ADS_ZONE_{placement.toUpperCase()}</span>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={`ad-slot min-h-[90px] overflow-hidden rounded-lg bg-[var(--bg-card)] ${className}`}
      data-ad-placement={placement}
      data-ad-zone={zoneId}
      id={`ad-${placement}-${zoneId}`}
    />
  );
}
