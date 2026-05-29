"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";

type NodeRow = {
  id: string;
  slug: string;
  title: string;
  urlHash: string;
  summary: string | null;
  tags: string[];
  isPremium: boolean;
  tokenCost: number;
  previewSec: number;
  published: boolean;
  viewCount: number;
  parentNodeId: string | null;
  _count: { progress: number; bookmarks: number };
};

export function ContentEditor() {
  const [nodes, setNodes] = useState<NodeRow[]>([]);
  const [title, setTitle] = useState("");
  const [urlHash, setUrlHash] = useState("");
  const [summary, setSummary] = useState("");
  const [tagsInput, setTagsInput] = useState("ai, animation");
  const [isPremium, setIsPremium] = useState(false);
  const [tokenCost, setTokenCost] = useState(0);
  const [published, setPublished] = useState(true);
  const [message, setMessage] = useState("");

  async function load() {
    const res = await fetch("/api/admin/nodes");
    const data = await res.json();
    setNodes(data.nodes ?? []);
  }

  useEffect(() => {
    void load();
  }, []);

  function parseTags(raw: string) {
    return raw
      .split(/[,#\s]+/)
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean)
      .slice(0, 12);
  }

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/nodes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        urlHash,
        summary,
        tags: parseTags(tagsInput),
        isPremium,
        tokenCost: isPremium ? tokenCost : 0,
        published,
        vertical: "ADULT",
        durationSec: 60,
      }),
    });
    setMessage(res.ok ? "Publicado en catálogo." : "Error al crear.");
    if (res.ok) {
      setTitle("");
      setUrlHash("");
      setSummary("");
      void load();
    }
  }

  async function togglePublish(node: NodeRow) {
    await fetch(`/api/admin/nodes/${node.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !node.published }),
    });
    void load();
  }

  return (
    <div className="space-y-8">
      <form onSubmit={onCreate} className="max-w-lg space-y-3 rounded-xl border border-zinc-800 p-4">
        <h3 className="font-medium text-white">Nuevo vídeo (catálogo raíz)</h3>
        <input
          placeholder="Título"
          className="w-full rounded border border-zinc-700 bg-zinc-950 px-3 py-2 text-white"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <input
          placeholder="url-hash (archivo .mp4 en storage)"
          className="w-full rounded border border-zinc-700 bg-zinc-950 px-3 py-2 text-white"
          value={urlHash}
          onChange={(e) => setUrlHash(e.target.value)}
          required
        />
        <input
          placeholder="Tags: ai, animation, 3d"
          className="w-full rounded border border-zinc-700 bg-zinc-950 px-3 py-2 text-white"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
        />
        <textarea
          placeholder="Descripción SEO"
          className="w-full rounded border border-zinc-700 bg-zinc-950 px-3 py-2 text-white"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
        />
        <label className="flex items-center gap-2 text-sm text-zinc-300">
          <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
          Publicado en catálogo
        </label>
        <label className="flex items-center gap-2 text-sm text-zinc-300">
          <input type="checkbox" checked={isPremium} onChange={(e) => setIsPremium(e.target.checked)} />
          Premium (preview + tokens)
        </label>
        {isPremium && (
          <input
            type="number"
            min={0}
            className="w-full rounded border border-zinc-700 bg-zinc-950 px-3 py-2 text-white"
            value={tokenCost}
            onChange={(e) => setTokenCost(Number(e.target.value))}
            placeholder="Coste en tokens"
          />
        )}
        <button type="submit" className="rounded-lg bg-violet-600 px-4 py-2 text-sm text-white hover:bg-violet-500">
          Crear y publicar
        </button>
        {message && <p className="text-sm text-zinc-400">{message}</p>}
      </form>
      <div>
        <h3 className="mb-3 font-medium text-white">Todos los nodos ({nodes.length})</h3>
        <ul className="divide-y divide-zinc-800 rounded-xl border border-zinc-800">
          {nodes.map((n) => (
            <li key={n.id} className="flex flex-wrap items-center justify-between gap-4 px-4 py-3 text-sm">
              <div className="min-w-0">
                <p className="font-medium text-white">{n.title}</p>
                <p className="text-zinc-500">
                  /watch/{n.slug} · {n.viewCount} vistas · {n.tags.map((t) => `#${t}`).join(" ")}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {n.isPremium && <span className="text-amber-400">Premium</span>}
                {!n.published && <span className="text-zinc-500">Borrador</span>}
                {n.parentNodeId === null && (
                  <Link href={`/watch/${n.slug}`} className="text-indigo-400 hover:text-indigo-300">
                    Ver
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => void togglePublish(n)}
                  className="rounded border border-zinc-700 px-2 py-1 text-xs text-zinc-300"
                >
                  {n.published ? "Ocultar" : "Publicar"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
