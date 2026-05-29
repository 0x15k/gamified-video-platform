import { MarketingNav } from "@/components/layout/MarketingNav";

export default function PrivacyPage() {
  return (
    <>
      <MarketingNav />
      <article className="prose prose-invert max-w-none text-zinc-300">
        <h1 className="text-2xl font-bold text-white">Privacidad</h1>
        <p className="mt-4 text-sm text-zinc-400">
          Plantilla GDPR/CCPA-ready pendiente. Incluirá tratamiento de datos de pago, logs de
          acceso a media firmada y retención según vertical elegida.
        </p>
      </article>
    </>
  );
}
