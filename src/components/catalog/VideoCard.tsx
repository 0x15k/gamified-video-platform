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

export function VideoCard({ item }: { item: CatalogItem }) {
  const duration = formatDuration(item.durationSec);

  return (
    <Link
      href={`/watch/${item.slug}`}
      className="group block overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/40 transition hover:border-zinc-600"
    >
      <div className="relative aspect-video bg-zinc-800">
        {item.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.thumbnailUrl}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-zinc-600">▶</div>
        )}
        {duration && (
          <span className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 text-xs text-white">
            {duration}
          </span>
        )}
        {item.isPremium && (
          <span className="absolute left-2 top-2 rounded bg-amber-600/90 px-1.5 py-0.5 text-[10px] font-medium uppercase text-white">
            Premium
          </span>
        )}
      </div>
      <div className="p-3">
        <h3 className="line-clamp-2 text-sm font-medium text-white group-hover:text-indigo-300">
          {item.title}
        </h3>
        <p className="mt-1 text-xs text-zinc-500">
          {formatViews(item.viewCount)} vistas
          {item.tags[0] ? ` · #${item.tags[0]}` : ""}
        </p>
      </div>
    </Link>
  );
}
