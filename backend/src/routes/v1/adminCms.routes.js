import { Router } from "express";
import { adminCmsController } from "../../controllers/adminCms.controller.js";
import { validate } from "../../validators/validate.middleware.js";
import { authenticate, requirePermission } from "../../middleware/auth.js";
import { PERMISSIONS } from "../../config/permissions.js";
import {
  heroSchema,
  updateHeroSchema,
  createBannerSchema,
  updateBannerSchema,
  bannerQuerySchema,
  createSpecialOfferSchema,
  updateSpecialOfferSchema,
  specialOfferQuerySchema,
  idParamSchema,
} from "../../validators/cms.validator.js";

const router = Router();

// Protect all admin CMS routes with authentication
router.use(authenticate);

// ==========================================
// 1. HERO SECTION
// ==========================================

router.get(
  "/hero",
  requirePermission(PERMISSIONS.HERO_VIEW),
  adminCmsController.getHero
);
router.post(
  "/hero",
  requirePermission(PERMISSIONS.HERO_UPDATE),
  validate({ body: heroSchema }),
  adminCmsController.saveHero
);
router.patch(
  "/hero/:id",
  requirePermission(PERMISSIONS.HERO_UPDATE),
  validate({ params: idParamSchema, body: updateHeroSchema }),
  adminCmsController.updateHero
);

// ==========================================
// 2. BANNERS
// ==========================================

router.get(
  "/banners",
  requirePermission(PERMISSIONS.BANNER_VIEW),
  validate({ query: bannerQuerySchema }),
  adminCmsController.getBanners
);
router.get(
  "/banners/:id",
  requirePermission(PERMISSIONS.BANNER_VIEW),
  validate({ params: idParamSchema }),
  adminCmsController.getBannerById
);
router.post(
  "/banners",
  requirePermission(PERMISSIONS.BANNER_CREATE),
  validate({ body: createBannerSchema }),
  adminCmsController.createBanner
);
router.patch(
  "/banners/:id",
  requirePermission(PERMISSIONS.BANNER_UPDATE),
  validate({ params: idParamSchema, body: updateBannerSchema }),
  adminCmsController.updateBanner
);
router.delete(
  "/banners/:id",
  requirePermission(PERMISSIONS.BANNER_DELETE),
  validate({ params: idParamSchema }),
  adminCmsController.deleteBanner
);

// ==========================================
// 3. SPECIAL OFFERS
// ==========================================

router.get(
  "/special-offers",
  requirePermission(PERMISSIONS.SPECIAL_OFFER_VIEW),
  validate({ query: specialOfferQuerySchema }),
  adminCmsController.getSpecialOffers
);
router.get(
  "/special-offers/:id",
  requirePermission(PERMISSIONS.SPECIAL_OFFER_VIEW),
  validate({ params: idParamSchema }),
  adminCmsController.getSpecialOfferById
);
router.post(
  "/special-offers",
  requirePermission(PERMISSIONS.SPECIAL_OFFER_CREATE),
  validate({ body: createSpecialOfferSchema }),
  adminCmsController.createSpecialOffer
);
router.patch(
  "/special-offers/:id",
  requirePermission(PERMISSIONS.SPECIAL_OFFER_UPDATE),
  validate({ params: idParamSchema, body: updateSpecialOfferSchema }),
  adminCmsController.updateSpecialOffer
);
router.delete(
  "/special-offers/:id",
  requirePermission(PERMISSIONS.SPECIAL_OFFER_DELETE),
  validate({ params: idParamSchema }),
  adminCmsController.deleteSpecialOffer
);

export default router;
