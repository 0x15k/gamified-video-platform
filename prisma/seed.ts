import "dotenv/config";
import { mkdirSync, writeFileSync, existsSync } from "fs";
import path from "path";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "../src/generated/prisma/client";
import bcrypt from "bcryptjs";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const VIDEO_FILES = ["intro", "path-a", "path-b", "ending-a", "premium-path"];

const MINIMAL_MP4 = Buffer.from(
  "AAAAIGZ0eXBpc29tAAACAGlzb21pc28yYXZjMW1wNDEAAAAIZnJlZQAA" +
    "tGxvdXQAAAAGdHJhawAAAAAAAAAAAAAA",
  "base64",
);

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
      siteName: "Gamified Platform",
      vertical: "NEUTRAL",
      ageGateEnabled: false,
    },
  });

  const adminHash = await bcrypt.hash("Admin1234", 12);
  await prisma.user.create({
    data: {
      email: "admin@local.dev",
      passwordHash: adminHash,
      role: "ADMIN",
      tokensBalance: 9999,
      avatarData: {},
    },
  });

  const user = await prisma.user.create({
    data: {
      email: "demo@local.dev",
      passwordHash,
      role: "FREE",
      tokensBalance: 100,
      avatarData: {
        hairColor: "#4a3728",
        skinTone: "#f5d0b5",
        outfitColor: "#2563eb",
      },
    },
  });

  const root = await prisma.videoNode.create({
    data: {
      title: "El comienzo",
      urlHash: "intro",
      durationSec: 30,
      isPremium: false,
    },
  });

  const pathA = await prisma.videoNode.create({
    data: {
      title: "Camino valiente",
      urlHash: "path-a",
      parentNodeId: root.id,
      durationSec: 20,
      isPremium: false,
    },
  });

  const pathB = await prisma.videoNode.create({
    data: {
      title: "Camino premium",
      urlHash: "premium-path",
      parentNodeId: root.id,
      durationSec: 20,
      isPremium: true,
      tokenCost: 25,
    },
  });

  await prisma.videoNode.create({
    data: {
      title: "Final valiente",
      urlHash: "ending-a",
      parentNodeId: pathA.id,
      durationSec: 15,
      isPremium: false,
    },
  });

  await prisma.videoNode.create({
    data: {
      title: "Final exclusivo",
      urlHash: "path-b",
      parentNodeId: pathB.id,
      durationSec: 15,
      isPremium: true,
      tokenCost: 10,
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
      body: "Explora el catálogo y el mapa narrativo. Tu progreso se guardará automáticamente.",
    },
  });

  console.log("Seed complete.");
  console.log("  Demo:  demo@local.dev / Demo1234");
  console.log("  Admin: admin@local.dev / Admin1234");
  console.log("Root node:", root.id);
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
