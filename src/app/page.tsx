import Link from "next/link";

export default function HomePage() {
  return (
    <section className="space-y-6 py-12">
      <h1 className="text-4xl font-bold text-white">Plataforma de video interactivo</h1>
      <p className="max-w-xl text-zinc-400">
        Narrativa ramificada, avatares 3D y economía de tokens. Self-hosted con seguridad
        OWASP-first.
      </p>
      <div className="flex gap-4">
        <Link
          href="/register"
          className="rounded-lg bg-indigo-600 px-5 py-2 font-medium text-white hover:bg-indigo-500"
        >
          Empezar
        </Link>
        <Link
          href="/login"
          className="rounded-lg border border-zinc-700 px-5 py-2 text-zinc-300 hover:border-zinc-500"
        >
          Iniciar sesión
        </Link>
      </div>
    </section>
  );
}
