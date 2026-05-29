import { AvatarCanvas } from "@/components/avatar/AvatarCanvas";
import { AvatarControls } from "@/components/avatar/AvatarControls";

export default function AvatarPage() {
  return (
    <section className="grid gap-6 lg:grid-cols-2">
      <div>
        <h1 className="mb-4 text-2xl font-bold text-white">Creador de avatar 3D</h1>
        <AvatarCanvas />
      </div>
      <AvatarControls />
    </section>
  );
}
