import { attributeService } from "../services/attribute.service.js";
import { attributeValueService } from "../services/attributeValue.service.js";
import { sendSuccess, sendPaginated } from "../utils/apiResponse.js";

/**
 * Attribute Controller
 * Handles HTTP requests for attributes and dynamic attribute values
 */
export const attributeController = {
  /**
   * GET /api/v1/attributes
   */
  async getAttributes(req, res, next) {
    try {
      const { attributes, pagination } = await attributeService.getAttributes(req.query);
      return sendPaginated(res, {
        message: "Attributes fetched successfully",
        data: attributes,
        pagination,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/attributes/:id
   */
  async getAttributeById(req, res, next) {
    try {
      const attribute = await attributeService.getAttributeById(req.params.id);
      return sendSuccess(res, {
        message: "Attribute fetched successfully",
        data: attribute,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/v1/attributes
   */
  async createAttribute(req, res, next) {
    try {
      const attribute = await attributeService.createAttribute(req.body);
      return sendSuccess(res, {
        message: "Attribute created successfully",
        data: attribute,
        statusCode: 201,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * PATCH /api/v1/attributes/:id
   */
  async updateAttribute(req, res, next) {
    try {
      const attribute = await attributeService.updateAttribute(req.params.id, req.body);
      return sendSuccess(res, {
        message: "Attribute updated successfully",
        data: attribute,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * DELETE /api/v1/attributes/:id
   */
  async deleteAttribute(req, res, next) {
    try {
      const result = await attributeService.deleteAttribute(req.params.id);
      return sendSuccess(res, {
        message: result.message,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/attributes/:attributeId/values
   */
  async getAttributeValues(req, res, next) {
    try {
      const values = await attributeValueService.getValuesByAttributeId(
        req.params.attributeId,
        req.query
      );
      return sendSuccess(res, {
        message: "Attribute values fetched successfully",
        data: values,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/attribute-values/:id
   */
  async getAttributeValueById(req, res, next) {
    try {
      const value = await attributeValueService.getValueById(req.params.id);
      return sendSuccess(res, {
        message: "Attribute value fetched successfully",
        data: value,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/v1/attributes/:attributeId/values
   */
  async createAttributeValue(req, res, next) {
    try {
      const value = await attributeValueService.createValue(
        req.params.attributeId,
        req.body
      );
      return sendSuccess(res, {
        message: "Attribute value created successfully",
        data: value,
        statusCode: 201,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * PATCH /api/v1/attribute-values/:id
   */
  async updateAttributeValue(req, res, next) {
    try {
      const value = await attributeValueService.updateValue(req.params.id, req.body);
      return sendSuccess(res, {
        message: "Attribute value updated successfully",
        data: value,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * DELETE /api/v1/attribute-values/:id
   */
  async deleteAttributeValue(req, res, next) {
    try {
      const result = await attributeValueService.deleteValue(req.params.id);
      return sendSuccess(res, {
        message: result.message,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
};

export default attributeController;
