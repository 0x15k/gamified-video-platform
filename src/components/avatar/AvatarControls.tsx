"use client";

import { useAvatarStore } from "@/stores/useAvatarStore";

const FIELDS = [
  { key: "hairColor" as const, label: "Color de pelo" },
  { key: "skinTone" as const, label: "Tono de piel" },
  { key: "outfitColor" as const, label: "Color de ropa" },
];

export function AvatarControls() {
  const data = useAvatarStore((s) => s.data);
  const setField = useAvatarStore((s) => s.setField);
  const isSaving = useAvatarStore((s) => s.isSaving);

  return (
    <div className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
      <h3 className="font-medium text-white">Personalizar avatar</h3>
      {FIELDS.map(({ key, label }) => (
        <label key={key} className="flex items-center justify-between gap-4 text-sm text-zinc-300">
          <span>{label}</span>
          <input
            type="color"
            value={data[key]}
            onChange={(e) => setField(key, e.target.value)}
            className="h-9 w-14 cursor-pointer rounded border border-zinc-700 bg-transparent"
          />
        </label>
      ))}
      {isSaving && <p className="text-xs text-zinc-500">Guardando...</p>}
    </div>
  );
}
