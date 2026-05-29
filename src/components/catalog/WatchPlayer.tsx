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

type PlayPayload = {
  sourceType: "FILE" | "EMBED";
  streamUrl?: string;
  embedUrl?: string | null;
  previewSec?: number | null;
  locked?: boolean;
};

export function WatchPlayer({ slug, title, showAds }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const adConfig = useAdConfig();
  const [error, setError] = useState("");
  const [play, setPlay] = useState<PlayPayload | null>(null);
  const [showPreroll, setShowPreroll] = useState(showAds);

  useEffect(() => {
    let disposed = false;

    async function load() {
      setError("");
      const res = await fetch(`/api/catalog/${slug}/play`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(typeof data.error === "string" ? data.error : "No se pudo cargar el vídeo.");
        return;
      }
      const data = (await res.json()) as PlayPayload;
      if (disposed) return;

      setPlay(data);
      void fetch(`/api/catalog/${slug}/view`, { method: "POST" });
    }

    void load();
    return () => {
      disposed = true;
    };
  }, [slug]);

  useEffect(() => {
    if (play?.sourceType !== "FILE" || !play.streamUrl) return;

    const video = videoRef.current;
    if (!video) return;

    setError("");
    video.src = play.streamUrl;
    void video.load();

    const onError = () => {
      setError("playback_failed");
    };

    video.addEventListener("error", onError);

    let removePreview: (() => void) | undefined;
    if (play.previewSec) {
      const onTime = () => {
        if (video.currentTime >= play.previewSec!) {
          video.pause();
          setError("preview_end");
        }
      };
      video.addEventListener("timeupdate", onTime);
      removePreview = () => video.removeEventListener("timeupdate", onTime);
    }

    return () => {
      video.removeEventListener("error", onError);
      removePreview?.();
    };
  }, [play]);

  function zone(placement: AdPlacement) {
    return adConfig.zones[placement];
  }

  const preroll = showAds && showPreroll && (
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
  );

  if (play?.sourceType === "EMBED") {
    return (
      <div className="space-y-3">
        {preroll}
        {play.locked || !play.embedUrl ? (
          <div className="surface-panel flex aspect-video flex-col items-center justify-center gap-3 p-6 text-center">
            <p className="font-medium text-white">Contenido premium / embed bloqueado</p>
            <p className="text-sm text-[var(--text-muted)]">
              <Link href="/login" className="text-[var(--accent)] hover:underline">
                Inicia sesión
              </Link>{" "}
              o{" "}
              <Link href="/upgrade" className="text-[var(--premium)] hover:underline">
                Premium
              </Link>
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl bg-black ring-1 ring-[var(--border)]">
            <iframe
              src={play.embedUrl}
              title={title}
              className="aspect-video w-full border-0"
              allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
              allowFullScreen
              loading="lazy"
            />
          </div>
        )}
        <p className="text-xs text-[var(--text-dim)]">
          Vídeo embebido de fuente externa · solo contenido etiquetado IA
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {preroll}
      <div className="overflow-hidden rounded-xl bg-black ring-1 ring-[var(--border)]">
        <video
          ref={videoRef}
          controls
          playsInline
          className="aspect-video w-full bg-black"
          title={title}
        />
      </div>
      {play?.previewSec && !error && (
        <p className="text-xs text-[var(--text-muted)]">Vista previa · {play.previewSec}s</p>
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
      {error === "playback_failed" && (
        <div className="surface-panel border-red-500/30 p-4 text-sm">
          <p className="font-medium text-white">Vídeo no disponible</p>
          <p className="mt-1 text-[var(--text-muted)]">
            Este clip no tiene embed ni archivo válido. En{" "}
            <Link href="/admin/content" className="text-[var(--accent)] hover:underline">
              Admin → Contenido
            </Link>{" "}
            pega la URL <code className="text-xs">https://www.pornhub.com/embed/…</code>
          </p>
        </div>
      )}
      {error && error !== "preview_end" && error !== "playback_failed" && (
        <p className="text-sm text-red-400">{error}</p>
      )}
    </div>
  );
}
