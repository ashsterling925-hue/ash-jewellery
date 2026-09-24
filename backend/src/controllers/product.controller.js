import { productService } from "../services/product.service.js";
import { sendSuccess, sendPaginated } from "../utils/apiResponse.js";
import { memoryCache } from "../utils/cache.js";

/**
 * Product Controller
 * Handles HTTP request/response flow for product catalogue endpoints
 */
export const productController = {
  /**
   * GET /api/v1/products
   * List products with filtering, search, sorting and pagination
   */
  async getProducts(req, res, next) {
    try {
      const { products, pagination } = await productService.getProducts(req.query);
      return sendPaginated(res, {
        message: "Products fetched successfully",
        data: products,
        pagination,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/products/:id
   * Get single product by ID
   */
  async getProductById(req, res, next) {
    try {
      const product = await productService.getProductById(req.params.id);
      return sendSuccess(res, {
        message: "Product fetched successfully",
        data: product,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/v1/products
   * Create a new product
   */
  async createProduct(req, res, next) {
    try {
      const product = await productService.createProduct(req.body);
      memoryCache.flushPrefix("storefront:product");
      memoryCache.flushPrefix("storefront:merchandising");
      return sendSuccess(res, {
        message: "Product created successfully",
        data: product,
        statusCode: 201,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * PATCH /api/v1/products/:id
   * Update existing product
   */
  async updateProduct(req, res, next) {
    try {
      const product = await productService.updateProduct(req.params.id, req.body);
      memoryCache.flushPrefix("storefront:product");
      memoryCache.flushPrefix("storefront:merchandising");
      return sendSuccess(res, {
        message: "Product updated successfully",
        data: product,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * DELETE /api/v1/products/:id
   * Delete product
   */
  async deleteProduct(req, res, next) {
    try {
      const result = await productService.deleteProduct(req.params.id);
      memoryCache.flushPrefix("storefront:product");
      memoryCache.flushPrefix("storefront:merchandising");
      return sendSuccess(res, {
        message: result.message,
        data: result.product,
      });
    } catch (error) {
      next(error);
    }
  },
};

export default productController;
