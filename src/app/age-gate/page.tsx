"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";

function AgeGateContent() {
  const router = useRouter();
  const params = useSearchParams();

  async function accept() {
    await fetch("/api/platform/age-verify", { method: "POST" });
    const next = params.get("next") || "/catalog";
    router.push(next);
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--bg-base)] px-4">
      <div className="w-full max-w-md surface-panel p-8 text-center shadow-2xl shadow-black/50">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--accent)] text-2xl font-black text-black">
          18+
        </div>
        <h1 className="text-2xl font-bold text-white">Contenido para adultos</h1>
        <p className="mt-3 text-sm leading-relaxed text-[var(--text-muted)]">
          Este sitio contiene material solo para mayores de 18 años. Al entrar confirmas que cumples
          la edad legal en tu país y aceptas nuestros{" "}
          <Link href="/legal/terms" className="text-[var(--accent)] hover:underline">
            términos
          </Link>
          .
        </p>
        <button type="button" onClick={() => void accept()} className="btn-primary mt-8 w-full py-3">
          Entrar — tengo 18 años o más
        </button>
        <Link
          href="/"
          className="mt-4 block text-sm text-[var(--text-dim)] hover:text-white"
        >
          Salir del sitio
        </Link>
      </div>
    </div>
  );
}

export default function AgeGatePage() {
  return (
    <Suspense>
      <AgeGateContent />
    </Suspense>
  );
}
