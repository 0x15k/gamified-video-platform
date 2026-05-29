"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { PlanBadge } from "@/components/layout/PlanBadge";
import { ProfileForm } from "@/components/settings/ProfileForm";
import { useAuthStore } from "@/stores/useAuthStore";
import { isAdmin } from "@/lib/rbac/permissions";

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
        <p className="flex items-center gap-2">
          <span className="text-zinc-500">Suscripción:</span>
          {user?.plan ? <PlanBadge plan={user.plan} /> : "—"}
        </p>
        {user && isAdmin(user.accountType) && (
          <p className="text-xs text-violet-400">Cuenta staff — el panel de plataforma está en /admin</p>
        )}
      </div>
      <ProfileForm />
    </section>
  );
}
