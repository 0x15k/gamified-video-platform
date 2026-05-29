import Link from "next/link";

type Props = {
  siteName?: string;
};

export function MarketingNav({ siteName = "Gamified Platform" }: Props) {
  return (
    <nav className="mb-8 flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
      <div className="flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent)] text-sm font-black text-black">
            ▶
          </span>
          <span className="text-lg font-bold text-white">{siteName}</span>
        </Link>
        <Link
          href="/catalog"
          className="text-sm font-medium text-[var(--text-muted)] hover:text-[var(--accent)]"
        >
          Catálogo
        </Link>
      </div>
      <div className="flex gap-3 text-sm">
        <Link href="/login" className="text-[var(--text-muted)] hover:text-white">
          Login
        </Link>
        <Link href="/register" className="btn-primary py-1.5">
          Registro
        </Link>
      </div>
    </nav>
  );
}
