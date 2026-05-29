import Link from "next/link";
import { listPublishedStories } from "@/lib/video/stories";

export const metadata = {
  title: "Historias interactivas",
  description: "Elige tu camino. Vídeos IA con distintos finales según tus decisiones.",
};

export default async function StoriesPage() {
  const stories = await listPublishedStories(48);

  return (
    <section>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white sm:text-2xl">Historias IA</h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Vídeos pregenerados con IA · tú eliges el final
        </p>
      </div>

      {stories.length === 0 ? (
        <p className="text-sm text-[var(--text-dim)]">Próximamente nuevas historias.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stories.map((s) => (
            <Link
              key={s.id}
              href={`/player?node=${s.id}`}
              className="surface-panel group block p-5 transition hover:border-[var(--accent)]/40"
            >
              <h2 className="font-semibold text-white group-hover:text-[var(--accent)]">
                {s.title}
              </h2>
              {s.model && (
                <p className="mt-1 text-xs text-[var(--accent)]">{s.model.name}</p>
              )}
              {s.summary && (
                <p className="mt-2 line-clamp-2 text-sm text-[var(--text-dim)]">{s.summary}</p>
              )}
              <p className="mt-3 text-[11px] text-[var(--text-muted)]">
                {s._count.childNodes + 1} escenas · elige tu camino
              </p>
            </Link>
          ))}
        </div>
      )}

      <p className="mt-8 text-center text-xs text-[var(--text-dim)]">
        Requiere cuenta para guardar progreso ·{" "}
        <Link href="/login" className="text-[var(--accent)] hover:underline">
          Iniciar sesión
        </Link>
      </p>
    </section>
  );
}
