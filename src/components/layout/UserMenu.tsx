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
          className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 text-sm font-semibold text-white"
          aria-label="Menú de cuenta"
        >
          {initial}
        </button>
        <div className="invisible absolute right-0 z-50 mt-2 w-52 rounded-xl border border-zinc-800 bg-zinc-950 py-1 opacity-0 shadow-xl transition group-hover:visible group-hover:opacity-100">
          <p className="truncate px-3 py-2 text-xs text-zinc-500">{user.email}</p>
          <Link href="/settings" className="block px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-900">
            Ajustes
          </Link>
          {isAdmin(user.accountType) && (
            <Link href="/admin" className="block px-3 py-2 text-sm text-violet-300 hover:bg-zinc-900">
              Panel staff →
            </Link>
          )}
          <button
            type="button"
            onClick={() => void logout().then(() => (window.location.href = "/"))}
            className="block w-full px-3 py-2 text-left text-sm text-zinc-400 hover:bg-zinc-900"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
}
