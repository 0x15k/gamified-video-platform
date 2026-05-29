import Link from "next/link";
import { MarketingNav } from "@/components/layout/MarketingNav";
import { getPlatformSettings } from "@/lib/platform/settings";

export default async function HomePage() {
  const platform = await getPlatformSettings();
  const isAdult = platform.vertical === "ADULT";

  return (
    <div className="mx-auto min-h-screen max-w-5xl px-4 py-6 sm:px-6">
      <MarketingNav siteName={platform.siteName} />
      <section className="space-y-12 py-6">
        <div className="relative overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-8 sm:p-12">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[var(--accent)]/10 blur-3xl" />
          <p className="text-sm font-semibold uppercase tracking-wider text-[var(--accent)]">
            {isAdult ? "+18 · Streaming interactivo" : "Self-hosted · Secure"}
          </p>
          <h1 className="mt-3 max-w-xl text-3xl font-bold leading-tight text-white sm:text-4xl md:text-5xl">
            {isAdult ? (
              <>
                <span className="text-gradient-accent">{platform.siteName}</span>
                <br />
                <span className="text-2xl font-semibold text-[var(--text-muted)] sm:text-3xl">
                  AI animation & historias ramificadas
                </span>
              </>
            ) : (
              "Plataforma de video interactivo"
            )}
          </h1>
          <p className="mt-4 max-w-lg text-base text-[var(--text-muted)]">
            {isAdult
              ? "Miles de vistas, tags trending y episodios donde tú eliges el final. Gratis con anuncios o Premium sin publicidad."
              : "Cascarón completo con narrativa ramificada, tokens y avatares 3D."}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/catalog" className="btn-primary px-6 py-2.5">
              {isAdult ? "Ver catálogo ahora" : "Explorar catálogo"}
            </Link>
            {isAdult ? (
              <Link href="/upgrade" className="btn-ghost border-[var(--premium)]/40 text-[var(--premium)]">
                Premium sin ads
              </Link>
            ) : (
              <>
                <Link href="/register" className="btn-ghost">
                  Crear cuenta
                </Link>
                <Link href="/login" className="btn-ghost">
                  Login
                </Link>
              </>
            )}
          </div>
        </div>

        {isAdult ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { title: "Trending", desc: "Lo más visto ahora", href: "/catalog?sort=trending" },
              { title: "AI & Animation", desc: "Tags populares", href: "/catalog?tag=ai" },
              { title: "Interactivo", desc: "Elige tu final", href: "/catalog?tag=interactive" },
            ].map((card) => (
              <Link
                key={card.href}
                href={card.href}
                className="surface-panel group p-5 transition hover:border-[var(--accent)]/40"
              >
                <h2 className="font-semibold text-white group-hover:text-[var(--accent)]">
                  {card.title}
                </h2>
                <p className="mt-1 text-sm text-[var(--text-dim)]">{card.desc}</p>
              </Link>
            ))}
          </div>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {[
              "Narrativa ramificada",
              "Economía de tokens",
              "Avatares 3D",
              "Auth JWT + Redis",
            ].map((f) => (
              <li key={f} className="surface-panel px-4 py-3 text-sm text-[var(--text-muted)]">
                {f}
              </li>
            ))}
          </ul>
        )}

        <p className="text-center text-xs text-[var(--text-dim)]">
          <Link href="/legal/terms" className="hover:text-[var(--accent)]">
            Términos
          </Link>
          {" · "}
          <Link href="/legal/privacy" className="hover:text-[var(--accent)]">
            Privacidad
          </Link>
          {isAdult && " · Solo mayores de 18 años"}
        </p>
      </section>
    </div>
  );
}
