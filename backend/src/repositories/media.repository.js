import { prisma } from "../config/database.js";

export class MediaRepository {
  /**
   * Find paginated media assets
   */
  async findMany({ where = {}, skip = 0, take = 20, orderBy = { createdAt: "desc" } } = {}) {
    return prisma.mediaAsset.findMany({
      where,
      skip,
      take,
      orderBy,
      include: {
        _count: {
          select: {
            productImages: true,
            categories: true,
            collections: true,
          },
        },
      },
    });
  }

  /**
   * Count media assets matching condition
   */
  async count(where = {}) {
    return prisma.mediaAsset.count({ where });
  }

  /**
   * Find single media asset by ID
   */
  async findById(id) {
    return prisma.mediaAsset.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            productImages: true,
            categories: true,
            collections: true,
          },
        },
      },
    });
  }

  /**
   * Find single media asset by storage key
   */
  async findByStorageKey(storageKey) {
    return prisma.mediaAsset.findFirst({
      where: { storageKey },
    });
  }

  /**
   * Create media asset record
   */
  async create(data) {
    return prisma.mediaAsset.create({
      data,
    });
  }

  /**
   * Update media asset record
   */
  async update(id, data) {
    return prisma.mediaAsset.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete media asset record
   */
  async delete(id) {
    return prisma.mediaAsset.delete({
      where: { id },
    });
  }

  /**
   * Count total references across products, categories, collections
   */
  async countUsage(id) {
    const [productCount, categoryCount, collectionCount] = await Promise.all([
      prisma.productImage.count({ where: { mediaAssetId: id } }),
      prisma.category.count({ where: { mediaAssetId: id } }),
      prisma.collection.count({ where: { mediaAssetId: id } }),
    ]);

    return {
      productCount,
      categoryCount,
      collectionCount,
      totalUsage: productCount + categoryCount + collectionCount,
    };
  }
}

export const mediaRepository = new MediaRepository();
export default mediaRepository;
