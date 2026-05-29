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

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const node = await getNodeBySlug(slug);
  if (!node) return { title: "No encontrado" };
  return {
    title: node.title,
    description: node.summary ?? undefined,
    keywords: node.tags,
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
    <section className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">{node.title}</h1>
        {node.summary && <p className="mt-2 text-zinc-400">{node.summary}</p>}
        <div className="mt-2 flex flex-wrap gap-2">
          {node.tags.map((t) => (
            <Link
              key={t}
              href={`/catalog?tag=${encodeURIComponent(t)}`}
              className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-300 hover:bg-zinc-700"
            >
              #{t}
            </Link>
          ))}
        </div>
        <p className="mt-1 text-xs text-zinc-600">{node.viewCount} vistas</p>
      </div>

      <WatchPlayer slug={slug} title={node.title} showAds={showAds} />

      {showAds && (
        <AdSlot
          placement="watch_bottom"
          zoneId={adConfig.zones.watch_bottom}
          scriptUrl={adConfig.scriptUrl}
        />
      )}

      {node.childNodes.length > 0 && (
        <div>
          <h2 className="mb-3 text-lg font-semibold text-white">Ramas interactivas</h2>
          <ul className="space-y-2 text-sm text-zinc-400">
            {node.childNodes.map((c) => (
              <li key={c.id}>
                <Link href={`/watch/${c.slug}`} className="text-indigo-400 hover:text-indigo-300">
                  {c.title}
                </Link>
                {c.isPremium && <span className="ml-2 text-amber-400">Premium</span>}
              </li>
            ))}
          </ul>
          <Link href={`/player?node=${node.id}`} className="mt-3 inline-block text-sm text-indigo-400">
            Modo historia completa →
          </Link>
        </div>
      )}

      {related.length > 0 && (
        <div>
          <h2 className="mb-4 text-lg font-semibold text-white">Relacionados</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((item) => (
              <VideoCard key={item.slug} item={item as CatalogItem} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
