import { create } from "zustand";

export type AvatarData = {
  hairColor: string;
  skinTone: string;
  outfitColor: string;
};

export type UserProfile = {
  id: string;
  email: string;
  displayName?: string | null;
  bio?: string | null;
  role: "FREE" | "PREMIUM" | "WHALE" | "ADMIN";
  tokensBalance: number;
  avatarData: AvatarData;
};

type AuthState = {
  user: UserProfile | null;
  isLoading: boolean;
  setUser: (user: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
  fetchMe: () => Promise<void>;
  logout: () => Promise<void>;
};

const defaultAvatar: AvatarData = {
  hairColor: "#4a3728",
  skinTone: "#f5d0b5",
  outfitColor: "#2563eb",
};

function normalizeAvatar(data: unknown): AvatarData {
  if (data && typeof data === "object") {
    const d = data as Record<string, unknown>;
    return {
      hairColor: typeof d.hairColor === "string" ? d.hairColor : defaultAvatar.hairColor,
      skinTone: typeof d.skinTone === "string" ? d.skinTone : defaultAvatar.skinTone,
      outfitColor: typeof d.outfitColor === "string" ? d.outfitColor : defaultAvatar.outfitColor,
    };
  }
  return defaultAvatar;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
  fetchMe: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch("/api/auth/me");
      if (!res.ok) {
        set({ user: null, isLoading: false });
        return;
      }
      const data = await res.json();
      set({
        user: {
          ...data.user,
          avatarData: normalizeAvatar(data.user.avatarData),
        },
        isLoading: false,
      });
    } catch {
      set({ user: null, isLoading: false });
    }
  },
  logout: async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    set({ user: null });
  },
}));
