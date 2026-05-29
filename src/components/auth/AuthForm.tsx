"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";

type Mode = "login" | "register";

type Props = {
  mode: Mode;
};

export function AuthForm({ mode }: Props) {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Error de autenticación");
      return;
    }

    const data = await res.json();
    setUser({
      ...data.user,
      avatarData: {
        hairColor: "#4a3728",
        skinTone: "#f5d0b5",
        outfitColor: "#2563eb",
        ...(typeof data.user.avatarData === "object" ? data.user.avatarData : {}),
      },
    });
    const params = new URLSearchParams(window.location.search);
    router.push(params.get("next") || "/dashboard");
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto w-full max-w-md space-y-4">
      <h1 className="text-2xl font-bold text-white">
        {mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
      </h1>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-white"
      />
      <input
        type="password"
        required
        minLength={8}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Contraseña (mín. 8, mayús, minús, número)"
        className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-white"
      />
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-indigo-600 py-2 font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
      >
        {loading ? "..." : mode === "login" ? "Entrar" : "Registrarse"}
      </button>
    </form>
  );
}
