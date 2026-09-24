import { api } from "./client.js";

/**
 * Super Admin Management API Service
 */
export const adminApi = {
  // ==========================================
  // 1. DASHBOARD OVERVIEW
  // ==========================================

  async getDashboardStats() {
    return api.get("/admin/dashboard-stats");
  },

  // ==========================================
  // 2. CUSTOMERS
  // ==========================================

  async getCustomers(params = {}) {
    return api.get("/admin/customers", params);
  },

  // ==========================================
  // 3. ENQUIRIES
  // ==========================================

  async getEnquiries(params = {}) {
    return api.get("/admin/enquiries", params);
  },

  async updateEnquiry(id, data) {
    return api.patch(`/admin/enquiries/${id}`, data);
  },

  // ==========================================
  // 4. ANALYTICS
  // ==========================================

  async getAnalytics(params = {}) {
    return api.get("/admin/analytics", params);
  },

  // ==========================================
  // 5. NAVIGATION & PAGES
  // ==========================================

  async getNavigation() {
    return api.get("/admin/navigation");
  },

  async getPages() {
    return api.get("/admin/pages");
  },

  // ==========================================
  // 6. STORE SETTINGS
  // ==========================================

  async getSettings() {
    return api.get("/admin/settings");
  },

  async updateSettings(data) {
    return api.put("/admin/settings", data);
  },
};

export default adminApi;
