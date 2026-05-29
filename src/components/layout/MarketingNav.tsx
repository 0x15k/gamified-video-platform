import Link from "next/link";

export function MarketingNav() {
  return (
    <nav className="mb-8 flex items-center justify-between border-b border-zinc-800 pb-4">
      <Link href="/" className="text-lg font-semibold text-white">
        Gamified Platform
      </Link>
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
