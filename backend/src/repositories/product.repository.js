import { prisma } from "../config/prisma.js";

const DEFAULT_PRODUCT_INCLUDE = {
  category: {
    select: {
      id: true,
      name: true,
      slug: true,
    },
  },
  subcategory: {
    select: {
      id: true,
      name: true,
      slug: true,
    },
  },
  collection: {
    select: {
      id: true,
      name: true,
      slug: true,
    },
  },
  images: {
    orderBy: {
      sortOrder: "asc",
    },
    include: {
      mediaAsset: true,
    },
  },
  attributeValues: {
    include: {
      attribute: {
        select: {
          id: true,
          name: true,
          slug: true,
          selectionType: true,
          filterable: true,
          sortOrder: true,
        },
      },
      attributeValue: {
        select: {
          id: true,
          value: true,
          slug: true,
          status: true,
          sortOrder: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  },
  productTags: {
    include: {
      tag: {
        select: {
          id: true,
          name: true,
          slug: true,
          status: true,
          sortOrder: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  },
};

/**
 * Product Repository
 * Encapsulates database operations for Product, ProductImage, and ProductAttributeValue via Prisma
 */
export const productRepository = {
  /**
   * Find products with filtering, sorting, pagination and relationships
   */
  async findMany({
    where = {},
    orderBy = { createdAt: "desc" },
    skip,
    take,
    include = DEFAULT_PRODUCT_INCLUDE,
    select,
  } = {}) {
    return prisma.product.findMany({
      where,
      orderBy,
      ...(skip !== undefined && { skip }),
      ...(take !== undefined && { take }),
      ...(select ? { select } : { include }),
    });
  },

  /**
   * Count products matching criteria
   */
  async count(where = {}) {
    return prisma.product.count({ where });
  },

  /**
   * Find product by ID with relations
   */
  async findById(id, include = DEFAULT_PRODUCT_INCLUDE) {
    return prisma.product.findUnique({
      where: { id },
      include,
    });
  },

  /**
   * Find product by unique SKU
   */
  async findBySku(sku) {
    return prisma.product.findUnique({
      where: { sku: sku.trim() },
    });
  },

  /**
   * Find product by unique slug with relations
   */
  async findBySlug(slug, include = DEFAULT_PRODUCT_INCLUDE) {
    return prisma.product.findUnique({
      where: { slug: slug.trim() },
      include,
    });
  },

  /**
   * Create product, images, dynamic attribute specifications, and tags within a transaction
   */
  async createWithImages(productData, images = [], attributeAssignments = [], tagIds = []) {
    return prisma.$transaction(async (tx) => {
      // 1. Create the Product record
      const product = await tx.product.create({
        data: productData,
      });

      // 2. Create ProductImage records if images are provided
      if (images && images.length > 0) {
        await tx.productImage.createMany({
          data: images.map((img, index) => ({
            productId: product.id,
            mediaAssetId: img.mediaAssetId || null,
            url: img.url,
            altText: img.altText || product.name,
            sortOrder: typeof img.sortOrder === "number" ? img.sortOrder : index,
            isPrimary: img.isPrimary !== undefined ? img.isPrimary : index === 0,
          })),
        });
      }

      // 3. Create ProductAttributeValue records if attribute assignments are provided
      if (attributeAssignments && attributeAssignments.length > 0) {
        await tx.productAttributeValue.createMany({
          data: attributeAssignments.map((assignment) => ({
            productId: product.id,
            attributeId: assignment.attributeId,
            attributeValueId: assignment.attributeValueId,
          })),
        });
      }

      // 4. Create ProductTag records if tagIds are provided
      if (tagIds && tagIds.length > 0) {
        await tx.productTag.createMany({
          data: tagIds.map((tagId) => ({
            productId: product.id,
            tagId,
          })),
        });
      }

      // 5. If collectionId provided, also sync in ProductCollection junction
      if (product.collectionId) {
        await tx.productCollection.upsert({
          where: {
            productId_collectionId: {
              productId: product.id,
              collectionId: product.collectionId,
            },
          },
          update: {},
          create: {
            productId: product.id,
            collectionId: product.collectionId,
          },
        });
      }

      // 6. Return full product with relations
      return tx.product.findUnique({
        where: { id: product.id },
        include: DEFAULT_PRODUCT_INCLUDE,
      });
    });
  },

  /**
   * Update product, synchronize images, dynamic attributes, and tags within a transaction
   */
  async updateWithImages(id, productData, images, attributeAssignments, tagIds) {
    return prisma.$transaction(async (tx) => {
      // 1. Update Product fields
      const product = await tx.product.update({
        where: { id },
        data: productData,
      });

      // 2. Synchronize images if images array is provided
      if (images !== undefined && Array.isArray(images)) {
        await tx.productImage.deleteMany({
          where: { productId: id },
        });

        if (images.length > 0) {
          await tx.productImage.createMany({
            data: images.map((img, index) => ({
              productId: id,
              mediaAssetId: img.mediaAssetId || null,
              url: img.url,
              altText: img.altText || product.name,
              sortOrder: typeof img.sortOrder === "number" ? img.sortOrder : index,
              isPrimary: img.isPrimary !== undefined ? img.isPrimary : index === 0,
            })),
          });
        }
      }

      // 3. Synchronize attribute assignments if provided
      if (attributeAssignments !== undefined && Array.isArray(attributeAssignments)) {
        await tx.productAttributeValue.deleteMany({
          where: { productId: id },
        });

        if (attributeAssignments.length > 0) {
          await tx.productAttributeValue.createMany({
            data: attributeAssignments.map((assignment) => ({
              productId: id,
              attributeId: assignment.attributeId,
              attributeValueId: assignment.attributeValueId,
            })),
          });
        }
      }

      // 4. Synchronize tag assignments if provided
      if (tagIds !== undefined && Array.isArray(tagIds)) {
        await tx.productTag.deleteMany({
          where: { productId: id },
        });

        if (tagIds.length > 0) {
          await tx.productTag.createMany({
            data: tagIds.map((tagId) => ({
              productId: id,
              tagId,
            })),
          });
        }
      }

      // 5. Synchronize ProductCollection junction if collectionId changed
      if (productData.collectionId !== undefined) {
        await tx.productCollection.deleteMany({
          where: { productId: id },
        });

        if (product.collectionId) {
          await tx.productCollection.create({
            data: {
              productId: id,
              collectionId: product.collectionId,
            },
          });
        }
      }

      // 6. Return full updated product
      return tx.product.findUnique({
        where: { id },
        include: DEFAULT_PRODUCT_INCLUDE,
      });
    });
  },

  /**
   * Delete product and its relations safely
   */
  async delete(id) {
    return prisma.$transaction(async (tx) => {
      await tx.productImage.deleteMany({ where: { productId: id } });
      await tx.productAttributeValue.deleteMany({ where: { productId: id } });
      await tx.productCollection.deleteMany({ where: { productId: id } });
      return tx.product.delete({ where: { id } });
    });
  },

  /**
   * Update product status (e.g. for archive)
   */
  async updateStatus(id, status) {
    return prisma.product.update({
      where: { id },
      data: { status },
      include: DEFAULT_PRODUCT_INCLUDE,
    });
  },
};

export default productRepository;
