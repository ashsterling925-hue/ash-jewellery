import { mediaService } from "../services/media.service.js";
import { sendSuccess, sendPaginated } from "../utils/apiResponse.js";

export const mediaController = {
  /**
   * GET /api/v1/media
   * Paginated list of media with search and filters
   */
  async getMedia(req, res, next) {
    try {
      const result = await mediaService.getMedia(req.query);
      return sendPaginated(res, {
        message: "Media assets fetched successfully",
        data: result.items,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/media/:id
   * Get single media asset by ID
   */
  async getMediaById(req, res, next) {
    try {
      const media = await mediaService.getMediaById(req.params.id);
      return sendSuccess(res, {
        message: "Media asset fetched successfully",
        data: media,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/v1/media
   * Upload a new media asset (multipart/form-data)
   */
  async uploadMedia(req, res, next) {
    try {
      const media = await mediaService.uploadMedia(req.file, req.body);
      return sendSuccess(res, {
        message: "Media uploaded successfully",
        data: media,
        statusCode: 201,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * PATCH /api/v1/media/:id
   * Update media metadata (altText, title, status)
   */
  async updateMedia(req, res, next) {
    try {
      const media = await mediaService.updateMedia(req.params.id, req.body);
      return sendSuccess(res, {
        message: "Media metadata updated successfully",
        data: media,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * DELETE /api/v1/media/:id
   * Delete or archive media
   */
  async deleteMedia(req, res, next) {
    try {
      const result = await mediaService.deleteMedia(req.params.id);
      return sendSuccess(res, {
        message: result.message,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
};

export default mediaController;
