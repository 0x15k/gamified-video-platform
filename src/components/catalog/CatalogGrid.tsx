"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { VideoCard, type CatalogItem } from "@/components/catalog/VideoCard";
import Link from "next/link";

export function CatalogGrid() {
  const params = useSearchParams();
  const [data, setData] = useState<{
    items: CatalogItem[];
    page: number;
    totalPages: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const qs = params.toString();
    void fetch(`/api/catalog?${qs}`)
      .then((r) => r.json())
      .then((d) => {
        setData({ items: d.items ?? [], page: d.page, totalPages: d.totalPages });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params]);

  if (loading) return <p className="text-zinc-500">Cargando catálogo…</p>;
  if (!data?.items.length) {
    return <p className="rounded-xl border border-zinc-800 p-8 text-center text-zinc-500">Sin resultados.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.items.map((item) => (
          <VideoCard key={item.slug} item={item} />
        ))}
      </div>
      {data.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {data.page > 1 && (
            <Link
              href={`/catalog?${updatePage(params, data.page - 1)}`}
              className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300"
            >
              ← Anterior
            </Link>
          )}
          <span className="px-4 py-2 text-sm text-zinc-500">
            {data.page} / {data.totalPages}
          </span>
          {data.page < data.totalPages && (
            <Link
              href={`/catalog?${updatePage(params, data.page + 1)}`}
              className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300"
            >
              Siguiente →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

function updatePage(params: URLSearchParams, page: number) {
  const next = new URLSearchParams(params.toString());
  next.set("page", String(page));
  return next.toString();
}
