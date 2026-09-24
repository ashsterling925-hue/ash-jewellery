import { prisma } from "../config/prisma.js";

const DEFAULT_OFFER_INCLUDE = {
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

export const specialOfferRepository = {
  /**
   * Find special offers matching criteria
   */
  async findMany({
    where = {},
    orderBy = [{ sortOrder: "asc" }, { createdAt: "desc" }],
    skip,
    take,
    include = DEFAULT_OFFER_INCLUDE,
  } = {}) {
    return prisma.specialOffer.findMany({
      where,
      orderBy,
      ...(skip !== undefined && { skip }),
      ...(take !== undefined && { take }),
      include,
    });
  },

  /**
   * Count special offers matching criteria
   */
  async count(where = {}) {
    return prisma.specialOffer.count({ where });
  },

  /**
   * Find special offer by ID
   */
  async findById(id) {
    return prisma.specialOffer.findUnique({
      where: { id },
      include: DEFAULT_OFFER_INCLUDE,
    });
  },

  /**
   * Create special offer
   */
  async create(data) {
    return prisma.specialOffer.create({
      data,
      include: DEFAULT_OFFER_INCLUDE,
    });
  },

  /**
   * Update special offer by ID
   */
  async update(id, data) {
    return prisma.specialOffer.update({
      where: { id },
      data,
      include: DEFAULT_OFFER_INCLUDE,
    });
  },

  /**
   * Delete special offer by ID
   */
  async delete(id) {
    return prisma.specialOffer.delete({
      where: { id },
    });
  },
};

export default specialOfferRepository;
