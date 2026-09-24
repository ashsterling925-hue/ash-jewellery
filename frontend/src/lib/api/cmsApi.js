import { api } from "./client.js";

/**
 * CMS API Service for Admin (Hero, Banners, Special Offers)
 */
export const cmsApi = {
  // ==========================================
  // 1. HERO SECTION
  // ==========================================

  async getAdminHero() {
    return api.get("/admin/hero");
  },

  async saveHero(data) {
    return api.post("/admin/hero", data);
  },

  async updateHero(id, data) {
    return api.patch(`/admin/hero/${id}`, data);
  },

  // ==========================================
  // 2. PROMOTIONAL BANNERS
  // ==========================================

  async getAdminBanners(params = {}) {
    return api.get("/admin/banners", params);
  },

  async getBannerById(id) {
    return api.get(`/admin/banners/${id}`);
  },

  async createBanner(data) {
    return api.post("/admin/banners", data);
  },

  async updateBanner(id, data) {
    return api.patch(`/admin/banners/${id}`, data);
  },

  async deleteBanner(id) {
    return api.delete(`/admin/banners/${id}`);
  },

  // ==========================================
  // 3. SPECIAL OFFERS
  // ==========================================

  async getAdminSpecialOffers(params = {}) {
    return api.get("/admin/special-offers", params);
  },

  async getSpecialOfferById(id) {
    return api.get(`/admin/special-offers/${id}`);
  },

  async createSpecialOffer(data) {
    return api.post("/admin/special-offers", data);
  },

  async updateSpecialOffer(id, data) {
    return api.patch(`/admin/special-offers/${id}`, data);
  },

  async deleteSpecialOffer(id) {
    return api.delete(`/admin/special-offers/${id}`);
  },
};

export default cmsApi;
