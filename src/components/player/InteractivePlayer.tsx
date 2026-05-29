"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import videojs from "video.js";
import type Player from "video.js/dist/types/player";
import "video.js/dist/video-js.css";
import { DecisionOverlay } from "@/components/player/DecisionOverlay";
import { VideoPreloader } from "@/components/player/VideoPreloader";
import { useAuthStore } from "@/stores/useAuthStore";
import { usePlayerStore, type ChildOption } from "@/stores/usePlayerStore";

type Props = {
  nodeId: string;
};

export function InteractivePlayer({ nodeId }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<Player | null>(null);
  const [showChoices, setShowChoices] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const {
    currentNode,
    children,
    setNodeData,
    clearPreloads,
    pushHistory,
  } = usePlayerStore();

  const loadNode = useCallback(
    async (id: string) => {
      setLoading(true);
      setShowChoices(false);
      setError(null);
      clearPreloads();

      const res = await fetch(`/api/video/nodes/${id}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (res.status === 402) {
          setError("No tienes tokens suficientes para este contenido premium.");
        } else if (res.status === 401) {
          setError("Sesión expirada. Vuelve a iniciar sesión.");
        } else {
          setError(data.error ?? "No se pudo cargar el video.");
        }
        setLoading(false);
        return;
      }

      const data = await res.json();
      setNodeData(data.node, data.children);
      pushHistory(id);

      const currentUser = useAuthStore.getState().user;
      if (currentUser && data.user) {
        setUser({
          ...currentUser,
          tokensBalance: data.user.tokensBalance,
          role: data.user.role,
        });
      }

      setLoading(false);

      const player = playerRef.current;
      if (player) {
        const cached = usePlayerStore.getState().getPreload(id);
        player.src({
          src: cached ?? data.node.streamUrl,
          type: "video/mp4",
        });
        void player.play();
      }
    },
    [clearPreloads, pushHistory, setNodeData, setUser],
  );

  useEffect(() => {
    if (!videoRef.current || playerRef.current) return;

    const player = videojs(videoRef.current, {
      controls: true,
      fluid: true,
      preload: "auto",
    });
    playerRef.current = player;

    player.on("timeupdate", () => {
      const duration = player.duration();
      const current = player.currentTime();
      if (!duration || current === undefined) return;
      if (duration - current <= 5 && usePlayerStore.getState().children.length > 0) {
        setShowChoices(true);
      }
    });

    void loadNode(nodeId);

    return () => {
      player.dispose();
      playerRef.current = null;
      clearPreloads();
    };
  }, [nodeId, loadNode, clearPreloads]);

  const handleSelect = async (option: ChildOption) => {
    setShowChoices(false);
    await loadNode(option.id);
  };

  if (error) {
    return (
      <div className="rounded-lg border border-red-500/40 bg-red-950/30 p-4 text-red-200">
        <p>{error}</p>
        <button
          type="button"
          onClick={() => void loadNode(nodeId)}
          className="mt-3 text-sm underline"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (loading && !currentNode) {
    return <p className="text-zinc-400">Cargando experiencia...</p>;
  }

  return (
    <div className="relative w-full">
      <div data-vjs-player>
        <video ref={videoRef} className="video-js vjs-big-play-centered w-full" />
      </div>
      {children.length > 0 && <VideoPreloader children={children} />}
      {showChoices && children.length > 0 && (
        <DecisionOverlay
          options={children}
          tokensBalance={user?.tokensBalance ?? 0}
          userRole={user?.role ?? "FREE"}
          onSelect={handleSelect}
        />
      )}
      {currentNode && (
        <h2 className="mt-4 text-xl font-semibold text-white">{currentNode.title}</h2>
      )}
    </div>
  );
}
