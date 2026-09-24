import { collectionRepository } from "../repositories/collection.repository.js";
import { slugify } from "./category.service.js";
import { ApiError } from "../utils/apiError.js";
import { getPaginationParams, formatPaginationMeta } from "../utils/pagination.js";
import { getSortParams, getSearchFilter } from "../utils/queryHelper.js";

const ALLOWED_SORT_FIELDS = ["name", "sortOrder", "createdAt", "updatedAt", "status"];

export const collectionService = {
  /**
   * List collections with filtering, search, sorting and pagination
   */
  async getCollections(query = {}) {
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
      whereConditions.push({
        status: {
          equals: query.status,
          mode: "insensitive",
        },
      });
    }

    const where = whereConditions.length > 0 ? { AND: whereConditions } : {};

    const [collections, total] = await Promise.all([
      collectionRepository.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      collectionRepository.count(where),
    ]);

    const pagination = formatPaginationMeta(total, page, limit);

    return {
      collections,
      pagination,
    };
  },

  /**
   * Get single collection by ID or Slug
   */
  async getCollectionById(idOrSlug) {
    let collection = await collectionRepository.findById(idOrSlug);
    if (!collection) {
      collection = await collectionRepository.findBySlug(idOrSlug);
    }
    if (!collection) {
      throw ApiError.notFound(`Collection "${idOrSlug}" was not found.`);
    }
    return collection;
  },

  /**
   * Create a new collection
   */
  async createCollection(payload) {
    const name = payload.name.trim();
    let slug = payload.slug ? slugify(payload.slug) : slugify(name);

    if (!slug) {
      slug = `col-${Date.now()}`;
    }

    // Check duplicate name
    const existingByName = await collectionRepository.findByName(name);
    if (existingByName) {
      throw ApiError.conflict(
        `A collection named "${name}" already exists.`,
        "DUPLICATE_NAME"
      );
    }

    // Check duplicate slug
    const existingBySlug = await collectionRepository.findBySlug(slug);
    if (existingBySlug) {
      throw ApiError.conflict(
        `A collection with slug "${slug}" already exists.`,
        "DUPLICATE_SLUG"
      );
    }

    const collectionData = {
      name,
      slug,
      description: payload.description ? payload.description.trim() : null,
      image: payload.image || null,
      mediaAssetId: payload.mediaAssetId || null,
      status: payload.status || "Active",
      sortOrder: typeof payload.sortOrder === "number" ? payload.sortOrder : 0,
      seoTitle: payload.seoTitle ? payload.seoTitle.trim() : null,
      seoDescription: payload.seoDescription ? payload.seoDescription.trim() : null,
    };

    return collectionRepository.create(collectionData);
  },

  /**
   * Update existing collection
   */
  async updateCollection(id, payload) {
    const existing = await collectionRepository.findById(id);
    if (!existing) {
      throw ApiError.notFound(`Collection with ID "${id}" was not found.`);
    }

    const updateData = {};

    if (payload.name !== undefined) {
      const name = payload.name.trim();
      if (name.toLowerCase() !== existing.name.toLowerCase()) {
        const duplicateName = await collectionRepository.findByName(name);
        if (duplicateName && duplicateName.id !== id) {
          throw ApiError.conflict(
            `A collection named "${name}" already exists.`,
            "DUPLICATE_NAME"
          );
        }
      }
      updateData.name = name;
    }

    if (payload.slug !== undefined) {
      const candidateSlug = slugify(payload.slug);
      if (candidateSlug && candidateSlug !== existing.slug) {
        const duplicateSlug = await collectionRepository.findBySlug(candidateSlug);
        if (duplicateSlug && duplicateSlug.id !== id) {
          throw ApiError.conflict(
            `A collection with slug "${candidateSlug}" already exists.`,
            "DUPLICATE_SLUG"
          );
        }
        updateData.slug = candidateSlug;
      }
    }

    if (payload.description !== undefined) {
      updateData.description = payload.description ? payload.description.trim() : null;
    }

    if (payload.image !== undefined) {
      updateData.image = payload.image || null;
    }

    if (payload.mediaAssetId !== undefined) {
      updateData.mediaAssetId = payload.mediaAssetId || null;
    }

    if (payload.status !== undefined) {
      updateData.status = payload.status;
    }

    if (payload.sortOrder !== undefined) {
      updateData.sortOrder = payload.sortOrder;
    }

    if (payload.seoTitle !== undefined) {
      updateData.seoTitle = payload.seoTitle ? payload.seoTitle.trim() : null;
    }

    if (payload.seoDescription !== undefined) {
      updateData.seoDescription = payload.seoDescription ? payload.seoDescription.trim() : null;
    }

    return collectionRepository.update(id, updateData);
  },

  /**
   * Safe delete or archive collection
   */
  async deleteCollection(id) {
    const collection = await collectionRepository.findById(id);
    if (!collection) {
      throw ApiError.notFound(`Collection with ID "${id}" was not found.`);
    }

    const { productsCount, totalReferences } =
      await collectionRepository.countRelations(id);

    // If products are linked in ProductCollection, safe archive
    if (totalReferences > 0) {
      const archived = await collectionRepository.update(id, { status: "Inactive" });
      return {
        archived: true,
        message: `Collection has ${totalReferences} linked product(s). It has been safely deactivated to Inactive status instead of deleted.`,
        collection: archived,
      };
    }

    // Otherwise clean hard delete
    await collectionRepository.delete(id);
    return {
      archived: false,
      message: `Collection "${collection.name}" was successfully deleted.`,
      collection: { id, name: collection.name },
    };
  },
};

export default collectionService;
