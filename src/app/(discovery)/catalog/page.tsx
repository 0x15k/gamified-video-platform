import { Suspense } from "react";
import { CatalogSearch } from "@/components/catalog/CatalogSearch";
import { CatalogGrid } from "@/components/catalog/CatalogGrid";
import { AdSlot } from "@/components/ads/AdSlot";
import { getPlatformSettings } from "@/lib/platform/settings";
import { getPopularTags } from "@/lib/catalog/queries";
import { getAdConfig } from "@/lib/ads/config";

export const metadata = {
  title: "Catálogo",
  description: "Explora vídeos por tags, trending y búsqueda.",
};

export default async function CatalogPage() {
  const [platform, tags, adConfig] = await Promise.all([
    getPlatformSettings(),
    getPopularTags(),
    Promise.resolve(getAdConfig()),
  ]);
  const adsOn = platform.adsEnabled && adConfig.enabled;

  return (
    <section>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white sm:text-2xl">Vídeos populares</h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Solo chicas IA y animación — vídeos embebidos de prueba (sin subida propia)
        </p>
      </div>
      <CatalogSearch tags={tags} />
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
