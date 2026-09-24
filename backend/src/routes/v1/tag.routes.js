import { Router } from "express";
import { tagController } from "../../controllers/tag.controller.js";
import { validate } from "../../validators/validate.middleware.js";
import { authenticate, requirePermission } from "../../middleware/auth.js";
import { PERMISSIONS } from "../../config/permissions.js";
import {
  createTagSchema,
  updateTagSchema,
  tagQuerySchema,
  tagIdParamSchema,
} from "../../validators/tag.validator.js";

const router = Router();

// Protect all tag management routes with authentication
router.use(authenticate);

// GET /api/v1/tags - list tags with filters/search/sorting/pagination
router.get(
  "/",
  requirePermission(PERMISSIONS.TAG_VIEW),
  validate({ query: tagQuerySchema }),
  tagController.getTags
);

// GET /api/v1/tags/:id - get single tag by ID
router.get(
  "/:id",
  requirePermission(PERMISSIONS.TAG_VIEW),
  validate({ params: tagIdParamSchema }),
  tagController.getTagById
);

// POST /api/v1/tags - create tag
router.post(
  "/",
  requirePermission(PERMISSIONS.TAG_CREATE),
  validate({ body: createTagSchema }),
  tagController.createTag
);

// PATCH /api/v1/tags/:id - update tag
router.patch(
  "/:id",
  requirePermission(PERMISSIONS.TAG_UPDATE),
  validate({
    params: tagIdParamSchema,
    body: updateTagSchema,
  }),
  tagController.updateTag
);

// DELETE /api/v1/tags/:id - safe delete/archive tag
router.delete(
  "/:id",
  requirePermission(PERMISSIONS.TAG_DELETE),
  validate({ params: tagIdParamSchema }),
  tagController.deleteTag
);

export default router;
