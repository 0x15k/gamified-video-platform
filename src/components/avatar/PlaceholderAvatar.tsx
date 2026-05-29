"use client";

import type { AvatarData } from "@/stores/useAuthStore";

type Props = {
  data: AvatarData;
};

export function PlaceholderAvatar({ data }: Props) {
  return (
    <group>
      <mesh position={[0, 1.6, 0]}>
        <sphereGeometry args={[0.35, 32, 32]} />
        <meshStandardMaterial color={data.skinTone} />
      </mesh>
      <mesh position={[0, 2.05, 0]}>
        <sphereGeometry args={[0.38, 32, 32]} />
        <meshStandardMaterial color={data.hairColor} />
      </mesh>
      <mesh position={[0, 0.75, 0]}>
        <boxGeometry args={[0.7, 0.9, 0.4]} />
        <meshStandardMaterial color={data.outfitColor} />
      </mesh>
      <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[0.35, 0.2, 0.35]} />
        <meshStandardMaterial color="#1f2937" />
      </mesh>
    </group>
  );
}
