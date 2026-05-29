import { Suspense } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
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
      <PageHeader
        title="Catálogo"
        description={
          platform.vertical === "ADULT"
            ? "Descubre contenido por tags y trending. Los anuncios financian el acceso gratuito."
            : "Vídeos publicados en la plataforma."
        }
      />
      <CatalogSearch tags={tags} />
      {adsOn && (
        <div className="my-6">
          <AdSlot
            placement="catalog_inline"
            zoneId={adConfig.zones.catalog_inline}
            scriptUrl={adConfig.scriptUrl}
          />
        </div>
      )}
      <Suspense fallback={<p className="text-zinc-500">Cargando vídeos…</p>}>
        <CatalogGrid />
      </Suspense>
    </section>
  );
}
