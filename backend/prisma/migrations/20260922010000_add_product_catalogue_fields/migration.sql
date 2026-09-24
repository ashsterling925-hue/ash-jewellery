-- AlterTable
ALTER TABLE "Product" ADD COLUMN "collectionId" TEXT;
ALTER TABLE "Product" ADD COLUMN "material" TEXT;
ALTER TABLE "Product" ADD COLUMN "colour" TEXT;
ALTER TABLE "Product" ADD COLUMN "finish" TEXT;

-- CreateIndex
CREATE INDEX "Product_collectionId_idx" ON "Product"("collectionId");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "Collection"("id") ON DELETE SET NULL ON UPDATE CASCADE;
