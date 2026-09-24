import { api } from "./client.js";

/**
 * Tag API Service for Frontend
 */
export const tagApi = {
  /**
   * Fetch tags with optional query filtering (search, status, page, limit, sortBy, sortOrder)
   */
  async getTags(params = {}) {
    return api.get("/tags", params);
  },

  /**
   * Fetch a single tag by ID
   */
  async getTagById(id) {
    return api.get(`/tags/${id}`);
  },

  /**
   * Create a new tag
   */
  async createTag(data) {
    return api.post("/tags", data);
  },

  /**
   * Update tag by ID
   */
  async updateTag(id, data) {
    return api.patch(`/tags/${id}`, data);
  },

  /**
   * Safe delete or archive tag
   */
  async deleteTag(id) {
    return api.delete(`/tags/${id}`);
  },
};

export default tagApi;
