import { PageHeader } from "@/components/layout/PageHeader";
import { SUBSCRIPTION_PLANS } from "@/lib/store/packs";

export default function UpgradePage() {
  return (
    <section>
      <PageHeader
        title="Planes de suscripción"
        description="Integración CCBill/Crypto pendiente. Estructura lista para conectar pasarelas."
      />
      <div className="grid gap-4 md:grid-cols-2">
        {SUBSCRIPTION_PLANS.map((plan) => (
          <div key={plan.id} className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
            <h2 className="text-xl font-bold text-white">{plan.name}</h2>
            <p className="mt-1 text-2xl text-indigo-300">{plan.priceLabel}</p>
            <ul className="mt-4 space-y-2 text-sm text-zinc-400">
              {plan.perks.map((perk) => (
                <li key={perk}>· {perk}</li>
              ))}
            </ul>
            <button
              type="button"
              disabled
              className="mt-6 w-full cursor-not-allowed rounded-lg border border-zinc-700 py-2 text-sm text-zinc-500"
            >
              Próximamente — pasarela de pago
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
