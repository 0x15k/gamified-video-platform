import { PageHeader } from "@/components/layout/PageHeader";
import { StoryMap } from "@/components/story/StoryMap";

export default function StoryPage() {
  return (
    <section>
      <PageHeader
        title="Mapa de historia"
        description="Vista del árbol narrativo. Navega ramas sin depender del motor de video optimizado."
      />
      <StoryMap />
    </section>
  );
}
