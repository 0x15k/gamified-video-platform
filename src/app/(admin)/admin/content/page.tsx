import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { ContentEditor } from "@/components/admin/ContentEditor";

export default function AdminContentPage() {
  return (
    <section>
      <PageHeader
        title="Gestión de contenido"
        description="Creator shell: nodos del árbol narrativo (sin acceso para usuarios finales)."
        action={
          <Link href="/admin" className="text-sm text-zinc-400 hover:text-white">
            ← Resumen
          </Link>
        }
      />
      <ContentEditor />
    </section>
  );
}
