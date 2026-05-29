"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";

type StorySummary = {
  id: string;
  title: string;
  summary: string | null;
  published: boolean;
  model: { name: string; slug: string } | null;
  sceneCount: number;
  hasVideo: boolean;
};

type Scene = {
  id: string;
  title: string;
  choiceLabel: string | null;
  parentNodeId: string | null;
  urlHash: string;
  isPremium: boolean;
  tokenCost: number;
  published: boolean;
  hasVideo: boolean;
};

type ModelOption = { id: string; name: string };

async function uploadVideo(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch("/api/admin/upload", { method: "POST", body: form });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? "Error al subir vídeo");
  return data.urlHash as string;
}

export function StoryBuilder() {
  const [stories, setStories] = useState<StorySummary[]>([]);
  const [models, setModels] = useState<ModelOption[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [selectedSceneId, setSelectedSceneId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const [newTitle, setNewTitle] = useState("");
  const [newSummary, setNewSummary] = useState("");
  const [newModelId, setNewModelId] = useState("");
  const [newVideo, setNewVideo] = useState<File | null>(null);

  const [choiceLabel, setChoiceLabel] = useState("");
  const [choiceTitle, setChoiceTitle] = useState("");
  const [choiceVideo, setChoiceVideo] = useState<File | null>(null);
  const [choicePremium, setChoicePremium] = useState(false);

  const loadStories = useCallback(async () => {
    const [sRes, mRes] = await Promise.all([
      fetch("/api/admin/stories"),
      fetch("/api/admin/models"),
    ]);
    const sData = await sRes.json();
    const mData = await mRes.json();
    setStories(sData.stories ?? []);
    setModels((mData.models ?? []).map((m: { id: string; name: string }) => ({ id: m.id, name: m.name })));
  }, []);

  const loadTree = useCallback(async (storyId: string) => {
    const res = await fetch(`/api/admin/stories/${storyId}`);
    if (!res.ok) return;
    const data = await res.json();
    setScenes(data.scenes ?? []);
    setSelectedSceneId(data.root?.id ?? null);
  }, []);

  useEffect(() => {
    void loadStories();
  }, [loadStories]);

  useEffect(() => {
    if (selectedId) void loadTree(selectedId);
    else setScenes([]);
  }, [selectedId, loadTree]);

  const selectedScene = scenes.find((s) => s.id === selectedSceneId) ?? null;
  const childrenOf = (parentId: string) => scenes.filter((s) => s.parentNodeId === parentId);

  async function onCreateStory(e: FormEvent) {
    e.preventDefault();
    if (!newVideo) {
      setMessage("Selecciona el vídeo de la escena inicial.");
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const urlHash = await uploadVideo(newVideo);
      const res = await fetch("/api/admin/stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          summary: newSummary,
          modelId: newModelId || undefined,
          urlHash,
          published: false,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Error al crear");
      setNewTitle("");
      setNewSummary("");
      setNewVideo(null);
      setSelectedId(data.story.id);
      setMessage("Historia creada. Añade decisiones y escenas.");
      await loadStories();
      await loadTree(data.story.id);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Error");
    } finally {
      setBusy(false);
    }
  }

  async function onAddChoice(e: FormEvent) {
    e.preventDefault();
    if (!selectedId || !selectedSceneId || !choiceVideo) {
      setMessage("Selecciona una escena y sube el vídeo de la rama.");
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const urlHash = await uploadVideo(choiceVideo);
      const res = await fetch("/api/admin/stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "addChoice",
          parentSceneId: selectedSceneId,
          choiceLabel,
          title: choiceTitle,
          urlHash,
          isPremium: choicePremium,
          tokenCost: choicePremium ? 25 : 0,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Error");
      setChoiceLabel("");
      setChoiceTitle("");
      setChoiceVideo(null);
      setChoicePremium(false);
      setMessage("Decisión añadida.");
      await loadTree(selectedId);
      await loadStories();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Error");
    } finally {
      setBusy(false);
    }
  }

  async function togglePublished(story: StorySummary) {
    await fetch(`/api/admin/stories/${story.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !story.published }),
    });
    await loadStories();
  }

  function SceneNode({ scene, depth }: { scene: Scene; depth: number }) {
    const kids = childrenOf(scene.id);
    const isSelected = scene.id === selectedSceneId;
    const isFinal = kids.length === 0;

    return (
      <li className="list-none">
        <button
          type="button"
          onClick={() => setSelectedSceneId(scene.id)}
          className={`mb-1 w-full rounded-lg border px-3 py-2 text-left text-sm transition ${
            isSelected
              ? "border-violet-500/60 bg-violet-600/15 text-white"
              : "border-zinc-800 bg-zinc-900/50 text-zinc-300 hover:border-zinc-600"
          }`}
          style={{ marginLeft: depth * 12 }}
        >
          <span className="font-medium">{scene.title}</span>
          {scene.choiceLabel && (
            <span className="ml-2 text-xs text-violet-300">← «{scene.choiceLabel}»</span>
          )}
          <span className="mt-0.5 block text-[10px] text-zinc-500">
            {scene.hasVideo ? "✓ vídeo" : "⚠ sin vídeo"}
            {isFinal ? " · final" : ` · ${kids.length} decisiones`}
            {scene.isPremium && " · premium"}
          </span>
        </button>
        {kids.length > 0 && (
          <ul className="border-l border-zinc-800 pl-2">
            {kids.map((k) => (
              <SceneNode key={k.id} scene={k} depth={depth + 1} />
            ))}
          </ul>
        )}
      </li>
    );
  }

  const rootScene = scenes.find((s) => s.parentNodeId === null);

  return (
    <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
      <aside className="space-y-3">
        <h3 className="text-sm font-semibold text-white">Historias</h3>
        <ul className="max-h-[420px] space-y-1 overflow-y-auto">
          {stories.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => setSelectedId(s.id)}
                className={`w-full rounded-lg px-3 py-2 text-left text-sm ${
                  selectedId === s.id
                    ? "bg-violet-600/20 text-violet-100"
                    : "text-zinc-400 hover:bg-zinc-900"
                }`}
              >
                {s.title}
                <span className="block text-[10px] text-zinc-500">
                  {s.sceneCount} escenas · {s.published ? "publicada" : "borrador"}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <div className="space-y-6">
        <div className="rounded-xl border border-violet-500/20 bg-violet-950/20 p-4 text-sm text-violet-100">
          <p className="font-medium">Historias interactivas (vídeo IA pregenerado)</p>
          <p className="mt-1 text-violet-200/80">
            1) Crea la historia con el vídeo inicial · 2) En cada escena, añade decisiones con su
            propio MP4 · 3) Publica cuando el árbol esté listo.
          </p>
          <p className="mt-2 text-xs text-zinc-400">
            Live desactivado (mantenimiento). Solo ramas con finales distintos.
          </p>
        </div>

        {!selectedId && (
          <form onSubmit={onCreateStory} className="surface-panel max-w-lg space-y-3 p-4">
            <h3 className="font-medium text-white">Nueva historia</h3>
            <input
              className="input-field"
              placeholder="Título (ej. Luna — noche en la ciudad)"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              required
            />
            <textarea
              className="input-field"
              placeholder="Resumen corto"
              value={newSummary}
              onChange={(e) => setNewSummary(e.target.value)}
            />
            <select
              className="input-field"
              value={newModelId}
              onChange={(e) => setNewModelId(e.target.value)}
            >
              <option value="">Modelo IA (opcional)</option>
              {models.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
            <label className="block text-sm text-zinc-300">
              Vídeo escena inicial (MP4 generado con IA)
              <input
                type="file"
                accept="video/mp4,video/*"
                className="mt-1 block w-full text-xs"
                onChange={(e) => setNewVideo(e.target.files?.[0] ?? null)}
                required
              />
            </label>
            <button type="submit" disabled={busy} className="btn-primary disabled:opacity-50">
              {busy ? "Subiendo…" : "Crear historia"}
            </button>
          </form>
        )}

        {selectedId && rootScene && (
          <>
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="text-lg font-semibold text-white">
                {stories.find((s) => s.id === selectedId)?.title}
              </h3>
              <button
                type="button"
                className="btn-ghost py-1 text-xs"
                onClick={() => {
                  const s = stories.find((x) => x.id === selectedId);
                  if (s) void togglePublished(s);
                }}
              >
                {stories.find((s) => s.id === selectedId)?.published ? "Despublicar" : "Publicar"}
              </button>
              <Link
                href={`/player?node=${selectedId}`}
                className="text-xs text-violet-300 hover:underline"
                target="_blank"
              >
                Probar →
              </Link>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="surface-panel p-4">
                <h4 className="mb-3 text-xs font-semibold uppercase text-zinc-500">Árbol de escenas</h4>
                <ul>
                  <SceneNode scene={rootScene} depth={0} />
                </ul>
              </div>

              <div className="space-y-4">
                {selectedScene && (
                  <div className="surface-panel p-4 text-sm">
                    <h4 className="font-medium text-white">Escena: {selectedScene.title}</h4>
                    <p className="mt-1 text-zinc-500">
                      {selectedScene.hasVideo ? "Vídeo listo" : "Falta vídeo MP4"}
                    </p>
                  </div>
                )}

                <form onSubmit={onAddChoice} className="surface-panel space-y-3 p-4">
                  <h4 className="font-medium text-white">Añadir decisión desde escena seleccionada</h4>
                  <p className="text-xs text-zinc-500">
                    El usuario verá el botón «{choiceLabel || "…"}» y saltará al vídeo de esa rama.
                  </p>
                  <input
                    className="input-field"
                    placeholder="Texto del botón (ej. Entrar en la habitación)"
                    value={choiceLabel}
                    onChange={(e) => setChoiceLabel(e.target.value)}
                    required
                  />
                  <input
                    className="input-field"
                    placeholder="Título de la escena destino"
                    value={choiceTitle}
                    onChange={(e) => setChoiceTitle(e.target.value)}
                    required
                  />
                  <label className="block text-sm text-zinc-300">
                    Vídeo de esta rama (MP4)
                    <input
                      type="file"
                      accept="video/mp4,video/*"
                      className="mt-1 block w-full text-xs"
                      onChange={(e) => setChoiceVideo(e.target.files?.[0] ?? null)}
                      required
                    />
                  </label>
                  <label className="flex items-center gap-2 text-sm text-zinc-300">
                    <input
                      type="checkbox"
                      checked={choicePremium}
                      onChange={(e) => setChoicePremium(e.target.checked)}
                    />
                    Rama premium (tokens)
                  </label>
                  <button type="submit" disabled={busy} className="btn-primary disabled:opacity-50">
                    {busy ? "Guardando…" : "Añadir rama"}
                  </button>
                </form>
              </div>
            </div>
          </>
        )}

        {message && <p className="text-sm text-zinc-400">{message}</p>}
      </div>
    </div>
  );
}
