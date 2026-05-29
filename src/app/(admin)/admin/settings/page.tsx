"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { VERTICAL_LABELS, type PlatformVerticalKey } from "@/lib/platform/labels";

type Settings = {
  siteName: string;
  vertical: PlatformVerticalKey;
  ageGateEnabled: boolean;
  adsEnabled: boolean;
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    void fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((d) => setSettings(d.settings));
  }, []);

  async function save() {
    if (!settings) return;
    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    setMessage(res.ok ? "Guardado." : "Error al guardar.");
  }

  return (
    <section>
      <PageHeader
        title="Configuración de plataforma"
        description="Vertical ADULT: activa age gate y anuncios para monetización por tráfico."
        action={
          <Link href="/admin" className="text-sm text-zinc-400 hover:text-white">
            ← Resumen
          </Link>
        }
      />
      {settings && (
        <div className="max-w-lg space-y-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <label className="block text-sm">
            <span className="text-zinc-400">Nombre del sitio</span>
            <input
              className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-white"
              value={settings.siteName}
              onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
            />
          </label>
          <label className="block text-sm">
            <span className="text-zinc-400">Vertical</span>
            <select
              className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-white"
              value={settings.vertical}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  vertical: e.target.value as Settings["vertical"],
                })
              }
            >
              {Object.entries(VERTICAL_LABELS).map(([k, label]) => (
                <option key={k} value={k}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm text-zinc-300">
            <input
              type="checkbox"
              checked={settings.ageGateEnabled}
              onChange={(e) =>
                setSettings({ ...settings, ageGateEnabled: e.target.checked })
              }
            />
            Age gate (+18)
          </label>
          <label className="flex items-center gap-2 text-sm text-zinc-300">
            <input
              type="checkbox"
              checked={settings.adsEnabled}
              onChange={(e) =>
                setSettings({ ...settings, adsEnabled: e.target.checked })
              }
            />
            Anuncios activos (FREE ve ads; Premium/Whale no)
          </label>
          <button
            type="button"
            onClick={() => void save()}
            className="rounded-lg bg-violet-600 px-4 py-2 text-sm text-white hover:bg-violet-500"
          >
            Guardar
          </button>
          {message && <p className="text-sm text-emerald-400">{message}</p>}
        </div>
      )}
    </section>
  );
}
