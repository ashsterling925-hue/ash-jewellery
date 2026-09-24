/**
 * Custom ApiError class for structured, safe operational errors
 */
export class ApiError extends Error {
  constructor(statusCode, message, code = "INTERNAL_SERVER_ERROR", errors = []) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.code = code;
    this.errors = errors;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message = "Bad request", errors = [], code = "BAD_REQUEST") {
    return new ApiError(400, message, code, errors);
  }

  static unauthorized(message = "Authentication required", code = "UNAUTHORIZED") {
    return new ApiError(401, message, code);
  }

  static forbidden(message = "Access denied", code = "FORBIDDEN") {
    return new ApiError(403, message, code);
  }

  static notFound(message = "Resource not found", code = "RECORD_NOT_FOUND") {
    return new ApiError(404, message, code);
  }

  static conflict(message = "Resource already exists", code = "DUPLICATE_RECORD") {
    return new ApiError(409, message, code);
  }

  static internal(message = "Internal server error", code = "INTERNAL_SERVER_ERROR") {
    return new ApiError(500, message, code);
  }
}

export default ApiError;
