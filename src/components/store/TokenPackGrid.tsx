"use client";

import { useState } from "react";
import { TOKEN_PACKS } from "@/lib/store/packs";
import { useAuthStore } from "@/stores/useAuthStore";

export function TokenPackGrid() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function buyPack(packId: string) {
    setLoadingId(packId);
    setMessage(null);
    const res = await fetch("/api/store/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ packId }),
    });
    setLoadingId(null);
    if (!res.ok) {
      setMessage("No se pudo completar la compra de prueba.");
      return;
    }
    const data = await res.json();
    if (user) {
      setUser({ ...user, tokensBalance: data.user.tokensBalance });
    }
    setMessage(`+${data.pack.tokens} tokens acreditados (checkout simulado).`);
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-zinc-500">
        Checkout simulado para desarrollo. CCBill/Crypto se conectarán en una fase posterior.
      </p>
      {message && (
        <p className="rounded-lg border border-emerald-500/30 bg-emerald-950/30 px-3 py-2 text-sm text-emerald-300">
          {message}
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-3">
        {TOKEN_PACKS.map((pack) => (
          <div
            key={pack.id}
            className={`rounded-xl border p-5 ${
              pack.popular ? "border-indigo-500/50 bg-indigo-950/20" : "border-zinc-800 bg-zinc-900/40"
            }`}
          >
            {pack.popular && (
              <span className="text-xs font-medium text-indigo-400">Más popular</span>
            )}
            <h3 className="mt-1 text-lg font-semibold text-white">{pack.name}</h3>
            <p className="text-2xl font-bold text-white">{pack.priceLabel}</p>
            <p className="mt-2 text-sm text-zinc-400">{pack.description}</p>
            <p className="mt-3 text-sm text-indigo-300">{pack.tokens} tokens</p>
            <button
              type="button"
              disabled={loadingId === pack.id}
              onClick={() => void buyPack(pack.id)}
              className="mt-4 w-full rounded-lg bg-indigo-600 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
            >
              {loadingId === pack.id ? "Procesando..." : "Comprar (mock)"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
