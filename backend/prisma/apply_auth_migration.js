import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";
import { PrismaClient } from "@prisma/client";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const prisma = new PrismaClient();

const statements = [
  // 1. UserRole Enum
  `DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'UserRole') THEN
      CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'STAFF');
    END IF;
  END $$;`,

  // 2. User Table Enhancements
  `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "role" "UserRole" NOT NULL DEFAULT 'STAFF';`,
  `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lastLoginAt" TIMESTAMP(3);`,
  `CREATE INDEX IF NOT EXISTS "User_role_idx" ON "User"("role");`,

  // 3. RefreshToken Table
  `CREATE TABLE IF NOT EXISTS "RefreshToken" (
      "id" TEXT NOT NULL,
      "userId" TEXT NOT NULL,
      "tokenHash" TEXT NOT NULL,
      "expiresAt" TIMESTAMP(3) NOT NULL,
      "revokedAt" TIMESTAMP(3),
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
  );`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "RefreshToken_tokenHash_key" ON "RefreshToken"("tokenHash");`,
  `CREATE INDEX IF NOT EXISTS "RefreshToken_userId_idx" ON "RefreshToken"("userId");`,
  `CREATE INDEX IF NOT EXISTS "RefreshToken_tokenHash_idx" ON "RefreshToken"("tokenHash");`,
  `CREATE INDEX IF NOT EXISTS "RefreshToken_expiresAt_idx" ON "RefreshToken"("expiresAt");`,
  `DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'RefreshToken_userId_fkey') THEN
      ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
  END $$;`,

  // 4. PasswordResetToken Table
  `CREATE TABLE IF NOT EXISTS "PasswordResetToken" (
      "id" TEXT NOT NULL,
      "userId" TEXT NOT NULL,
      "tokenHash" TEXT NOT NULL,
      "expiresAt" TIMESTAMP(3) NOT NULL,
      "usedAt" TIMESTAMP(3),
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
  );`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "PasswordResetToken_tokenHash_key" ON "PasswordResetToken"("tokenHash");`,
  `CREATE INDEX IF NOT EXISTS "PasswordResetToken_userId_idx" ON "PasswordResetToken"("userId");`,
  `CREATE INDEX IF NOT EXISTS "PasswordResetToken_tokenHash_idx" ON "PasswordResetToken"("tokenHash");`,
  `CREATE INDEX IF NOT EXISTS "PasswordResetToken_expiresAt_idx" ON "PasswordResetToken"("expiresAt");`,
  `DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'PasswordResetToken_userId_fkey') THEN
      ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
  END $$;`,

  // 5. AuditLog Table Enhancements
  `ALTER TABLE "AuditLog" ADD COLUMN IF NOT EXISTS "userId" TEXT;`,
  `CREATE INDEX IF NOT EXISTS "AuditLog_userId_idx" ON "AuditLog"("userId");`,
  `DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'AuditLog_userId_fkey') THEN
      ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
  END $$;`,
];

async function applyAuthMigration() {
  console.log(`Applying Phase 11 Auth & RBAC migration (${statements.length} statements) to Neon PostgreSQL...`);

  let executedCount = 0;

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i].trim();
    let attempts = 0;
    let success = false;
    let lastError = null;

    while (attempts < 5 && !success) {
      try {
        attempts++;
        await prisma.$executeRawUnsafe(stmt);
        executedCount++;
        success = true;
      } catch (err) {
        lastError = err;
        console.warn(`[Statement ${i + 1}] Attempt ${attempts} failed: ${err.message}. Retrying in 2s...`);
        await new Promise((r) => setTimeout(r, 2000));
      }
    }

    if (!success) {
      console.error(`Failed to execute statement ${i + 1}:\n${stmt}`);
      throw lastError;
    }
  }

  console.log(`Successfully executed all ${executedCount} statements.`);

  // Regenerate Prisma client
  console.log("Regenerating Prisma client...");
  execSync("npx prisma generate", {
    cwd: path.resolve(__dirname, ".."),
    stdio: "inherit",
  });
  console.log("Prisma client regenerated successfully.");

  await prisma.$disconnect();
}

applyAuthMigration().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
