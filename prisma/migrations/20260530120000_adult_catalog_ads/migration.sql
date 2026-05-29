-- Catalog discovery + ad monetization fields
ALTER TABLE "video_nodes" ADD COLUMN "slug" TEXT;
ALTER TABLE "video_nodes" ADD COLUMN "tags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "video_nodes" ADD COLUMN "preview_sec" INTEGER NOT NULL DEFAULT 30;
ALTER TABLE "video_nodes" ADD COLUMN "view_count" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "video_nodes" ADD COLUMN "thumbnail_url" TEXT;
ALTER TABLE "video_nodes" ADD COLUMN "published" BOOLEAN NOT NULL DEFAULT true;

UPDATE "video_nodes"
SET "slug" = LOWER(REGEXP_REPLACE(REGEXP_REPLACE("title", '[^a-zA-Z0-9]+', '-', 'g'), '(^-|-$)', '', 'g'))
  || '-' || SUBSTRING("id", 1, 8)
WHERE "slug" IS NULL;

ALTER TABLE "video_nodes" ALTER COLUMN "slug" SET NOT NULL;
CREATE UNIQUE INDEX "video_nodes_slug_key" ON "video_nodes"("slug");
CREATE INDEX "video_nodes_published_view_count_idx" ON "video_nodes"("published", "view_count");

ALTER TABLE "platform_settings" ADD COLUMN IF NOT EXISTS "ads_enabled" BOOLEAN NOT NULL DEFAULT false;
UPDATE "platform_settings" SET "ads_enabled" = true WHERE "vertical" = 'ADULT';
