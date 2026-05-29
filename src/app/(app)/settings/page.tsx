"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { useAuthStore } from "@/stores/useAuthStore";

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);

  return (
    <section>
      <PageHeader
        title="Ajustes"
        description="Perfil y preferencias de cuenta."
      />
      <div className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
        <div>
          <label className="text-xs text-zinc-500">Email</label>
          <p className="text-white">{user?.email ?? "—"}</p>
        </div>
        <div>
          <label className="text-xs text-zinc-500">Rol</label>
          <p className="text-white">{user?.role ?? "—"}</p>
        </div>
        <div>
          <label className="text-xs text-zinc-500">Contraseña</label>
          <button
            type="button"
            disabled
            className="mt-1 block text-sm text-zinc-500"
          >
            Cambiar contraseña — próximamente
          </button>
        </div>
      </div>
    </section>
  );
}
