"use client";

import { useEffect } from "react";
import type { ChildOption } from "@/stores/usePlayerStore";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { preloadVideoChunk } from "@/lib/video/preload";

type Props = {
  options: ChildOption[];
};

export function VideoPreloader({ options }: Props) {
  const setPreload = usePlayerStore((s) => s.setPreload);

  useEffect(() => {
    let cancelled = false;

    async function preloadAll() {
      await Promise.all(
        options.map(async (child) => {
          const blobUrl = await preloadVideoChunk(child.streamUrl);
          if (!cancelled && blobUrl) {
            setPreload(child.id, blobUrl);
          }
        }),
      );
    }

    if (options.length > 0) {
      void preloadAll();
    }

    return () => {
      cancelled = true;
    };
  }, [options, setPreload]);

  return (
    <div className="hidden" aria-hidden>
      {options.map((c) => (
        <video key={c.id} preload="auto" muted playsInline src={c.streamUrl} />
      ))}
    </div>
  );
}
