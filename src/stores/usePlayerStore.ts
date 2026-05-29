import { create } from "zustand";

export type ChildOption = {
  id: string;
  title: string;
  isPremium: boolean;
  tokenCost: number;
  durationSec: number | null;
  streamUrl: string;
};

export type NodePayload = {
  id: string;
  title: string;
  isPremium: boolean;
  tokenCost: number;
  durationSec: number | null;
  streamUrl: string;
};

type PlayerState = {
  currentNode: NodePayload | null;
  children: ChildOption[];
  history: string[];
  preloadCache: Map<string, string>;
  setNodeData: (node: NodePayload, children: ChildOption[]) => void;
  setPreload: (nodeId: string, blobUrl: string) => void;
  getPreload: (nodeId: string) => string | undefined;
  clearPreloads: () => void;
  pushHistory: (nodeId: string) => void;
};

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentNode: null,
  children: [],
  history: [],
  preloadCache: new Map(),
  setNodeData: (node, children) => set({ currentNode: node, children }),
  setPreload: (nodeId, blobUrl) => {
    const cache = new Map(get().preloadCache);
    cache.set(nodeId, blobUrl);
    set({ preloadCache: cache });
  },
  getPreload: (nodeId) => get().preloadCache.get(nodeId),
  clearPreloads: () => {
    for (const url of get().preloadCache.values()) {
      if (url.startsWith("blob:")) URL.revokeObjectURL(url);
    }
    set({ preloadCache: new Map() });
  },
  pushHistory: (nodeId) =>
    set((s) => ({ history: [...s.history, nodeId] })),
}));
