"use client";

import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { ContinueWatching } from "@/components/dashboard/ContinueWatching";
import { ProgressSummary } from "@/components/dashboard/ProgressSummary";
import { useAuthStore } from "@/stores/useAuthStore";

const QUICK_LINKS = [
  { href: "/catalog", title: "Catálogo", desc: "Todos los capítulos" },
  { href: "/story", title: "Mapa narrativo", desc: "Árbol de decisiones" },
  { href: "/bookmarks", title: "Favoritos", desc: "Contenido guardado" },
  { href: "/store", title: "Tienda", desc: "Packs de tokens" },
  { href: "/avatar", title: "Avatar", desc: "Personalización 3D" },
  { href: "/notifications", title: "Notificaciones", desc: "Avisos del sistema" },
];

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const name = user?.displayName ?? user?.email?.split("@")[0];

  return (
    <section>
      <PageHeader
        title={`Hola${name ? `, ${name}` : ""}`}
        description="Tu hub: progreso, catálogo, avatar y economía de tokens."
      />
      <ContinueWatching />
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <ProgressSummary />
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <p className="text-xs text-zinc-500">Tokens</p>
          <p className="text-3xl font-bold text-white">{user?.tokensBalance ?? 0}</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <p className="text-xs text-zinc-500">Plan</p>
          <p className="text-3xl font-bold text-white">{user?.plan ?? "—"}</p>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {QUICK_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-xl border border-zinc-800 p-4 transition hover:border-indigo-500/40 hover:bg-zinc-900/80"
          >
            <h2 className="font-semibold text-white">{link.title}</h2>
            <p className="mt-1 text-sm text-zinc-400">{link.desc}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
