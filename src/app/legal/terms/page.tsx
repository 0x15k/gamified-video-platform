import { MarketingNav } from "@/components/layout/MarketingNav";

export default function TermsPage() {
  return (
    <>
      <MarketingNav />
      <article className="prose prose-invert max-w-none text-zinc-300">
        <h1 className="text-2xl font-bold text-white">Términos de uso</h1>
        <p className="mt-4 text-sm text-zinc-400">
          Plantilla legal. El texto definitivo dependerá de si operas formación en ciberseguridad o
          contenido adulto (+18), incluyendo jurisdicción, edad mínima y políticas de reembolso.
        </p>
      </article>
    </>
  );
}
