"use client";

import { FormEvent, useState } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { isAdmin } from "@/lib/rbac/permissions";
import type { AccountType } from "@/lib/rbac/types";

type Mode = "login" | "register";

type Props = {
  mode: Mode;
};

function resolveRedirect(accountType: AccountType): string {
  const params = new URLSearchParams(window.location.search);
  const next = params.get("next");
  if (next && next.startsWith("/") && !next.startsWith("//")) {
    return next;
  }
  return isAdmin(accountType) ? "/admin" : "/dashboard";
}

export function AuthForm({ mode }: Props) {
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
    const normalizedEmail = email.trim().toLowerCase();

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: normalizedEmail, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(
          typeof data.error === "string"
            ? data.error
            : res.status === 429
              ? "Demasiados intentos. Espera un minuto."
              : "Error de autenticación",
        );
        return;
      }

      if (!data.user?.id) {
        setError("Respuesta inválida del servidor.");
        return;
      }

      setUser({
        ...data.user,
        avatarData: {
          hairColor: "#4a3728",
          skinTone: "#f5d0b5",
          outfitColor: "#2563eb",
          ...(typeof data.user.avatarData === "object" ? data.user.avatarData : {}),
        },
      });

      // Full navigation so httpOnly cookies are sent on the next request (avoids soft-router races).
      window.location.assign(resolveRedirect(data.user.accountType));
    } catch {
      setError("No se pudo conectar. ¿Están activos el servidor, Postgres y Redis?");
    } finally {
      setLoading(false);
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
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        className="input-field"
      />
      <input
        type="password"
        required
        minLength={8}
        autoComplete={mode === "login" ? "current-password" : "new-password"}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Contraseña (mín. 8, mayús, minús, número)"
        className="input-field"
      />
      <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 disabled:opacity-50">
        {loading ? "..." : mode === "login" ? "Entrar" : "Registrarse"}
      </button>
      {mode === "login" && (
        <p className="text-center text-xs text-[var(--text-muted)]">
          Admin local: <span className="text-zinc-300">admin@local.dev</span> / Admin1234
        </p>
      )}
    </form>
  );
}
