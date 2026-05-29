import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { AnalyticsOverview } from "@/components/admin/AnalyticsOverview";

export default function AdminAnalyticsPage() {
  return (
    <section>
      <PageHeader
        title="Analytics"
        description="Métricas agregadas de los últimos 7 días."
        action={
          <Link href="/admin" className="text-sm text-zinc-400 hover:text-white">
            ← Admin
          </Link>
        }
      />
      <AnalyticsOverview />
    </section>
  );
}
