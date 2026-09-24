import { prisma } from "../config/prisma.js";

/**
 * Tag Repository
 * Encapsulates database operations for Tag and ProductTag via Prisma
 */
export const tagRepository = {
  /**
   * Find tags with filtering, sorting and pagination
   */
  async findMany({ where = {}, orderBy = { sortOrder: "asc" }, skip, take } = {}) {
    return prisma.tag.findMany({
      where,
      orderBy,
      skip,
      take,
      include: {
        _count: {
          select: {
            productTags: true,
          },
        },
      },
    });
  },

  /**
   * Count total tags matching filter
   */
  async count(where = {}) {
    return prisma.tag.count({ where });
  },

  /**
   * Find a tag by ID
   */
  async findById(id) {
    return prisma.tag.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            productTags: true,
          },
        },
      },
    });
  },

  /**
   * Find a tag by slug
   */
  async findBySlug(slug) {
    return prisma.tag.findUnique({
      where: { slug },
    });
  },

  /**
   * Find a tag by name (case-insensitive)
   */
  async findByName(name) {
    return prisma.tag.findFirst({
      where: {
        name: {
          equals: name,
          mode: "insensitive",
        },
      },
    });
  },

  /**
   * Find active tags matching a list of IDs
   */
  async findActiveByIds(ids) {
    if (!ids || ids.length === 0) return [];
    return prisma.tag.findMany({
      where: {
        id: { in: ids },
        status: { in: ["Active", "ACTIVE", "active"] },
      },
    });
  },

  /**
   * Find any tags matching a list of IDs
   */
  async findByIds(ids) {
    if (!ids || ids.length === 0) return [];
    return prisma.tag.findMany({
      where: {
        id: { in: ids },
      },
    });
  },

  /**
   * Create a new tag
   */
  async create(data) {
    return prisma.tag.create({
      data,
    });
  },

  /**
   * Update an existing tag
   */
  async update(id, data) {
    return prisma.tag.update({
      where: { id },
      data,
      include: {
        _count: {
          select: {
            productTags: true,
          },
        },
      },
    });
  },

  /**
   * Delete a tag
   */
  async delete(id) {
    return prisma.tag.delete({
      where: { id },
    });
  },

  /**
   * Count how many products use this tag
   */
  async countUsage(tagId) {
    return prisma.productTag.count({
      where: { tagId },
    });
  },
};

export default tagRepository;
