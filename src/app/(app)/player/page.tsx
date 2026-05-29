"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const InteractivePlayer = dynamic(
  () =>
    import("@/components/player/InteractivePlayer").then((m) => m.InteractivePlayer),
  { ssr: false, loading: () => <p className="text-zinc-400">Cargando reproductor...</p> },
);

export default function PlayerPage() {
  const [rootId, setRootId] = useState<string | null>(null);

  useEffect(() => {
    void fetch("/api/video/root")
      .then((r) => r.json())
      .then((d) => setRootId(d.rootId))
      .catch(() => setRootId(null));
  }, []);

  if (!rootId) {
    return <p className="text-zinc-400">Buscando nodo inicial...</p>;
  }

  return (
    <section>
      <h1 className="mb-6 text-2xl font-bold text-white">Reproductor interactivo</h1>
      <InteractivePlayer nodeId={rootId} />
    </section>
  );
}
