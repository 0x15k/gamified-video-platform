"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";

type ModelRow = {
  id: string;
  slug: string;
  name: string;
  bio: string | null;
  tags: string[];
  isLive: boolean;
  published: boolean;
  viewCount: number;
  _count: { videos: number };
};

export function ModelsEditor() {
  const [models, setModels] = useState<ModelRow[]>([]);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [tagsInput, setTagsInput] = useState("ai, animation");
  const [isLive, setIsLive] = useState(false);
  const [message, setMessage] = useState("");

  async function load() {
    const res = await fetch("/api/admin/models");
    const data = await res.json();
    setModels(data.models ?? []);
  }

  useEffect(() => {
    void load();
  }, []);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/models", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        bio,
        tags: tagsInput.split(/[,#\s]+/).map((t) => t.trim().toLowerCase()).filter(Boolean),
        isLive,
        published: true,
      }),
    });
    const data = await res.json().catch(() => ({}));
    setMessage(res.ok ? "Modelo creado." : (data.error ?? "Error"));
    if (res.ok) {
      setName("");
      setBio("");
      void load();
    }
  }

  async function toggleLive(model: ModelRow) {
    await fetch(`/api/admin/models/${model.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isLive: !model.isLive }),
    });
    void load();
  }

  return (
    <div className="space-y-8">
      <form onSubmit={onCreate} className="max-w-xl space-y-3 surface-panel p-4">
        <h3 className="font-medium text-white">Nuevo modelo IA</h3>
        <input
          placeholder="Nombre (ej. Luna AI)"
          className="input-field"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <textarea
          placeholder="Bio corta"
          className="input-field"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        />
        <input
          placeholder="Tags: ai, 3d, webcam"
          className="input-field"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
        />
        <label className="flex items-center gap-2 text-sm text-zinc-300">
          <input type="checkbox" checked={isLive} onChange={(e) => setIsLive(e.target.checked)} />
          Marcar como &quot;En vivo&quot; (simulado)
        </label>
        <button type="submit" className="btn-primary">
          Crear modelo
        </button>
        {message && <p className="text-sm text-zinc-400">{message}</p>}
      </form>

      <ul className="divide-y divide-[var(--border-subtle)] surface-panel">
        {models.map((m) => (
          <li key={m.id} className="flex flex-wrap items-center justify-between gap-4 px-4 py-3 text-sm">
            <div>
              <p className="font-medium text-white">
                {m.name}
                {m.isLive && (
                  <span className="ml-2 text-[10px] uppercase text-red-400">Live</span>
                )}
              </p>
              <p className="text-[var(--text-dim)]">
                /model/{m.slug} · {m._count.videos} vídeos
              </p>
            </div>
            <div className="flex gap-2">
              <Link href={`/model/${m.slug}`} className="text-[var(--accent)] hover:underline">
                Ver
              </Link>
              <button
                type="button"
                onClick={() => void toggleLive(m)}
                className="btn-ghost py-1 text-xs"
              >
                {m.isLive ? "Quitar live" : "Live"}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
