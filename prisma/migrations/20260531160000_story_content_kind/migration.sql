-- CreateEnum
CREATE TYPE "ContentKind" AS ENUM ('CLIP', 'STORY');

-- AlterTable
ALTER TABLE "video_nodes" ADD COLUMN "content_kind" "ContentKind" NOT NULL DEFAULT 'CLIP';
ALTER TABLE "video_nodes" ADD COLUMN "choice_label" TEXT;

-- CreateIndex
CREATE INDEX "video_nodes_content_kind_published_idx" ON "video_nodes"("content_kind", "published");

-- Nodos con padre o raíces con hijos → historia interactiva
UPDATE "video_nodes" AS vn
SET "content_kind" = 'STORY'
WHERE vn."parent_node_id" IS NOT NULL
   OR EXISTS (
     SELECT 1 FROM "video_nodes" AS c WHERE c."parent_node_id" = vn."id"
   );
