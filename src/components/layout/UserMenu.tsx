"use client";

import Link from "next/link";
import { useAuthStore } from "@/stores/useAuthStore";
import { PlanBadge } from "@/components/layout/PlanBadge";
import { isAdmin } from "@/lib/rbac/permissions";

export function UserMenu() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  if (!user) return null;

  const initial = (user.displayName?.[0] ?? user.email[0] ?? "?").toUpperCase();

  return (
    <div className="flex items-center gap-3">
      <PlanBadge plan={user.plan} />
      <div className="group relative">
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--accent)] text-sm font-bold text-black"
          aria-label="Menú de cuenta"
        >
          {initial}
        </button>
        <div className="invisible absolute right-0 z-50 mt-2 w-52 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] py-1 opacity-0 shadow-xl transition group-hover:visible group-hover:opacity-100">
          <p className="truncate px-3 py-2 text-xs text-[var(--text-dim)]">{user.email}</p>
          <Link href="/catalog" className="block px-3 py-2 text-sm text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-white">
            Catálogo
          </Link>
          <Link href="/settings" className="block px-3 py-2 text-sm text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-white">
            Ajustes
          </Link>
          {isAdmin(user.accountType) && (
            <Link href="/admin" className="block px-3 py-2 text-sm text-violet-400 hover:bg-[var(--bg-hover)]">
              Panel staff →
            </Link>
          )}
          <button
            type="button"
            onClick={() => void logout().then(() => (window.location.href = "/"))}
            className="block w-full px-3 py-2 text-left text-sm text-[var(--text-dim)] hover:bg-[var(--bg-hover)]"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
}
