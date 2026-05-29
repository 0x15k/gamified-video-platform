import { create } from "zustand";
import type { AvatarData } from "@/stores/useAuthStore";

type AvatarState = {
  data: AvatarData;
  isSaving: boolean;
  setField: (key: keyof AvatarData, value: string) => void;
  hydrate: (data: AvatarData) => void;
  persist: () => void;
};

let saveTimer: ReturnType<typeof setTimeout> | null = null;

export const useAvatarStore = create<AvatarState>((set, get) => ({
  data: {
    hairColor: "#4a3728",
    skinTone: "#f5d0b5",
    outfitColor: "#2563eb",
  },
  isSaving: false,
  hydrate: (data) => set({ data }),
  setField: (key, value) => {
    set((s) => ({ data: { ...s.data, [key]: value } }));
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(() => get().persist(), 500);
  },
  persist: async () => {
    set({ isSaving: true });
    try {
      await fetch("/api/avatar", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(get().data),
      });
    } finally {
      set({ isSaving: false });
    }
  },
}));
