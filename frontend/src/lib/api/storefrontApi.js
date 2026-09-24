import { api } from "./client.js";

// In-memory cache & pending promise registry for client-side deduplication
const clientCache = new Map();
const pendingRequests = new Map();

// LocalStorage & SessionStorage persistent cache for instant 0ms first paint
function readStorageCache(key) {
  try {
    if (typeof window === "undefined") return null;
    const storageKey = `ash_sf_${key}`;
    const raw =
      (window.localStorage && localStorage.getItem(storageKey)) ||
      (window.sessionStorage && sessionStorage.getItem(storageKey));
    if (!raw) return null;
    const item = JSON.parse(raw);
    if (Date.now() < item.expiresAt) {
      return item.data;
    }
    if (window.localStorage) localStorage.removeItem(storageKey);
    if (window.sessionStorage) sessionStorage.removeItem(storageKey);
  } catch {
    // ignore storage errors
  }
  return null;
}

function writeStorageCache(key, data, ttlMs) {
  try {
    if (typeof window === "undefined") return;
    const storageKey = `ash_sf_${key}`;
    const serialized = JSON.stringify({
      data,
      expiresAt: Date.now() + ttlMs,
    });
    if (window.localStorage) localStorage.setItem(storageKey, serialized);
    if (window.sessionStorage) sessionStorage.setItem(storageKey, serialized);
  } catch {
    // ignore storage quotas
  }
}

async function cachedFetch(url, params = null, ttlMs = 45000) {
  const cacheKey = `${url}:${params ? JSON.stringify(params) : ""}`;

  // 1. Check in-memory cache
  const cached = clientCache.get(cacheKey);
  if (cached && Date.now() < cached.expiresAt) {
    return cached.data;
  }

  // 2. Check persistent session storage cache
  const storageCached = readStorageCache(cacheKey);
  if (storageCached) {
    clientCache.set(cacheKey, {
      data: storageCached,
      expiresAt: Date.now() + ttlMs,
    });
    return storageCached;
  }

  // 3. Deduplicate in-flight promises
  if (pendingRequests.has(cacheKey)) {
    return pendingRequests.get(cacheKey);
  }

  // 4. Dispatch network request
  const requestPromise = (params ? api.get(url, params) : api.get(url))
    .then((res) => {
      clientCache.set(cacheKey, {
        data: res,
        expiresAt: Date.now() + ttlMs,
      });
      writeStorageCache(cacheKey, res, ttlMs);
      return res;
    })
    .finally(() => {
      pendingRequests.delete(cacheKey);
    });

  pendingRequests.set(cacheKey, requestPromise);
  return requestPromise;
}

/**
 * Public Storefront API Service with Persistent Session Caching and In-Flight Request Deduplication
 */
export const storefrontApi = {
  /**
   * Synchronously retrieve cached data if available in memory or session storage.
   * Enables instantaneous (0ms) component initial state with zero layout shift.
   */
  getCachedSync(url, params = null) {
    const cacheKey = `${url}:${params ? JSON.stringify(params) : ""}`;
    const mem = clientCache.get(cacheKey);
    if (mem && Date.now() < mem.expiresAt) return mem.data?.data || mem.data;
    const stored = readStorageCache(cacheKey);
    if (stored) return stored?.data || stored;
    return null;
  },

  /**
   * Fetch published products with filters, search, pagination, and sorting
   */
  async getProducts(params = {}) {
    return cachedFetch("/storefront/products", params, 30000);
  },

  /**
   * Fetch single published product details by slug
   */
  async getProductBySlug(slug) {
    return cachedFetch(`/storefront/products/${slug}`, null, 60000);
  },

  /**
   * Fetch active categories (cached for 5 mins in localStorage)
   */
  async getCategories(params = {}) {
    return cachedFetch("/storefront/categories", params, 300000);
  },

  /**
   * Fetch single active category by slug
   */
  async getCategoryBySlug(slug) {
    return cachedFetch(`/storefront/categories/${slug}`, null, 120000);
  },

  /**
   * Fetch single active subcategory by slug
   */
  async getSubcategoryBySlug(slug) {
    return cachedFetch(`/storefront/subcategories/${slug}`, null, 120000);
  },

  /**
   * Fetch active collections
   */
  async getCollections(params = {}) {
    return cachedFetch("/storefront/collections", params, 120000);
  },

  /**
   * Fetch single active collection by slug
   */
  async getCollectionBySlug(slug) {
    return cachedFetch(`/storefront/collections/${slug}`, null, 120000);
  },

  /**
   * Fetch dynamic filterable attributes with active values
   */
  async getFilters() {
    return cachedFetch("/storefront/filters", null, 180000);
  },

  /**
   * Fetch active hero section configuration
   */
  async getHero() {
    return cachedFetch("/storefront/hero", null, 120000);
  },

  /**
   * Fetch active promotional banners
   */
  async getBanners(params = {}) {
    return cachedFetch("/storefront/banners", params, 120000);
  },

  /**
   * Fetch active special offers
   */
  async getSpecialOffers() {
    return cachedFetch("/storefront/special-offers", null, 120000);
  },

  /**
   * Fetch dynamic homepage merchandising product sections
   */
  async getMerchandising(params = {}) {
    return cachedFetch("/storefront/merchandising", params, 120000);
  },

  /**
   * Fetch dynamic signature collections homepage section config & active categories
   */
  async getSignatureCollections() {
    return cachedFetch("/storefront/signature-collections", null, 120000);
  },

  /**
   * Invalidate client-side cache
   */
  clearCache() {
    clientCache.clear();
    pendingRequests.clear();
    try {
      if (typeof window !== "undefined") {
        if (window.localStorage) {
          Object.keys(localStorage).forEach((key) => {
            if (key.startsWith("ash_sf_")) localStorage.removeItem(key);
          });
        }
        if (window.sessionStorage) {
          Object.keys(sessionStorage).forEach((key) => {
            if (key.startsWith("ash_sf_")) sessionStorage.removeItem(key);
          });
        }
      }
    } catch {
      // ignore
    }
  },
};

export default storefrontApi;
