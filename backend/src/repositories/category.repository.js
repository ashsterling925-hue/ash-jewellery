import { prisma } from "../config/prisma.js";

/**
 * Category Repository
 * Handles all database operations for Category via Prisma
 */
export const categoryRepository = {
  /**
   * Find categories matching criteria with pagination and sorting
   */
  async findMany({ where = {}, orderBy = { createdAt: "desc" }, skip, take, include } = {}) {
    return prisma.category.findMany({
      where,
      orderBy,
      ...(skip !== undefined && { skip }),
      ...(take !== undefined && { take }),
      ...(include && { include }),
    });
  },

  /**
   * Count total categories matching criteria
   */
  async count(where = {}) {
    return prisma.category.count({ where });
  },

  /**
   * Find single category by ID
   */
  async findById(id, include = {}) {
    return prisma.category.findUnique({
      where: { id },
      include: {
        subcategories: {
          where: { status: "Active" },
          orderBy: { sortOrder: "asc" },
        },
        _count: {
          select: {
            subcategories: true,
            products: true,
          },
        },
        ...include,
      },
    });
  },

  /**
   * Find category by unique slug
   */
  async findBySlug(slug, include = {}) {
    return prisma.category.findUnique({
      where: { slug },
      include: {
        subcategories: {
          where: { status: "Active" },
          orderBy: { sortOrder: "asc" },
        },
        ...include,
      },
    });
  },

  /**
   * Find category by name (case-insensitive)
   */
  async findByName(name) {
    return prisma.category.findFirst({
      where: {
        name: {
          equals: name.trim(),
          mode: "insensitive",
        },
      },
    });
  },

  /**
   * Create a new category
   */
  async create(data) {
    return prisma.category.create({
      data,
    });
  },

  /**
   * Update category by ID
   */
  async update(id, data) {
    return prisma.category.update({
      where: { id },
      data,
    });
  },

  /**
   * Hard delete category by ID
   */
  async delete(id) {
    return prisma.category.delete({
      where: { id },
    });
  },

  /**
   * Count relations for safe deletion check
   */
  async countRelations(id) {
    const [subcategoriesCount, productsCount] = await Promise.all([
      prisma.subcategory.count({ where: { categoryId: id } }),
      prisma.product.count({ where: { categoryId: id } }),
    ]);

    return {
      subcategoriesCount,
      productsCount,
      totalReferences: subcategoriesCount + productsCount,
    };
  },
};

export default categoryRepository;
