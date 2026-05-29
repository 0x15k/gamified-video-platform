import Link from "next/link";
import { Suspense } from "react";
import { CatalogSearch } from "@/components/catalog/CatalogSearch";
import { CatalogGrid } from "@/components/catalog/CatalogGrid";
import { ModelCardGrid, type ModelCardItem } from "@/components/catalog/ModelCard";
import { AdSlot } from "@/components/ads/AdSlot";
import { getPlatformSettings } from "@/lib/platform/settings";
import { getPopularTags } from "@/lib/catalog/queries";
import { listModels } from "@/lib/catalog/models";
import { getAdConfig } from "@/lib/ads/config";

export const metadata = {
  title: "Catálogo",
  description: "Explora vídeos por tags, trending y búsqueda.",
};

export default async function CatalogPage() {
  const [platform, tags, adConfig, modelRows] = await Promise.all([
    getPlatformSettings(),
    getPopularTags(),
    Promise.resolve(getAdConfig()),
    listModels({ limit: 4 }),
  ]);
  const adsOn = platform.adsEnabled && adConfig.enabled;
  const modelCards: ModelCardItem[] = modelRows.map((m) => ({
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
    <section>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white sm:text-2xl">Vídeos populares</h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Solo chicas IA y animación — vídeos embebidos de prueba (sin subida propia)
        </p>
      </div>
      <CatalogSearch tags={tags} />
      {modelCards.length > 0 && (
        <section className="mb-8">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--text-muted)]">
              Modelos IA
            </h2>
            <Link href="/models" className="text-xs text-[var(--accent)] hover:underline">
              Ver todos
            </Link>
          </div>
          <ModelCardGrid models={modelCards} />
        </section>
      )}
      {adsOn && (
        <div className="mb-5 overflow-hidden rounded-lg">
          <AdSlot
            placement="catalog_inline"
            zoneId={adConfig.zones.catalog_inline}
            scriptUrl={adConfig.scriptUrl}
          />
        </div>
      )}
      <Suspense
        fallback={
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="aspect-video animate-pulse rounded-lg bg-[var(--bg-card)]"
              />
            ))}
          </div>
        }
      >
        <CatalogGrid />
      </Suspense>
    </section>
  );
}
