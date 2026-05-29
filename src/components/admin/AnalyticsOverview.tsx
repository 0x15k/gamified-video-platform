"use client";

import { useEffect, useState } from "react";

type Overview = {
  totalUsers: number;
  completedProgress: number;
  tokenPurchases: number;
  eventsByType: { eventType: string; count: number }[];
};

export function AnalyticsOverview() {
  const [data, setData] = useState<Overview | null>(null);

  useEffect(() => {
    void fetch("/api/admin/analytics")
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData(null));
  }, []);

  if (!data) return <p className="text-zinc-400">Cargando métricas...</p>;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-zinc-800 p-4">
          <p className="text-xs text-zinc-500">Usuarios</p>
          <p className="text-2xl font-bold text-white">{data.totalUsers}</p>
        </div>
        <div className="rounded-xl border border-zinc-800 p-4">
          <p className="text-xs text-zinc-500">Completados</p>
          <p className="text-2xl font-bold text-white">{data.completedProgress}</p>
        </div>
        <div className="rounded-xl border border-zinc-800 p-4">
          <p className="text-xs text-zinc-500">Transacciones (7d)</p>
          <p className="text-2xl font-bold text-white">{data.tokenPurchases}</p>
        </div>
      </div>
      <div className="rounded-xl border border-zinc-800 p-4">
        <h3 className="mb-3 font-medium text-white">Eventos (7 días)</h3>
        <ul className="space-y-1 text-sm text-zinc-400">
          {data.eventsByType.map((e) => (
            <li key={e.eventType} className="flex justify-between">
              <span>{e.eventType}</span>
              <span className="text-white">{e.count}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
