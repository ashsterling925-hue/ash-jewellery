import { attributeRepository } from "../repositories/attribute.repository.js";
import { attributeValueRepository } from "../repositories/attributeValue.repository.js";
import { slugify } from "./category.service.js";
import { ApiError } from "../utils/apiError.js";

export const attributeValueService = {
  /**
   * Get all values belonging to an attribute
   */
  async getValuesByAttributeId(attributeId, query = {}) {
    const attribute = await attributeRepository.findById(attributeId);
    if (!attribute) {
      throw ApiError.notFound(`Attribute with ID "${attributeId}" was not found.`);
    }

    const where = {};
    if (query.status && query.status !== "All") {
      where.status = query.status;
    }
    if (query.search) {
      where.OR = [
        { value: { contains: query.search.trim(), mode: "insensitive" } },
        { slug: { contains: query.search.trim(), mode: "insensitive" } },
      ];
    }

    const values = await attributeValueRepository.findByAttributeId(attributeId, { where });
    return values;
  },

  /**
   * Get single attribute value by ID
   */
  async getValueById(id) {
    const value = await attributeValueRepository.findById(id);
    if (!value) {
      throw ApiError.notFound(`Attribute value with ID "${id}" was not found.`);
    }
    return value;
  },

  /**
   * Create an attribute value under a parent attribute
   */
  async createValue(attributeId, payload) {
    const attribute = await attributeRepository.findById(attributeId);
    if (!attribute) {
      throw ApiError.notFound(`Attribute with ID "${attributeId}" was not found.`);
    }

    const value = payload.value.trim();
    let slug = payload.slug ? slugify(payload.slug) : slugify(value);

    if (!slug) {
      slug = `val-${Date.now()}`;
    }

    // Check duplicate value under same attribute
    const existingValue = await attributeValueRepository.findByValueAndAttribute(attributeId, value);
    if (existingValue) {
      throw ApiError.conflict(
        `Attribute "${attribute.name}" already has a value "${value}".`,
        "DUPLICATE_ATTRIBUTE_VALUE"
      );
    }

    // Check duplicate slug under same attribute
    const existingSlug = await attributeValueRepository.findBySlugAndAttribute(attributeId, slug);
    if (existingSlug) {
      throw ApiError.conflict(
        `Attribute "${attribute.name}" already has a value with slug "${slug}".`,
        "DUPLICATE_ATTRIBUTE_VALUE_SLUG"
      );
    }

    const valueData = {
      attributeId,
      value,
      slug,
      status: payload.status || "Active",
      sortOrder: payload.sortOrder !== undefined ? Number(payload.sortOrder) : 0,
    };

    return attributeValueRepository.create(valueData);
  },

  /**
   * Update an attribute value
   */
  async updateValue(id, payload) {
    const existing = await attributeValueRepository.findById(id);
    if (!existing) {
      throw ApiError.notFound(`Attribute value with ID "${id}" was not found.`);
    }

    const updateData = {};

    if (payload.value !== undefined) {
      const value = payload.value.trim();
      if (value.toLowerCase() !== existing.value.toLowerCase()) {
        const duplicateValue = await attributeValueRepository.findByValueAndAttribute(
          existing.attributeId,
          value
        );
        if (duplicateValue && duplicateValue.id !== id) {
          throw ApiError.conflict(
            `Attribute "${existing.attribute.name}" already has a value "${value}".`,
            "DUPLICATE_ATTRIBUTE_VALUE"
          );
        }
      }
      updateData.value = value;
    }

    if (payload.slug !== undefined) {
      const candidateSlug = slugify(payload.slug);
      if (candidateSlug && candidateSlug !== existing.slug) {
        const duplicateSlug = await attributeValueRepository.findBySlugAndAttribute(
          existing.attributeId,
          candidateSlug
        );
        if (duplicateSlug && duplicateSlug.id !== id) {
          throw ApiError.conflict(
            `Attribute "${existing.attribute.name}" already has a value with slug "${candidateSlug}".`,
            "DUPLICATE_ATTRIBUTE_VALUE_SLUG"
          );
        }
        updateData.slug = candidateSlug;
      }
    }

    if (payload.status !== undefined) {
      updateData.status = payload.status;
    }

    if (payload.sortOrder !== undefined) {
      updateData.sortOrder = Number(payload.sortOrder);
    }

    return attributeValueRepository.update(id, updateData);
  },

  /**
   * Safe delete/archive attribute value
   */
  async deleteValue(id) {
    const existing = await attributeValueRepository.findById(id);
    if (!existing) {
      throw ApiError.notFound(`Attribute value with ID "${id}" was not found.`);
    }

    const usageCount = await attributeValueRepository.countUsage(id);
    if (usageCount > 0) {
      await attributeValueRepository.update(id, { status: "Inactive" });
      return {
        message: `Attribute value "${existing.value}" is assigned to ${usageCount} product(s) and cannot be permanently deleted. It has been deactivated.`,
        archived: true,
        id,
      };
    }

    await attributeValueRepository.delete(id);
    return {
      message: `Attribute value "${existing.value}" was successfully deleted.`,
      archived: false,
      id,
    };
  },
};

export default attributeValueService;
