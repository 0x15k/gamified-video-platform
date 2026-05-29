"use client";

import { useEffect, useState } from "react";

type Settings = {
  vertical: string;
  ageGateEnabled: boolean;
};

export function AgeGateBanner() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [accepted, setAccepted] = useState(true);

  useEffect(() => {
    const stored = sessionStorage.getItem("age_gate_accepted");
    if (stored === "1") setAccepted(true);

    void fetch("/api/platform/settings")
      .then((r) => r.json())
      .then((d) => setSettings(d.settings))
      .catch(() => setSettings(null));
  }, []);

  if (!settings || settings.vertical !== "ADULT" || !settings.ageGateEnabled || accepted) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
      <div className="max-w-md rounded-xl border border-zinc-700 bg-zinc-900 p-6 text-center">
        <h2 className="text-xl font-bold text-white">Contenido +18</h2>
        <p className="mt-2 text-sm text-zinc-400">
          Debes ser mayor de edad para continuar. Al entrar confirmas cumplir la ley aplicable en
          tu jurisdicción.
        </p>
        <button
          type="button"
          onClick={() => {
            sessionStorage.setItem("age_gate_accepted", "1");
            setAccepted(true);
          }}
          className="mt-6 w-full rounded-lg bg-indigo-600 py-2 text-white hover:bg-indigo-500"
        >
          Tengo 18 años o más
        </button>
        <a href="/" className="mt-3 block text-sm text-zinc-500 hover:text-zinc-300">
          Salir
        </a>
      </div>
    </div>
  );
}
