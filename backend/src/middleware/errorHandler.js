import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { ApiError } from "../utils/apiError.js";
import { env } from "../config/env.js";

/**
 * Global centralized error-handling middleware
 */
export function errorHandler(err, req, res, next) {
  // 1. Operational ApiError
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      code: err.code,
      errors: err.errors || [],
      ...(env.NODE_ENV === "development" && { stack: err.stack }),
    });
  }

  // 2. Zod Validation Errors
  if (err instanceof ZodError) {
    const formattedErrors = err.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));

    return res.status(400).json({
      success: false,
      message: "Validation failed",
      code: "VALIDATION_ERROR",
      errors: formattedErrors,
      ...(env.NODE_ENV === "development" && { stack: err.stack }),
    });
  }

  // 3. Prisma Known Request Errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case "P2002": {
        const target = err.meta?.target ? ` on field (${err.meta.target})` : "";
        return res.status(409).json({
          success: false,
          message: `A record with this value already exists${target}.`,
          code: "DUPLICATE_RECORD",
          errors: [],
        });
      }
      case "P2025": {
        return res.status(404).json({
          success: false,
          message: "The requested record was not found.",
          code: "RECORD_NOT_FOUND",
          errors: [],
        });
      }
      case "P2003": {
        return res.status(400).json({
          success: false,
          message: "Invalid relation reference provided.",
          code: "FOREIGN_KEY_VIOLATION",
          errors: [],
        });
      }
      default:
        return res.status(400).json({
          success: false,
          message: "Database operation failed",
          code: "DATABASE_ERROR",
          errors: [],
        });
    }
  }

  // 4. Prisma Validation Error
  if (err instanceof Prisma.PrismaClientValidationError) {
    return res.status(400).json({
      success: false,
      message: "Invalid data format provided for database operation.",
      code: "DATABASE_VALIDATION_ERROR",
      errors: [],
    });
  }

  // 5. Malformed JSON Body Error
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({
      success: false,
      message: "Malformed JSON payload provided.",
      code: "INVALID_JSON",
      errors: [],
    });
  }

  // 6. Generic / Uncaught Server Errors
  console.error("[Unhandled Error]:", err);
  return res.status(500).json({
    success: false,
    message:
      env.NODE_ENV === "production"
        ? "An internal server error occurred."
        : err.message || "Internal server error",
    code: "INTERNAL_SERVER_ERROR",
    errors: [],
    ...(env.NODE_ENV === "development" && { stack: err.stack }),
  });
}

export default errorHandler;
