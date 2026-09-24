import { authService } from "../services/auth.service.js";
import { tokenService } from "../services/token.service.js";
import { sendSuccess } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";

export const authController = {
  /**
   * POST /api/v1/auth/login
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const ipAddress = req.ip || req.headers["x-forwarded-for"] || null;

      const result = await authService.login({ email, password, ipAddress });

      // Set refresh token in secure HttpOnly cookie
      res.cookie("refreshToken", result.refreshToken, tokenService.getCookieOptions());

      return sendSuccess(res, {
        message: "Sign in successful",
        data: {
          user: result.user,
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/v1/auth/refresh
   */
  async refresh(req, res, next) {
    try {
      const rawRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
      if (!rawRefreshToken) {
        throw ApiError.unauthorized("Refresh token is required.", "REFRESH_TOKEN_REQUIRED");
      }

      const result = await authService.refresh({ rawRefreshToken });

      // Rotate: set new refresh token in HttpOnly cookie
      if (result.newRefreshToken) {
        res.cookie("refreshToken", result.newRefreshToken, tokenService.getCookieOptions());
      }

      return sendSuccess(res, {
        message: "Session refreshed successfully",
        data: {
          user: result.user,
          accessToken: result.newAccessToken,
          refreshToken: result.newRefreshToken || rawRefreshToken,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/v1/auth/logout
   */
  async logout(req, res, next) {
    try {
      const rawRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
      const ipAddress = req.ip || req.headers["x-forwarded-for"] || null;
      let userId = req.user?.id || null;

      if (!userId && req.headers.authorization?.startsWith("Bearer ")) {
        try {
          const token = req.headers.authorization.substring(7).trim();
          const decoded = tokenService.verifyAccessToken(token);
          if (decoded?.userId) userId = decoded.userId;
        } catch {
          // Token may be expired, continue with rawRefreshToken
        }
      }

      await authService.logout({ rawRefreshToken, userId, ipAddress });

      // Robustly clear refresh token cookie across all browser variants
      res.clearCookie("refreshToken", {
        path: "/",
        httpOnly: true,
      });
      res.cookie("refreshToken", "", {
        maxAge: 0,
        path: "/",
        httpOnly: true,
      });

      return sendSuccess(res, {
        message: "Logged out successfully",
        data: null,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/auth/me
   */
  async getMe(req, res, next) {
    try {
      return sendSuccess(res, {
        message: "Current user profile fetched successfully",
        data: {
          user: req.user,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/v1/auth/forgot-password
   */
  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;
      const ipAddress = req.ip || req.headers["x-forwarded-for"] || null;

      const result = await authService.forgotPassword({ email, ipAddress });

      return sendSuccess(res, {
        message: result.message,
        data: null,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/v1/auth/reset-password
   */
  async resetPassword(req, res, next) {
    try {
      const { token, newPassword } = req.body;
      const ipAddress = req.ip || req.headers["x-forwarded-for"] || null;

      const result = await authService.resetPassword({ token, newPassword, ipAddress });

      return sendSuccess(res, {
        message: result.message,
        data: null,
      });
    } catch (error) {
      next(error);
    }
  },
};

export default authController;
