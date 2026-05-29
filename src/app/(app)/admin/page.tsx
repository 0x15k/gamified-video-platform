"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { useAuthStore } from "@/stores/useAuthStore";
import { VERTICAL_LABELS, type PlatformVerticalKey } from "@/lib/platform/labels";

type Settings = {
  siteName: string;
  vertical: PlatformVerticalKey;
  ageGateEnabled: boolean;
};

export default function AdminPage() {
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (user && user.role !== "ADMIN") {
      router.replace("/dashboard");
    }
  }, [user, router]);

  useEffect(() => {
    if (user?.role !== "ADMIN") return;
    void fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((d) => setSettings(d.settings));
  }, [user]);

  async function save() {
    if (!settings) return;
    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    setMessage(res.ok ? "Guardado." : "Error al guardar.");
  }

  if (user?.role !== "ADMIN") {
    return <p className="text-zinc-400">Acceso restringido.</p>;
  }

  return (
    <section>
      <PageHeader
        title="Administración"
        description="Configuración de plataforma. Vertical en NEUTRAL hasta que decidas el modelo de negocio."
      />
      <div className="mb-4 flex gap-3">
        <Link href="/admin/content" className="text-sm text-indigo-400 hover:text-indigo-300">
          Gestionar contenido →
        </Link>
      </div>
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
            <span className="text-zinc-400">Vertical (previsualización)</span>
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
            Age gate (+18) activo solo si vertical = ADULT
          </label>
          <button
            type="button"
            onClick={() => void save()}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-500"
          >
            Guardar configuración
          </button>
          {message && <p className="text-sm text-emerald-400">{message}</p>}
        </div>
      )}
    </section>
  );
}
