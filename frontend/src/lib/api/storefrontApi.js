import { api } from "./client.js";

// In-memory cache & pending promise registry for client-side deduplication
const clientCache = new Map();
const pendingRequests = new Map();

async function cachedFetch(url, params = null, ttlMs = 45000) {
  const cacheKey = `${url}:${params ? JSON.stringify(params) : ""}`;

  // 1. Check if cached and still valid
  const cached = clientCache.get(cacheKey);
  if (cached && Date.now() < cached.expiresAt) {
    return cached.data;
  }

  // 2. Check if a request is already in-flight for this key (deduplication)
  if (pendingRequests.has(cacheKey)) {
    return pendingRequests.get(cacheKey);
  }

  // 3. Dispatch fresh request
  const requestPromise = (params ? api.get(url, params) : api.get(url))
    .then((res) => {
      clientCache.set(cacheKey, {
        data: res,
        expiresAt: Date.now() + ttlMs,
      });
      return res;
    })
    .finally(() => {
      pendingRequests.delete(cacheKey);
    });

  pendingRequests.set(cacheKey, requestPromise);
  return requestPromise;
}

/**
 * Public Storefront API Service with In-Memory Client Caching and Request Deduplication
 */
export const storefrontApi = {
  /**
   * Fetch published products with filters, search, pagination, and sorting
   * Uses shorter 20s TTL for product queries
   */
  async getProducts(params = {}) {
    return cachedFetch("/storefront/products", params, 20000);
  },

  /**
   * Fetch single published product details by slug
   */
  async getProductBySlug(slug) {
    return cachedFetch(`/storefront/products/${slug}`, null, 30000);
  },

  /**
   * Fetch active categories (cached for 60s)
   */
  async getCategories(params = {}) {
    return cachedFetch("/storefront/categories", params, 60000);
  },

  /**
   * Fetch single active category by slug
   */
  async getCategoryBySlug(slug) {
    return cachedFetch(`/storefront/categories/${slug}`, null, 60000);
  },

  /**
   * Fetch single active subcategory by slug
   */
  async getSubcategoryBySlug(slug) {
    return cachedFetch(`/storefront/subcategories/${slug}`, null, 60000);
  },

  /**
   * Fetch active collections
   */
  async getCollections(params = {}) {
    return cachedFetch("/storefront/collections", params, 60000);
  },

  /**
   * Fetch single active collection by slug
   */
  async getCollectionBySlug(slug) {
    return cachedFetch(`/storefront/collections/${slug}`, null, 60000);
  },

  /**
   * Fetch dynamic filterable attributes with active values
   */
  async getFilters() {
    return cachedFetch("/storefront/filters", null, 120000);
  },

  /**
   * Fetch active hero section configuration
   */
  async getHero() {
    return cachedFetch("/storefront/hero", null, 60000);
  },

  /**
   * Fetch active promotional banners
   */
  async getBanners(params = {}) {
    return cachedFetch("/storefront/banners", params, 60000);
  },

  /**
   * Fetch active special offers
   */
  async getSpecialOffers() {
    return cachedFetch("/storefront/special-offers", null, 60000);
  },

  /**
   * Fetch dynamic homepage merchandising product sections
   */
  async getMerchandising(params = {}) {
    return cachedFetch("/storefront/merchandising", params, 60000);
  },

  /**
   * Invalidate client-side cache
   */
  clearCache() {
    clientCache.clear();
    pendingRequests.clear();
  },
};

export default storefrontApi;
