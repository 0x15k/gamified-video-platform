"use client";

import { useEffect, useState } from "react";

export function usePlatformBrand() {
  const [siteName, setSiteName] = useState("Gamified Platform");

  useEffect(() => {
    void fetch("/api/platform/settings")
      .then((r) => r.json())
      .then((d) => setSiteName(d.settings?.siteName ?? "Gamified Platform"))
      .catch(() => undefined);
  }, []);

  return siteName;
}
