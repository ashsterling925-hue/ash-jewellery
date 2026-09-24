import { Router } from "express";
import { categoryController } from "../../controllers/category.controller.js";
import { subcategoryController } from "../../controllers/subcategory.controller.js";
import { validate } from "../../validators/validate.middleware.js";
import { authenticate, requirePermission } from "../../middleware/auth.js";
import { PERMISSIONS } from "../../config/permissions.js";
import {
  createCategorySchema,
  updateCategorySchema,
  categoryQuerySchema,
  idParamSchema,
} from "../../validators/category.validator.js";
import { categoryIdParamSchema } from "../../validators/subcategory.validator.js";

const router = Router();

// Protect all category management routes with authentication
router.use(authenticate);

// GET /api/v1/categories - list categories
router.get(
  "/",
  requirePermission(PERMISSIONS.CATEGORY_VIEW),
  validate({ query: categoryQuerySchema }),
  categoryController.getCategories
);

// GET /api/v1/categories/:id - get single category
router.get(
  "/:id",
  requirePermission(PERMISSIONS.CATEGORY_VIEW),
  validate({ params: idParamSchema }),
  categoryController.getCategoryById
);

// GET /api/v1/categories/:categoryId/subcategories - get subcategories of a category
router.get(
  "/:categoryId/subcategories",
  requirePermission(PERMISSIONS.CATEGORY_VIEW),
  validate({ params: categoryIdParamSchema }),
  subcategoryController.getSubcategoriesByCategory
);

// POST /api/v1/categories - create category
router.post(
  "/",
  requirePermission(PERMISSIONS.CATEGORY_CREATE),
  validate({ body: createCategorySchema }),
  categoryController.createCategory
);

// PATCH /api/v1/categories/:id - update category
router.patch(
  "/:id",
  requirePermission(PERMISSIONS.CATEGORY_UPDATE),
  validate({ params: idParamSchema, body: updateCategorySchema }),
  categoryController.updateCategory
);

// DELETE /api/v1/categories/:id - safe delete/archive category
router.delete(
  "/:id",
  requirePermission(PERMISSIONS.CATEGORY_DELETE),
  validate({ params: idParamSchema }),
  categoryController.deleteCategory
);

export default router;
