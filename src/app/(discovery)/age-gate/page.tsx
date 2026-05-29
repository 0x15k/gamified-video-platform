"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function AgeGateContent() {
  const router = useRouter();
  const params = useSearchParams();

  async function accept() {
    await fetch("/api/platform/age-verify", { method: "POST" });
    const next = params.get("next") || "/catalog";
    router.push(next);
  }

  return (
    <div className="mx-auto max-w-md rounded-xl border border-zinc-700 bg-zinc-900 p-8 text-center">
      <h1 className="text-2xl font-bold text-white">Contenido para adultos (+18)</h1>
      <p className="mt-3 text-sm text-zinc-400">
        Al continuar confirmas que eres mayor de edad según la legislación de tu país y aceptas
        nuestros términos.
      </p>
      <button
        type="button"
        onClick={() => void accept()}
        className="mt-8 w-full rounded-lg bg-indigo-600 py-3 font-medium text-white hover:bg-indigo-500"
      >
        Entrar — tengo 18 años o más
      </button>
      <a href="/" className="mt-4 block text-sm text-zinc-500 hover:text-zinc-300">
        Salir del sitio
      </a>
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
