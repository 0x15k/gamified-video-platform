import { PageHeader } from "@/components/layout/PageHeader";
import { StoryBuilder } from "@/components/admin/StoryBuilder";
import Link from "next/link";

export default function AdminContentPage() {
  return (
    <section>
      <PageHeader
        title="Historias interactivas"
        description="Sube vídeos IA y conecta decisiones con distintos finales. Sin live — solo ramas pregrabadas."
        action={
          <Link href="/admin/models" className="text-sm text-zinc-400 hover:text-white">
            Modelos IA →
          </Link>
        }
      />
      <StoryBuilder />
    </section>
  );
}
