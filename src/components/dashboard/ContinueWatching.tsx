"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type ContinueData = {
  nodeId?: string;
  id?: string;
  title: string;
  status?: string;
};

export function ContinueWatching() {
  const [data, setData] = useState<ContinueData | null>(null);

  useEffect(() => {
    void fetch("/api/user/progress/continue")
      .then((r) => r.json())
      .then((d) => {
        const c = d.continue;
        if (!c) return;
        setData({
          nodeId: c.nodeId ?? c.id,
          title: c.title,
          status: c.status,
        });
      })
      .catch(() => setData(null));
  }, []);

  if (!data?.nodeId) return null;

  return (
    <Link
      href={`/player?node=${data.nodeId}`}
      className="mb-6 block rounded-xl border border-indigo-500/40 bg-indigo-950/30 p-4 transition hover:border-indigo-400"
    >
      <p className="text-xs font-medium text-indigo-300">Continuar</p>
      <p className="mt-1 text-lg font-semibold text-white">{data.title}</p>
      {data.status && (
        <p className="mt-1 text-xs text-zinc-400">Estado: {data.status}</p>
      )}
    </Link>
  );
}
