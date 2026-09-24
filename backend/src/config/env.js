import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { z } from "zod";

// Robust .env resolution: resolves backend/.env regardless of whether the process is run from backend/ or backend/src/
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config(); // fallback to process.cwd()

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.coerce.number().int().positive().default(5000),
  FRONTEND_URL: z.string().default("http://localhost:5173"),
  DATABASE_URL: z.string().optional().default(""),
  JWT_SECRET: z.string().default("dev-jwt-secret-ash-jewellery-do-not-use-in-prod"),
  JWT_ACCESS_SECRET: z.string().default(process.env.JWT_SECRET || "dev-jwt-access-secret-ash-jewellery-do-not-use-in-prod"),
  JWT_REFRESH_SECRET: z.string().default("dev-jwt-refresh-secret-ash-jewellery-do-not-use-in-prod"),
  ACCESS_TOKEN_EXPIRES_IN: z.string().default("7d"),
  REFRESH_TOKEN_EXPIRES_IN: z.string().default("7d"),
  COOKIE_SECURE: z.coerce.boolean().default(process.env.NODE_ENV === "production"),
  COOKIE_SAME_SITE: z.enum(["lax", "none", "strict"]).default("lax"),
  RESET_TOKEN_EXPIRES_MINUTES: z.coerce.number().default(15),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(15 * 60 * 1000),
  RATE_LIMIT_MAX: z.coerce.number().default(100),
  STORAGE_PROVIDER: z.enum(["local", "s3"]).default("local"),
  MEDIA_MAX_FILE_SIZE: z.coerce.number().default(10 * 1024 * 1024), // 10MB default
  STORAGE_LOCAL_BASE_URL: z.string().default("http://localhost:5000/uploads"),
  STORAGE_BUCKET: z.string().optional(),
  STORAGE_REGION: z.string().optional(),
  STORAGE_ACCESS_KEY: z.string().optional(),
  STORAGE_SECRET_KEY: z.string().optional(),
  STORAGE_ENDPOINT: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment configuration:", parsed.error.format());
  process.exit(1);
}

export const env = Object.freeze(parsed.data);

// Validation warnings in development
if (env.NODE_ENV === "production") {
  if (!env.DATABASE_URL) {
    console.error("❌ Fatal: DATABASE_URL must be defined in production.");
    process.exit(1);
  }
  if (env.JWT_SECRET === "dev-jwt-secret-ash-jewellery-do-not-use-in-prod") {
    console.error("❌ Fatal: JWT_SECRET must be set to a secure string in production.");
    process.exit(1);
  }
} else if (!env.DATABASE_URL) {
  console.warn("⚠️ Warning: DATABASE_URL is not set. Database functionality will be unavailable.");
}

export default env;
