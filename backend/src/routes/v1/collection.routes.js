import { Router } from "express";
import { collectionController } from "../../controllers/collection.controller.js";
import { validate } from "../../validators/validate.middleware.js";
import { authenticate, requirePermission } from "../../middleware/auth.js";
import { PERMISSIONS } from "../../config/permissions.js";
import {
  createCollectionSchema,
  updateCollectionSchema,
  collectionQuerySchema,
  collectionIdParamSchema,
} from "../../validators/collection.validator.js";

const router = Router();

// Protect all collection management routes with authentication
router.use(authenticate);

// GET /api/v1/collections - list collections with filters/search/sorting/pagination
router.get(
  "/",
  requirePermission(PERMISSIONS.COLLECTION_VIEW),
  validate({ query: collectionQuerySchema }),
  collectionController.getCollections
);

// GET /api/v1/collections/:id - get single collection
router.get(
  "/:id",
  requirePermission(PERMISSIONS.COLLECTION_VIEW),
  validate({ params: collectionIdParamSchema }),
  collectionController.getCollectionById
);

// POST /api/v1/collections - create collection
router.post(
  "/",
  requirePermission(PERMISSIONS.COLLECTION_CREATE),
  validate({ body: createCollectionSchema }),
  collectionController.createCollection
);

// PATCH /api/v1/collections/:id - update collection
router.patch(
  "/:id",
  requirePermission(PERMISSIONS.COLLECTION_UPDATE),
  validate({
    params: collectionIdParamSchema,
    body: updateCollectionSchema,
  }),
  collectionController.updateCollection
);

// DELETE /api/v1/collections/:id - safe delete/archive collection
router.delete(
  "/:id",
  requirePermission(PERMISSIONS.COLLECTION_DELETE),
  validate({ params: collectionIdParamSchema }),
  collectionController.deleteCollection
);

export default router;
