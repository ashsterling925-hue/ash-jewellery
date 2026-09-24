import { api } from "./client.js";

/**
 * Attribute API Service for Frontend
 */
export const attributeApi = {
  /**
   * Fetch attributes with optional filters (search, status, filterable, includeValues, page, limit, sortBy, sortOrder)
   */
  async getAttributes(params = {}) {
    return api.get("/attributes", params);
  },

  /**
   * Fetch a single attribute by ID with values
   */
  async getAttributeById(id) {
    return api.get(`/attributes/${id}`);
  },

  /**
   * Create a new attribute
   */
  async createAttribute(data) {
    return api.post("/attributes", data);
  },

  /**
   * Update attribute by ID
   */
  async updateAttribute(id, data) {
    return api.patch(`/attributes/${id}`, data);
  },

  /**
   * Delete or archive attribute by ID
   */
  async deleteAttribute(id) {
    return api.delete(`/attributes/${id}`);
  },

  /**
   * Fetch values belonging to an attribute
   */
  async getAttributeValues(attributeId, params = {}) {
    return api.get(`/attributes/${attributeId}/values`, params);
  },

  /**
   * Create an attribute value under an attribute
   */
  async createAttributeValue(attributeId, data) {
    return api.post(`/attributes/${attributeId}/values`, data);
  },
};

export default attributeApi;
