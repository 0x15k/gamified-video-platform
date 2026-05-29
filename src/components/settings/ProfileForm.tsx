"use client";

import { FormEvent, useEffect, useState } from "react";
import { useAuthStore } from "@/stores/useAuthStore";

export function ProfileForm() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    void fetch("/api/user/profile")
      .then((r) => r.json())
      .then((d) => {
        setDisplayName(d.profile?.displayName ?? "");
        setBio(d.profile?.bio ?? "");
      })
      .catch(() => undefined);
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/user/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayName, bio }),
    });
    if (!res.ok) {
      setMessage("Error al guardar.");
      return;
    }
    const data = await res.json();
    if (user) {
      setUser({ ...user, ...data.profile });
    }
    setMessage("Perfil actualizado.");
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <label className="block text-sm">
        <span className="text-zinc-400">Nombre público</span>
        <input
          className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-white"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Tu nombre o alias"
        />
      </label>
      <label className="block text-sm">
        <span className="text-zinc-400">Bio</span>
        <textarea
          className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-white"
          rows={3}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Breve descripción"
        />
      </label>
      <button
        type="submit"
        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-500"
      >
        Guardar perfil
      </button>
      {message && <p className="text-sm text-emerald-400">{message}</p>}
    </form>
  );
}
