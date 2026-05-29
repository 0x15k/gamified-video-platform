"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/useAuthStore";

type Transaction = {
  id: string;
  amount: string;
  currency: string;
  status: string;
  gateway: string;
  createdAt: string;
};

export function WalletPanel() {
  const user = useAuthStore((s) => s.user);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    void fetch("/api/wallet/transactions")
      .then((r) => r.json())
      .then((d) => setTransactions(d.transactions ?? []))
      .catch(() => setTransactions([]));
  }, []);

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-indigo-500/30 bg-indigo-950/30 p-6">
        <p className="text-sm text-indigo-200">Saldo de tokens</p>
        <p className="mt-1 text-4xl font-bold text-white">{user.tokensBalance}</p>
        <p className="mt-2 text-sm text-zinc-400">
          Plan: <span className="font-medium text-white">{user.plan}</span>
        </p>
      </div>

      <div>
        <h3 className="mb-3 font-medium text-white">Historial reciente</h3>
        {transactions.length === 0 ? (
          <p className="text-sm text-zinc-500">Sin transacciones aún.</p>
        ) : (
          <ul className="divide-y divide-zinc-800 rounded-xl border border-zinc-800">
            {transactions.map((tx) => (
              <li key={tx.id} className="flex justify-between px-4 py-3 text-sm">
                <span className="text-zinc-300">
                  {tx.gateway} · {tx.status}
                </span>
                <span className="text-white">
                  {tx.amount} {tx.currency}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
