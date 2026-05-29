"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { FormEvent, useState } from "react";

type Props = {
  siteName: string;
  isAdult?: boolean;
};

export function DiscoveryHeader({ siteName, isAdult }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [q, setQ] = useState("");

  function onSearch(e: FormEvent) {
    e.preventDefault();
    const query = q.trim();
    router.push(query ? `/catalog?q=${encodeURIComponent(query)}` : "/catalog");
  }

  return (
    <header className="sticky top-0 z-50 -mx-4 mb-6 border-b border-[var(--border-subtle)] bg-[var(--bg-base)]/95 px-4 py-3 backdrop-blur-lg sm:-mx-6 sm:px-6">
      <div className="mx-auto flex max-w-[1540px] flex-col gap-3 lg:flex-row lg:items-center lg:gap-6">
        <div className="flex shrink-0 items-center justify-between gap-4 lg:justify-start">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent)] text-sm font-black text-black">
              ▶
            </span>
            <span className="text-lg font-bold tracking-tight text-white">
              {siteName}
            </span>
          </Link>
          {isAdult && (
            <span className="rounded border border-[var(--accent)]/40 bg-[var(--accent-muted)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[var(--accent)]">
              +18
            </span>
          )}
          <div className="flex gap-2 lg:hidden">
            <Link href="/login" className="text-sm text-[var(--text-muted)]">
              Login
            </Link>
          </div>
        </div>

        <form onSubmit={onSearch} className="min-w-0 flex-1">
          <div className="relative">
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar vídeos, tags (ai, animation…)"
              className="input-field w-full pr-24"
            />
            <button
              type="submit"
              className="absolute right-1 top-1/2 -translate-y-1/2 rounded-md bg-[var(--accent)] px-4 py-1.5 text-xs font-bold text-black hover:bg-[var(--accent-hover)]"
            >
              Buscar
            </button>
          </div>
        </form>

        <nav className="hidden shrink-0 items-center gap-1 lg:flex">
          <Link
            href="/stories"
            className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
              pathname.startsWith("/stories")
                ? "bg-[var(--accent-muted)] text-[var(--accent)]"
                : "text-[var(--text-muted)] hover:text-white"
            }`}
          >
            Historias
          </Link>
          <Link
            href="/models"
            className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
              pathname.startsWith("/model")
                ? "bg-[var(--accent-muted)] text-[var(--accent)]"
                : "text-[var(--text-muted)] hover:text-white"
            }`}
          >
            Modelos
          </Link>
          <Link
            href="/catalog"
            className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
              pathname.startsWith("/catalog") || pathname.startsWith("/watch")
                ? "text-[var(--text-muted)] hover:text-white"
                : "text-[var(--text-muted)] hover:text-white"
            }`}
          >
            Clips
          </Link>
          <Link
            href="/upgrade"
            className="rounded-lg px-3 py-2 text-sm font-medium text-[var(--premium)] hover:bg-amber-500/10"
          >
            Premium
          </Link>
          <Link href="/dashboard" className="rounded-lg px-3 py-2 text-sm text-[var(--text-muted)] hover:text-white">
            Mi cuenta
          </Link>
          <Link href="/login" className="btn-ghost ml-1 py-1.5">
            Login
          </Link>
        </nav>
      </div>
    </header>
  );
}
