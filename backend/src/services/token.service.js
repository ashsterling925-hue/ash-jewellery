import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { prisma } from "../config/prisma.js";
import { generateRandomToken, hashToken } from "../utils/security.js";
import { ApiError } from "../utils/apiError.js";

const REFRESH_TOKEN_EXPIRATION_DAYS = 7;

export const tokenService = {
  /**
   * Generate short-lived JWT access token
   * @param {Object} user - { id, email, role, status }
   * @returns {string} - Signed JWT
   */
  generateAccessToken(user) {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
    };

    return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
      expiresIn: env.ACCESS_TOKEN_EXPIRES_IN,
    });
  },

  /**
   * Verify JWT access token
   * @param {string} token
   * @returns {Object} - Decoded payload
   */
  verifyAccessToken(token) {
    try {
      return jwt.verify(token, env.JWT_ACCESS_SECRET);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        throw ApiError.unauthorized("Access token has expired", "TOKEN_EXPIRED");
      }
      throw ApiError.unauthorized("Invalid access token", "INVALID_TOKEN");
    }
  },

  /**
   * Generate raw refresh token, hash it, and store in database
   * @param {string} userId
   * @returns {Promise<string>} - Raw refresh token to be set in HttpOnly cookie
   */
  async createRefreshToken(userId) {
    const rawToken = generateRandomToken(40);
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRATION_DAYS);

    await prisma.refreshToken.create({
      data: {
        userId,
        tokenHash,
        expiresAt,
      },
    });

    return rawToken;
  },

  /**
   * Validate refresh token and rotate: revokes old token and issues a new one
   * @param {string} rawToken - Plain refresh token from cookie
   * @returns {Promise<{ newAccessToken: string, newRefreshToken: string, user: Object }>}
   */
  async rotateRefreshToken(rawToken) {
    if (!rawToken) {
      throw ApiError.unauthorized("Refresh token is required", "REFRESH_TOKEN_REQUIRED");
    }

    const tokenHash = hashToken(rawToken);
    const storedToken = await prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true,
          },
        },
      },
    });

    // Check existence, revocation, and expiration
    if (!storedToken) {
      throw ApiError.unauthorized("Invalid refresh token", "INVALID_REFRESH_TOKEN");
    }

    if (storedToken.revokedAt) {
      const GRACE_PERIOD_MS = 60 * 1000; // 60 seconds grace window for concurrent/Strict-Mode requests
      const timeSinceRevocation = Date.now() - new Date(storedToken.revokedAt).getTime();

      if (timeSinceRevocation < GRACE_PERIOD_MS && storedToken.user && storedToken.user.status === "ACTIVE") {
        const newAccessToken = this.generateAccessToken(storedToken.user);
        return {
          newAccessToken,
          newRefreshToken: rawToken,
          user: storedToken.user,
        };
      }

      // Outside grace window — possible token reuse, revoke all tokens
      await prisma.refreshToken.updateMany({
        where: { userId: storedToken.userId },
        data: { revokedAt: new Date() },
      });
      throw ApiError.unauthorized("Refresh token has been revoked", "REVOKED_REFRESH_TOKEN");
    }

    if (new Date() > storedToken.expiresAt) {
      throw ApiError.unauthorized("Refresh token has expired", "EXPIRED_REFRESH_TOKEN");
    }

    const user = storedToken.user;
    if (!user || user.status !== "ACTIVE") {
      throw ApiError.forbidden("Account is inactive or suspended", "ACCOUNT_INACTIVE");
    }

    // Revoke the old token (rotation)
    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revokedAt: new Date() },
    });

    // Create new refresh token and access token
    const newRefreshToken = await this.createRefreshToken(user.id);
    const newAccessToken = this.generateAccessToken(user);

    return {
      newAccessToken,
      newRefreshToken,
      user,
    };
  },

  /**
   * Revoke a refresh token (e.g. on logout)
   * @param {string} rawToken
   */
  async revokeRefreshToken(rawToken) {
    if (!rawToken) return;
    const tokenHash = hashToken(rawToken);
    await prisma.refreshToken.updateMany({
      where: {
        tokenHash,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });
  },

  /**
   * Revoke all refresh tokens for a user (e.g. after password reset)
   * @param {string} userId
   */
  async revokeAllUserTokens(userId) {
    if (!userId) return;
    await prisma.refreshToken.updateMany({
      where: {
        userId,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });
  },

  /**
   * Get cookie options for storing the refresh token
   */
  getCookieOptions() {
    const isProd = env.NODE_ENV === "production";
    return {
      httpOnly: true,
      secure: env.COOKIE_SECURE ?? isProd,
      sameSite: env.COOKIE_SAME_SITE || "lax",
      path: "/",
      maxAge: REFRESH_TOKEN_EXPIRATION_DAYS * 24 * 60 * 60 * 1000,
    };
  },
};

export default tokenService;
