import "dotenv/config";
import { mkdirSync, writeFileSync, existsSync } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "../src/generated/prisma/client";
import bcrypt from "bcryptjs";
import { buildNodeSlug } from "../src/lib/catalog/slug";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const VIDEO_FILES = ["intro", "path-a", "path-b", "ending-a", "premium-path"];

const MINIMAL_MP4 = Buffer.from(
  "AAAAIGZ0eXBpc29tAAACAGlzb21pc28yYXZjMW1wNDEAAAAIZnJlZQAA" +
    "tGxvdXQAAAAGdHJhawAAAAAAAAAAAAAA",
  "base64",
);

function slug(title: string) {
  return buildNodeSlug(title, randomUUID().replace(/-/g, ""));
}

async function ensureVideos() {
  const storagePath = path.resolve(process.env.VIDEO_STORAGE_PATH ?? "./storage/videos");
  mkdirSync(storagePath, { recursive: true });

  for (const name of VIDEO_FILES) {
    const filePath = path.join(storagePath, `${name}.mp4`);
    if (!existsSync(filePath)) {
      writeFileSync(filePath, MINIMAL_MP4);
    }
  }
}

async function main() {
  await ensureVideos();

  const passwordHash = await bcrypt.hash("Demo1234", 12);

  await prisma.analyticsEvent.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.userBookmark.deleteMany();
  await prisma.userProgress.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.videoNode.deleteMany();
  await prisma.user.deleteMany();
  await prisma.platformSettings.deleteMany();

  await prisma.platformSettings.create({
    data: {
      id: "default",
      siteName: "Interactive AI",
      vertical: "ADULT",
      ageGateEnabled: true,
      adsEnabled: true,
    },
  });

  const adminHash = await bcrypt.hash("Admin1234", 12);
  await prisma.user.create({
    data: {
      email: "admin@local.dev",
      passwordHash: adminHash,
      accountType: "ADMIN",
      plan: "FREE",
      tokensBalance: 9999,
      avatarData: {},
    },
  });

  const user = await prisma.user.create({
    data: {
      email: "demo@local.dev",
      passwordHash,
      accountType: "USER",
      plan: "FREE",
      tokensBalance: 100,
      avatarData: {
        hairColor: "#4a3728",
        skinTone: "#f5d0b5",
        outfitColor: "#2563eb",
      },
    },
  });

  await prisma.videoNode.create({
    data: {
      title: "AI Animation — Loop 01",
      slug: slug("AI Animation Loop 01"),
      summary: "Clip corto estilo animación IA. Demo de catálogo público.",
      urlHash: "intro",
      tags: ["ai", "animation", "3d"],
      vertical: "ADULT",
      durationSec: 30,
      viewCount: 8420,
      isPremium: false,
      published: true,
    },
  });

  await prisma.videoNode.create({
    data: {
      title: "AI Animation — Premium teaser",
      slug: slug("AI Animation Premium teaser"),
      summary: "Vista previa gratuita; contenido completo con tokens o Premium.",
      urlHash: "premium-path",
      tags: ["ai", "animation", "premium"],
      vertical: "ADULT",
      durationSec: 45,
      viewCount: 12500,
      isPremium: true,
      tokenCost: 25,
      previewSec: 20,
      published: true,
    },
  });

  const root = await prisma.videoNode.create({
    data: {
      title: "Historia interactiva — Episodio 1",
      slug: slug("Historia interactiva Episodio 1"),
      summary: "Narrativa ramificada con decisiones. Modo historia en /player.",
      urlHash: "intro",
      tags: ["ai", "interactive", "story"],
      vertical: "ADULT",
      durationSec: 30,
      viewCount: 3200,
      isPremium: false,
      published: true,
    },
  });

  const pathA = await prisma.videoNode.create({
    data: {
      title: "Camino valiente",
      slug: slug("Camino valiente"),
      urlHash: "path-a",
      parentNodeId: root.id,
      tags: ["interactive"],
      vertical: "ADULT",
      durationSec: 20,
      isPremium: false,
      published: true,
    },
  });

  const pathB = await prisma.videoNode.create({
    data: {
      title: "Camino premium",
      slug: slug("Camino premium"),
      urlHash: "premium-path",
      parentNodeId: root.id,
      tags: ["premium", "interactive"],
      vertical: "ADULT",
      durationSec: 20,
      isPremium: true,
      tokenCost: 25,
      previewSec: 15,
      published: true,
    },
  });

  await prisma.videoNode.create({
    data: {
      title: "Final valiente",
      slug: slug("Final valiente"),
      urlHash: "ending-a",
      parentNodeId: pathA.id,
      vertical: "ADULT",
      durationSec: 15,
      isPremium: false,
      published: true,
    },
  });

  await prisma.videoNode.create({
    data: {
      title: "Final exclusivo",
      slug: slug("Final exclusivo"),
      urlHash: "path-b",
      parentNodeId: pathB.id,
      vertical: "ADULT",
      durationSec: 15,
      isPremium: true,
      tokenCost: 10,
      published: true,
    },
  });

  await prisma.transaction.create({
    data: {
      userId: user.id,
      amount: 100,
      currency: "TOKENS",
      status: "COMPLETED",
      gateway: "INTERNAL",
      metadata: { type: "welcome_bonus" },
    },
  });

  await prisma.notification.create({
    data: {
      userId: user.id,
      title: "Bienvenido",
      body: "Explora el catálogo público o inicia sesión para guardar progreso y favoritos.",
    },
  });

  console.log("Seed complete (vertical: ADULT, ads + age gate on).");
  console.log("  Demo:  demo@local.dev / Demo1234");
  console.log("  Admin: admin@local.dev / Admin1234");
  console.log("  Catalog: http://localhost:3000/catalog");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
