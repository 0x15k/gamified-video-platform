"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { useAvatarStore } from "@/stores/useAvatarStore";

const REFRESH_INTERVAL_MS = 13 * 60 * 1000;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const fetchMe = useAuthStore((s) => s.fetchMe);
  const user = useAuthStore((s) => s.user);
  const hydrate = useAvatarStore((s) => s.hydrate);

  useEffect(() => {
    void fetchMe();
  }, [fetchMe]);

  useEffect(() => {
    if (user?.avatarData) {
      hydrate(user.avatarData);
    }
  }, [user, hydrate]);

  useEffect(() => {
    if (!user) return;

    const refresh = async () => {
      const res = await fetch("/api/auth/refresh", { method: "POST" });
      if (res.ok) void fetchMe();
    };

    const timer = setInterval(() => void refresh(), REFRESH_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [user, fetchMe]);

  return <>{children}</>;
}
