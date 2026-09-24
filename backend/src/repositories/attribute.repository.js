import { prisma } from "../config/prisma.js";

const DEFAULT_ATTRIBUTE_INCLUDE = {
  values: {
    orderBy: {
      sortOrder: "asc",
    },
  },
  _count: {
    select: {
      values: true,
      productAttributeValues: true,
    },
  },
};

export const attributeRepository = {
  /**
   * Find attributes with filtering, sorting, pagination
   */
  async findMany({ where = {}, orderBy = { sortOrder: "asc" }, skip, take, includeValues = false }) {
    return prisma.attribute.findMany({
      where,
      orderBy,
      skip,
      take,
      include: includeValues
        ? DEFAULT_ATTRIBUTE_INCLUDE
        : {
            _count: {
              select: {
                values: true,
                productAttributeValues: true,
              },
            },
          },
    });
  },

  /**
   * Count total attributes matching where clause
   */
  async count(where = {}) {
    return prisma.attribute.count({ where });
  },

  /**
   * Find attribute by ID with all its values
   */
  async findById(id) {
    return prisma.attribute.findUnique({
      where: { id },
      include: DEFAULT_ATTRIBUTE_INCLUDE,
    });
  },

  /**
   * Find attribute by unique slug
   */
  async findBySlug(slug) {
    return prisma.attribute.findUnique({
      where: { slug: slug.trim().toLowerCase() },
      include: DEFAULT_ATTRIBUTE_INCLUDE,
    });
  },

  /**
   * Find attribute by unique name
   */
  async findByName(name) {
    return prisma.attribute.findUnique({
      where: { name: name.trim() },
    });
  },

  /**
   * Create attribute with optional initial values in a transaction
   */
  async create(data, values = []) {
    return prisma.$transaction(async (tx) => {
      const attribute = await tx.attribute.create({
        data,
      });

      if (values && values.length > 0) {
        await tx.attributeValue.createMany({
          data: values.map((val, index) => ({
            attributeId: attribute.id,
            value: val.value.trim(),
            slug: val.slug || val.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
            status: val.status || "Active",
            sortOrder: typeof val.sortOrder === "number" ? val.sortOrder : index,
          })),
        });
      }

      return tx.attribute.findUnique({
        where: { id: attribute.id },
        include: DEFAULT_ATTRIBUTE_INCLUDE,
      });
    });
  },

  /**
   * Update attribute by ID
   */
  async update(id, data) {
    return prisma.attribute.update({
      where: { id },
      data,
      include: DEFAULT_ATTRIBUTE_INCLUDE,
    });
  },

  /**
   * Count how many product specifications reference this attribute
   */
  async countUsage(id) {
    return prisma.productAttributeValue.count({
      where: { attributeId: id },
    });
  },

  /**
   * Delete attribute by ID (cascades to its values)
   */
  async delete(id) {
    return prisma.attribute.delete({
      where: { id },
    });
  },
};

export default attributeRepository;
