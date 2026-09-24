import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { PrismaClient } from "@prisma/client";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const prisma = new PrismaClient();

const statements = [
  // 1. Add merchandising columns to Product table if they don't exist
  `ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "isBestSeller" BOOLEAN NOT NULL DEFAULT false;`,
  `ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "isNewArrival" BOOLEAN NOT NULL DEFAULT false;`,
  `ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "isTrending" BOOLEAN NOT NULL DEFAULT false;`,
  `ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "displayPriority" INTEGER NOT NULL DEFAULT 0;`,
  `ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "newArrivalUntil" TIMESTAMP(3);`,

  // 2. Indexes for performance
  `CREATE INDEX IF NOT EXISTS "Product_isFeatured_idx" ON "Product"("isFeatured");`,
  `CREATE INDEX IF NOT EXISTS "Product_isBestSeller_idx" ON "Product"("isBestSeller");`,
  `CREATE INDEX IF NOT EXISTS "Product_isNewArrival_idx" ON "Product"("isNewArrival");`,
  `CREATE INDEX IF NOT EXISTS "Product_isTrending_idx" ON "Product"("isTrending");`,
  `CREATE INDEX IF NOT EXISTS "Product_displayPriority_idx" ON "Product"("displayPriority");`,
];

async function runMigration() {
  console.log("[Migration] Applying Product Merchandising schema changes to database...");
  for (const sql of statements) {
    try {
      await prisma.$executeRawUnsafe(sql);
      console.log(`[Migration] ✓ Executed: ${sql.slice(0, 70)}...`);
    } catch (err) {
      console.error(`[Migration] ✗ Failed: ${sql}\nError:`, err.message);
    }
  }
  console.log("[Migration] All Product Merchandising statements processed successfully!");
  await prisma.$disconnect();
}

runMigration().catch(async (e) => {
  console.error("[Migration] Fatal error:", e);
  await prisma.$disconnect();
  process.exit(1);
});
