import { productService } from "../services/product.service.js";
import { categoryService } from "../services/category.service.js";
import { subcategoryService } from "../services/subcategory.service.js";
import { collectionService } from "../services/collection.service.js";
import { attributeService } from "../services/attribute.service.js";
import { heroService } from "../services/hero.service.js";
import { bannerService } from "../services/banner.service.js";
import { specialOfferService } from "../services/specialOffer.service.js";
import { signatureCollectionsService } from "../services/signatureCollections.service.js";
import { sendSuccess, sendPaginated } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { memoryCache } from "../utils/cache.js";

/**
 * Public Storefront Controller
 * Dedicated to customer-facing queries with strict Active/Published visibility enforcement
 */
export const storefrontController = {
  /**
   * GET /api/v1/storefront/products
   * List public published products with filters, search, sorting and pagination
   */
  async getProducts(req, res, next) {
    try {
      const cacheKey = `storefront:products:${JSON.stringify(req.query)}`;
      const cached = memoryCache.get(cacheKey);
      if (cached) {
        return sendPaginated(res, cached);
      }

      const { products, pagination } = await productService.getProducts({
        ...req.query,
        status: "PUBLISHED",
        cardOnly: req.query.full !== "true",
      });

      const responsePayload = {
        message: "Storefront products fetched successfully",
        data: products,
        pagination,
      };

      memoryCache.set(cacheKey, responsePayload, 60); // 60s cache

      return sendPaginated(res, responsePayload);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/storefront/products/:slug
   * Get single published product by slug
   */
  async getProductBySlug(req, res, next) {
    try {
      const slug = req.params.slug;
      const cacheKey = `storefront:product:${slug}`;
      const cached = memoryCache.get(cacheKey);
      if (cached) {
        return sendSuccess(res, cached);
      }

      const product = await productService.getProductById(slug);

      // Verify product is PUBLISHED
      if (product.status !== "PUBLISHED") {
        throw ApiError.notFound(`Product "${slug}" was not found.`);
      }

      const responsePayload = {
        message: "Storefront product details fetched successfully",
        data: product,
      };

      memoryCache.set(cacheKey, responsePayload, 120); // 120s cache

      return sendSuccess(res, responsePayload);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/storefront/merchandising
   * Dynamic homepage product sections (Best Sellers, New Arrivals, Featured, Trending)
   */
  async getHomepageMerchandising(req, res, next) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit, 10) : 8;
      const section = req.query.section?.toLowerCase();
      const cacheKey = `storefront:merchandising:${limit}:${section || "all"}`;
      const cached = memoryCache.get(cacheKey);
      if (cached) {
        return sendSuccess(res, cached);
      }

      const data = await productService.getHomepageMerchandising(limit);

      // Support optional section filter if client requests a single section
      if (section) {
        let sectionData = [];
        if (section === "bestsellers" || section === "best-sellers" || section === "bestseller") {
          sectionData = data.bestSellers;
        } else if (section === "newarrivals" || section === "new-arrivals" || section === "newarrival") {
          sectionData = data.newArrivals;
        } else if (section === "featured") {
          sectionData = data.featured;
        } else if (section === "trending") {
          sectionData = data.trending;
        }

        const responsePayload = {
          message: `Homepage ${req.query.section} products fetched successfully`,
          data: sectionData,
        };
        memoryCache.set(cacheKey, responsePayload, 120);

        return sendSuccess(res, responsePayload);
      }

      const responsePayload = {
        message: "Homepage merchandising products fetched successfully",
        data,
      };
      memoryCache.set(cacheKey, responsePayload, 120);

      return sendSuccess(res, responsePayload);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/storefront/categories
   * List active categories
   */
  async getCategories(req, res, next) {
    try {
      const cacheKey = `storefront:categories:${JSON.stringify(req.query)}`;
      const cached = memoryCache.get(cacheKey);
      if (cached) {
        return sendPaginated(res, cached);
      }

      const { categories, pagination } = await categoryService.getCategories({
        ...req.query,
        status: "Active",
      });

      const responsePayload = {
        message: "Storefront categories fetched successfully",
        data: categories,
        pagination,
      };
      memoryCache.set(cacheKey, responsePayload, 120);

      return sendPaginated(res, responsePayload);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/storefront/categories/:slug
   * Get single active category by slug
   */
  async getCategoryBySlug(req, res, next) {
    try {
      const category = await categoryService.getCategoryById(req.params.slug);

      if (category.status.toLowerCase() !== "active") {
        throw ApiError.notFound(`Category "${req.params.slug}" was not found.`);
      }

      return sendSuccess(res, {
        message: "Storefront category fetched successfully",
        data: category,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/storefront/subcategories/:slug
   * Get single active subcategory by slug
   */
  async getSubcategoryBySlug(req, res, next) {
    try {
      const subcategory = await subcategoryService.getSubcategoryById(req.params.slug);

      if (subcategory.status.toLowerCase() !== "active") {
        throw ApiError.notFound(`Subcategory "${req.params.slug}" was not found.`);
      }

      return sendSuccess(res, {
        message: "Storefront subcategory fetched successfully",
        data: subcategory,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/storefront/collections
   * List active collections
   */
  async getCollections(req, res, next) {
    try {
      const { collections, pagination } = await collectionService.getCollections({
        ...req.query,
        status: "Active",
      });

      return sendPaginated(res, {
        message: "Storefront collections fetched successfully",
        data: collections,
        pagination,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/storefront/collections/:slug
   * Get single active collection by slug
   */
  async getCollectionBySlug(req, res, next) {
    try {
      const collection = await collectionService.getCollectionById(req.params.slug);

      if (collection.status.toLowerCase() !== "active") {
        throw ApiError.notFound(`Collection "${req.params.slug}" was not found.`);
      }

      return sendSuccess(res, {
        message: "Storefront collection fetched successfully",
        data: collection,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/storefront/filters
   * Get dynamic filterable attributes with their active values
   */
  async getFilterableAttributes(req, res, next) {
    try {
      const cacheKey = "storefront:filters";
      const cached = memoryCache.get(cacheKey);
      if (cached) {
        return sendSuccess(res, cached);
      }

      const { attributes } = await attributeService.getAttributes({
        filterable: true,
        status: "Active",
        includeValues: true,
        onlyActiveValues: true,
        limit: 100,
      });

      const responsePayload = {
        message: "Filterable attributes fetched successfully",
        data: attributes,
      };
      memoryCache.set(cacheKey, responsePayload, 300);

      return sendSuccess(res, responsePayload);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/storefront/hero
   * Get active hero section configuration
   */
  async getHero(req, res, next) {
    try {
      const cacheKey = "storefront:hero";
      const cached = memoryCache.get(cacheKey);
      if (cached) {
        return sendSuccess(res, cached);
      }

      const hero = await heroService.getStorefrontHero();
      const responsePayload = {
        message: "Storefront hero fetched successfully",
        data: hero,
      };
      memoryCache.set(cacheKey, responsePayload, 180);

      return sendSuccess(res, responsePayload);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/storefront/banners
   * Get active promotional banners within valid date bounds
   */
  async getBanners(req, res, next) {
    try {
      const position = req.query.position || "HOME_PROMOTION";
      const cacheKey = `storefront:banners:${position}`;
      const cached = memoryCache.get(cacheKey);
      if (cached) {
        return sendSuccess(res, cached);
      }

      const banners = await bannerService.getStorefrontBanners(position);
      const responsePayload = {
        message: "Storefront banners fetched successfully",
        data: banners,
      };
      memoryCache.set(cacheKey, responsePayload, 180);

      return sendSuccess(res, responsePayload);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/storefront/special-offers
   * Get active special offers within valid date bounds
   */
  async getSpecialOffers(req, res, next) {
    try {
      const offers = await specialOfferService.getStorefrontSpecialOffers();
      return sendSuccess(res, {
        message: "Storefront special offers fetched successfully",
        data: offers,
      });
    } catch (error) {
      next(error);
    }
  },


  /**
   * GET /api/v1/storefront/signature-collections
   * Get dynamic signature collections homepage section config & active categories
   */
  async getSignatureCollections(req, res, next) {
    try {
      const cacheKey = "storefront:signature-collections";
      const cached = memoryCache.get(cacheKey);
      if (cached) {
        return sendSuccess(res, cached);
      }

      const data = await signatureCollectionsService.getConfig();
      const responsePayload = {
        message: "Signature collections fetched successfully",
        data,
      };
      memoryCache.set(cacheKey, responsePayload, 60);

      return sendSuccess(res, responsePayload);
    } catch (error) {
      next(error);
    }
  },
};

export default storefrontController;
