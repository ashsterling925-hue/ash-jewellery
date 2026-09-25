import rateLimit from "express-rate-limit";
import { env } from "../config/env.js";

/**
 * Standard global API rate limiter
 */
export const apiLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS, // 15 minutes by default
  max: env.RATE_LIMIT_MAX, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later.",
    code: "RATE_LIMIT_EXCEEDED",
    errors: [],
  },
  skip: () => env.NODE_ENV === "test" || env.NODE_ENV === "development",
});

/**
 * Stricter limiter prepared for authentication and sensitive endpoints
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
  message: {
    success: false,
    message: "Too many login attempts. Please try again after 15 minutes.",
    code: "AUTH_RATE_LIMIT_EXCEEDED",
    errors: [],
  },
  skip: () => env.NODE_ENV === "test" || env.NODE_ENV === "development",
});

export default apiLimiter;
