"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";

type NodeRow = {
  id: string;
  slug: string;
  title: string;
  sourceType: "FILE" | "EMBED";
  urlHash: string;
  embedUrl: string | null;
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
  const [embedInput, setEmbedInput] = useState("");
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
        summary,
        sourceType: "EMBED",
        embedUrl: embedInput,
        tags: parseTags(tagsInput),
        isPremium,
        tokenCost: isPremium ? tokenCost : 0,
        published,
        vertical: "ADULT",
        durationSec: 60,
      }),
    });
    const data = await res.json().catch(() => ({}));
    setMessage(res.ok ? "Embed publicado (solo IA)." : (data.error ?? "Error al crear."));
    if (res.ok) {
      setTitle("");
      setEmbedInput("");
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
      <div className="surface-panel border-[var(--accent)]/20 p-4 text-sm text-[var(--text-muted)]">
        <p className="font-medium text-white">Modo embed (pruebas)</p>
        <p className="mt-2">
          En la web de origen: abre un vídeo → <strong className="text-white">Compartir / Embed</strong>{" "}
          → copia la URL <code className="text-[var(--accent)]">https://…/embed/…</code> y pégala abajo.
          Solo dominios permitidos. El tag <strong className="text-white">ai</strong> es obligatorio.
        </p>
      </div>

      <form onSubmit={onCreate} className="max-w-xl space-y-3 surface-panel p-4">
        <h3 className="font-medium text-white">Nuevo embed IA</h3>
        <input
          placeholder="Título"
          className="input-field"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          placeholder="Pega URL embed o iframe completo"
          className="input-field min-h-[80px] font-mono text-xs"
          value={embedInput}
          onChange={(e) => setEmbedInput(e.target.value)}
          required
        />
        <input
          placeholder="Tags: ai, animation (obligatorio ai)"
          className="input-field"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
        />
        <textarea
          placeholder="Descripción"
          className="input-field"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
        />
        <label className="flex items-center gap-2 text-sm text-zinc-300">
          <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
          Publicado
        </label>
        <label className="flex items-center gap-2 text-sm text-zinc-300">
          <input type="checkbox" checked={isPremium} onChange={(e) => setIsPremium(e.target.checked)} />
          Premium
        </label>
        {isPremium && (
          <input
            type="number"
            min={0}
            className="input-field"
            value={tokenCost}
            onChange={(e) => setTokenCost(Number(e.target.value))}
          />
        )}
        <button type="submit" className="btn-primary">
          Publicar embed
        </button>
        {message && <p className="text-sm text-zinc-400">{message}</p>}
      </form>

      <div>
        <h3 className="mb-3 font-medium text-white">Catálogo ({nodes.length})</h3>
        <ul className="divide-y divide-[var(--border-subtle)] surface-panel">
          {nodes.map((n) => (
            <li key={n.id} className="flex flex-wrap items-center justify-between gap-4 px-4 py-3 text-sm">
              <div className="min-w-0">
                <p className="font-medium text-white">
                  {n.title}
                  <span className="ml-2 text-[10px] uppercase text-[var(--accent)]">
                    {n.sourceType}
                  </span>
                </p>
                <p className="truncate text-[var(--text-dim)]">
                  /watch/{n.slug} · {n.viewCount} vistas · {n.tags.map((t) => `#${t}`).join(" ")}
                </p>
                {n.embedUrl && (
                  <p className="truncate font-mono text-[10px] text-[var(--text-muted)]">{n.embedUrl}</p>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {n.parentNodeId === null && n.embedUrl && (
                  <Link href={`/watch/${n.slug}`} className="text-[var(--accent)] hover:underline">
                    Ver
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => void togglePublish(n)}
                  className="btn-ghost py-1 text-xs"
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
