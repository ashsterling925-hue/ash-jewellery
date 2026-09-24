import { subcategoryRepository } from "../repositories/subcategory.repository.js";
import { categoryRepository } from "../repositories/category.repository.js";
import { slugify } from "./category.service.js";
import { ApiError } from "../utils/apiError.js";
import { getPaginationParams, formatPaginationMeta } from "../utils/pagination.js";
import { getSortParams, getSearchFilter } from "../utils/queryHelper.js";

const ALLOWED_SORT_FIELDS = ["name", "sortOrder", "createdAt", "updatedAt", "status"];

export const subcategoryService = {
  /**
   * List subcategories with filtering, search, sorting and pagination
   */
  async getSubcategories(query = {}) {
    const { page, limit, skip } = getPaginationParams(query);
    const orderBy = getSortParams(query, ALLOWED_SORT_FIELDS, { sortOrder: "asc" });

    const whereConditions = [];

    // Search filter
    const searchFilter = getSearchFilter(query.search, ["name", "slug", "description"]);
    if (searchFilter) {
      whereConditions.push(searchFilter);
    }

    // Category filter
    if (query.categoryId && query.categoryId !== "All") {
      whereConditions.push({ categoryId: query.categoryId });
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

    const [subcategories, total] = await Promise.all([
      subcategoryRepository.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      subcategoryRepository.count(where),
    ]);

    const pagination = formatPaginationMeta(total, page, limit);

    return {
      subcategories,
      pagination,
    };
  },

  /**
   * Get subcategories belonging to a specific category
   */
  async getSubcategoriesByCategory(categoryId) {
    const category = await categoryRepository.findById(categoryId);
    if (!category) {
      throw ApiError.notFound(`Category with ID "${categoryId}" was not found.`);
    }

    const subcategories = await subcategoryRepository.findMany({
      where: { categoryId },
      orderBy: { sortOrder: "asc" },
    });

    return {
      category: {
        id: category.id,
        name: category.name,
        slug: category.slug,
      },
      subcategories,
    };
  },

  /**
   * Get subcategory by ID or Slug
   */
  async getSubcategoryById(idOrSlug) {
    let subcategory = await subcategoryRepository.findById(idOrSlug);
    if (!subcategory) {
      subcategory = await subcategoryRepository.findBySlug(idOrSlug);
    }
    if (!subcategory) {
      throw ApiError.notFound(`Subcategory "${idOrSlug}" was not found.`);
    }
    return subcategory;
  },

  /**
   * Create a new subcategory
   */
  async createSubcategory(payload) {
    const { categoryId, name: rawName, slug: rawSlug } = payload;
    const name = rawName.trim();

    // Verify category exists by ID, slug, or name
    let category = await categoryRepository.findById(categoryId);
    if (!category) {
      category = await categoryRepository.findBySlug(categoryId);
    }
    if (!category) {
      category = await categoryRepository.findByName(categoryId);
    }
    if (!category) {
      throw ApiError.badRequest(
        `Category with ID or slug "${categoryId}" does not exist. A valid category is required.`,
        [],
        "INVALID_CATEGORY_ID"
      );
    }
    const resolvedCategoryId = category.id;

    // Generate clean base slug
    let baseSlug = rawSlug ? slugify(rawSlug) : slugify(name);
    if (!baseSlug) {
      baseSlug = `subcat-${Date.now()}`;
    }

    // Ensure slug uniqueness across the catalog
    let slug = baseSlug;
    let counter = 1;
    while (await subcategoryRepository.findBySlug(slug)) {
      counter++;
      slug = `${baseSlug}-${counter}`;
    }

    // Check duplicate name within the same category
    const existingByName = await subcategoryRepository.findByNameAndCategory(name, resolvedCategoryId);
    if (existingByName) {
      throw ApiError.conflict(
        `A subcategory named "${name}" already exists in category "${category.name}".`,
        "DUPLICATE_NAME"
      );
    }

    const subcategoryData = {
      categoryId: resolvedCategoryId,
      name,
      slug,
      description: payload.description ? payload.description.trim() : null,
      status: payload.status || "Active",
      sortOrder: typeof payload.sortOrder === "number" ? payload.sortOrder : 0,
      seoTitle: payload.seoTitle ? payload.seoTitle.trim() : null,
      seoDescription: payload.seoDescription ? payload.seoDescription.trim() : null,
    };

    return subcategoryRepository.create(subcategoryData);
  },

  /**
   * Update existing subcategory
   */
  async updateSubcategory(id, payload) {
    const existing = await subcategoryRepository.findById(id);
    if (!existing) {
      throw ApiError.notFound(`Subcategory with ID "${id}" was not found.`);
    }

    const targetCategoryId = payload.categoryId || existing.categoryId;

    // If categoryId is changing, verify new category exists
    if (payload.categoryId && payload.categoryId !== existing.categoryId) {
      let newCategory = await categoryRepository.findById(payload.categoryId);
      if (!newCategory) newCategory = await categoryRepository.findBySlug(payload.categoryId);
      if (!newCategory) newCategory = await categoryRepository.findByName(payload.categoryId);
      if (!newCategory) {
        throw ApiError.badRequest(
          `Category with ID or slug "${payload.categoryId}" does not exist.`,
          [],
          "INVALID_CATEGORY_ID"
        );
      }
      payload.categoryId = newCategory.id;
    }

    const updateData = {};

    if (payload.name !== undefined) {
      const name = payload.name.trim();
      if (name.toLowerCase() !== existing.name.toLowerCase() || payload.categoryId) {
        const duplicate = await subcategoryRepository.findByNameAndCategory(name, targetCategoryId);
        if (duplicate && duplicate.id !== id) {
          throw ApiError.conflict(
            `A subcategory named "${name}" already exists in this category.`,
            "DUPLICATE_NAME"
          );
        }
      }
      updateData.name = name;
    }

    if (payload.slug !== undefined) {
      const candidateSlug = slugify(payload.slug);
      if (candidateSlug && candidateSlug !== existing.slug) {
        const duplicate = await subcategoryRepository.findBySlug(candidateSlug);
        if (duplicate && duplicate.id !== id) {
          throw ApiError.conflict(
            `A subcategory with slug "${candidateSlug}" already exists.`,
            "DUPLICATE_SLUG"
          );
        }
        updateData.slug = candidateSlug;
      }
    }

    if (payload.categoryId !== undefined) {
      updateData.categoryId = payload.categoryId;
    }

    if (payload.description !== undefined) {
      updateData.description = payload.description ? payload.description.trim() : null;
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

    return subcategoryRepository.update(id, updateData);
  },

  /**
   * Safe delete or archive subcategory
   */
  async deleteSubcategory(id) {
    const subcategory = await subcategoryRepository.findById(id);
    if (!subcategory) {
      throw ApiError.notFound(`Subcategory with ID "${id}" was not found.`);
    }

    const { productsCount } = await subcategoryRepository.countRelations(id);

    // If products are linked, safe archive
    if (productsCount > 0) {
      const archived = await subcategoryRepository.update(id, { status: "Inactive" });
      return {
        archived: true,
        message: `Subcategory is linked to ${productsCount} product(s). It has been safely deactivated to Inactive status instead of deleted.`,
        subcategory: archived,
      };
    }

    // Otherwise clean hard delete
    await subcategoryRepository.delete(id);
    return {
      archived: false,
      message: `Subcategory "${subcategory.name}" was successfully deleted.`,
      subcategory: { id, name: subcategory.name },
    };
  },
};

export default subcategoryService;
