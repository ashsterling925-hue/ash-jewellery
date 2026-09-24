import { attributeRepository } from "../repositories/attribute.repository.js";
import { slugify } from "./category.service.js";
import { ApiError } from "../utils/apiError.js";
import { getPaginationParams, formatPaginationMeta } from "../utils/pagination.js";
import { getSortParams, getSearchFilter } from "../utils/queryHelper.js";

const ALLOWED_SORT_FIELDS = ["name", "slug", "sortOrder", "createdAt", "updatedAt"];

export const attributeService = {
  /**
   * List attributes with search, filtering, sorting, pagination
   */
  async getAttributes(query = {}) {
    const { page, limit, skip } = getPaginationParams(query);
    const orderBy = getSortParams(query, ALLOWED_SORT_FIELDS, { sortOrder: "asc" });

    const whereConditions = [];

    // Search filter across name, slug, description
    const searchFilter = getSearchFilter(query.search, ["name", "slug", "description"]);
    if (searchFilter) {
      whereConditions.push(searchFilter);
    }

    // Status filter
    if (query.status && query.status !== "All") {
      whereConditions.push({ status: query.status });
    }

    // Filterable filter
    if (query.filterable !== undefined) {
      whereConditions.push({ filterable: query.filterable });
    }

    const where = whereConditions.length > 0 ? { AND: whereConditions } : {};

    const [attributes, total] = await Promise.all([
      attributeRepository.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        includeValues: query.includeValues === true || query.includeValues === "true",
      }),
      attributeRepository.count(where),
    ]);

    const pagination = formatPaginationMeta(total, page, limit);

    // If active attributes are requested, ensure only active values are returned
    let formattedAttributes = attributes;
    if (query.status === "Active" || query.onlyActiveValues) {
      formattedAttributes = attributes.map((attr) => ({
        ...attr,
        values: attr.values ? attr.values.filter((v) => v.status === "Active") : attr.values,
      }));
    }

    return {
      attributes: formattedAttributes,
      pagination,
    };
  },

  /**
   * Get single attribute by ID with all values
   */
  async getAttributeById(id) {
    const attribute = await attributeRepository.findById(id);
    if (!attribute) {
      throw ApiError.notFound(`Attribute with ID "${id}" was not found.`);
    }
    return attribute;
  },

  /**
   * Create a new attribute with optional initial values
   */
  async createAttribute(payload) {
    const name = payload.name.trim();
    let slug = payload.slug ? slugify(payload.slug) : slugify(name);

    if (!slug) {
      slug = `attr-${Date.now()}`;
    }

    // Check slug uniqueness
    const existingSlug = await attributeRepository.findBySlug(slug);
    if (existingSlug) {
      throw ApiError.conflict(
        `An attribute with slug "${slug}" already exists.`,
        "DUPLICATE_ATTRIBUTE_SLUG"
      );
    }

    // Check name uniqueness
    const existingName = await attributeRepository.findByName(name);
    if (existingName) {
      throw ApiError.conflict(
        `An attribute with name "${name}" already exists.`,
        "DUPLICATE_ATTRIBUTE_NAME"
      );
    }

    const attributeData = {
      name,
      slug,
      code: slug, // total backward compatibility
      description: payload.description?.trim() || null,
      status: payload.status || "Active",
      selectionType: payload.selectionType || "SINGLE",
      filterable: payload.filterable !== undefined ? Boolean(payload.filterable) : true,
      sortOrder: payload.sortOrder !== undefined ? Number(payload.sortOrder) : 0,
    };

    return attributeRepository.create(attributeData, payload.values || []);
  },

  /**
   * Update an existing attribute
   */
  async updateAttribute(id, payload) {
    const existing = await attributeRepository.findById(id);
    if (!existing) {
      throw ApiError.notFound(`Attribute with ID "${id}" was not found.`);
    }

    const updateData = {};

    if (payload.name !== undefined) {
      const name = payload.name.trim();
      if (name.toLowerCase() !== existing.name.toLowerCase()) {
        const duplicateName = await attributeRepository.findByName(name);
        if (duplicateName && duplicateName.id !== id) {
          throw ApiError.conflict(
            `An attribute with name "${name}" already exists.`,
            "DUPLICATE_ATTRIBUTE_NAME"
          );
        }
      }
      updateData.name = name;
    }

    if (payload.slug !== undefined) {
      const candidateSlug = slugify(payload.slug);
      if (candidateSlug && candidateSlug !== existing.slug) {
        const duplicateSlug = await attributeRepository.findBySlug(candidateSlug);
        if (duplicateSlug && duplicateSlug.id !== id) {
          throw ApiError.conflict(
            `An attribute with slug "${candidateSlug}" already exists.`,
            "DUPLICATE_ATTRIBUTE_SLUG"
          );
        }
        updateData.slug = candidateSlug;
        updateData.code = candidateSlug;
      }
    }

    if (payload.description !== undefined) {
      updateData.description = payload.description?.trim() || null;
    }

    if (payload.status !== undefined) {
      updateData.status = payload.status;
    }

    if (payload.selectionType !== undefined) {
      updateData.selectionType = payload.selectionType;
    }

    if (payload.filterable !== undefined) {
      updateData.filterable = Boolean(payload.filterable);
    }

    if (payload.sortOrder !== undefined) {
      updateData.sortOrder = Number(payload.sortOrder);
    }

    return attributeRepository.update(id, updateData);
  },

  /**
   * Safe delete/archive attribute
   */
  async deleteAttribute(id) {
    const existing = await attributeRepository.findById(id);
    if (!existing) {
      throw ApiError.notFound(`Attribute with ID "${id}" was not found.`);
    }

    // Check usage in products
    const usageCount = await attributeRepository.countUsage(id);
    if (usageCount > 0) {
      // Archive instead of hard delete
      await attributeRepository.update(id, { status: "Inactive" });
      return {
        message: `Attribute "${existing.name}" is assigned to ${usageCount} product(s) and cannot be permanently deleted. It has been deactivated.`,
        archived: true,
        id,
      };
    }

    // Safe to delete physically
    await attributeRepository.delete(id);
    return {
      message: `Attribute "${existing.name}" was successfully deleted.`,
      archived: false,
      id,
    };
  },
};

export default attributeService;
