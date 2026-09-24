import { prisma } from "../config/prisma.js";

/**
 * Subcategory Repository
 * Handles all database operations for Subcategory via Prisma
 */
export const subcategoryRepository = {
  /**
   * Find subcategories matching criteria with pagination, sorting and category info
   */
  async findMany({
    where = {},
    orderBy = { sortOrder: "asc" },
    skip,
    take,
    include = {
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  } = {}) {
    return prisma.subcategory.findMany({
      where,
      orderBy,
      ...(skip !== undefined && { skip }),
      ...(take !== undefined && { take }),
      ...(include && { include }),
    });
  },

  /**
   * Count subcategories matching criteria
   */
  async count(where = {}) {
    return prisma.subcategory.count({ where });
  },

  /**
   * Find subcategory by ID with category details
   */
  async findById(id, include = {}) {
    return prisma.subcategory.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            status: true,
          },
        },
        _count: {
          select: {
            products: true,
          },
        },
        ...include,
      },
    });
  },

  /**
   * Find subcategory by unique slug
   */
  async findBySlug(slug) {
    return prisma.subcategory.findUnique({
      where: { slug },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });
  },

  /**
   * Find by name within same category (case-insensitive)
   */
  async findByNameAndCategory(name, categoryId) {
    return prisma.subcategory.findFirst({
      where: {
        categoryId,
        name: {
          equals: name.trim(),
          mode: "insensitive",
        },
      },
    });
  },

  /**
   * Create a new subcategory
   */
  async create(data) {
    return prisma.subcategory.create({
      data,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });
  },

  /**
   * Update subcategory by ID
   */
  async update(id, data) {
    return prisma.subcategory.update({
      where: { id },
      data,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });
  },

  /**
   * Hard delete subcategory by ID
   */
  async delete(id) {
    return prisma.subcategory.delete({
      where: { id },
    });
  },

  /**
   * Count relations for safe deletion check
   */
  async countRelations(id) {
    const productsCount = await prisma.product.count({
      where: { subcategoryId: id },
    });

    return {
      productsCount,
      totalReferences: productsCount,
    };
  },
};

export default subcategoryRepository;
