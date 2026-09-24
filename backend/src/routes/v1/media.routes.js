import { Router } from "express";
import { mediaController } from "../../controllers/media.controller.js";
import { handleMediaUpload } from "../../middleware/upload.middleware.js";
import { validate } from "../../validators/validate.middleware.js";
import { authenticate, requirePermission } from "../../middleware/auth.js";
import { PERMISSIONS } from "../../config/permissions.js";
import {
  mediaQuerySchema,
  updateMediaSchema,
  mediaIdParamSchema,
} from "../../validators/media.validator.js";

const router = Router();

// Protect all media management routes with authentication
router.use(authenticate);

// GET /api/v1/media - list media assets with filters, search, sorting, pagination
router.get(
  "/",
  requirePermission(PERMISSIONS.MEDIA_VIEW),
  validate({ query: mediaQuerySchema }),
  mediaController.getMedia
);

// GET /api/v1/media/:id - get single media asset by ID
router.get(
  "/:id",
  requirePermission(PERMISSIONS.MEDIA_VIEW),
  validate({ params: mediaIdParamSchema }),
  mediaController.getMediaById
);

// POST /api/v1/media - upload new media asset
router.post(
  "/",
  requirePermission(PERMISSIONS.MEDIA_CREATE),
  handleMediaUpload,
  mediaController.uploadMedia
);

// PATCH /api/v1/media/:id - update media metadata
router.patch(
  "/:id",
  requirePermission(PERMISSIONS.MEDIA_UPDATE),
  validate({
    params: mediaIdParamSchema,
    body: updateMediaSchema,
  }),
  mediaController.updateMedia
);

// DELETE /api/v1/media/:id - safe delete or archive media
router.delete(
  "/:id",
  requirePermission(PERMISSIONS.MEDIA_DELETE),
  validate({ params: mediaIdParamSchema }),
  mediaController.deleteMedia
);

export default router;
