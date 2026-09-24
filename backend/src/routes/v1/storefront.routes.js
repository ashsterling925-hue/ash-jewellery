import { Router } from "express";
import { storefrontController } from "../../controllers/storefront.controller.js";
import { validate } from "../../validators/validate.middleware.js";
import { productQuerySchema } from "../../validators/product.validator.js";
import { categoryQuerySchema } from "../../validators/category.validator.js";
import { collectionQuerySchema } from "../../validators/collection.validator.js";

const router = Router();

// Products
router.get(
  "/products",
  validate({ query: productQuerySchema }),
  storefrontController.getProducts
);

router.get(
  "/products/:slug",
  storefrontController.getProductBySlug
);

// Categories
router.get(
  "/categories",
  validate({ query: categoryQuerySchema }),
  storefrontController.getCategories
);

router.get(
  "/categories/:slug",
  storefrontController.getCategoryBySlug
);

// Subcategories
router.get(
  "/subcategories/:slug",
  storefrontController.getSubcategoryBySlug
);

// Collections
router.get(
  "/collections",
  validate({ query: collectionQuerySchema }),
  storefrontController.getCollections
);

router.get(
  "/collections/:slug",
  storefrontController.getCollectionBySlug
);

// Filterable Attributes
router.get(
  "/filters",
  storefrontController.getFilterableAttributes
);

// Homepage CMS — Hero, Promotional Banners, Special Offers, Merchandising Products
router.get("/hero", storefrontController.getHero);
router.get("/banners", storefrontController.getBanners);
router.get("/special-offers", storefrontController.getSpecialOffers);
router.get("/merchandising", storefrontController.getHomepageMerchandising);
router.get("/homepage/merchandising", storefrontController.getHomepageMerchandising);
router.get("/signature-collections", storefrontController.getSignatureCollections);

export default router;
