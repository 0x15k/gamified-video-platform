import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";

const CARDS = [
  {
    href: "/admin/content",
    title: "Contenido",
    desc: "Árbol de nodos, rutas premium y metadatos.",
  },
  {
    href: "/admin/analytics",
    title: "Analytics",
    desc: "Eventos, embudo y uso de la plataforma.",
  },
  {
    href: "/admin/settings",
    title: "Configuración",
    desc: "Marca, vertical y age gate.",
  },
];

export default function AdminOverviewPage() {
  return (
    <section>
      <PageHeader
        title="Resumen staff"
        description="Panel separado del producto usuario. Solo cuentas ADMIN."
      />
      <div className="grid gap-4 sm:grid-cols-3">
        {CARDS.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="rounded-xl border border-violet-500/20 bg-zinc-900/50 p-5 transition hover:border-violet-500/40"
          >
            <h2 className="font-semibold text-white">{card.title}</h2>
            <p className="mt-2 text-sm text-zinc-400">{card.desc}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
