"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { PlaceholderAvatar } from "@/components/avatar/PlaceholderAvatar";
import { useAvatarStore } from "@/stores/useAvatarStore";

export function AvatarCanvas() {
  const data = useAvatarStore((s) => s.data);

  return (
    <div className="h-[420px] w-full overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950">
      <Canvas camera={{ position: [0, 1.2, 3.5], fov: 45 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 8, 5]} intensity={1.2} />
        <PlaceholderAvatar data={data} />
        <OrbitControls enablePan={false} minDistance={2} maxDistance={6} />
      </Canvas>
    </div>
  );
}
