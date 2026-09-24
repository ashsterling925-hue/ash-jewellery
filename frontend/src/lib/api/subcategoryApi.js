import { api } from "./client.js";

/**
 * Subcategory API Service for Frontend
 */
export const subcategoryApi = {
  /**
   * Fetch subcategories with optional query filtering (search, categoryId, status, page, limit, sortBy, sortOrder)
   */
  async getSubcategories(params = {}) {
    return api.get("/subcategories", params);
  },

  /**
   * Fetch a single subcategory by ID
   */
  async getSubcategoryById(id) {
    return api.get(`/subcategories/${id}`);
  },

  /**
   * Create a new subcategory
   */
  async createSubcategory(data) {
    return api.post("/subcategories", data);
  },

  /**
   * Update subcategory by ID
   */
  async updateSubcategory(id, data) {
    return api.patch(`/subcategories/${id}`, data);
  },

  /**
   * Safe delete or archive subcategory
   */
  async deleteSubcategory(id) {
    return api.delete(`/subcategories/${id}`);
  },
};

export default subcategoryApi;
