-- AlterTable MediaAsset
ALTER TABLE "MediaAsset" ADD COLUMN IF NOT EXISTS "originalFileName" TEXT;
ALTER TABLE "MediaAsset" ADD COLUMN IF NOT EXISTS "storageKey" TEXT;
ALTER TABLE "MediaAsset" ADD COLUMN IF NOT EXISTS "width" INTEGER;
ALTER TABLE "MediaAsset" ADD COLUMN IF NOT EXISTS "height" INTEGER;
ALTER TABLE "MediaAsset" ADD COLUMN IF NOT EXISTS "title" TEXT;
ALTER TABLE "MediaAsset" ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'ACTIVE';

-- Indexes on MediaAsset
CREATE INDEX IF NOT EXISTS "MediaAsset_status_idx" ON "MediaAsset"("status");
CREATE INDEX IF NOT EXISTS "MediaAsset_mimeType_idx" ON "MediaAsset"("mimeType");
CREATE INDEX IF NOT EXISTS "MediaAsset_storageKey_idx" ON "MediaAsset"("storageKey");

-- AlterTable Category
ALTER TABLE "Category" ADD COLUMN IF NOT EXISTS "mediaAssetId" TEXT;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Category_mediaAssetId_fkey') THEN
    ALTER TABLE "Category" ADD CONSTRAINT "Category_mediaAssetId_fkey" FOREIGN KEY ("mediaAssetId") REFERENCES "MediaAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "Category_mediaAssetId_idx" ON "Category"("mediaAssetId");

-- AlterTable Collection
ALTER TABLE "Collection" ADD COLUMN IF NOT EXISTS "mediaAssetId" TEXT;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Collection_mediaAssetId_fkey') THEN
    ALTER TABLE "Collection" ADD CONSTRAINT "Collection_mediaAssetId_fkey" FOREIGN KEY ("mediaAssetId") REFERENCES "MediaAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "Collection_mediaAssetId_idx" ON "Collection"("mediaAssetId");

-- AlterTable ProductImage
CREATE INDEX IF NOT EXISTS "ProductImage_mediaAssetId_idx" ON "ProductImage"("mediaAssetId");
