import { productService } from "../services/product.service.js";
import { categoryService } from "../services/category.service.js";
import { subcategoryService } from "../services/subcategory.service.js";
import { collectionService } from "../services/collection.service.js";
import { attributeService } from "../services/attribute.service.js";
import { heroService } from "../services/hero.service.js";
import { bannerService } from "../services/banner.service.js";
import { specialOfferService } from "../services/specialOffer.service.js";
import { sendSuccess, sendPaginated } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";

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
      const { products, pagination } = await productService.getProducts({
        ...req.query,
        status: "PUBLISHED",
      });

      return sendPaginated(res, {
        message: "Storefront products fetched successfully",
        data: products,
        pagination,
      });
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
      const product = await productService.getProductById(req.params.slug);

      // Verify product is PUBLISHED
      if (product.status !== "PUBLISHED") {
        throw ApiError.notFound(`Product "${req.params.slug}" was not found.`);
      }

      return sendSuccess(res, {
        message: "Storefront product details fetched successfully",
        data: product,
      });
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
      const data = await productService.getHomepageMerchandising(limit);

      // Support optional section filter if client requests a single section
      if (req.query.section) {
        const sec = req.query.section.toLowerCase();
        let sectionData = [];
        if (sec === "bestsellers" || sec === "best-sellers" || sec === "bestseller") {
          sectionData = data.bestSellers;
        } else if (sec === "newarrivals" || sec === "new-arrivals" || sec === "newarrival") {
          sectionData = data.newArrivals;
        } else if (sec === "featured") {
          sectionData = data.featured;
        } else if (sec === "trending") {
          sectionData = data.trending;
        }

        return sendSuccess(res, {
          message: `Homepage ${req.query.section} products fetched successfully`,
          data: sectionData,
        });
      }

      return sendSuccess(res, {
        message: "Homepage merchandising products fetched successfully",
        data,
      });
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
      const { categories, pagination } = await categoryService.getCategories({
        ...req.query,
        status: "Active",
      });

      return sendPaginated(res, {
        message: "Storefront categories fetched successfully",
        data: categories,
        pagination,
      });
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
      const { attributes } = await attributeService.getAttributes({
        filterable: true,
        status: "Active",
        includeValues: true,
        onlyActiveValues: true,
        limit: 100,
      });

      return sendSuccess(res, {
        message: "Filterable attributes fetched successfully",
        data: attributes,
      });
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
      const hero = await heroService.getStorefrontHero();
      return sendSuccess(res, {
        message: "Storefront hero fetched successfully",
        data: hero,
      });
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
      const banners = await bannerService.getStorefrontBanners(position);
      return sendSuccess(res, {
        message: "Storefront banners fetched successfully",
        data: banners,
      });
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
   * GET /api/v1/storefront/merchandising
   * GET /api/v1/storefront/homepage/merchandising
   * Get dynamic homepage merchandising sections (Best Sellers, New Arrivals, Featured, Trending)
   */
  async getHomepageMerchandising(req, res, next) {
    try {
      const limit = parseInt(req.query.limit, 10) || 8;
      const data = await productService.getHomepageMerchandising(limit);

      const section = req.query.section?.toLowerCase();
      if (section) {
        if (section === "bestsellers" || section === "best-sellers") {
          return sendSuccess(res, {
            message: "Best sellers fetched successfully",
            data: data.bestSellers,
          });
        }
        if (section === "new-arrivals" || section === "newarrivals") {
          return sendSuccess(res, {
            message: "New arrivals fetched successfully",
            data: data.newArrivals,
          });
        }
        if (section === "featured") {
          return sendSuccess(res, {
            message: "Featured products fetched successfully",
            data: data.featured,
          });
        }
        if (section === "trending") {
          return sendSuccess(res, {
            message: "Trending products fetched successfully",
            data: data.trending,
          });
        }
      }

      return sendSuccess(res, {
        message: "Homepage merchandising products fetched successfully",
        data,
      });
    } catch (error) {
      next(error);
    }
  },
};

export default storefrontController;
