import { MarketingNav } from "@/components/layout/MarketingNav";
import { getPlatformSettings } from "@/lib/platform/settings";

export default async function TermsPage() {
  const { vertical } = await getPlatformSettings();
  const adult = vertical === "ADULT";

  return (
    <>
      <MarketingNav />
      <article className="max-w-none space-y-4 text-zinc-300">
        <h1 className="text-2xl font-bold text-white">Términos de uso</h1>
        {adult ? (
          <>
            <p className="text-sm text-zinc-400">
              Última actualización: plantilla operativa para contenido +18. Debes revisar con asesoría
              legal antes de producción.
            </p>
            <section className="space-y-2 text-sm">
              <h2 className="font-semibold text-white">1. Edad mínima</h2>
              <p>
                El acceso está limitado a personas mayores de 18 años (o la mayoría de edad en tu
                jurisdicción). Al usar el sitio confirmas cumplir este requisito.
              </p>
              <h2 className="font-semibold text-white">2. Contenido</h2>
              <p>
                El material puede incluir animación generada por IA y narrativa interactiva. No está
                permitido el acceso de menores. El operador puede retirar contenido que infrinja la ley
                o estos términos.
              </p>
              <h2 className="font-semibold text-white">3. Cuentas y planes</h2>
              <p>
                Las cuentas registradas permiten guardar progreso y favoritos. Los planes Premium
                eliminan publicidad según la configuración vigente.
              </p>
              <h2 className="font-semibold text-white">4. Publicidad</h2>
              <p>
                Los usuarios del plan gratuito pueden ver anuncios de terceros. Esos anuncios tienen sus
                propias políticas; no controlamos sitios externos enlazados desde creatividades.
              </p>
              <h2 className="font-semibold text-white">5. Uso prohibido</h2>
              <p>
                Queda prohibido redistribuir contenido sin autorización, eludir controles técnicos,
                automatizar scraping masivo o usar el servicio con fines ilegales.
              </p>
              <h2 className="font-semibold text-white">6. Limitación de responsabilidad</h2>
              <p>
                El servicio se ofrece &quot;tal cual&quot;. No garantizamos disponibilidad ininterrumpida.
              </p>
            </section>
          </>
        ) : (
          <p className="text-sm text-zinc-400">
            Plantilla legal genérica. Personaliza según formación o entretenimiento antes de lanzar.
          </p>
        )}
      </article>
    </>
  );
}
