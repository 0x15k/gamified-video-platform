import { PageHeader } from "@/components/layout/PageHeader";
import { WalletPanel } from "@/components/wallet/WalletPanel";

export default function WalletPage() {
  return (
    <section>
      <PageHeader
        title="Billetera e inventario"
        description="Saldo de tokens e historial de transacciones."
      />
      <WalletPanel />
    </section>
  );
}
