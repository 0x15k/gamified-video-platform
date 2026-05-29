import Link from "next/link";
import { notFound } from "next/navigation";
import { WatchPlayer } from "@/components/catalog/WatchPlayer";
import { VideoCard, type CatalogItem } from "@/components/catalog/VideoCard";
import { AdSlot } from "@/components/ads/AdSlot";
import { getNodeBySlug, getRelatedNodes } from "@/lib/catalog/queries";
import { getPlatformSettings } from "@/lib/platform/settings";
import { getAdConfig } from "@/lib/ads/config";
import { shouldShowAds } from "@/lib/ads/should-show-ads";
import { cookies } from "next/headers";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { ACCESS_COOKIE } from "@/lib/auth/cookies";
import type { SubscriptionPlan } from "@/lib/rbac/types";
import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/platform/site-url";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const node = await getNodeBySlug(slug);
  if (!node) return { title: "No encontrado" };

  const base = getSiteUrl();
  const thumb = node.thumbnailUrl ?? `${base}/api/thumbnail/${slug}`;
  const description =
    node.summary ??
    `Watch ${node.title} — ${node.tags.map((t) => `#${t}`).join(" ")}`;

  return {
    title: node.title,
    description,
    keywords: node.tags,
    openGraph: {
      title: node.title,
      description,
      type: "video.other",
      url: `${base}/watch/${slug}`,
      images: [{ url: thumb, width: 640, height: 360, alt: node.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: node.title,
      description,
      images: [thumb],
    },
  };
}

export default async function WatchPage({ params }: Props) {
  const { slug } = await params;
  const node = await getNodeBySlug(slug);
  if (!node) notFound();

  const [platform, related, adConfig] = await Promise.all([
    getPlatformSettings(),
    getRelatedNodes(node.id, node.tags),
    Promise.resolve(getAdConfig()),
  ]);

  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_COOKIE)?.value;
  const payload = token ? await verifyAccessToken(token) : null;
  const plan = (payload?.plan as SubscriptionPlan | undefined) ?? null;
  const showAds =
    platform.adsEnabled &&
    adConfig.enabled &&
    shouldShowAds({
      adsEnabled: true,
      plan,
      isStaff: payload?.accountType === "ADMIN",
    });

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0 space-y-4">
          <WatchPlayer slug={slug} title={node.title} showAds={showAds} />
          <div>
            <h1 className="text-lg font-bold leading-snug text-white sm:text-xl">
              {node.title}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-[var(--text-dim)]">
              <span>{node.viewCount.toLocaleString()} vistas</span>
              {node.durationSec && <span>{Math.floor(node.durationSec / 60)} min</span>}
              {node.isPremium && (
                <span className="rounded bg-[var(--premium)]/20 px-2 py-0.5 font-semibold text-[var(--premium)]">
                  Premium
                </span>
              )}
            </div>
            {node.summary && (
              <p className="mt-3 text-sm leading-relaxed text-[var(--text-muted)]">
                {node.summary}
              </p>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              {node.tags.map((t) => (
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
        </div>

        {showAds && (
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-4">
              <AdSlot
                placement="watch_sidebar"
                zoneId={adConfig.zones.watch_sidebar}
                scriptUrl={adConfig.scriptUrl}
                className="min-h-[280px] rounded-lg"
              />
            </div>
          </aside>
        )}
      </div>

      {showAds && (
        <AdSlot
          placement="watch_bottom"
          zoneId={adConfig.zones.watch_bottom}
          scriptUrl={adConfig.scriptUrl}
          className="rounded-lg"
        />
      )}

      {node.childNodes.length > 0 && (
        <section className="surface-panel p-4">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--text-muted)]">
            Elige tu camino
          </h2>
          <ul className="space-y-2">
            {node.childNodes.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/watch/${c.slug}`}
                  className="text-sm font-medium text-[var(--accent)] hover:underline"
                >
                  {c.title}
                </Link>
                {c.isPremium && (
                  <span className="ml-2 text-xs text-[var(--premium)]">Premium</span>
                )}
              </li>
            ))}
          </ul>
          <Link
            href={`/player?node=${node.id}`}
            className="mt-3 inline-block text-xs text-[var(--text-muted)] hover:text-white"
          >
            Modo historia completa →
          </Link>
        </section>
      )}

      {related.length > 0 && (
        <section>
          <h2 className="mb-4 border-b border-[var(--border-subtle)] pb-2 text-base font-bold text-white">
            Vídeos relacionados
          </h2>
          <div className="grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
            {related.map((item) => (
              <VideoCard key={item.slug} item={item as CatalogItem} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
