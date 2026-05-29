CREATE TYPE "VideoSourceType" AS ENUM ('FILE', 'EMBED');

ALTER TABLE "video_nodes" ADD COLUMN "source_type" "VideoSourceType" NOT NULL DEFAULT 'FILE';
ALTER TABLE "video_nodes" ADD COLUMN "embed_url" TEXT;
