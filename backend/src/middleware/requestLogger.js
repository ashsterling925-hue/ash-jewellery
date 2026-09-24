import morgan from "morgan";
import { env } from "../config/env.js";

// Custom token for ISO timestamp
morgan.token("timestamp", () => new Date().toISOString());

// Redact authorization headers from logging
morgan.token("safe-url", (req) => {
  const url = new URL(req.originalUrl || req.url, "http://localhost");
  // Remove any sensitive query parameters from logs
  url.searchParams.delete("token");
  url.searchParams.delete("password");
  url.searchParams.delete("secret");
  return url.pathname + (url.search || "");
});

const format =
  env.NODE_ENV === "production"
    ? "[:timestamp] :method :safe-url :status :res[content-length] - :response-time ms"
    : "dev";

export const requestLogger = morgan(format, {
  skip: () => env.NODE_ENV === "test",
});

export default requestLogger;
