import { subcategoryService } from "../services/subcategory.service.js";
import { sendSuccess, sendPaginated } from "../utils/apiResponse.js";

/**
 * Subcategory Controller
 * Handles HTTP request/response flow for subcategory endpoints
 */
export const subcategoryController = {
  /**
   * GET /api/v1/subcategories
   */
  async getSubcategories(req, res, next) {
    try {
      const { subcategories, pagination } = await subcategoryService.getSubcategories(req.query);
      return sendPaginated(res, {
        message: "Subcategories fetched successfully",
        data: subcategories,
        pagination,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/subcategories/:id
   */
  async getSubcategoryById(req, res, next) {
    try {
      const subcategory = await subcategoryService.getSubcategoryById(req.params.id);
      return sendSuccess(res, {
        message: "Subcategory fetched successfully",
        data: subcategory,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/categories/:categoryId/subcategories
   */
  async getSubcategoriesByCategory(req, res, next) {
    try {
      const result = await subcategoryService.getSubcategoriesByCategory(req.params.categoryId);
      return sendSuccess(res, {
        message: `Subcategories for category "${result.category.name}" fetched successfully`,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/v1/subcategories
   */
  async createSubcategory(req, res, next) {
    try {
      const subcategory = await subcategoryService.createSubcategory(req.body);
      return sendSuccess(res, {
        message: "Subcategory created successfully",
        data: subcategory,
        statusCode: 201,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * PATCH /api/v1/subcategories/:id
   */
  async updateSubcategory(req, res, next) {
    try {
      const subcategory = await subcategoryService.updateSubcategory(req.params.id, req.body);
      return sendSuccess(res, {
        message: "Subcategory updated successfully",
        data: subcategory,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * DELETE /api/v1/subcategories/:id
   */
  async deleteSubcategory(req, res, next) {
    try {
      const result = await subcategoryService.deleteSubcategory(req.params.id);
      return sendSuccess(res, {
        message: result.message,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
};

export default subcategoryController;
