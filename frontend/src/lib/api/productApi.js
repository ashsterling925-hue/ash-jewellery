import { api } from "./client.js";

/**
 * Product API Service for Frontend
 */
export const productApi = {
  /**
   * Fetch products with optional query filtering (search, status, stockStatus, categoryId, subcategoryId, collectionId, tagId, page, limit, sortBy, sortOrder)
   */
  async getProducts(params = {}) {
    return api.get("/products", params);
  },

  /**
   * Fetch a single product by ID
   */
  async getProductById(id) {
    return api.get(`/products/${id}`);
  },

  /**
   * Create a new product
   */
  async createProduct(data) {
    return api.post("/products", data);
  },

  /**
   * Update product by ID
   */
  async updateProduct(id, data) {
    return api.patch(`/products/${id}`, data);
  },

  /**
   * Delete product by ID
   */
  async deleteProduct(id) {
    return api.delete(`/products/${id}`);
  },
};

export default productApi;
