"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import { usePlatformBrand } from "@/components/platform/PlatformBrand";

const BASE_NAV = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/catalog", label: "Catálogo" },
  { href: "/story", label: "Mapa" },
  { href: "/player", label: "Reproductor" },
  { href: "/avatar", label: "Avatar" },
  { href: "/store", label: "Tienda" },
  { href: "/wallet", label: "Billetera" },
  { href: "/bookmarks", label: "Favoritos" },
  { href: "/notifications", label: "Notificaciones" },
  { href: "/upgrade", label: "Planes" },
  { href: "/settings", label: "Ajustes" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const siteName = usePlatformBrand();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    void fetch("/api/notifications")
      .then((r) => r.json())
      .then((d) => setUnread(d.unreadCount ?? 0))
      .catch(() => setUnread(0));
  }, [pathname]);

  const NAV =
    user?.role === "ADMIN"
      ? [...BASE_NAV, { href: "/admin", label: "Admin" }]
      : BASE_NAV;

  return (
    <div className="flex min-h-[calc(100vh-4rem)] gap-8">
      <aside className="hidden w-56 shrink-0 md:block">
        <div className="sticky top-8 space-y-6">
          <Link href="/dashboard" className="block text-lg font-semibold text-white">
            {siteName}
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
                  {item.href === "/notifications" && unread > 0 && (
                    <span className="ml-1.5 rounded-full bg-indigo-600 px-1.5 text-[10px] text-white">
                      {unread}
                    </span>
                  )}
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
