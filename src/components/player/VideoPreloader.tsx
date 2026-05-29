"use client";

import { useEffect } from "react";
import type { ChildOption } from "@/stores/usePlayerStore";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { preloadVideoChunk } from "@/lib/video/preload";

type Props = {
  children: ChildOption[];
};

export function VideoPreloader({ children }: Props) {
  const setPreload = usePlayerStore((s) => s.setPreload);

  useEffect(() => {
    let cancelled = false;

    async function preloadAll() {
      await Promise.all(
        children.map(async (child) => {
          const blobUrl = await preloadVideoChunk(child.streamUrl);
          if (!cancelled && blobUrl) {
            setPreload(child.id, blobUrl);
          }
        }),
      );
    }

    if (children.length > 0) {
      void preloadAll();
    }

    return () => {
      cancelled = true;
    };
  }, [children, setPreload]);

  return (
    <div className="hidden" aria-hidden>
      {children.map((c) => (
        <video key={c.id} preload="auto" muted playsInline src={c.streamUrl} />
      ))}
    </div>
  );
}
