"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";

type Notification = {
  id: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
};

export default function NotificationsPage() {
  const [items, setItems] = useState<Notification[]>([]);

  async function load() {
    const res = await fetch("/api/notifications");
    const data = await res.json();
    setItems(data.notifications ?? []);
  }

  useEffect(() => {
    void load();
  }, []);

  async function markAllRead() {
    await fetch("/api/notifications", { method: "PATCH" });
    void load();
  }

  return (
    <section>
      <PageHeader
        title="Notificaciones"
        description="Avisos de progreso, compras y sistema."
        action={
          <button
            type="button"
            onClick={() => void markAllRead()}
            className="text-sm text-indigo-400 hover:text-indigo-300"
          >
            Marcar todas leídas
          </button>
        }
      />
      {items.length === 0 ? (
        <p className="text-zinc-400">Sin notificaciones.</p>
      ) : (
        <ul className="divide-y divide-zinc-800 rounded-xl border border-zinc-800">
          {items.map((n) => (
            <li
              key={n.id}
              className={`px-4 py-3 ${n.read ? "opacity-60" : "bg-zinc-900/40"}`}
            >
              <p className="font-medium text-white">{n.title}</p>
              <p className="text-sm text-zinc-400">{n.body}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
