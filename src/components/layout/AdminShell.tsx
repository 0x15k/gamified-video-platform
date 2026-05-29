"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ADMIN_NAV } from "@/lib/rbac/navigation";
import { useAuthStore } from "@/stores/useAuthStore";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const logout = useAuthStore((s) => s.logout);

  return (
    <div className="min-h-screen bg-zinc-950">
      <header className="border-b border-violet-500/20 bg-zinc-950">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <span className="rounded bg-violet-600/20 px-2 py-0.5 text-xs font-medium text-violet-300">
              Staff
            </span>
            <span className="font-semibold text-white">Panel de plataforma</span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/dashboard" className="text-zinc-400 hover:text-white">
              ← Vista usuario
            </Link>
            <button
              type="button"
              onClick={() => void logout().then(() => (window.location.href = "/"))}
              className="text-zinc-500 hover:text-white"
            >
              Salir
            </button>
          </div>
        </div>
      </header>
      <div className="mx-auto flex max-w-6xl gap-8 px-4 py-6">
        <aside className="w-52 shrink-0">
          <nav className="space-y-1">
            {ADMIN_NAV.flatMap((s) => s.items).map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block rounded-lg px-3 py-2 text-sm ${
                    active
                      ? "bg-violet-600/20 text-violet-200"
                      : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
