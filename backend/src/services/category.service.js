import { categoryRepository } from "../repositories/category.repository.js";
import { ApiError } from "../utils/apiError.js";
import { getPaginationParams, formatPaginationMeta } from "../utils/pagination.js";
import { getSortParams, getSearchFilter } from "../utils/queryHelper.js";

/**
 * Generate URL-friendly slug
 */
export function slugify(text = "") {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

const ALLOWED_SORT_FIELDS = ["name", "sortOrder", "createdAt", "updatedAt", "status"];

export const categoryService = {
  /**
   * List categories with filtering, search, sorting and pagination
   */
  async getCategories(query = {}) {
    const { page, limit, skip } = getPaginationParams(query);
    const orderBy = getSortParams(query, ALLOWED_SORT_FIELDS, { sortOrder: "asc" });

    // Build where criteria
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

    const [categories, total] = await Promise.all([
      categoryRepository.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          subcategories: {
            where: {
              status: { equals: "Active", mode: "insensitive" },
            },
            orderBy: { sortOrder: "asc" },
          },
          _count: {
            select: { products: true, subcategories: true },
          },
        },
      }),
      categoryRepository.count(where),
    ]);

    const pagination = formatPaginationMeta(total, page, limit);

    return {
      categories,
      pagination,
    };
  },

  /**
   * Get single category by ID or Slug
   */
  async getCategoryById(idOrSlug) {
    let category = await categoryRepository.findById(idOrSlug);
    if (!category) {
      category = await categoryRepository.findBySlug(idOrSlug);
    }
    if (!category) {
      throw ApiError.notFound(`Category "${idOrSlug}" was not found.`);
    }
    return category;
  },

  /**
   * Create a new category
   */
  async createCategory(payload) {
    const name = payload.name.trim();
    let slug = payload.slug ? slugify(payload.slug) : slugify(name);

    if (!slug) {
      slug = `cat-${Date.now()}`;
    }

    // Check duplicate name
    const existingByName = await categoryRepository.findByName(name);
    if (existingByName) {
      throw ApiError.conflict(`A category named "${name}" already exists.`, "DUPLICATE_NAME");
    }

    // Check duplicate slug
    const existingBySlug = await categoryRepository.findBySlug(slug);
    if (existingBySlug) {
      throw ApiError.conflict(`A category with slug "${slug}" already exists.`, "DUPLICATE_SLUG");
    }

    const categoryData = {
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

    return categoryRepository.create(categoryData);
  },

  /**
   * Update existing category
   */
  async updateCategory(id, payload) {
    const existing = await categoryRepository.findById(id);
    if (!existing) {
      throw ApiError.notFound(`Category with ID "${id}" was not found.`);
    }

    const updateData = {};

    // Name update + conflict check
    if (payload.name !== undefined) {
      const name = payload.name.trim();
      if (name.toLowerCase() !== existing.name.toLowerCase()) {
        const duplicateName = await categoryRepository.findByName(name);
        if (duplicateName && duplicateName.id !== id) {
          throw ApiError.conflict(`A category named "${name}" already exists.`, "DUPLICATE_NAME");
        }
      }
      updateData.name = name;
    }

    // Slug update + conflict check
    if (payload.slug !== undefined || (payload.name && !payload.slug && payload.autoSlug)) {
      const candidateSlug = payload.slug ? slugify(payload.slug) : slugify(payload.name);
      if (candidateSlug && candidateSlug !== existing.slug) {
        const duplicateSlug = await categoryRepository.findBySlug(candidateSlug);
        if (duplicateSlug && duplicateSlug.id !== id) {
          throw ApiError.conflict(`A category with slug "${candidateSlug}" already exists.`, "DUPLICATE_SLUG");
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

    return categoryRepository.update(id, updateData);
  },

  /**
   * Safe delete or archive category
   */
  async deleteCategory(id) {
    const category = await categoryRepository.findById(id);
    if (!category) {
      throw ApiError.notFound(`Category with ID "${id}" was not found.`);
    }

    const { subcategoriesCount, productsCount, totalReferences } =
      await categoryRepository.countRelations(id);

    // If subcategories or products are linked, safe archive/deactivate
    if (totalReferences > 0) {
      const archived = await categoryRepository.update(id, { status: "Inactive" });
      return {
        archived: true,
        message: `Category has ${totalReferences} linked record(s) (${subcategoriesCount} subcategory, ${productsCount} product). It has been safely deactivated to Inactive status instead of deleted.`,
        category: archived,
      };
    }

    // Otherwise clean hard delete
    await categoryRepository.delete(id);
    return {
      archived: false,
      message: `Category "${category.name}" was successfully deleted.`,
      category: { id, name: category.name },
    };
  },
};

export default categoryService;
