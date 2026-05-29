"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type StoryNode = {
  id: string;
  title: string;
  isPremium: boolean;
  tokenCost: number;
  durationSec: number | null;
  parentNodeId: string | null;
};

export function StoryMap() {
  const [nodes, setNodes] = useState<StoryNode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetch("/api/video/tree")
      .then((r) => r.json())
      .then((d) => setNodes(d.nodes ?? []))
      .catch(() => setNodes([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-zinc-400">Cargando mapa narrativo...</p>;
  if (nodes.length === 0) {
    return (
      <p className="text-zinc-400">
        No hay nodos en la base de datos. Ejecuta <code className="text-zinc-300">npm run db:seed</code>.
      </p>
    );
  }

  const roots = nodes.filter((n) => !n.parentNodeId);
  const childrenOf = (parentId: string) => nodes.filter((n) => n.parentNodeId === parentId);

  function NodeCard({ node, depth }: { node: StoryNode; depth: number }) {
    const children = childrenOf(node.id);
    return (
      <li className="ml-0" style={{ marginLeft: depth * 16 }}>
        <div className="mb-2 rounded-lg border border-zinc-800 bg-zinc-900/60 p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-medium text-white">{node.title}</span>
            {node.isPremium && (
              <span className="text-xs text-amber-400">Premium · {node.tokenCost} tokens</span>
            )}
          </div>
          <div className="mt-2 flex flex-wrap gap-3">
            <Link
              href={`/player?node=${node.id}`}
              className="text-xs text-indigo-400 hover:text-indigo-300"
            >
              Reproducir →
            </Link>
            <button
              type="button"
              className="text-xs text-zinc-400 hover:text-amber-300"
              onClick={() =>
                void fetch("/api/user/bookmarks", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ videoNodeId: node.id }),
                })
              }
            >
              ★ Favorito
            </button>
          </div>
        </div>
        {children.length > 0 && (
          <ul className="border-l border-zinc-800 pl-4">
            {children.map((c) => (
              <NodeCard key={c.id} node={c} depth={depth + 1} />
            ))}
          </ul>
        )}
      </li>
    );
  }

  return (
    <ul className="space-y-2">
      {roots.map((root) => (
        <NodeCard key={root.id} node={root} depth={0} />
      ))}
    </ul>
  );
}
