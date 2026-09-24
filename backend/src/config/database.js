import { PrismaClient } from "@prisma/client";
import { env } from "./env.js";

const globalForPrisma = globalThis;

let prismaInstance = null;
let prismaInitError = null;

try {
  prismaInstance =
    globalForPrisma.prisma ??
    new PrismaClient({
      log: env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    });

  if (env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prismaInstance;
  }
} catch (error) {
  prismaInitError = error;
}

export const prisma = prismaInstance;

/**
 * Safe database connectivity check
 * @returns {Promise<{ connected: boolean, message?: string }>}
 */
export async function checkDatabaseConnection() {
  if (!env.DATABASE_URL) {
    return {
      connected: false,
      message: "DATABASE_URL environment variable is not configured",
    };
  }

  if (prismaInitError || !prisma) {
    return {
      connected: false,
      message:
        prismaInitError?.message ||
        "Prisma Client not initialized. Run 'npm run db:generate' in backend directory.",
    };
  }

  try {
    await prisma.$queryRaw`SELECT 1`;
    return { connected: true };
  } catch (error) {
    return {
      connected: false,
      message: "Database connection failed",
    };
  }
}

/**
 * Disconnect Prisma client on server shutdown
 */
export async function disconnectDatabase() {
  if (prisma) {
    try {
      await prisma.$disconnect();
      console.log("[Database] Prisma disconnected cleanly.");
    } catch (error) {
      console.error("[Database] Error disconnecting Prisma:", error.message);
    }
  }
}

export default prisma;
