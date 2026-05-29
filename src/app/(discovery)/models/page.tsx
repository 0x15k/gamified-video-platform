import { listModels } from "@/lib/catalog/models";
import { ModelCardGrid, type ModelCardItem } from "@/components/catalog/ModelCard";

export const metadata = {
  title: "Modelos IA",
  description: "Chicas y personajes generados por IA. Clips, animación y sensación webcam.",
};

export default async function ModelsPage() {
  const rows = await listModels({ limit: 48 });

  const models: ModelCardItem[] = rows.map((m) => ({
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
        <h1 className="text-xl font-bold text-white sm:text-2xl">Modelos IA</h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Personajes virtuales · animación, 3D y estilo webcam simulada
        </p>
      </div>
      {models.length === 0 ? (
        <p className="text-sm text-[var(--text-dim)]">Aún no hay modelos publicados.</p>
      ) : (
        <ModelCardGrid models={models} />
      )}
    </section>
  );
}
