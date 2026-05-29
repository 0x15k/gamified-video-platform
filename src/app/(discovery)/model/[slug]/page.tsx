import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { LIVE_FEATURE_ENABLED } from "@/lib/platform/features";
import { getModelBySlug, listModelVideos } from "@/lib/catalog/models";
import { getSiteUrl } from "@/lib/platform/site-url";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const model = await getModelBySlug(slug);
  if (!model) return { title: "No encontrado" };

  const base = getSiteUrl();
  const avatar = model.avatarUrl ?? `${base}/api/model/${slug}/avatar`;

  return {
    title: `${model.name} · Modelo IA`,
    description: model.bio ?? `${model.name} — contenido generado por IA`,
    openGraph: {
      title: model.name,
      description: model.bio ?? undefined,
      url: `${base}/model/${slug}`,
      images: [{ url: avatar, width: 400, height: 400, alt: model.name }],
    },
  };
}

export default async function ModelProfilePage({ params }: Props) {
  const { slug } = await params;
  const model = await getModelBySlug(slug);
  if (!model) notFound();

  const videos = await listModelVideos(model.id);
  const avatar = model.avatarUrl ?? `/api/model/${model.slug}/avatar`;

  return (
    <div className="space-y-8">
      <header className="surface-panel flex flex-col gap-6 p-6 sm:flex-row sm:items-start">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={avatar}
          alt=""
          className="h-28 w-28 shrink-0 rounded-full object-cover ring-4 ring-[var(--accent)]/40"
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold text-white">{model.name}</h1>
            <span className="rounded bg-[var(--accent)] px-2 py-0.5 text-[10px] font-bold uppercase text-black">
              IA
            </span>
            {LIVE_FEATURE_ENABLED && model.isLive && (
              <span className="rounded bg-red-500/20 px-2 py-0.5 text-[10px] font-bold uppercase text-red-400">
                En vivo
              </span>
            )}
          </div>
          {model.bio && (
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--text-muted)]">
              {model.bio}
            </p>
          )}
          <p className="mt-3 text-xs text-[var(--text-dim)]">
            {model._count.videos} vídeos · {model.viewCount.toLocaleString()} vistas totales
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {model.tags.map((t) => (
              <Link
                key={t}
                href={`/catalog?tag=${encodeURIComponent(t)}`}
                className="tag-chip hover:border-[var(--accent)] hover:text-[var(--accent)]"
              >
                #{t}
              </Link>
            ))}
          </div>
        </div>
      </header>

      <section>
        <h2 className="mb-4 border-b border-[var(--border-subtle)] pb-2 text-base font-bold text-white">
          Historias de {model.name}
        </h2>
        {videos.length === 0 ? (
          <p className="text-sm text-[var(--text-dim)]">Sin historias publicadas aún.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {videos.map((item) => (
              <Link
                key={item.slug}
                href={`/player?node=${item.id}`}
                className="surface-panel block p-4 transition hover:border-[var(--accent)]/40"
              >
                <h3 className="font-medium text-white">{item.title}</h3>
                {item.summary && (
                  <p className="mt-1 line-clamp-2 text-sm text-[var(--text-dim)]">{item.summary}</p>
                )}
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
