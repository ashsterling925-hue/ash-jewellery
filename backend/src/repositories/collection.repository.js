import { prisma } from "../config/prisma.js";

/**
 * Collection Repository
 * Handles all database operations for Collection via Prisma
 */
export const collectionRepository = {
  /**
   * Find collections matching criteria with pagination and sorting
   */
  async findMany({
    where = {},
    orderBy = { sortOrder: "asc" },
    skip,
    take,
    include,
  } = {}) {
    return prisma.collection.findMany({
      where,
      orderBy,
      ...(skip !== undefined && { skip }),
      ...(take !== undefined && { take }),
      ...(include && { include }),
    });
  },

  /**
   * Count total collections matching criteria
   */
  async count(where = {}) {
    return prisma.collection.count({ where });
  },

  /**
   * Find single collection by ID with product count
   */
  async findById(id, include = {}) {
    return prisma.collection.findUnique({
      where: { id },
      include: {
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
   * Find collection by unique slug
   */
  async findBySlug(slug) {
    return prisma.collection.findUnique({
      where: { slug },
    });
  },

  /**
   * Find collection by name (case-insensitive)
   */
  async findByName(name) {
    return prisma.collection.findFirst({
      where: {
        name: {
          equals: name.trim(),
          mode: "insensitive",
        },
      },
    });
  },

  /**
   * Create a new collection
   */
  async create(data) {
    return prisma.collection.create({
      data,
    });
  },

  /**
   * Update collection by ID
   */
  async update(id, data) {
    return prisma.collection.update({
      where: { id },
      data,
    });
  },

  /**
   * Hard delete collection by ID
   */
  async delete(id) {
    return prisma.collection.delete({
      where: { id },
    });
  },

  /**
   * Count relations for safe deletion check
   */
  async countRelations(id) {
    const productsCount = await prisma.productCollection.count({
      where: { collectionId: id },
    });

    return {
      productsCount,
      totalReferences: productsCount,
    };
  },
};

export default collectionRepository;
