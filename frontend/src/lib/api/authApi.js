import { api } from "./client.js";

/**
 * Authentication API Service
 * Interacts with /api/v1/auth endpoints
 */
export const authApi = {
  /**
   * Admin Login
   * @param {Object} credentials - { email, password }
   */
  async login({ email, password }) {
    return api.post("/auth/login", { email, password });
  },

  /**
   * Refresh session via HttpOnly cookie or body token
   */
  async refresh(data = {}) {
    return api.post("/auth/refresh", data);
  },

  /**
   * Logout session and clear HttpOnly cookie
   */
  async logout() {
    return api.post("/auth/logout", {});
  },

  /**
   * Fetch currently authenticated user profile
   */
  async getMe() {
    return api.get("/auth/me");
  },

  /**
   * Request password recovery reset link
   * @param {Object} payload - { email }
   */
  async forgotPassword({ email }) {
    return api.post("/auth/forgot-password", { email });
  },

  /**
   * Reset password with reset token
   * @param {Object} payload - { token, newPassword }
   */
  async resetPassword({ token, newPassword }) {
    return api.post("/auth/reset-password", { token, newPassword });
  },
};

export default authApi;
