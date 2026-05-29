import { ModelsEditor } from "@/components/admin/ModelsEditor";
import { PageHeader } from "@/components/layout/PageHeader";

export default function AdminModelsPage() {
  return (
    <section>
      <PageHeader
        title="Modelos IA"
        description="Personajes del catálogo. Asigna modelos al publicar vídeos en Contenido."
      />
      <ModelsEditor />
    </section>
  );
}
