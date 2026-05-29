"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

const SORTS = [
  { value: "trending", label: "Trending" },
  { value: "recent", label: "Recientes" },
  { value: "duration", label: "Duración" },
] as const;

export function CatalogSearch({ tags }: { tags: { tag: string; count: number }[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");

  function apply(updates: Record<string, string | null>) {
    const next = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(updates)) {
      if (v === null || v === "") next.delete(k);
      else next.set(k, v);
    }
    next.delete("page");
    router.push(`/catalog?${next.toString()}`);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    apply({ q: q.trim() || null });
  }

  const activeTag = params.get("tag");
  const activeSort = params.get("sort") ?? "trending";

  return (
    <div className="space-y-4">
      <form onSubmit={onSubmit} className="flex gap-2">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por título o tag (ej. ai, animation)…"
          className="min-w-0 flex-1 rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-2 text-sm text-white placeholder:text-zinc-600"
        />
        <button
          type="submit"
          className="shrink-0 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
        >
          Buscar
        </button>
      </form>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-zinc-500">Orden:</span>
        {SORTS.map((s) => (
          <button
            key={s.value}
            type="button"
            onClick={() => apply({ sort: s.value })}
            className={`rounded-full px-3 py-1 text-xs ${
              activeSort === s.value
                ? "bg-indigo-600/30 text-indigo-300"
                : "bg-zinc-800 text-zinc-400 hover:text-white"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => apply({ tag: null })}
            className={`rounded-full px-3 py-1 text-xs ${
              !activeTag ? "bg-zinc-100 text-zinc-900" : "bg-zinc-800 text-zinc-400"
            }`}
          >
            Todos
          </button>
          {tags.map(({ tag, count }) => (
            <button
              key={tag}
              type="button"
              onClick={() => apply({ tag })}
              className={`rounded-full px-3 py-1 text-xs ${
                activeTag === tag
                  ? "bg-indigo-600/30 text-indigo-300"
                  : "bg-zinc-800 text-zinc-400 hover:text-white"
              }`}
            >
              #{tag} ({count})
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
