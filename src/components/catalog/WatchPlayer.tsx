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
            setError(
              "Vista previa finalizada. Inicia sesión o pasa a Premium para ver el contenido completo.",
            );
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
    <div className="space-y-4">
      {showAds && showPreroll && (
        <div className="space-y-2">
          <AdSlot
            placement="watch_preroll"
            zoneId={zone("watch_preroll")}
            scriptUrl={adConfig.scriptUrl}
            label="Anuncio previo"
          />
          <button
            type="button"
            onClick={() => setShowPreroll(false)}
            className="text-xs text-zinc-500 hover:text-zinc-300"
          >
            Saltar anuncio →
          </button>
        </div>
      )}
      <div className="overflow-hidden rounded-xl border border-zinc-800 bg-black">
        <video
          ref={videoRef}
          controls
          playsInline
          className="aspect-video w-full"
          title={title}
        />
      </div>
      {previewSec && (
        <p className="text-sm text-amber-300/90">
          Vista previa: {previewSec}s ·{" "}
          <Link href="/login" className="underline">
            Iniciar sesión
          </Link>{" "}
          o{" "}
          <Link href="/upgrade" className="underline">
            Premium sin anuncios
          </Link>
        </p>
      )}
      {error && <p className="text-sm text-red-300">{error}</p>}
    </div>
  );
}
