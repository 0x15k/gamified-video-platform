import Link from "next/link";
import { MarketingNav } from "@/components/layout/MarketingNav";
import { ModelCardGrid, type ModelCardItem } from "@/components/catalog/ModelCard";
import { getPlatformSettings } from "@/lib/platform/settings";
import { listModels } from "@/lib/catalog/models";
import { listPublishedStories } from "@/lib/video/stories";

export default async function HomePage() {
  const platform = await getPlatformSettings();
  const isAdult = platform.vertical === "ADULT";
  const [featuredModels, stories] = isAdult
    ? await Promise.all([listModels({ limit: 4 }), listPublishedStories(3)])
    : [[], []];

  const modelCards: ModelCardItem[] = featuredModels.map((m) => ({
    slug: m.slug,
    name: m.name,
    bio: m.bio,
    avatarUrl: m.avatarUrl ?? `/api/model/${m.slug}/avatar`,
    tags: m.tags,
    isLive: m.isLive,
    viewCount: m.viewCount,
    videoCount: m._count.videos,
  }));

  return (
    <div className="mx-auto min-h-screen max-w-5xl px-4 py-6 sm:px-6">
      <MarketingNav siteName={platform.siteName} />
      <section className="space-y-12 py-6">
        <div className="relative overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-8 sm:p-12">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[var(--accent)]/10 blur-3xl" />
          <p className="text-sm font-semibold uppercase tracking-wider text-[var(--accent)]">
            {isAdult ? "+18 · Historias interactivas IA" : "Self-hosted · Secure"}
          </p>
          <h1 className="mt-3 max-w-xl text-3xl font-bold leading-tight text-white sm:text-4xl md:text-5xl">
            {isAdult ? (
              <>
                <span className="text-gradient-accent">{platform.siteName}</span>
                <br />
                <span className="text-2xl font-semibold text-[var(--text-muted)] sm:text-3xl">
                  Vídeo IA · tú eliges el final
                </span>
              </>
            ) : (
              "Plataforma de video interactivo"
            )}
          </h1>
          <p className="mt-4 max-w-lg text-base text-[var(--text-muted)]">
            {isAdult
              ? "Clips generados con IA conectados en ramas. Cada decisión lleva a otro vídeo y a un final distinto."
              : "Cascarón completo con narrativa ramificada, tokens y avatares 3D."}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/stories" className="btn-primary px-6 py-2.5">
              Ver historias
            </Link>
            {isAdult ? (
              <>
                <Link href="/models" className="btn-ghost">
                  Modelos IA
                </Link>
                <Link href="/upgrade" className="btn-ghost border-[var(--premium)]/40 text-[var(--premium)]">
                  Premium
                </Link>
              </>
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

        {isAdult && stories.length > 0 && (
          <section>
            <div className="mb-4 flex items-end justify-between">
              <h2 className="text-lg font-bold text-white">Historias destacadas</h2>
              <Link href="/stories" className="text-sm text-[var(--accent)] hover:underline">
                Ver todas →
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {stories.map((s) => (
                <Link
                  key={s.id}
                  href={`/player?node=${s.id}`}
                  className="surface-panel group p-4 transition hover:border-[var(--accent)]/40"
                >
                  <h3 className="font-semibold text-white group-hover:text-[var(--accent)]">
                    {s.title}
                  </h3>
                  {s.summary && (
                    <p className="mt-1 line-clamp-2 text-sm text-[var(--text-dim)]">{s.summary}</p>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}

        {isAdult && modelCards.length > 0 && (
          <section>
            <div className="mb-4 flex items-end justify-between">
              <h2 className="text-lg font-bold text-white">Modelos IA</h2>
              <Link href="/models" className="text-sm text-[var(--accent)] hover:underline">
                Ver todos →
              </Link>
            </div>
            <ModelCardGrid models={modelCards} />
          </section>
        )}

        {!isAdult && (
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
