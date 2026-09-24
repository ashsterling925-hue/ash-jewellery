import { Router } from "express";
import { subcategoryController } from "../../controllers/subcategory.controller.js";
import { validate } from "../../validators/validate.middleware.js";
import { authenticate, requirePermission } from "../../middleware/auth.js";
import { PERMISSIONS } from "../../config/permissions.js";
import {
  createSubcategorySchema,
  updateSubcategorySchema,
  subcategoryQuerySchema,
  subcategoryIdParamSchema,
} from "../../validators/subcategory.validator.js";

const router = Router();

// Protect all subcategory routes with authentication
router.use(authenticate);

// GET /api/v1/subcategories - list subcategories
router.get(
  "/",
  requirePermission(PERMISSIONS.CATEGORY_VIEW),
  validate({ query: subcategoryQuerySchema }),
  subcategoryController.getSubcategories
);

// GET /api/v1/subcategories/:id - get single subcategory
router.get(
  "/:id",
  requirePermission(PERMISSIONS.CATEGORY_VIEW),
  validate({ params: subcategoryIdParamSchema }),
  subcategoryController.getSubcategoryById
);

// POST /api/v1/subcategories - create subcategory
router.post(
  "/",
  requirePermission(PERMISSIONS.CATEGORY_CREATE),
  validate({ body: createSubcategorySchema }),
  subcategoryController.createSubcategory
);

// PATCH /api/v1/subcategories/:id - update subcategory
router.patch(
  "/:id",
  requirePermission(PERMISSIONS.CATEGORY_UPDATE),
  validate({ params: subcategoryIdParamSchema, body: updateSubcategorySchema }),
  subcategoryController.updateSubcategory
);

// DELETE /api/v1/subcategories/:id - safe delete/archive subcategory
router.delete(
  "/:id",
  requirePermission(PERMISSIONS.CATEGORY_DELETE),
  validate({ params: subcategoryIdParamSchema }),
  subcategoryController.deleteSubcategory
);

export default router;
