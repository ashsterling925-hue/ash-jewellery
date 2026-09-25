import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import { env } from "./config/env.js";
import { requestLogger } from "./middleware/requestLogger.js";
import { apiLimiter } from "./middleware/rateLimiter.js";
import { notFound } from "./middleware/notFound.js";
import { errorHandler } from "./middleware/errorHandler.js";
import apiRoutes from "./routes/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// 1. Security Headers & CORS
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

const allowedOrigins = [
  ...new Set(
    env.FRONTEND_URL.split(",")
      .flatMap((s) => {
        const trimmed = s.trim();
        if (!trimmed) return [];
        const withoutSlash = trimmed.replace(/\/+$/, "");
        return [withoutSlash, `${withoutSlash}/`];
      })
      .filter(Boolean)
  ),
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// 1.1 Static uploads route for uploaded media
app.use("/uploads", express.static(path.resolve(__dirname, "../uploads")));

// 2. Cookie Parser & Request Parsers with limits
app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// 3. Request Logging
app.use(requestLogger);

// 4. Rate Limiting for all API requests
app.use("/api", apiLimiter);

// 5. API Routes Registry
app.use("/api", apiRoutes);

// 6. 404 Not Found Handler
app.use(notFound);

// 7. Central Error Handling Middleware
app.use(errorHandler);

export default app;
