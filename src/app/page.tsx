import Link from "next/link";
import { MarketingNav } from "@/components/layout/MarketingNav";
import { getPlatformSettings } from "@/lib/platform/settings";

export default async function HomePage() {
  const platform = await getPlatformSettings();
  const isAdult = platform.vertical === "ADULT";

  return (
    <>
      <MarketingNav siteName={platform.siteName} />
      <section className="space-y-10 py-8">
        <div className="max-w-2xl space-y-4">
          <p className="text-sm font-medium text-indigo-400">
            {isAdult ? "+18 · Catálogo con anuncios" : "Self-hosted · OWASP-first"}
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-white md:text-5xl">
            {isAdult
              ? `${platform.siteName} — vídeos IA e interactivos`
              : "Plataforma de video interactivo y gamificación"}
          </h1>
          <p className="text-lg text-zinc-400">
            {isAdult
              ? "Explora por tags, trending y episodios ramificados. Gratis con anuncios; Premium sin publicidad."
              : "Cascarón completo listo para iterar. El motor de video se perfecciona al final del roadmap."}
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/catalog"
              className="rounded-lg bg-indigo-600 px-5 py-2.5 font-medium text-white hover:bg-indigo-500"
            >
              {isAdult ? "Explorar catálogo" : "Ver catálogo"}
            </Link>
            {!isAdult && (
              <>
                <Link
                  href="/register"
                  className="rounded-lg border border-zinc-700 px-5 py-2.5 text-zinc-300 hover:border-zinc-500"
                >
                  Crear cuenta
                </Link>
                <Link
                  href="/login"
                  className="rounded-lg border border-zinc-700 px-5 py-2.5 text-zinc-300 hover:border-zinc-500"
                >
                  Iniciar sesión
                </Link>
              </>
            )}
            {isAdult && (
              <Link
                href="/upgrade"
                className="rounded-lg border border-zinc-700 px-5 py-2.5 text-zinc-300 hover:border-zinc-500"
              >
                Premium sin ads
              </Link>
            )}
          </div>
        </div>
        {isAdult ? (
          <ul className="grid gap-3 sm:grid-cols-2">
            {[
              "Catálogo público indexable (SEO + sitemap)",
              "Tags: ai, animation, 3d…",
              "Trending por vistas",
              "Anuncios en FREE · sin ads en Premium",
              "Historias ramificadas opcionales",
              "Age gate +18",
            ].map((f) => (
              <li
                key={f}
                className="rounded-lg border border-zinc-800 bg-zinc-900/30 px-4 py-3 text-sm text-zinc-300"
              >
                {f}
              </li>
            ))}
          </ul>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {[
              "Narrativa ramificada con mapa de historia",
              "Economía de tokens y rutas premium",
              "Avatares 3D personalizables",
              "Auth seguro JWT + Redis",
            ].map((f) => (
              <li
                key={f}
                className="rounded-lg border border-zinc-800 bg-zinc-900/30 px-4 py-3 text-sm text-zinc-300"
              >
                {f}
              </li>
            ))}
          </ul>
        )}
        <p className="text-xs text-zinc-600">
          <a href="/legal/terms" className="hover:text-zinc-400">
            Términos
          </a>
          {" · "}
          <a href="/legal/privacy" className="hover:text-zinc-400">
            Privacidad
          </a>
          {isAdult && (
            <>
              {" · "}
              <span>Contenido solo para mayores de 18 años</span>
            </>
          )}
        </p>
      </section>
    </>
  );
}
