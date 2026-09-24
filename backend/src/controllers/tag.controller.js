import { tagService } from "../services/tag.service.js";
import { sendSuccess, sendPaginated } from "../utils/apiResponse.js";

/**
 * Tag Controller
 * Handles HTTP request/response flow for Tag catalogue endpoints
 */
export const tagController = {
  /**
   * GET /api/v1/tags
   * List tags with filtering, search, sorting and pagination
   */
  async getTags(req, res, next) {
    try {
      const { tags, pagination } = await tagService.getTags(req.query);
      return sendPaginated(res, {
        message: "Tags fetched successfully",
        data: tags,
        pagination,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/tags/:id
   * Get single tag by ID
   */
  async getTagById(req, res, next) {
    try {
      const tag = await tagService.getTagById(req.params.id);
      return sendSuccess(res, {
        message: "Tag fetched successfully",
        data: tag,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/v1/tags
   * Create a new tag
   */
  async createTag(req, res, next) {
    try {
      const tag = await tagService.createTag(req.body);
      return sendSuccess(res, {
        message: "Tag created successfully",
        data: tag,
        statusCode: 201,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * PATCH /api/v1/tags/:id
   * Update an existing tag
   */
  async updateTag(req, res, next) {
    try {
      const tag = await tagService.updateTag(req.params.id, req.body);
      return sendSuccess(res, {
        message: "Tag updated successfully",
        data: tag,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * DELETE /api/v1/tags/:id
   * Safe delete or archive tag
   */
  async deleteTag(req, res, next) {
    try {
      const result = await tagService.deleteTag(req.params.id);
      return sendSuccess(res, {
        message: result.message,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
};

export default tagController;
