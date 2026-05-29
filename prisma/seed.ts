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
  await prisma.aiModel.deleteMany();
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

  const aiModels = await Promise.all(
    [
      {
        slug: "luna-ai",
        name: "Luna AI",
        bio: "Animación 3D estilo webcam. Personaje 100% generado por IA.",
        tags: ["ai", "3d", "webcam"],
        isLive: false,
        viewCount: 42000,
      },
      {
        slug: "nova-ai",
        name: "Nova",
        bio: "Historias cyber-anime con ramas premium.",
        tags: ["ai", "animation", "story"],
        isLive: false,
        viewCount: 28500,
      },
      {
        slug: "mira-ai",
        name: "Mira",
        bio: "Render hiperrealista en historias interactivas.",
        tags: ["ai", "cgi", "story"],
        isLive: false,
        viewCount: 51200,
      },
      {
        slug: "zara-ai",
        name: "Zara",
        bio: "Personaje interactivo con finales alternativos.",
        tags: ["ai", "interactive", "story"],
        isLive: false,
        viewCount: 19300,
      },
    ].map((m) => prisma.aiModel.create({ data: { ...m, published: true } })),
  );

  const [luna] = aiModels;

  const root = await prisma.videoNode.create({
    data: {
      title: "Luna — Noche en la ciudad",
      slug: slug("Luna Noche en la ciudad"),
      summary: "Historia IA ramificada. Sube tus MP4 reales en Admin → Historias.",
      urlHash: "intro",
      contentKind: "STORY",
      sourceType: "FILE",
      modelId: luna.id,
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
      title: "Luna acepta la invitación",
      slug: slug("Luna acepta invitacion"),
      choiceLabel: "Aceptar la invitación",
      urlHash: "path-a",
      contentKind: "STORY",
      sourceType: "FILE",
      parentNodeId: root.id,
      modelId: luna.id,
      tags: ["ai", "story"],
      vertical: "ADULT",
      durationSec: 20,
      isPremium: false,
      published: true,
    },
  });

  const pathB = await prisma.videoNode.create({
    data: {
      title: "Luna prefiere quedarse",
      slug: slug("Luna prefiere quedarse"),
      choiceLabel: "Quedarse en casa",
      urlHash: "premium-path",
      contentKind: "STORY",
      sourceType: "FILE",
      parentNodeId: root.id,
      modelId: luna.id,
      tags: ["ai", "story", "premium"],
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
      title: "Final — conexión profunda",
      slug: slug("Final conexion profunda"),
      choiceLabel: null,
      urlHash: "ending-a",
      contentKind: "STORY",
      sourceType: "FILE",
      parentNodeId: pathA.id,
      modelId: luna.id,
      vertical: "ADULT",
      durationSec: 15,
      isPremium: false,
      published: true,
    },
  });

  await prisma.videoNode.create({
    data: {
      title: "Final — noche exclusiva",
      slug: slug("Final noche exclusiva"),
      choiceLabel: null,
      urlHash: "path-b",
      contentKind: "STORY",
      sourceType: "FILE",
      parentNodeId: pathB.id,
      modelId: luna.id,
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
      body: "Explora historias interactivas en /stories o crea las tuyas en Admin.",
    },
  });

  console.log("Seed complete (vertical: ADULT, ads + age gate on).");
  console.log(`  Models: ${aiModels.length} IA profiles at /models`);
  console.log("  Demo:  demo@local.dev / Demo1234");
  console.log("  Admin: admin@local.dev / Admin1234");
  console.log("  Stories: http://localhost:3000/stories");
  console.log("  Admin historias: http://localhost:3000/admin/content");
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
