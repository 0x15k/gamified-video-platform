"use client";

import { Suspense, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";

const InteractivePlayer = dynamic(
  () =>
    import("@/components/player/InteractivePlayer").then((m) => m.InteractivePlayer),
  { ssr: false, loading: () => <p className="text-zinc-400">Cargando reproductor...</p> },
);

function PlayerContent() {
  const searchParams = useSearchParams();
  const queryNode = searchParams.get("node");
  const [rootId, setRootId] = useState<string | null>(queryNode);

  useEffect(() => {
    if (queryNode) {
      setRootId(queryNode);
      return;
    }
    void fetch("/api/video/root")
      .then((r) => r.json())
      .then((d) => setRootId(d.rootId))
      .catch(() => setRootId(null));
  }, [queryNode]);

  if (!rootId) {
    return <p className="text-zinc-400">Buscando nodo inicial...</p>;
  }
  return <InteractivePlayer nodeId={rootId} />;
}

export default function PlayerPage() {
  return (
    <section>
      <PageHeader
        title="Reproductor interactivo"
        description="Funcional pero en fase de refinamiento. Usa el mapa de historia para navegar el árbol."
        action={
          <Link href="/story" className="text-sm text-indigo-400 hover:text-indigo-300">
            Ver mapa →
          </Link>
        }
      />
      <div className="mb-4 rounded-lg border border-amber-500/30 bg-amber-950/20 px-4 py-3 text-sm text-amber-200">
        Fase actual: cascarón y lógica core. Optimización de video y pre-buffering se pulirán al
        final del roadmap.
      </div>
      <Suspense fallback={<p className="text-zinc-400">Cargando...</p>}>
        <PlayerContent />
      </Suspense>
    </section>
  );
}
