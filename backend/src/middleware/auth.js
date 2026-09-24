import { tokenService } from "../services/token.service.js";
import { userRepository } from "../repositories/user.repository.js";
import { hasPermission } from "../config/permissions.js";
import { ApiError } from "../utils/apiError.js";

/**
 * Authentication Middleware
 * Validates JWT access token from Authorization header, verifies user in DB, and attaches req.user
 */
export async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw ApiError.unauthorized("Authentication required. Please provide a valid Bearer token.", "UNAUTHORIZED");
    }

    const token = authHeader.substring(7).trim();
    if (!token) {
      throw ApiError.unauthorized("Authentication token cannot be empty.", "UNAUTHORIZED");
    }

    const decoded = tokenService.verifyAccessToken(token);

    const user = await userRepository.findById(decoded.userId);
    if (!user) {
      throw ApiError.unauthorized("User session is invalid. Account does not exist.", "USER_NOT_FOUND");
    }

    if (user.status !== "ACTIVE") {
      throw ApiError.forbidden("Account is inactive or suspended.", "ACCOUNT_INACTIVE");
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Role-based authorization middleware
 * @param {string|string[]} roles - Allowed role(s) e.g. "SUPER_ADMIN" or ["SUPER_ADMIN", "ADMIN"]
 */
export function requireRole(roles) {
  const allowedRoles = Array.isArray(roles) ? roles : [roles];

  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized("Authentication required prior to authorization check."));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        ApiError.forbidden(
          `Access denied. Role "${req.user.role}" does not have sufficient clearance for this resource.`,
          "FORBIDDEN_ROLE"
        )
      );
    }

    next();
  };
}

/**
 * Permission-based authorization middleware
 * Evaluates requested permission against the centralized role-permission matrix
 * @param {string} permission - System permission e.g. "PRODUCT_DELETE"
 */
export function requirePermission(permission) {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized("Authentication required prior to permission check."));
    }

    if (!hasPermission(req.user.role, permission)) {
      return next(
        ApiError.forbidden(
          `Access denied. Missing required permission: "${permission}".`,
          "FORBIDDEN_PERMISSION"
        )
      );
    }

    next();
  };
}

export default {
  authenticate,
  requireRole,
  requirePermission,
};
