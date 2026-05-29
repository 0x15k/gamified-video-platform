import Link from "next/link";

export type CatalogItem = {
  slug: string;
  title: string;
  summary: string | null;
  tags: string[];
  durationSec: number | null;
  viewCount: number;
  isPremium: boolean;
  thumbnailUrl: string | null;
};

function formatDuration(sec: number | null) {
  if (!sec) return null;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return m > 0 ? `${m}:${String(s).padStart(2, "0")}` : `0:${s}`;
}

function formatViews(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function thumbnailSrc(item: CatalogItem) {
  return item.thumbnailUrl ?? `/api/thumbnail/${item.slug}`;
}

export function VideoCard({ item }: { item: CatalogItem }) {
  const duration = formatDuration(item.durationSec);
  const thumb = thumbnailSrc(item);

  return (
    <Link href={`/watch/${item.slug}`} className="group block">
      <div className="relative overflow-hidden rounded-lg bg-[var(--bg-hover)] ring-1 ring-[var(--border-subtle)] transition duration-200 group-hover:ring-[var(--accent)]/50">
        <div className="relative aspect-[16/9] overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={thumb}
            alt=""
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
          {duration && (
            <span className="absolute bottom-1.5 right-1.5 rounded bg-black/85 px-1.5 py-0.5 text-[11px] font-semibold text-white">
              {duration}
            </span>
          )}
          {item.isPremium && (
            <span className="absolute left-1.5 top-1.5 rounded bg-[var(--premium)] px-1.5 py-0.5 text-[10px] font-bold uppercase text-black">
              HD
            </span>
          )}
        </div>
      </div>
      <div className="mt-2 px-0.5">
        <h3 className="line-clamp-2 text-[13px] font-medium leading-snug text-[var(--text)] group-hover:text-[var(--accent)]">
          {item.title}
        </h3>
        <p className="mt-0.5 text-[11px] text-[var(--text-dim)]">
          {formatViews(item.viewCount)} vistas
          {item.tags[0] && (
            <span className="text-[var(--text-muted)]"> · #{item.tags[0]}</span>
          )}
        </p>
      </div>
    </Link>
  );
}
