import { prisma } from "../config/prisma.js";

const DEFAULT_HERO_INCLUDE = {
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

export const heroRepository = {
  /**
   * Find single active hero configuration
   */
  async findActive() {
    return prisma.heroSection.findFirst({
      where: {
        status: {
          equals: "ACTIVE",
          mode: "insensitive",
        },
      },
      include: DEFAULT_HERO_INCLUDE,
      orderBy: { updatedAt: "desc" },
    });
  },

  /**
   * Find the most recent hero configuration (regardless of status)
   */
  async findLatest() {
    return prisma.heroSection.findFirst({
      include: DEFAULT_HERO_INCLUDE,
      orderBy: { updatedAt: "desc" },
    });
  },

  /**
   * Find hero by ID
   */
  async findById(id) {
    return prisma.heroSection.findUnique({
      where: { id },
      include: DEFAULT_HERO_INCLUDE,
    });
  },

  /**
   * Create a hero section configuration
   */
  async create(data) {
    return prisma.heroSection.create({
      data,
      include: DEFAULT_HERO_INCLUDE,
    });
  },

  /**
   * Update hero configuration by ID
   */
  async update(id, data) {
    return prisma.heroSection.update({
      where: { id },
      data,
      include: DEFAULT_HERO_INCLUDE,
    });
  },
};

export default heroRepository;
