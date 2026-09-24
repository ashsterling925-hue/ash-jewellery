import { prisma } from "../config/prisma.js";

const DEFAULT_BANNER_INCLUDE = {
  mediaAsset: {
    select: {
      id: true,
      fileName: true,
      url: true,
      altText: true,
      title: true,
      width: true,
      height: true,
    },
  },
};

export const bannerRepository = {
  /**
   * Find banners matching criteria
   */
  async findMany({
    where = {},
    orderBy = [{ sortOrder: "asc" }, { createdAt: "desc" }],
    skip,
    take,
    include = DEFAULT_BANNER_INCLUDE,
  } = {}) {
    return prisma.banner.findMany({
      where,
      orderBy,
      ...(skip !== undefined && { skip }),
      ...(take !== undefined && { take }),
      include,
    });
  },

  /**
   * Count banners matching criteria
   */
  async count(where = {}) {
    return prisma.banner.count({ where });
  },

  /**
   * Find single banner by ID
   */
  async findById(id) {
    return prisma.banner.findUnique({
      where: { id },
      include: DEFAULT_BANNER_INCLUDE,
    });
  },

  /**
   * Create banner
   */
  async create(data) {
    return prisma.banner.create({
      data,
      include: DEFAULT_BANNER_INCLUDE,
    });
  },

  /**
   * Update banner by ID
   */
  async update(id, data) {
    return prisma.banner.update({
      where: { id },
      data,
      include: DEFAULT_BANNER_INCLUDE,
    });
  },

  /**
   * Delete banner by ID
   */
  async delete(id) {
    return prisma.banner.delete({
      where: { id },
    });
  },
};

export default bannerRepository;
