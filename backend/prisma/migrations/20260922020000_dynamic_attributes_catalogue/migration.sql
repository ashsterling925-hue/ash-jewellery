-- CreateEnum
DO $$ BEGIN
  CREATE TYPE "AttributeSelectionType" AS ENUM ('SINGLE', 'MULTIPLE');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- AlterTable Attribute
ALTER TABLE "Attribute" ADD COLUMN IF NOT EXISTS "slug" TEXT;
ALTER TABLE "Attribute" ADD COLUMN IF NOT EXISTS "selectionType" "AttributeSelectionType" NOT NULL DEFAULT 'SINGLE';
ALTER TABLE "Attribute" ADD COLUMN IF NOT EXISTS "filterable" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Attribute" ALTER COLUMN "code" DROP NOT NULL;

-- Populate slug from code or name if any existing attributes
UPDATE "Attribute" SET "slug" = LOWER(REGEXP_REPLACE(REGEXP_REPLACE("name", '[^a-zA-Z0-9]+', '-', 'g'), '^-|-$', '', 'g')) WHERE "slug" IS NULL;
ALTER TABLE "Attribute" ALTER COLUMN "slug" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Attribute_slug_key" ON "Attribute"("slug");
CREATE INDEX IF NOT EXISTS "Attribute_slug_idx" ON "Attribute"("slug");
CREATE INDEX IF NOT EXISTS "Attribute_filterable_idx" ON "Attribute"("filterable");
CREATE INDEX IF NOT EXISTS "Attribute_sortOrder_idx" ON "Attribute"("sortOrder");

-- AlterTable AttributeValue
ALTER TABLE "AttributeValue" ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'Active';
CREATE UNIQUE INDEX IF NOT EXISTS "AttributeValue_attributeId_slug_key" ON "AttributeValue"("attributeId", "slug");
CREATE INDEX IF NOT EXISTS "AttributeValue_status_idx" ON "AttributeValue"("status");
CREATE INDEX IF NOT EXISTS "AttributeValue_sortOrder_idx" ON "AttributeValue"("sortOrder");

-- AlterTable ProductAttributeValue
ALTER TABLE "ProductAttributeValue" ADD COLUMN IF NOT EXISTS "id" TEXT;
UPDATE "ProductAttributeValue" SET "id" = gen_random_uuid()::text WHERE "id" IS NULL;
ALTER TABLE "ProductAttributeValue" ALTER COLUMN "id" SET NOT NULL;

DO $$ BEGIN
  ALTER TABLE "ProductAttributeValue" DROP CONSTRAINT IF EXISTS "ProductAttributeValue_pkey";
  ALTER TABLE "ProductAttributeValue" ADD CONSTRAINT "ProductAttributeValue_pkey" PRIMARY KEY ("id");
EXCEPTION
  WHEN undefined_object THEN null;
END $$;

ALTER TABLE "ProductAttributeValue" ADD COLUMN IF NOT EXISTS "attributeId" TEXT;
UPDATE "ProductAttributeValue" pav
SET "attributeId" = av."attributeId"
FROM "AttributeValue" av
WHERE pav."attributeValueId" = av."id" AND pav."attributeId" IS NULL;

-- Add Foreign Key for ProductAttributeValue.attributeId
DO $$ BEGIN
  ALTER TABLE "ProductAttributeValue" ADD CONSTRAINT "ProductAttributeValue_attributeId_fkey" FOREIGN KEY ("attributeId") REFERENCES "Attribute"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create Unique Constraint and Indexes
CREATE UNIQUE INDEX IF NOT EXISTS "ProductAttributeValue_productId_attributeValueId_key" ON "ProductAttributeValue"("productId", "attributeValueId");
CREATE INDEX IF NOT EXISTS "ProductAttributeValue_attributeId_idx" ON "ProductAttributeValue"("attributeId");
