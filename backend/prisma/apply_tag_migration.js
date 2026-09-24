import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { PrismaClient } from "@prisma/client";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const prisma = new PrismaClient();

const statements = [
  `ALTER TABLE "Tag" ADD COLUMN IF NOT EXISTS "sortOrder" INTEGER NOT NULL DEFAULT 0;`,
  `CREATE INDEX IF NOT EXISTS "Tag_sortOrder_idx" ON "Tag"("sortOrder");`,
  `ALTER TABLE "ProductTag" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;`,
];

async function main() {
  console.log("Applying Tag catalogue enhancements to Neon PostgreSQL...");
  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i].trim();
    if (!stmt) continue;
    console.log(`Executing step ${i + 1}/${statements.length}...`);
    await prisma.$executeRawUnsafe(stmt);
  }
  console.log("Tag migration applied successfully!");
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error("Tag migration error:", e);
  await prisma.$disconnect();
  process.exit(1);
});
