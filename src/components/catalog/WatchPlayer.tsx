"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AdSlot } from "@/components/ads/AdSlot";
import { useAdConfig } from "@/components/ads/AdContext";
import type { AdPlacement } from "@/lib/ads/config";

type Props = {
  slug: string;
  title: string;
  showAds: boolean;
};

export function WatchPlayer({ slug, title, showAds }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const adConfig = useAdConfig();
  const [error, setError] = useState("");
  const [previewSec, setPreviewSec] = useState<number | null>(null);
  const [showPreroll, setShowPreroll] = useState(showAds);

  useEffect(() => {
    let disposed = false;

    async function load() {
      const res = await fetch(`/api/catalog/${slug}/play`);
      if (!res.ok) {
        setError("No se pudo cargar el vídeo.");
        return;
      }
      const data = await res.json();
      if (disposed) return;

      setPreviewSec(data.previewSec ?? null);
      void fetch(`/api/catalog/${slug}/view`, { method: "POST" });

      const video = videoRef.current;
      if (!video) return;
      video.src = data.streamUrl;

      if (data.previewSec) {
        const onTime = () => {
          if (video.currentTime >= data.previewSec) {
            video.pause();
            setError("preview_end");
          }
        };
        video.addEventListener("timeupdate", onTime);
        return () => video.removeEventListener("timeupdate", onTime);
      }
    }

    void load();
    return () => {
      disposed = true;
    };
  }, [slug]);

  function zone(placement: AdPlacement) {
    return adConfig.zones[placement];
  }

  return (
    <div className="space-y-3">
      {showAds && showPreroll && (
        <div className="space-y-1">
          <AdSlot
            placement="watch_preroll"
            zoneId={zone("watch_preroll")}
            scriptUrl={adConfig.scriptUrl}
            label="Anuncio"
            className="min-h-[120px]"
          />
          <button
            type="button"
            onClick={() => setShowPreroll(false)}
            className="text-xs text-[var(--text-dim)] hover:text-[var(--accent)]"
          >
            Saltar anuncio →
          </button>
        </div>
      )}
      <div className="overflow-hidden rounded-xl bg-black ring-1 ring-[var(--border)]">
        <video
          ref={videoRef}
          controls
          playsInline
          className="aspect-video w-full bg-black"
          title={title}
        />
      </div>
      {previewSec && !error && (
        <p className="text-xs text-[var(--text-muted)]">
          Vista previa · {previewSec}s
        </p>
      )}
      {error === "preview_end" && (
        <div className="surface-panel border-[var(--accent)]/30 p-4 text-sm">
          <p className="font-medium text-white">Vista previa finalizada</p>
          <p className="mt-1 text-[var(--text-muted)]">
            <Link href="/login" className="text-[var(--accent)] hover:underline">
              Inicia sesión
            </Link>{" "}
            o{" "}
            <Link href="/upgrade" className="text-[var(--premium)] hover:underline">
              pásate a Premium
            </Link>{" "}
            para ver el vídeo completo sin anuncios.
          </p>
        </div>
      )}
      {error && error !== "preview_end" && (
        <p className="text-sm text-red-400">{error}</p>
      )}
    </div>
  );
}
