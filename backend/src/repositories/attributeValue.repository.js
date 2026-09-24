import { prisma } from "../config/prisma.js";

export const attributeValueRepository = {
  /**
   * Find many attribute values matching criteria
   */
  async findMany({ where = {}, orderBy } = {}) {
    return prisma.attributeValue.findMany({
      where,
      ...(orderBy && { orderBy }),
    });
  },

  /**
   * Find all values belonging to an attribute
   */
  async findByAttributeId(attributeId, { where = {}, orderBy = [{ sortOrder: "asc" }, { value: "asc" }] } = {}) {
    return prisma.attributeValue.findMany({
      where: {
        attributeId,
        ...where,
      },
      orderBy,
      include: {
        _count: {
          select: {
            productAttributeValues: true,
          },
        },
      },
    });
  },

  /**
   * Find single attribute value by ID
   */
  async findById(id) {
    return prisma.attributeValue.findUnique({
      where: { id },
      include: {
        attribute: true,
        _count: {
          select: {
            productAttributeValues: true,
          },
        },
      },
    });
  },

  /**
   * Find value under attribute by literal value (case-insensitive)
   */
  async findByValueAndAttribute(attributeId, value) {
    return prisma.attributeValue.findFirst({
      where: {
        attributeId,
        value: {
          equals: value.trim(),
          mode: "insensitive",
        },
      },
    });
  },

  /**
   * Find value under attribute by slug
   */
  async findBySlugAndAttribute(attributeId, slug) {
    return prisma.attributeValue.findFirst({
      where: {
        attributeId,
        slug: slug.trim().toLowerCase(),
      },
    });
  },

  /**
   * Create an attribute value
   */
  async create(data) {
    return prisma.attributeValue.create({
      data,
      include: {
        attribute: true,
      },
    });
  },

  /**
   * Update an attribute value
   */
  async update(id, data) {
    return prisma.attributeValue.update({
      where: { id },
      data,
      include: {
        attribute: true,
      },
    });
  },

  /**
   * Count how many product specifications reference this value
   */
  async countUsage(id) {
    return prisma.productAttributeValue.count({
      where: { attributeValueId: id },
    });
  },

  /**
   * Delete an attribute value
   */
  async delete(id) {
    return prisma.attributeValue.delete({
      where: { id },
    });
  },
};

export default attributeValueRepository;
