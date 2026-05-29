"use client";

import { useRouter, useSearchParams } from "next/navigation";

const SORTS = [
  { value: "trending", label: "🔥 Trending" },
  { value: "recent", label: "Nuevos" },
  { value: "duration", label: "Más largos" },
] as const;

export function CatalogSearch({ tags }: { tags: { tag: string; count: number }[] }) {
  const router = useRouter();
  const params = useSearchParams();

  function apply(updates: Record<string, string | null>) {
    const next = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(updates)) {
      if (v === null || v === "") next.delete(k);
      else next.set(k, v);
    }
    next.delete("page");
    router.push(`/catalog?${next.toString()}`);
  }

  const activeTag = params.get("tag");
  const activeSort = params.get("sort") ?? "trending";
  const activeQ = params.get("q");

  return (
    <div className="mb-6 space-y-4">
      {activeQ && (
        <p className="text-sm text-[var(--text-muted)]">
          Resultados para{" "}
          <span className="font-medium text-white">&quot;{activeQ}&quot;</span>
          <button
            type="button"
            onClick={() => apply({ q: null })}
            className="ml-2 text-[var(--accent)] hover:underline"
          >
            Limpiar
          </button>
        </p>
      )}
      <div className="flex flex-wrap items-center gap-2">
        {SORTS.map((s) => (
          <button
            key={s.value}
            type="button"
            onClick={() => apply({ sort: s.value })}
            className={`tag-chip ${activeSort === s.value ? "tag-chip-active" : ""}`}
          >
            {s.label}
          </button>
        ))}
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 border-t border-[var(--border-subtle)] pt-4">
          <button
            type="button"
            onClick={() => apply({ tag: null })}
            className={`tag-chip ${!activeTag ? "tag-chip-active" : ""}`}
          >
            Todos
          </button>
          {tags.map(({ tag, count }) => (
            <button
              key={tag}
              type="button"
              onClick={() => apply({ tag })}
              className={`tag-chip ${activeTag === tag ? "tag-chip-active" : ""}`}
            >
              #{tag}
              <span className="ml-1 opacity-60">({count})</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
