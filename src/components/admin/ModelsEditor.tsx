"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";

type ModelRow = {
  id: string;
  slug: string;
  name: string;
  bio: string | null;
  tags: string[];
  published: boolean;
  _count: { videos: number };
};

export function ModelsEditor() {
  const [models, setModels] = useState<ModelRow[]>([]);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [tagsInput, setTagsInput] = useState("ai, animation");
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
        isLive: false,
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

  return (
    <div className="space-y-8">
      <div className="surface-panel border-zinc-700 p-4 text-sm text-zinc-400">
        <p className="font-medium text-zinc-300">Live / webcam simulada</p>
        <p className="mt-1">En mantenimiento. Por ahora solo historias con vídeo IA pregenerado.</p>
      </div>

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
          placeholder="Tags: ai, 3d, story"
          className="input-field"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
        />
        <button type="submit" className="btn-primary">
          Crear modelo
        </button>
        {message && <p className="text-sm text-zinc-400">{message}</p>}
      </form>

      <ul className="divide-y divide-[var(--border-subtle)] surface-panel">
        {models.map((m) => (
          <li key={m.id} className="flex flex-wrap items-center justify-between gap-4 px-4 py-3 text-sm">
            <div>
              <p className="font-medium text-white">{m.name}</p>
              <p className="text-[var(--text-dim)]">/model/{m.slug}</p>
            </div>
            <Link href={`/model/${m.slug}`} className="text-[var(--accent)] hover:underline">
              Ver perfil
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
