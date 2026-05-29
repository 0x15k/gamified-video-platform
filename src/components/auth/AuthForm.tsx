"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import { isAdmin } from "@/lib/rbac/permissions";

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
    const next = params.get("next");
    if (next) {
      router.push(next);
    } else if (isAdmin(data.user.accountType)) {
      router.push("/admin");
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <form onSubmit={onSubmit} className="surface-panel mx-auto w-full max-w-md space-y-4 p-6">
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
        className="input-field"
      />
      <input
        type="password"
        required
        minLength={8}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Contraseña (mín. 8, mayús, minús, número)"
        className="input-field"
      />
      <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 disabled:opacity-50">
        {loading ? "..." : mode === "login" ? "Entrar" : "Registrarse"}
      </button>
    </form>
  );
}
