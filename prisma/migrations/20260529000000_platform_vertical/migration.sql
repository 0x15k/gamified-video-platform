-- CreateEnum
CREATE TYPE "PlatformVertical" AS ENUM ('NEUTRAL', 'EDUCATION', 'ADULT');

-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'ADMIN';

-- CreateTable
CREATE TABLE "platform_settings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "site_name" TEXT NOT NULL DEFAULT 'Gamified Platform',
    "vertical" "PlatformVertical" NOT NULL DEFAULT 'NEUTRAL',
    "age_gate_enabled" BOOLEAN NOT NULL DEFAULT false,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "platform_settings_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "video_nodes" ADD COLUMN "summary" TEXT,
ADD COLUMN "vertical" "PlatformVertical" NOT NULL DEFAULT 'NEUTRAL';
