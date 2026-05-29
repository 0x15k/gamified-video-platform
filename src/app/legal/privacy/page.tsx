import { MarketingNav } from "@/components/layout/MarketingNav";
import { getPlatformSettings } from "@/lib/platform/settings";

export default async function PrivacyPage() {
  const { vertical } = await getPlatformSettings();
  const adult = vertical === "ADULT";

  return (
    <>
      <MarketingNav />
      <article className="max-w-none space-y-4 text-zinc-300">
        <h1 className="text-2xl font-bold text-white">Política de privacidad</h1>
        {adult ? (
          <>
            <p className="text-sm text-zinc-400">
              Resumen de tratamiento de datos para plataforma +18. Revisa con asesor legal antes de
              producción.
            </p>
            <section className="space-y-2 text-sm">
              <h2 className="font-semibold text-white">Datos que recogemos</h2>
              <p>
                Email y hash de contraseña si te registras; cookies de sesión; cookie de verificación de
                edad; logs técnicos (IP, user-agent) para seguridad y rate limiting; eventos de
                analytics agregados.
              </p>
              <h2 className="font-semibold text-white">Publicidad</h2>
              <p>
                Redes de anuncios de terceros pueden usar cookies o identificadores propios. Consulta
                sus políticas. Los usuarios Premium pueden no ver ciertos formatos publicitarios.
              </p>
              <h2 className="font-semibold text-white">Conservación</h2>
              <p>
                Conservamos datos de cuenta mientras mantengas el registro. Puedes solicitar eliminación
                contactando al operador del sitio.
              </p>
              <h2 className="font-semibold text-white">Tus derechos</h2>
              <p>
                Según tu jurisdicción (GDPR, CCPA, etc.) puedes solicitar acceso, rectificación o
                supresión de datos personales.
              </p>
            </section>
          </>
        ) : (
          <p className="text-sm text-zinc-400">
            Plantilla GDPR/CCPA-ready pendiente. Incluirá tratamiento de datos de pago y logs de media
            firmada.
          </p>
        )}
      </article>
    </>
  );
}
