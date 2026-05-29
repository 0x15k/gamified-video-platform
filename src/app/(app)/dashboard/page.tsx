"use client";

import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { useAuthStore } from "@/stores/useAuthStore";

const QUICK_LINKS = [
  { href: "/story", title: "Mapa de historia", desc: "Explora ramas y nodos narrativos" },
  { href: "/player", title: "Reproductor", desc: "Experiencia interactiva (en evolución)" },
  { href: "/avatar", title: "Avatar 3D", desc: "Personaliza tu personaje" },
  { href: "/store", title: "Tienda", desc: "Compra packs de tokens" },
  { href: "/wallet", title: "Billetera", desc: "Saldo e historial" },
  { href: "/upgrade", title: "Planes", desc: "Premium y Whale" },
];

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);

  return (
    <section>
      <PageHeader
        title={`Hola${user?.email ? `, ${user.email.split("@")[0]}` : ""}`}
        description="Panel principal de la plataforma. El núcleo de video se perfeccionará en fases posteriores."
      />
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <p className="text-xs text-zinc-500">Tokens</p>
          <p className="text-3xl font-bold text-white">{user?.tokensBalance ?? 0}</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <p className="text-xs text-zinc-500">Plan</p>
          <p className="text-3xl font-bold text-white">{user?.role ?? "—"}</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <p className="text-xs text-zinc-500">Fase actual</p>
          <p className="text-lg font-semibold text-indigo-300">Cascarón UI</p>
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
