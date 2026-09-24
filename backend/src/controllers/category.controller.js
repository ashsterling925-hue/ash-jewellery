import { categoryService } from "../services/category.service.js";
import { sendSuccess, sendPaginated } from "../utils/apiResponse.js";
import { memoryCache } from "../utils/cache.js";

/**
 * Category Controller
 * Handles HTTP request/response flow for category endpoints
 */
export const categoryController = {
  /**
   * GET /api/v1/categories
   */
  async getCategories(req, res, next) {
    try {
      const { categories, pagination } = await categoryService.getCategories(req.query);
      return sendPaginated(res, {
        message: "Categories fetched successfully",
        data: categories,
        pagination,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/categories/:id
   */
  async getCategoryById(req, res, next) {
    try {
      const category = await categoryService.getCategoryById(req.params.id);
      return sendSuccess(res, {
        message: "Category fetched successfully",
        data: category,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/v1/categories
   */
  async createCategory(req, res, next) {
    try {
      const category = await categoryService.createCategory(req.body);
      memoryCache.flushPrefix("storefront:categories");
      return sendSuccess(res, {
        message: "Category created successfully",
        data: category,
        statusCode: 201,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * PATCH /api/v1/categories/:id
   */
  async updateCategory(req, res, next) {
    try {
      const category = await categoryService.updateCategory(req.params.id, req.body);
      memoryCache.flushPrefix("storefront:categories");
      return sendSuccess(res, {
        message: "Category updated successfully",
        data: category,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * DELETE /api/v1/categories/:id
   */
  async deleteCategory(req, res, next) {
    try {
      const result = await categoryService.deleteCategory(req.params.id);
      memoryCache.flushPrefix("storefront:categories");
      return sendSuccess(res, {
        message: result.message,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
};

export default categoryController;
