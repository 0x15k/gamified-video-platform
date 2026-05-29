"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";

const NAV = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/story", label: "Historia" },
  { href: "/player", label: "Reproductor" },
  { href: "/avatar", label: "Avatar" },
  { href: "/store", label: "Tienda" },
  { href: "/wallet", label: "Billetera" },
  { href: "/upgrade", label: "Planes" },
  { href: "/settings", label: "Ajustes" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] gap-8">
      <aside className="hidden w-56 shrink-0 md:block">
        <div className="sticky top-8 space-y-6">
          <Link href="/dashboard" className="block text-lg font-semibold text-white">
            Gamified
          </Link>
          <nav className="flex flex-col gap-1 text-sm">
            {NAV.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-lg px-3 py-2 transition ${
                    active
                      ? "bg-indigo-600/20 text-indigo-300"
                      : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          {user && (
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-3 text-xs text-zinc-400">
              <p className="truncate font-medium text-zinc-200">{user.email}</p>
              <p className="mt-1">{user.tokensBalance} tokens · {user.role}</p>
            </div>
          )}
        </div>
      </aside>
      <div className="min-w-0 flex-1">
        <div className="mb-4 flex items-center justify-between gap-2 md:hidden">
          <span className="text-sm text-zinc-400">{user?.email}</span>
          <button
            type="button"
            onClick={() => void logout().then(() => (window.location.href = "/"))}
            className="text-sm text-zinc-500"
          >
            Salir
          </button>
        </div>
        {children}
      </div>
      <div className="hidden shrink-0 lg:block">
        <button
          type="button"
          onClick={() => void logout().then(() => (window.location.href = "/"))}
          className="text-sm text-zinc-500 hover:text-white"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
