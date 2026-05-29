"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { VideoCard, type CatalogItem } from "@/components/catalog/VideoCard";

export function CatalogGrid() {
  const params = useSearchParams();
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const pendingRef = useRef(false);

  const filterKey = params.toString();

  const loadPage = useCallback(
    async (pageNum: number, append: boolean) => {
      const qs = new URLSearchParams(filterKey);
      qs.set("page", String(pageNum));
      const res = await fetch(`/api/catalog?${qs}`);
      if (!res.ok) return;
      const d = await res.json();
      setTotalPages(d.totalPages ?? 1);
      setPage(d.page ?? pageNum);
      setItems((prev) => (append ? [...prev, ...(d.items ?? [])] : (d.items ?? [])));
    },
    [filterKey],
  );

  useEffect(() => {
    setLoading(true);
    setItems([]);
    setPage(1);
    void loadPage(1, false).finally(() => setLoading(false));
  }, [filterKey, loadPage]);

  useEffect(() => {
    if (loading || loadingMore || page >= totalPages) return;
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting || pendingRef.current) return;
        pendingRef.current = true;
        setLoadingMore(true);
        void loadPage(page + 1, true).finally(() => {
          setLoadingMore(false);
          pendingRef.current = false;
        });
      },
      { rootMargin: "200px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loading, loadingMore, page, totalPages, loadPage]);

  if (loading) return <p className="text-zinc-500">Cargando catálogo…</p>;
  if (!items.length) {
    return (
      <p className="rounded-xl border border-zinc-800 p-8 text-center text-zinc-500">
        Sin resultados.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
        {items.map((item) => (
          <VideoCard key={`${item.slug}-${item.title}`} item={item} />
        ))}
      </div>
      <div ref={sentinelRef} className="h-8" />
      {loadingMore && <p className="text-center text-sm text-zinc-500">Cargando más…</p>}
      {page >= totalPages && items.length > 0 && (
        <p className="text-center text-xs text-zinc-600">Fin del catálogo</p>
      )}
    </div>
  );
}
