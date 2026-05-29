import Link from "next/link";

export type ModelCardItem = {
  slug: string;
  name: string;
  bio?: string | null;
  avatarUrl: string;
  tags: string[];
  isLive: boolean;
  viewCount: number;
  videoCount: number;
};

function formatViews(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export function ModelCard({ model }: { model: ModelCardItem }) {
  return (
    <Link href={`/model/${model.slug}`} className="group block">
      <div className="relative overflow-hidden rounded-xl bg-[var(--bg-hover)] p-4 ring-1 ring-[var(--border-subtle)] transition duration-200 group-hover:ring-[var(--accent)]/50">
        <div className="flex items-start gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={model.avatarUrl}
            alt=""
            className="h-16 w-16 shrink-0 rounded-full object-cover ring-2 ring-[var(--accent)]/30"
            loading="lazy"
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate text-sm font-semibold text-white group-hover:text-[var(--accent)]">
                {model.name}
              </h3>
              <span className="rounded bg-[var(--accent)]/20 px-1.5 py-0.5 text-[9px] font-bold uppercase text-[var(--accent)]">
                IA
              </span>
              {model.isLive && (
                <span className="rounded bg-red-500/20 px-1.5 py-0.5 text-[9px] font-bold uppercase text-red-400">
                  Live
                </span>
              )}
            </div>
            {model.bio && (
              <p className="mt-1 line-clamp-2 text-xs text-[var(--text-dim)]">{model.bio}</p>
            )}
            <p className="mt-2 text-[11px] text-[var(--text-muted)]">
              {model.videoCount} vídeos · {formatViews(model.viewCount)} vistas
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function ModelCardGrid({ models }: { models: ModelCardItem[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {models.map((m) => (
        <ModelCard key={m.slug} model={m} />
      ))}
    </div>
  );
}
