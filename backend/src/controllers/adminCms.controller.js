import { heroService } from "../services/hero.service.js";
import { bannerService } from "../services/banner.service.js";
import { specialOfferService } from "../services/specialOffer.service.js";
import { signatureCollectionsService } from "../services/signatureCollections.service.js";
import { sendSuccess, sendPaginated } from "../utils/apiResponse.js";
import { memoryCache } from "../utils/cache.js";

/**
 * Admin CMS Controller
 * Handles HTTP requests for Hero, Promotional Banners, and Special Offers
 */
export const adminCmsController = {
  // ==========================================
  // 1. HERO SECTION
  // ==========================================

  async getHero(req, res, next) {
    try {
      const hero = await heroService.getAdminHero();
      return sendSuccess(res, {
        message: "Hero configuration fetched successfully",
        data: hero,
      });
    } catch (error) {
      next(error);
    }
  },

  async saveHero(req, res, next) {
    try {
      const hero = await heroService.saveHero(req.body);
      memoryCache.flushPrefix("storefront:hero");
      return sendSuccess(res, {
        message: "Hero configuration saved successfully",
        data: hero,
      });
    } catch (error) {
      next(error);
    }
  },

  async updateHero(req, res, next) {
    try {
      const hero = await heroService.updateHero(req.params.id, req.body);
      memoryCache.flushPrefix("storefront:hero");
      return sendSuccess(res, {
        message: "Hero configuration updated successfully",
        data: hero,
      });
    } catch (error) {
      next(error);
    }
  },

  // ==========================================
  // 2. BANNERS
  // ==========================================

  async getBanners(req, res, next) {
    try {
      const { banners, pagination } = await bannerService.getAdminBanners(req.query);
      return sendPaginated(res, {
        message: "Banners fetched successfully",
        data: banners,
        pagination,
      });
    } catch (error) {
      next(error);
    }
  },

  async getBannerById(req, res, next) {
    try {
      const banner = await bannerService.getBannerById(req.params.id);
      return sendSuccess(res, {
        message: "Banner fetched successfully",
        data: banner,
      });
    } catch (error) {
      next(error);
    }
  },

  async createBanner(req, res, next) {
    try {
      const banner = await bannerService.createBanner(req.body);
      memoryCache.flushPrefix("storefront:banners");
      return sendSuccess(res, {
        message: "Banner created successfully",
        data: banner,
        statusCode: 201,
      });
    } catch (error) {
      next(error);
    }
  },

  async updateBanner(req, res, next) {
    try {
      const banner = await bannerService.updateBanner(req.params.id, req.body);
      memoryCache.flushPrefix("storefront:banners");
      return sendSuccess(res, {
        message: "Banner updated successfully",
        data: banner,
      });
    } catch (error) {
      next(error);
    }
  },

  async deleteBanner(req, res, next) {
    try {
      const result = await bannerService.deleteBanner(req.params.id);
      memoryCache.flushPrefix("storefront:banners");
      return sendSuccess(res, {
        message: result.message,
        data: result.banner,
      });
    } catch (error) {
      next(error);
    }
  },

  // ==========================================
  // 3. SPECIAL OFFERS
  // ==========================================

  async getSpecialOffers(req, res, next) {
    try {
      const { offers, pagination } = await specialOfferService.getAdminSpecialOffers(req.query);
      return sendPaginated(res, {
        message: "Special offers fetched successfully",
        data: offers,
        pagination,
      });
    } catch (error) {
      next(error);
    }
  },

  async getSpecialOfferById(req, res, next) {
    try {
      const offer = await specialOfferService.getSpecialOfferById(req.params.id);
      return sendSuccess(res, {
        message: "Special offer fetched successfully",
        data: offer,
      });
    } catch (error) {
      next(error);
    }
  },

  async createSpecialOffer(req, res, next) {
    try {
      const offer = await specialOfferService.createSpecialOffer(req.body);
      return sendSuccess(res, {
        message: "Special offer created successfully",
        data: offer,
        statusCode: 201,
      });
    } catch (error) {
      next(error);
    }
  },

  async updateSpecialOffer(req, res, next) {
    try {
      const offer = await specialOfferService.updateSpecialOffer(req.params.id, req.body);
      return sendSuccess(res, {
        message: "Special offer updated successfully",
        data: offer,
      });
    } catch (error) {
      next(error);
    }
  },

  async deleteSpecialOffer(req, res, next) {
    try {
      const result = await specialOfferService.deleteSpecialOffer(req.params.id);
      return sendSuccess(res, {
        message: result.message,
        data: result.offer,
      });
    } catch (error) {
      next(error);
    }
  },

  // ==========================================
  // 4. SIGNATURE COLLECTIONS
  // ==========================================

  async getSignatureCollections(req, res, next) {
    try {
      const data = await signatureCollectionsService.getConfig();
      return sendSuccess(res, {
        message: "Signature collections configuration fetched successfully",
        data,
      });
    } catch (error) {
      next(error);
    }
  },

  async saveSignatureCollections(req, res, next) {
    try {
      const data = await signatureCollectionsService.saveConfig(req.body);
      return sendSuccess(res, {
        message: "Signature collections configuration saved successfully",
        data,
      });
    } catch (error) {
      next(error);
    }
  },
};

export default adminCmsController;
