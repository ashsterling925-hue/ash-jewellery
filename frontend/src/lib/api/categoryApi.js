import { api } from "./client.js";

/**
 * Category API Service for Frontend
 */
export const categoryApi = {
  /**
   * Fetch categories with optional query filtering (search, status, page, limit, sortBy, sortOrder)
   */
  async getCategories(params = {}) {
    return api.get("/categories", params);
  },

  /**
   * Fetch a single category by ID
   */
  async getCategoryById(id) {
    return api.get(`/categories/${id}`);
  },

  /**
   * Create a new category
   */
  async createCategory(data) {
    return api.post("/categories", data);
  },

  /**
   * Update category by ID
   */
  async updateCategory(id, data) {
    return api.patch(`/categories/${id}`, data);
  },

  /**
   * Safe delete or archive category
   */
  async deleteCategory(id) {
    return api.delete(`/categories/${id}`);
  },

  /**
   * Fetch subcategories belonging to a category
   */
  async getSubcategoriesByCategory(categoryId) {
    return api.get(`/categories/${categoryId}/subcategories`);
  },
};

export default categoryApi;
