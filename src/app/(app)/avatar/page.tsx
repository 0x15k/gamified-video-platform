import { PageHeader } from "@/components/layout/PageHeader";
import { AvatarCanvas } from "@/components/avatar/AvatarCanvas";
import { AvatarControls } from "@/components/avatar/AvatarControls";

export default function AvatarPage() {
  return (
    <section className="grid gap-6 lg:grid-cols-2">
      <div>
        <PageHeader
          title="Creador de avatar 3D"
          description="Personaliza colores y guarda en tu perfil."
        />
        <AvatarCanvas />
      </div>
      <AvatarControls />
    </section>
  );
}
