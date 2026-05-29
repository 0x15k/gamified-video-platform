import { PageHeader } from "@/components/layout/PageHeader";
import { TokenPackGrid } from "@/components/store/TokenPackGrid";

export default function StorePage() {
  return (
    <section>
      <PageHeader
        title="Tienda de tokens"
        description="Compra packs para desbloquear rutas premium en la narrativa."
      />
      <TokenPackGrid />
    </section>
  );
}
