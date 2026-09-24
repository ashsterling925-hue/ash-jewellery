import { Router } from "express";
import { attributeController } from "../../controllers/attribute.controller.js";
import { validate } from "../../validators/validate.middleware.js";
import { authenticate, requirePermission } from "../../middleware/auth.js";
import { PERMISSIONS } from "../../config/permissions.js";
import {
  createAttributeSchema,
  updateAttributeSchema,
  attributeQuerySchema,
  attributeIdParamSchema,
  createAttributeValueSchema,
  attributeValueParentParamSchema,
  attributeValueQuerySchema,
} from "../../validators/attribute.validator.js";

const router = Router();

// Protect all attribute management routes with authentication
router.use(authenticate);

// GET /api/v1/attributes - list attributes with filters/search/sorting/pagination
router.get(
  "/",
  requirePermission(PERMISSIONS.ATTRIBUTE_VIEW),
  validate({ query: attributeQuerySchema }),
  attributeController.getAttributes
);

// GET /api/v1/attributes/:id - get single attribute by ID with values
router.get(
  "/:id",
  requirePermission(PERMISSIONS.ATTRIBUTE_VIEW),
  validate({ params: attributeIdParamSchema }),
  attributeController.getAttributeById
);

// POST /api/v1/attributes - create attribute
router.post(
  "/",
  requirePermission(PERMISSIONS.ATTRIBUTE_CREATE),
  validate({ body: createAttributeSchema }),
  attributeController.createAttribute
);

// PATCH /api/v1/attributes/:id - update attribute
router.patch(
  "/:id",
  requirePermission(PERMISSIONS.ATTRIBUTE_UPDATE),
  validate({
    params: attributeIdParamSchema,
    body: updateAttributeSchema,
  }),
  attributeController.updateAttribute
);

// DELETE /api/v1/attributes/:id - safe delete/archive attribute
router.delete(
  "/:id",
  requirePermission(PERMISSIONS.ATTRIBUTE_DELETE),
  validate({ params: attributeIdParamSchema }),
  attributeController.deleteAttribute
);

// ==============================================================================
// Nested Attribute Values Endpoints
// ==============================================================================

// GET /api/v1/attributes/:attributeId/values - list values of an attribute
router.get(
  "/:attributeId/values",
  requirePermission(PERMISSIONS.ATTRIBUTE_VIEW),
  validate({
    params: attributeValueParentParamSchema,
    query: attributeValueQuerySchema,
  }),
  attributeController.getAttributeValues
);

// POST /api/v1/attributes/:attributeId/values - create attribute value
router.post(
  "/:attributeId/values",
  requirePermission(PERMISSIONS.ATTRIBUTE_CREATE),
  validate({
    params: attributeValueParentParamSchema,
    body: createAttributeValueSchema,
  }),
  attributeController.createAttributeValue
);

export default router;
