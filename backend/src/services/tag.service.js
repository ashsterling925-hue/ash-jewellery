import { tagRepository } from "../repositories/tag.repository.js";
import { ApiError } from "../utils/apiError.js";
import { getPaginationParams, formatPaginationMeta } from "../utils/pagination.js";
import { getSortParams, getSearchFilter } from "../utils/queryHelper.js";
import { slugify } from "./category.service.js";

const ALLOWED_SORT_FIELDS = ["name", "sortOrder", "createdAt", "updatedAt", "status"];

export const tagService = {
  /**
   * List tags with filtering, search, sorting and pagination
   */
  async getTags(query = {}) {
    const { page, limit, skip } = getPaginationParams(query);
    const orderBy = getSortParams(query, ALLOWED_SORT_FIELDS, { sortOrder: "asc" });

    const whereConditions = [];

    // Search filter across name, slug
    const searchFilter = getSearchFilter(query.search, ["name", "slug"]);
    if (searchFilter) {
      whereConditions.push(searchFilter);
    }

    // Status filter
    if (query.status && query.status !== "All") {
      whereConditions.push({
        status: {
          equals: query.status,
          mode: "insensitive",
        },
      });
    }

    const where = whereConditions.length > 0 ? { AND: whereConditions } : {};

    const [tags, total] = await Promise.all([
      tagRepository.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      tagRepository.count(where),
    ]);

    const pagination = formatPaginationMeta(total, page, limit);

    return {
      tags,
      pagination,
    };
  },

  /**
   * Get single tag by ID
   */
  async getTagById(id) {
    const tag = await tagRepository.findById(id);
    if (!tag) {
      throw ApiError.notFound(`Tag with ID "${id}" was not found.`, [], "TAG_NOT_FOUND");
    }
    return tag;
  },

  /**
   * Create a new tag
   */
  async createTag(data) {
    const name = data.name.trim();
    let slug = data.slug ? slugify(data.slug) : slugify(name);

    if (!slug) {
      slug = slugify(name);
    }

    // Check duplicate slug
    const existingSlug = await tagRepository.findBySlug(slug);
    if (existingSlug) {
      throw ApiError.conflict(
        `A tag with slug "${slug}" already exists.`,
        [{ field: "slug", message: "Slug must be unique" }],
        "DUPLICATE_SLUG"
      );
    }

    // Check duplicate name
    const existingName = await tagRepository.findByName(name);
    if (existingName) {
      throw ApiError.conflict(
        `A tag with name "${name}" already exists.`,
        [{ field: "name", message: "Tag name must be unique" }],
        "DUPLICATE_NAME"
      );
    }

    const tagData = {
      name,
      slug,
      description: data.description ? data.description.trim() : null,
      status: data.status || "Active",
      sortOrder: typeof data.sortOrder === "number" ? data.sortOrder : 0,
    };

    return tagRepository.create(tagData);
  },

  /**
   * Update existing tag
   */
  async updateTag(id, data) {
    const existing = await tagRepository.findById(id);
    if (!existing) {
      throw ApiError.notFound(`Tag with ID "${id}" was not found.`, [], "TAG_NOT_FOUND");
    }

    const updatePayload = {};

    // Validate and update name if provided
    if (data.name !== undefined) {
      const name = data.name.trim();
      const duplicateName = await tagRepository.findByName(name);
      if (duplicateName && duplicateName.id !== id) {
        throw ApiError.conflict(
          `A tag with name "${name}" already exists.`,
          [{ field: "name", message: "Tag name must be unique" }],
          "DUPLICATE_NAME"
        );
      }
      updatePayload.name = name;
    }

    // Validate and update slug if provided
    if (data.slug !== undefined) {
      const slug = slugify(data.slug);
      const duplicateSlug = await tagRepository.findBySlug(slug);
      if (duplicateSlug && duplicateSlug.id !== id) {
        throw ApiError.conflict(
          `A tag with slug "${slug}" already exists.`,
          [{ field: "slug", message: "Slug must be unique" }],
          "DUPLICATE_SLUG"
        );
      }
      updatePayload.slug = slug;
    }

    if (data.description !== undefined) {
      updatePayload.description = data.description ? data.description.trim() : null;
    }

    if (data.status !== undefined) {
      updatePayload.status = data.status;
    }

    if (data.sortOrder !== undefined) {
      updatePayload.sortOrder = typeof data.sortOrder === "number" ? data.sortOrder : 0;
    }

    return tagRepository.update(id, updatePayload);
  },

  /**
   * Safe delete or archive tag
   */
  async deleteTag(id) {
    const existing = await tagRepository.findById(id);
    if (!existing) {
      throw ApiError.notFound(`Tag with ID "${id}" was not found.`, [], "TAG_NOT_FOUND");
    }

    const usageCount = await tagRepository.countUsage(id);

    // If tag is linked to products, archive to Inactive to protect data integrity
    if (usageCount > 0) {
      const archivedTag = await tagRepository.update(id, { status: "Inactive" });
      return {
        message: `Tag "${existing.name}" is assigned to ${usageCount} product(s) and was safely archived to Inactive.`,
        tag: archivedTag,
        archived: true,
      };
    }

    // Clean delete if no relations exist
    await tagRepository.delete(id);
    return {
      message: `Tag "${existing.name}" was deleted successfully.`,
      id,
      archived: false,
    };
  },
};

export default tagService;
