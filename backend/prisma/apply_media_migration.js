import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { PrismaClient } from "@prisma/client";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const prisma = new PrismaClient();

const statements = [
  `ALTER TABLE "MediaAsset" ADD COLUMN IF NOT EXISTS "originalFileName" TEXT;`,
  `ALTER TABLE "MediaAsset" ADD COLUMN IF NOT EXISTS "storageKey" TEXT;`,
  `ALTER TABLE "MediaAsset" ADD COLUMN IF NOT EXISTS "width" INTEGER;`,
  `ALTER TABLE "MediaAsset" ADD COLUMN IF NOT EXISTS "height" INTEGER;`,
  `ALTER TABLE "MediaAsset" ADD COLUMN IF NOT EXISTS "title" TEXT;`,
  `ALTER TABLE "MediaAsset" ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'ACTIVE';`,
  `CREATE INDEX IF NOT EXISTS "MediaAsset_status_idx" ON "MediaAsset"("status");`,
  `CREATE INDEX IF NOT EXISTS "MediaAsset_mimeType_idx" ON "MediaAsset"("mimeType");`,
  `CREATE INDEX IF NOT EXISTS "MediaAsset_storageKey_idx" ON "MediaAsset"("storageKey");`,
  `ALTER TABLE "Category" ADD COLUMN IF NOT EXISTS "mediaAssetId" TEXT;`,
  `DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Category_mediaAssetId_fkey') THEN
      ALTER TABLE "Category" ADD CONSTRAINT "Category_mediaAssetId_fkey" FOREIGN KEY ("mediaAssetId") REFERENCES "MediaAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
  END $$;`,
  `CREATE INDEX IF NOT EXISTS "Category_mediaAssetId_idx" ON "Category"("mediaAssetId");`,
  `ALTER TABLE "Collection" ADD COLUMN IF NOT EXISTS "mediaAssetId" TEXT;`,
  `DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Collection_mediaAssetId_fkey') THEN
      ALTER TABLE "Collection" ADD CONSTRAINT "Collection_mediaAssetId_fkey" FOREIGN KEY ("mediaAssetId") REFERENCES "MediaAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
  END $$;`,
  `CREATE INDEX IF NOT EXISTS "Collection_mediaAssetId_idx" ON "Collection"("mediaAssetId");`,
  `CREATE INDEX IF NOT EXISTS "ProductImage_mediaAssetId_idx" ON "ProductImage"("mediaAssetId");`
];

async function executeWithRetry(stmt, maxRetries = 5) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await prisma.$executeRawUnsafe(stmt);
      return;
    } catch (err) {
      if (attempt === maxRetries) throw err;
      console.log(`Retry ${attempt}/${maxRetries} after error: ${err.message?.slice(0, 80)}...`);
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
}

async function main() {
  console.log("Applying Media management enhancements to Neon PostgreSQL...");
  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i].trim();
    if (!stmt) continue;
    console.log(`Executing step ${i + 1}/${statements.length}...`);
    await executeWithRetry(stmt);
  }
  console.log("✅ Media migration applied successfully!");
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error("Media migration error:", e);
  await prisma.$disconnect();
  process.exit(1);
});
