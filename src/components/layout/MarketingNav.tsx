import Link from "next/link";

type Props = {
  siteName?: string;
};

export function MarketingNav({ siteName = "Gamified Platform" }: Props) {
  return (
    <nav className="mb-8 flex items-center justify-between border-b border-zinc-800 pb-4">
      <div className="flex items-center gap-6">
        <Link href="/" className="text-lg font-semibold text-white">
          {siteName}
        </Link>
        <Link href="/catalog" className="text-sm text-zinc-400 hover:text-white">
          Catálogo
        </Link>
      </div>
      <div className="flex gap-4 text-sm">
        <Link href="/login" className="text-zinc-400 hover:text-white">
          Login
        </Link>
        <Link
          href="/register"
          className="rounded-lg bg-indigo-600 px-3 py-1.5 text-white hover:bg-indigo-500"
        >
          Registro
        </Link>
      </div>
    </nav>
  );
}
