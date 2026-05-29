"use client";

import { useEffect, useState } from "react";

export function ProgressSummary() {
  const [percent, setPercent] = useState(0);
  const [completed, setCompleted] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    void fetch("/api/user/progress")
      .then((r) => r.json())
      .then((d) => {
        setPercent(d.summary?.percent ?? 0);
        setCompleted(d.summary?.completed ?? 0);
        setTotal(d.summary?.totalNodes ?? 0);
      })
      .catch(() => undefined);
  }, []);

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
      <p className="text-xs text-zinc-500">Progreso global</p>
      <p className="text-3xl font-bold text-white">{percent}%</p>
      <p className="mt-1 text-xs text-zinc-400">
        {completed} de {total} nodos completados
      </p>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-zinc-800">
        <div
          className="h-full bg-indigo-500 transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
