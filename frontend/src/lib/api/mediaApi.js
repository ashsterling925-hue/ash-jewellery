import { api } from "./client.js";

/**
 * Media API Service for Frontend
 */
export const mediaApi = {
  /**
   * Fetch paginated media assets with filters
   * @param {Object} params - search, mimeType, status, page, limit, sortBy, sortOrder
   */
  async getMedia(params = {}) {
    return api.get("/media", params);
  },

  /**
   * Fetch single media asset by ID
   */
  async getMediaById(id) {
    return api.get(`/media/${id}`);
  },

  /**
   * Upload a new media asset (file + optional metadata)
   * @param {File|Blob} file
   * @param {Object} [metadata={}] - title, altText, folder
   */
  async uploadMedia(file, metadata = {}) {
    const formData = new FormData();
    formData.append("file", file);
    if (metadata.title) formData.append("title", metadata.title);
    if (metadata.altText) formData.append("altText", metadata.altText);
    if (metadata.folder) formData.append("folder", metadata.folder);

    return api.post("/media", formData);
  },

  /**
   * Update media metadata (altText, title, status)
   */
  async updateMedia(id, data) {
    return api.patch(`/media/${id}`, data);
  },

  /**
   * Delete or archive media
   */
  async deleteMedia(id) {
    return api.delete(`/media/${id}`);
  },
};

export default mediaApi;
