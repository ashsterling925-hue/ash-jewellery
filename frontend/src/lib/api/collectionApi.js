import { api } from "./client.js";

/**
 * Collection API Service for Frontend
 */
export const collectionApi = {
  /**
   * Fetch collections with optional query filtering (search, status, page, limit, sortBy, sortOrder)
   */
  async getCollections(params = {}) {
    return api.get("/collections", params);
  },

  /**
   * Fetch a single collection by ID
   */
  async getCollectionById(id) {
    return api.get(`/collections/${id}`);
  },

  /**
   * Create a new collection
   */
  async createCollection(data) {
    return api.post("/collections", data);
  },

  /**
   * Update collection by ID
   */
  async updateCollection(id, data) {
    return api.patch(`/collections/${id}`, data);
  },

  /**
   * Safe delete or archive collection
   */
  async deleteCollection(id) {
    return api.delete(`/collections/${id}`);
  },
};

export default collectionApi;
