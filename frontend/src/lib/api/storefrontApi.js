import { api } from "./client.js";

/**
 * Public Storefront API Service
 * Interacts with /api/v1/storefront for customer-facing catalogue data
 */
export const storefrontApi = {
  /**
   * Fetch published products with filters, search, pagination, and sorting
   * @param {Object} params - { categorySlug, subcategorySlug, collectionSlug, search, attributeValueIds, sortBy, sortOrder, page, limit }
   */
  async getProducts(params = {}) {
    return api.get("/storefront/products", params);
  },

  /**
   * Fetch single published product details by slug
   * @param {string} slug
   */
  async getProductBySlug(slug) {
    return api.get(`/storefront/products/${slug}`);
  },

  /**
   * Fetch active categories
   */
  async getCategories(params = {}) {
    return api.get("/storefront/categories", params);
  },

  /**
   * Fetch single active category by slug
   */
  async getCategoryBySlug(slug) {
    return api.get(`/storefront/categories/${slug}`);
  },

  /**
   * Fetch single active subcategory by slug
   */
  async getSubcategoryBySlug(slug) {
    return api.get(`/storefront/subcategories/${slug}`);
  },

  /**
   * Fetch active collections
   */
  async getCollections(params = {}) {
    return api.get("/storefront/collections", params);
  },

  /**
   * Fetch single active collection by slug
   */
  async getCollectionBySlug(slug) {
    return api.get(`/storefront/collections/${slug}`);
  },

  /**
   * Fetch dynamic filterable attributes with active values
   */
  async getFilters() {
    return api.get("/storefront/filters");
  },

  /**
   * Fetch active hero section configuration
   */
  async getHero() {
    return api.get("/storefront/hero");
  },

  /**
   * Fetch active promotional banners
   */
  async getBanners(params = {}) {
    return api.get("/storefront/banners", params);
  },

  /**
   * Fetch active special offers
   */
  async getSpecialOffers() {
    return api.get("/storefront/special-offers");
  },
};

export default storefrontApi;
