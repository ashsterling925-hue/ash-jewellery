import { Router } from "express";
import { attributeController } from "../../controllers/attribute.controller.js";
import { validate } from "../../validators/validate.middleware.js";
import { authenticate, requirePermission } from "../../middleware/auth.js";
import { PERMISSIONS } from "../../config/permissions.js";
import {
  updateAttributeValueSchema,
  attributeValueIdParamSchema,
} from "../../validators/attribute.validator.js";

const router = Router();

// Protect all attribute value management routes with authentication
router.use(authenticate);

// GET /api/v1/attribute-values/:id - get single attribute value
router.get(
  "/:id",
  requirePermission(PERMISSIONS.ATTRIBUTE_VIEW),
  validate({ params: attributeValueIdParamSchema }),
  attributeController.getAttributeValueById
);

// PATCH /api/v1/attribute-values/:id - update attribute value
router.patch(
  "/:id",
  requirePermission(PERMISSIONS.ATTRIBUTE_UPDATE),
  validate({
    params: attributeValueIdParamSchema,
    body: updateAttributeValueSchema,
  }),
  attributeController.updateAttributeValue
);

// DELETE /api/v1/attribute-values/:id - delete attribute value
router.delete(
  "/:id",
  requirePermission(PERMISSIONS.ATTRIBUTE_DELETE),
  validate({ params: attributeValueIdParamSchema }),
  attributeController.deleteAttributeValue
);

export default router;
