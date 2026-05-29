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

  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const {
    currentNode,
    children,
    setNodeData,
    getPreload,
    clearPreloads,
    pushHistory,
    setPreload,
  } = usePlayerStore();

  const loadNode = useCallback(
    async (id: string) => {
      setLoading(true);
      setShowChoices(false);
      clearPreloads();

      const res = await fetch(`/api/video/nodes/${id}`);
      if (!res.ok) {
        setLoading(false);
        return;
      }
      const data = await res.json();
      setNodeData(data.node, data.children);
      pushHistory(id);
      setLoading(false);

      const player = playerRef.current;
      if (player) {
        player.src({ src: data.node.streamUrl, type: "video/mp4" });
        void player.play();
      }
    },
    [clearPreloads, pushHistory, setNodeData],
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
    if (option.isPremium && user?.role === "FREE") {
      if ((user?.tokensBalance ?? 0) < option.tokenCost) return;
      const spendRes = await fetch("/api/wallet/spend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nodeId: option.id }),
      });
      if (!spendRes.ok) return;
      const spendData = await spendRes.json();
      if (user) {
        setUser({ ...user, tokensBalance: spendData.user.tokensBalance });
      }
    }

    setShowChoices(false);
    const cached = getPreload(option.id);
    const player = playerRef.current;
    if (player) {
      const src = cached ?? option.streamUrl;
      player.src({ src, type: "video/mp4" });
      void player.play();
      if (cached) setPreload(option.id, cached);
    }
    await loadNode(option.id);
  };

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
