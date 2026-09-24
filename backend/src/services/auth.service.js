import { userRepository } from "../repositories/user.repository.js";
import { tokenService } from "./token.service.js";
import { auditLogService } from "./auditLog.service.js";
import { emailService } from "./email.service.js";
import { verifyPassword, hashPassword, generateRandomToken, hashToken } from "../utils/security.js";
import { ApiError } from "../utils/apiError.js";
import { env } from "../config/env.js";
import { prisma } from "../config/prisma.js";

export const authService = {
  /**
   * Authenticate admin user with email and password
   */
  async login({ email, password, ipAddress = null }) {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await userRepository.findWithPasswordByEmail(normalizedEmail);

    if (!user || !user.passwordHash) {
      await auditLogService.log({
        action: "LOGIN_FAILED",
        entity: "USER",
        metadata: { email: normalizedEmail, reason: "ACCOUNT_NOT_FOUND_OR_NO_PASSWORD" },
        ipAddress,
      });
      // Generic authentication error prevents account enumeration
      throw ApiError.unauthorized("Invalid email or password.");
    }

    const isPasswordValid = await verifyPassword(password, user.passwordHash);
    if (!isPasswordValid) {
      await auditLogService.log({
        userId: user.id,
        action: "LOGIN_FAILED",
        entity: "USER",
        entityId: user.id,
        metadata: { email: normalizedEmail, reason: "INVALID_CREDENTIALS" },
        ipAddress,
      });
      throw ApiError.unauthorized("Invalid email or password.");
    }

    if (user.status !== "ACTIVE") {
      await auditLogService.log({
        userId: user.id,
        action: "LOGIN_FAILED",
        entity: "USER",
        entityId: user.id,
        metadata: { email: normalizedEmail, reason: `ACCOUNT_${user.status}` },
        ipAddress,
      });
      throw ApiError.forbidden("Your account is currently inactive or suspended. Please contact system support.");
    }

    // Update last login timestamp
    await userRepository.updateLastLogin(user.id);

    // Generate tokens
    const accessToken = tokenService.generateAccessToken(user);
    const refreshToken = await tokenService.createRefreshToken(user.id);

    await auditLogService.log({
      userId: user.id,
      action: "LOGIN_SUCCESS",
      entity: "USER",
      entityId: user.id,
      metadata: { role: user.role },
      ipAddress,
    });

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    };

    return {
      user: safeUser,
      accessToken,
      refreshToken,
    };
  },

  /**
   * Refresh session and rotate refresh token
   */
  async refresh({ rawRefreshToken }) {
    return tokenService.rotateRefreshToken(rawRefreshToken);
  },

  /**
   * Terminate session on logout
   */
  async logout({ rawRefreshToken, userId = null, ipAddress = null }) {
    if (rawRefreshToken) {
      await tokenService.revokeRefreshToken(rawRefreshToken);
    }

    if (userId) {
      await auditLogService.log({
        userId,
        action: "LOGOUT",
        entity: "USER",
        entityId: userId,
        ipAddress,
      });
    }

    return { message: "Logged out successfully" };
  },

  /**
   * Request password reset link (email-based)
   */
  async forgotPassword({ email, ipAddress = null }) {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await userRepository.findByEmail(normalizedEmail);

    if (user && user.status === "ACTIVE") {
      const rawToken = generateRandomToken(32);
      const tokenHash = hashToken(rawToken);

      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + (env.RESET_TOKEN_EXPIRES_MINUTES || 15));

      // Invalidate any previous unused reset tokens for this user
      await prisma.passwordResetToken.deleteMany({
        where: { userId: user.id },
      });

      // Save new reset token
      await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash,
          expiresAt,
        },
      });

      const frontendUrl = env.FRONTEND_URL.split(",")[0].trim().replace(/\/+$/, "");
      const resetUrl = `${frontendUrl}/reset-password?token=${rawToken}`;

      await emailService.sendPasswordResetEmail({
        to: user.email,
        name: user.name,
        resetUrl,
      });

      await auditLogService.log({
        userId: user.id,
        action: "PASSWORD_RESET_REQUESTED",
        entity: "USER",
        entityId: user.id,
        ipAddress,
      });
    }

    // Always return a generic success message so attackers cannot enumerate valid accounts
    return {
      message: "If the account exists, a password reset link has been sent.",
    };
  },

  /**
   * Complete password reset using valid reset token
   */
  async resetPassword({ token, newPassword, ipAddress = null }) {
    if (!token) {
      throw ApiError.badRequest("Password reset token is required.");
    }

    const tokenHash = hashToken(token);
    const resetRecord = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!resetRecord) {
      throw ApiError.badRequest("Invalid or expired password reset token.", [
        { field: "token", message: "Token does not exist or has expired" },
      ]);
    }

    if (resetRecord.usedAt) {
      throw ApiError.badRequest("This password reset token has already been used.", [
        { field: "token", message: "Token is no longer valid" },
      ]);
    }

    if (new Date() > resetRecord.expiresAt) {
      throw ApiError.badRequest("This password reset token has expired. Please request a new one.", [
        { field: "token", message: "Token has expired" },
      ]);
    }

    const newPasswordHash = await hashPassword(newPassword);

    // Update password
    await userRepository.updatePassword(resetRecord.userId, newPasswordHash);

    // Mark token as used
    await prisma.passwordResetToken.update({
      where: { id: resetRecord.id },
      data: { usedAt: new Date() },
    });

    // Invalidate all existing refresh tokens for security
    await tokenService.revokeAllUserTokens(resetRecord.userId);

    await auditLogService.log({
      userId: resetRecord.userId,
      action: "PASSWORD_RESET_COMPLETED",
      entity: "USER",
      entityId: resetRecord.userId,
      ipAddress,
    });

    return {
      message: "Password has been reset successfully. Please sign in with your new password.",
    };
  },

  /**
   * Get safe details for current authenticated user
   */
  async getCurrentUser(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw ApiError.unauthorized("User account was not found.");
    }
    if (user.status !== "ACTIVE") {
      throw ApiError.forbidden("Account is inactive or suspended.");
    }
    return user;
  },
};

export default authService;
