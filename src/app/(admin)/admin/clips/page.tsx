import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { ContentEditor } from "@/components/admin/ContentEditor";

export default function AdminClipsPage() {
  return (
    <section>
      <PageHeader
        title="Clips embed (catálogo)"
        description="Pega URLs embed para probar en producción. Ideal en Vercel (sin subir MP4 al servidor)."
        action={
          <Link href="/admin/content" className="text-sm text-zinc-400 hover:text-white">
            Historias MP4 →
          </Link>
        }
      />
      <ContentEditor />
    </section>
  );
}
