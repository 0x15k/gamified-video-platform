import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";

export default function CatalogPage() {
  return (
    <section>
      <PageHeader
        title="Catálogo de contenido"
        description="Vista unificada para cursos de pentesting o series interactivas. La vertical de negocio se definirá más adelante."
        action={
          <Link href="/story" className="text-sm text-indigo-400 hover:text-indigo-300">
            Ver mapa narrativo →
          </Link>
        }
      />
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 text-sm text-zinc-400">
        <p>
          El catálogo usa los mismos nodos de historia por ahora. Cuando elijas entre{" "}
          <strong className="text-zinc-200">educación (pentesting)</strong> o{" "}
          <strong className="text-zinc-200">entretenimiento adulto</strong>, personalizaremos
          branding, compliance y monetización sin reescribir el core.
        </p>
        <Link
          href="/story"
          className="mt-4 inline-block rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-500"
        >
          Explorar contenido
        </Link>
      </div>
    </section>
  );
}
