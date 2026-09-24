-- CreateTable HeroSection
CREATE TABLE IF NOT EXISTS "HeroSection" (
    "id" TEXT NOT NULL,
    "heading" TEXT NOT NULL,
    "subheading" TEXT,
    "mediaAssetId" TEXT,
    "buttonText" TEXT DEFAULT 'EXPLORE COLLECTIONS',
    "buttonUrl" TEXT DEFAULT '/category/bangles',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HeroSection_pkey" PRIMARY KEY ("id")
);

-- Foreign key for HeroSection
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'HeroSection_mediaAssetId_fkey') THEN
    ALTER TABLE "HeroSection" ADD CONSTRAINT "HeroSection_mediaAssetId_fkey" FOREIGN KEY ("mediaAssetId") REFERENCES "MediaAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- Indexes for HeroSection
CREATE INDEX IF NOT EXISTS "HeroSection_status_idx" ON "HeroSection"("status");
CREATE INDEX IF NOT EXISTS "HeroSection_mediaAssetId_idx" ON "HeroSection"("mediaAssetId");

-- CreateTable Banner
CREATE TABLE IF NOT EXISTS "Banner" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
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
);

-- Foreign key for Banner
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Banner_mediaAssetId_fkey') THEN
    ALTER TABLE "Banner" ADD CONSTRAINT "Banner_mediaAssetId_fkey" FOREIGN KEY ("mediaAssetId") REFERENCES "MediaAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- Indexes for Banner
CREATE INDEX IF NOT EXISTS "Banner_status_idx" ON "Banner"("status");
CREATE INDEX IF NOT EXISTS "Banner_position_idx" ON "Banner"("position");
CREATE INDEX IF NOT EXISTS "Banner_sortOrder_idx" ON "Banner"("sortOrder");
CREATE INDEX IF NOT EXISTS "Banner_startAt_idx" ON "Banner"("startAt");
CREATE INDEX IF NOT EXISTS "Banner_endAt_idx" ON "Banner"("endAt");
CREATE INDEX IF NOT EXISTS "Banner_mediaAssetId_idx" ON "Banner"("mediaAssetId");

-- CreateTable SpecialOffer
CREATE TABLE IF NOT EXISTS "SpecialOffer" (
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
);

-- Foreign key for SpecialOffer
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'SpecialOffer_mediaAssetId_fkey') THEN
    ALTER TABLE "SpecialOffer" ADD CONSTRAINT "SpecialOffer_mediaAssetId_fkey" FOREIGN KEY ("mediaAssetId") REFERENCES "MediaAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- Indexes for SpecialOffer
CREATE INDEX IF NOT EXISTS "SpecialOffer_status_idx" ON "SpecialOffer"("status");
CREATE INDEX IF NOT EXISTS "SpecialOffer_targetType_idx" ON "SpecialOffer"("targetType");
CREATE INDEX IF NOT EXISTS "SpecialOffer_sortOrder_idx" ON "SpecialOffer"("sortOrder");
CREATE INDEX IF NOT EXISTS "SpecialOffer_startAt_idx" ON "SpecialOffer"("startAt");
CREATE INDEX IF NOT EXISTS "SpecialOffer_endAt_idx" ON "SpecialOffer"("endAt");
CREATE INDEX IF NOT EXISTS "SpecialOffer_mediaAssetId_idx" ON "SpecialOffer"("mediaAssetId");
