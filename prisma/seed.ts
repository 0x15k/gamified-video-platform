import "dotenv/config";
import { mkdirSync, writeFileSync, existsSync } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "../src/generated/prisma/client";
import bcrypt from "bcryptjs";
import { buildNodeSlug } from "../src/lib/catalog/slug";
import { canonicalizeEmbedUrl } from "../src/lib/video/embed";

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
        isLive: true,
        viewCount: 42000,
      },
      {
        slug: "nova-ai",
        name: "Nova",
        bio: "Loops cortos y clips premium. Estética cyber-anime.",
        tags: ["ai", "animation", "premium"],
        isLive: false,
        viewCount: 28500,
      },
      {
        slug: "mira-ai",
        name: "Mira",
        bio: "Render hiperrealista. Contenido exclusivo en HD.",
        tags: ["ai", "cgi", "hd"],
        isLive: true,
        viewCount: 51200,
      },
      {
        slug: "zara-ai",
        name: "Zara",
        bio: "Personaje interactivo con historias ramificadas.",
        tags: ["ai", "interactive", "story"],
        isLive: false,
        viewCount: 19300,
      },
    ].map((m) => prisma.aiModel.create({ data: { ...m, published: true } })),
  );

  const [luna, nova, mira] = aiModels;

  const demoEmbeds = (process.env.DEMO_EMBED_URLS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const catalogSeeds = [
    {
      title: "AI Girl — Demo 1",
      summary: "Embed de prueba (solo contenido IA).",
      tags: ["ai", "animation", "3d"],
      isPremium: false,
      viewCount: 8420,
      modelId: luna.id,
    },
    {
      title: "AI Girl — Demo 2 (premium)",
      summary: "Embed premium de prueba; requiere tokens o plan Premium.",
      tags: ["ai", "animation", "premium"],
      isPremium: true,
      tokenCost: 25,
      previewSec: 20,
      viewCount: 12500,
      modelId: nova.id,
    },
    {
      title: "Luna — sesión webcam simulada",
      summary: "Clip estilo live cam IA.",
      tags: ["ai", "webcam", "3d"],
      isPremium: false,
      viewCount: 15600,
      modelId: luna.id,
    },
    {
      title: "Mira — render HD exclusivo",
      summary: "Vista previa gratuita; completo con Premium.",
      tags: ["ai", "cgi", "hd"],
      isPremium: true,
      tokenCost: 15,
      previewSec: 25,
      viewCount: 22100,
      modelId: mira.id,
    },
  ];

  for (let i = 0; i < catalogSeeds.length; i++) {
    const cfg = catalogSeeds[i];
    const rawUrl = demoEmbeds[i];
    const embedUrl = rawUrl ? canonicalizeEmbedUrl(rawUrl) : null;

    await prisma.videoNode.create({
      data: {
        title: cfg.title,
        slug: slug(cfg.title),
        summary: cfg.summary,
        sourceType: embedUrl ? "EMBED" : "FILE",
        urlHash: embedUrl ? "embed" : i === 0 ? "intro" : "premium-path",
        embedUrl,
        tags: cfg.tags,
        vertical: "ADULT",
        durationSec: 60,
        viewCount: cfg.viewCount,
        isPremium: cfg.isPremium,
        tokenCost: "tokenCost" in cfg ? cfg.tokenCost : 0,
        previewSec: "previewSec" in cfg ? cfg.previewSec : 30,
        published: embedUrl ? true : true,
        modelId: cfg.modelId,
      },
    });
  }

  if (demoEmbeds.length === 0) {
    console.log(
      "  Tip: define DEMO_EMBED_URLS=https://www.pornhub.com/embed/…,https://… en .env y vuelve a seedear para catálogo embed.",
    );
  }

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
  console.log(`  Models: ${aiModels.length} IA profiles at /models`);
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
