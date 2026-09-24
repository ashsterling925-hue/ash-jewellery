import { Router } from "express";
import { productController } from "../../controllers/product.controller.js";
import { validate } from "../../validators/validate.middleware.js";
import { authenticate, requirePermission } from "../../middleware/auth.js";
import { PERMISSIONS } from "../../config/permissions.js";
import {
  createProductSchema,
  updateProductSchema,
  productQuerySchema,
  productIdParamSchema,
} from "../../validators/product.validator.js";

const router = Router();

// Protect all product management routes with authentication
router.use(authenticate);

// GET /api/v1/products - list products with filters/search/sorting/pagination
router.get(
  "/",
  requirePermission(PERMISSIONS.PRODUCT_VIEW),
  validate({ query: productQuerySchema }),
  productController.getProducts
);

// GET /api/v1/products/:id - get single product with images, category, subcategory, collection
router.get(
  "/:id",
  requirePermission(PERMISSIONS.PRODUCT_VIEW),
  validate({ params: productIdParamSchema }),
  productController.getProductById
);

// POST /api/v1/products - create product
router.post(
  "/",
  requirePermission(PERMISSIONS.PRODUCT_CREATE),
  validate({ body: createProductSchema }),
  productController.createProduct
);

// PATCH /api/v1/products/:id - update product
router.patch(
  "/:id",
  requirePermission(PERMISSIONS.PRODUCT_UPDATE),
  validate({
    params: productIdParamSchema,
    body: updateProductSchema,
  }),
  productController.updateProduct
);

// DELETE /api/v1/products/:id - delete product
router.delete(
  "/:id",
  requirePermission(PERMISSIONS.PRODUCT_DELETE),
  validate({ params: productIdParamSchema }),
  productController.deleteProduct
);

export default router;
