"use client";

import { FormEvent, useEffect, useState } from "react";

type NodeRow = {
  id: string;
  title: string;
  urlHash: string;
  summary: string | null;
  isPremium: boolean;
  tokenCost: number;
  parentNodeId: string | null;
  _count: { progress: number; bookmarks: number };
};

export function ContentEditor() {
  const [nodes, setNodes] = useState<NodeRow[]>([]);
  const [title, setTitle] = useState("");
  const [urlHash, setUrlHash] = useState("");
  const [summary, setSummary] = useState("");
  const [message, setMessage] = useState("");

  async function load() {
    const res = await fetch("/api/admin/nodes");
    const data = await res.json();
    setNodes(data.nodes ?? []);
  }

  useEffect(() => {
    void load();
  }, []);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/nodes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, urlHash, summary, isPremium: false, tokenCost: 0 }),
    });
    setMessage(res.ok ? "Nodo creado." : "Error al crear.");
    if (res.ok) {
      setTitle("");
      setUrlHash("");
      setSummary("");
      void load();
    }
  }

  return (
    <div className="space-y-8">
      <form onSubmit={onCreate} className="max-w-lg space-y-3 rounded-xl border border-zinc-800 p-4">
        <h3 className="font-medium text-white">Nuevo capítulo / episodio</h3>
        <input
          placeholder="Título"
          className="w-full rounded border border-zinc-700 bg-zinc-950 px-3 py-2 text-white"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <input
          placeholder="url-hash (archivo sin .mp4)"
          className="w-full rounded border border-zinc-700 bg-zinc-950 px-3 py-2 text-white"
          value={urlHash}
          onChange={(e) => setUrlHash(e.target.value)}
          required
        />
        <textarea
          placeholder="Resumen"
          className="w-full rounded border border-zinc-700 bg-zinc-950 px-3 py-2 text-white"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
        />
        <button type="submit" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white">
          Crear nodo
        </button>
        {message && <p className="text-sm text-zinc-400">{message}</p>}
      </form>
      <div>
        <h3 className="mb-3 font-medium text-white">Catálogo ({nodes.length})</h3>
        <ul className="divide-y divide-zinc-800 rounded-xl border border-zinc-800">
          {nodes.map((n) => (
            <li key={n.id} className="flex justify-between gap-4 px-4 py-3 text-sm">
              <div>
                <p className="font-medium text-white">{n.title}</p>
                <p className="text-zinc-500">{n.urlHash} · {n._count.progress} progresos</p>
              </div>
              {n.isPremium && <span className="text-amber-400">Premium</span>}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
