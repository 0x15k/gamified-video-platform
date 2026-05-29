"use client";

import Link from "next/link";
import { useAuthStore } from "@/stores/useAuthStore";

export function AppNav() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  return (
    <nav className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 pb-4">
      <div className="flex gap-4 text-sm">
        <Link href="/" className="font-semibold text-white">
          Gamified Platform
        </Link>
        {user && (
          <>
            <Link href="/player" className="text-zinc-400 hover:text-white">
              Player
            </Link>
            <Link href="/avatar" className="text-zinc-400 hover:text-white">
              Avatar
            </Link>
            <Link href="/wallet" className="text-zinc-400 hover:text-white">
              Wallet
            </Link>
          </>
        )}
      </div>
      <div className="flex items-center gap-3 text-sm">
        {user ? (
          <>
            <span className="text-zinc-400">
              {user.email} · {user.tokensBalance} tokens
            </span>
            <button
              type="button"
              onClick={() => void logout().then(() => (window.location.href = "/"))}
              className="text-zinc-400 hover:text-white"
            >
              Salir
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="text-zinc-400 hover:text-white">
              Login
            </Link>
            <Link href="/register" className="text-indigo-400 hover:text-indigo-300">
              Registro
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
