import Link from "next/link";
import { MarketingNav } from "@/components/layout/MarketingNav";

const FEATURES = [
  "Narrativa ramificada con mapa de historia",
  "Economía de tokens y rutas premium",
  "Avatares 3D personalizables",
  "Auth seguro JWT + Redis",
  "Preparado para CCBill y pagos crypto",
];

export default function HomePage() {
  return (
    <>
      <MarketingNav />
      <section className="space-y-10 py-8">
        <div className="max-w-2xl space-y-4">
          <p className="text-sm font-medium text-indigo-400">Self-hosted · OWASP-first</p>
          <h1 className="text-4xl font-bold tracking-tight text-white md:text-5xl">
            Plataforma de video interactivo y gamificación
          </h1>
          <p className="text-lg text-zinc-400">
            Cascarón completo listo para iterar el core. El motor de video se perfecciona al final
            del roadmap.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/register"
              className="rounded-lg bg-indigo-600 px-5 py-2.5 font-medium text-white hover:bg-indigo-500"
            >
              Crear cuenta
            </Link>
            <Link
              href="/login"
              className="rounded-lg border border-zinc-700 px-5 py-2.5 text-zinc-300 hover:border-zinc-500"
            >
              Iniciar sesión
            </Link>
          </div>
        </div>
        <ul className="grid gap-3 sm:grid-cols-2">
          {FEATURES.map((f) => (
            <li
              key={f}
              className="rounded-lg border border-zinc-800 bg-zinc-900/30 px-4 py-3 text-sm text-zinc-300"
            >
              {f}
            </li>
          ))}
        </ul>
        <p className="text-xs text-zinc-600">
          <a href="/legal/terms" className="hover:text-zinc-400">
            Términos
          </a>
          {" · "}
          <a href="/legal/privacy" className="hover:text-zinc-400">
            Privacidad
          </a>
        </p>
      </section>
    </>
  );
}
