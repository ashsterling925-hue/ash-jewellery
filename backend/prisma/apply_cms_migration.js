import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { PrismaClient } from "@prisma/client";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const prisma = new PrismaClient();

const statements = [
  // 1. HeroSection Table
  `CREATE TABLE IF NOT EXISTS "HeroSection" (
      "id" TEXT NOT NULL,
      .
      "heading" TEXT NOT NULL,
      "subheading" TEXT,
      "mediaAssetId" TEXT,
      "buttonText" TEXT DEFAULT 'EXPLORE COLLECTIONS',
      "buttonUrl" TEXT DEFAULT '/category/bangles',
      "status" TEXT NOT NULL DEFAULT 'ACTIVE',
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "HeroSection_pkey" PRIMARY KEY ("id")
  );`,
  `DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'HeroSection_mediaAssetId_fkey') THEN
      ALTER TABLE "HeroSection" ADD CONSTRAINT "HeroSection_mediaAssetId_fkey" FOREIGN KEY ("mediaAssetId") REFERENCES "MediaAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
  END $$;`,
  `CREATE INDEX IF NOT EXISTS "HeroSection_status_idx" ON "HeroSection"("status");`,
  `CREATE INDEX IF NOT EXISTS "HeroSection_mediaAssetId_idx" ON "HeroSection"("mediaAssetId");`,

  // 2. Banner Table enhancements (table may already exist from init migration)
  `CREATE TABLE IF NOT EXISTS "Banner" (
      "id" TEXT NOT NULL,
      "title" TEXT NOT NULL,
      "subtitle" TEXT,
      "image" TEXT,
      "mediaAssetId" TEXT,
      "targetUrl" TEXT,
      "position" TEXT NOT NULL DEFAULT 'HOME_PROMOTION',
      "status" TEXT NOT NULL DEFAULT 'ACTIVE',
      "sortOrder" INTEGER NOT NULL DEFAULT 0,
      "startAt" TIMESTAMP(3),
      "endAt" TIMESTAMP(3),
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "Banner_pkey" PRIMARY KEY ("id")
  );`,
  `ALTER TABLE "Banner" ADD COLUMN IF NOT EXISTS "mediaAssetId" TEXT;`,
  `ALTER TABLE "Banner" ADD COLUMN IF NOT EXISTS "startAt" TIMESTAMP(3);`,
  `ALTER TABLE "Banner" ADD COLUMN IF NOT EXISTS "endAt" TIMESTAMP(3);`,
  `ALTER TABLE "Banner" ALTER COLUMN "image" DROP NOT NULL;`,
  `ALTER TABLE "Banner" ALTER COLUMN "position" SET DEFAULT 'HOME_PROMOTION';`,
  `DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Banner_mediaAssetId_fkey') THEN
      ALTER TABLE "Banner" ADD CONSTRAINT "Banner_mediaAssetId_fkey" FOREIGN KEY ("mediaAssetId") REFERENCES "MediaAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
  END $$;`,
  `CREATE INDEX IF NOT EXISTS "Banner_status_idx" ON "Banner"("status");`,
  `CREATE INDEX IF NOT EXISTS "Banner_position_idx" ON "Banner"("position");`,
  `CREATE INDEX IF NOT EXISTS "Banner_sortOrder_idx" ON "Banner"("sortOrder");`,
  `CREATE INDEX IF NOT EXISTS "Banner_startAt_idx" ON "Banner"("startAt");`,
  `CREATE INDEX IF NOT EXISTS "Banner_endAt_idx" ON "Banner"("endAt");`,
  `CREATE INDEX IF NOT EXISTS "Banner_mediaAssetId_idx" ON "Banner"("mediaAssetId");`,

  // 3. SpecialOffer Table
  `CREATE TABLE IF NOT EXISTS "SpecialOffer" (
      "id" TEXT NOT NULL,
      "title" TEXT NOT NULL,
      "description" TEXT,
      "mediaAssetId" TEXT,
      "targetType" TEXT NOT NULL DEFAULT 'CUSTOM',
      "targetId" TEXT,
      "buttonText" TEXT DEFAULT 'SHOP NOW',
      "buttonUrl" TEXT,
      "status" TEXT NOT NULL DEFAULT 'ACTIVE',
      "sortOrder" INTEGER NOT NULL DEFAULT 0,
      "startAt" TIMESTAMP(3),
      "endAt" TIMESTAMP(3),
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "SpecialOffer_pkey" PRIMARY KEY ("id")
  );`,
  `DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'SpecialOffer_mediaAssetId_fkey') THEN
      ALTER TABLE "SpecialOffer" ADD CONSTRAINT "SpecialOffer_mediaAssetId_fkey" FOREIGN KEY ("mediaAssetId") REFERENCES "MediaAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
  END $$;`,
  `CREATE INDEX IF NOT EXISTS "SpecialOffer_status_idx" ON "SpecialOffer"("status");`,
  `CREATE INDEX IF NOT EXISTS "SpecialOffer_targetType_idx" ON "SpecialOffer"("targetType");`,
  `CREATE INDEX IF NOT EXISTS "SpecialOffer_sortOrder_idx" ON "SpecialOffer"("sortOrder");`,
  `CREATE INDEX IF NOT EXISTS "SpecialOffer_startAt_idx" ON "SpecialOffer"("startAt");`,
  `CREATE INDEX IF NOT EXISTS "SpecialOffer_endAt_idx" ON "SpecialOffer"("endAt");`,
  `CREATE INDEX IF NOT EXISTS "SpecialOffer_mediaAssetId_idx" ON "SpecialOffer"("mediaAssetId");`,
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
  console.log("Applying Homepage CMS migration to Neon PostgreSQL...");
  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i].trim();
    if (!stmt) continue;
    console.log(`Executing step ${i + 1}/${statements.length}...`);
    await executeWithRetry(stmt);
  }
  console.log("✅ Homepage CMS migration applied successfully!");
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
