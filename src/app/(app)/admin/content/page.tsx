"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { StoryMap } from "@/components/story/StoryMap";
import { useAuthStore } from "@/stores/useAuthStore";

export default function AdminContentPage() {
  const user = useAuthStore((s) => s.user);
  const router = useRouter();

  useEffect(() => {
    if (user && user.role !== "ADMIN") router.replace("/dashboard");
  }, [user, router]);

  if (user?.role !== "ADMIN") {
    return <p className="text-zinc-400">Acceso restringido.</p>;
  }

  return (
    <section>
      <PageHeader
        title="Contenido"
        description="CRUD completo de episodios/capítulos pendiente. Por ahora, vista del árbol seed."
        action={
          <Link href="/admin" className="text-sm text-zinc-400 hover:text-white">
            ← Admin
          </Link>
        }
      />
      <StoryMap />
    </section>
  );
}
