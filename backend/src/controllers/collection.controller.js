import { collectionService } from "../services/collection.service.js";
import { sendSuccess, sendPaginated } from "../utils/apiResponse.js";

/**
 * Collection Controller
 * Handles HTTP request/response flow for collection endpoints
 */
export const collectionController = {
  /**
   * GET /api/v1/collections
   */
  async getCollections(req, res, next) {
    try {
      const { collections, pagination } = await collectionService.getCollections(req.query);
      return sendPaginated(res, {
        message: "Collections fetched successfully",
        data: collections,
        pagination,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/collections/:id
   */
  async getCollectionById(req, res, next) {
    try {
      const collection = await collectionService.getCollectionById(req.params.id);
      return sendSuccess(res, {
        message: "Collection fetched successfully",
        data: collection,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/v1/collections
   */
  async createCollection(req, res, next) {
    try {
      const collection = await collectionService.createCollection(req.body);
      return sendSuccess(res, {
        message: "Collection created successfully",
        data: collection,
        statusCode: 201,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * PATCH /api/v1/collections/:id
   */
  async updateCollection(req, res, next) {
    try {
      const collection = await collectionService.updateCollection(req.params.id, req.body);
      return sendSuccess(res, {
        message: "Collection updated successfully",
        data: collection,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * DELETE /api/v1/collections/:id
   */
  async deleteCollection(req, res, next) {
    try {
      const result = await collectionService.deleteCollection(req.params.id);
      return sendSuccess(res, {
        message: result.message,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
};

export default collectionController;
