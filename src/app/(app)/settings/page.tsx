"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { ProfileForm } from "@/components/settings/ProfileForm";
import { useAuthStore } from "@/stores/useAuthStore";

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);

  return (
    <section>
      <PageHeader title="Ajustes" description="Perfil público y cuenta." />
      <div className="mb-6 space-y-2 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 text-sm">
        <p>
          <span className="text-zinc-500">Email: </span>
          <span className="text-white">{user?.email}</span>
        </p>
        <p>
          <span className="text-zinc-500">Rol: </span>
          <span className="text-white">{user?.role}</span>
        </p>
      </div>
      <ProfileForm />
    </section>
  );
}
