"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";

type Bookmark = {
  id: string;
  videoNode: { id: string; title: string; summary: string | null; isPremium: boolean };
};

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);

  useEffect(() => {
    void fetch("/api/user/bookmarks")
      .then((r) => r.json())
      .then((d) => setBookmarks(d.bookmarks ?? []));
  }, []);

  return (
    <section>
      <PageHeader
        title="Favoritos"
        description="Capítulos guardados para retomar más tarde."
      />
      {bookmarks.length === 0 ? (
        <p className="text-zinc-400">No tienes favoritos. Guárdalos desde el mapa de historia.</p>
      ) : (
        <ul className="divide-y divide-zinc-800 rounded-xl border border-zinc-800">
          {bookmarks.map((b) => (
            <li key={b.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="font-medium text-white">{b.videoNode.title}</p>
                {b.videoNode.summary && (
                  <p className="text-sm text-zinc-500">{b.videoNode.summary}</p>
                )}
              </div>
              <Link
                href={`/player?node=${b.videoNode.id}`}
                className="text-sm text-indigo-400 hover:text-indigo-300"
              >
                Abrir
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
