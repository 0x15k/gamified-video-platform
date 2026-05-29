"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { useAvatarStore } from "@/stores/useAvatarStore";

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

  return <>{children}</>;
}
