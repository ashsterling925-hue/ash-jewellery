import { productRepository, PRODUCT_CARD_INCLUDE } from "../repositories/product.repository.js";
import { categoryRepository } from "../repositories/category.repository.js";
import { subcategoryRepository } from "../repositories/subcategory.repository.js";
import { collectionRepository } from "../repositories/collection.repository.js";
import { attributeRepository } from "../repositories/attribute.repository.js";
import { attributeValueRepository } from "../repositories/attributeValue.repository.js";
import { tagRepository } from "../repositories/tag.repository.js";
import { slugify } from "./category.service.js";
import { ApiError } from "../utils/apiError.js";
import { getPaginationParams, formatPaginationMeta } from "../utils/pagination.js";
import { getSortParams, getSearchFilter } from "../utils/queryHelper.js";
import { memoryCache } from "../utils/cache.js";

const ALLOWED_SORT_FIELDS = [
  "name",
  "price",
  "stockQuantity",
  "createdAt",
  "updatedAt",
  "sku",
  "sortOrder",
  "displayPriority",
];

/**
 * Derive stock status consistently from inventory numbers
 */
export function deriveStockStatus(quantity, threshold, explicitStatus) {
  if (explicitStatus === "BACKORDER") return "BACKORDER";
  if (quantity <= 0) return "OUT_OF_STOCK";
  if (quantity <= threshold) return "LOW_STOCK";
  return "IN_STOCK";
}

/**
 * Format Product with structured specifications/attributes and tags for API response
 */
export function formatProductResponse(product) {
  if (!product) return null;

  let attributes = [];
  if (product.attributeValues && Array.isArray(product.attributeValues)) {
    const attrMap = {};
    for (const item of product.attributeValues) {
      if (!item.attribute) continue;
      const attrId = item.attribute.id;
      if (!attrMap[attrId]) {
        attrMap[attrId] = {
          attributeId: attrId,
          name: item.attribute.name,
          slug: item.attribute.slug,
          selectionType: item.attribute.selectionType,
          filterable: item.attribute.filterable,
          values: [],
        };
      }
      if (item.attributeValue) {
        attrMap[attrId].values.push({
          id: item.attributeValue.id,
          value: item.attributeValue.value,
          slug: item.attributeValue.slug,
        });
      }
    }
    attributes = Object.values(attrMap);
  }

  const tags = (product.productTags || [])
    .filter((pt) => pt.tag)
    .map((pt) => ({
      id: pt.tag.id,
      name: pt.tag.name,
      slug: pt.tag.slug,
      status: pt.tag.status,
      sortOrder: pt.tag.sortOrder,
    }));

  return {
    ...product,
    attributes,
    tags,
  };
}

/**
 * Validate dynamic attribute assignments against DB constraints:
 * - Attribute exists
 * - AttributeValue exists
 * - AttributeValue belongs to Attribute (rejection if mismatch)
 * - SINGLE selectionType allows only 1 value (rejection if multiple)
 * - Deduplicate assignments
 */
export async function validateAndResolveAttributeAssignments(attributes, attributeValueIds) {
  const assignments = [];
  const assignedValuesByAttr = {};

  // Case 1: Structured attributes [{ attributeId, attributeValueIds: [...] }]
  if (attributes && Array.isArray(attributes) && attributes.length > 0) {
    for (const entry of attributes) {
      const { attributeId, attributeValueIds: valIds } = entry;
      if (!attributeId || !valIds || !Array.isArray(valIds) || valIds.length === 0) continue;

      const attribute = await attributeRepository.findById(attributeId);
      if (!attribute) {
        throw ApiError.badRequest(
          `Attribute with ID "${attributeId}" was not found.`,
          [],
          "INVALID_ATTRIBUTE_ID"
        );
      }

      // Check single vs multiple constraint
      if (attribute.selectionType === "SINGLE" && valIds.length > 1) {
        throw ApiError.badRequest(
          `Attribute "${attribute.name}" only permits a single value to be assigned.`,
          [],
          "SINGLE_ATTRIBUTE_MULTIPLE_VALUES"
        );
      }

      for (const valId of valIds) {
        const valueRecord = await attributeValueRepository.findById(valId);
        if (!valueRecord) {
          throw ApiError.badRequest(
            `Attribute value with ID "${valId}" was not found.`,
            [],
            "INVALID_ATTRIBUTE_VALUE_ID"
          );
        }

        // CRITICAL: Ensure value belongs to the attribute
        if (valueRecord.attributeId !== attributeId) {
          throw ApiError.badRequest(
            `Attribute value "${valueRecord.value}" does not belong to attribute "${attribute.name}".`,
            [],
            "ATTRIBUTE_VALUE_MISMATCH"
          );
        }

        if (!assignedValuesByAttr[attributeId]) {
          assignedValuesByAttr[attributeId] = new Set();
        }

        if (!assignedValuesByAttr[attributeId].has(valId)) {
          assignedValuesByAttr[attributeId].add(valId);
          assignments.push({
            attributeId,
            attributeValueId: valId,
          });
        }
      }
    }
  }

  // Case 2: Flat attributeValueIds array without structured attributes
  if (attributeValueIds && Array.isArray(attributeValueIds) && attributeValueIds.length > 0 && assignments.length === 0) {
    for (const valId of attributeValueIds) {
      const valueRecord = await attributeValueRepository.findById(valId);
      if (!valueRecord) {
        throw ApiError.badRequest(
          `Attribute value with ID "${valId}" was not found.`,
          [],
          "INVALID_ATTRIBUTE_VALUE_ID"
        );
      }

      const attrId = valueRecord.attributeId;
      const attr = valueRecord.attribute;

      if (!assignedValuesByAttr[attrId]) {
        assignedValuesByAttr[attrId] = new Set();
      }

      if (attr.selectionType === "SINGLE" && assignedValuesByAttr[attrId].size >= 1 && !assignedValuesByAttr[attrId].has(valId)) {
        throw ApiError.badRequest(
          `Attribute "${attr.name}" only permits a single value to be assigned.`,
          [],
          "SINGLE_ATTRIBUTE_MULTIPLE_VALUES"
        );
      }

      if (!assignedValuesByAttr[attrId].has(valId)) {
        assignedValuesByAttr[attrId].add(valId);
        assignments.push({
          attributeId: attrId,
          attributeValueId: valId,
        });
      }
    }
  }

  return assignments;
}

/**
 * Validate tag assignments against DB constraints:
 * - Deduplicate IDs
 * - Verify every tag exists
 * - Verify every tag is Active
 */
export async function validateAndResolveTagAssignments(tagIds, tags) {
  let targetIds = [];

  if (Array.isArray(tagIds) && tagIds.length > 0) {
    targetIds = [...tagIds];
  } else if (Array.isArray(tags) && tags.length > 0) {
    for (const t of tags) {
      if (typeof t === "string") {
        targetIds.push(t.trim());
      } else if (t && typeof t === "object" && t.id) {
        targetIds.push(t.id);
      }
    }
  }

  if (targetIds.length === 0) {
    return [];
  }

  const uniqueIds = [...new Set(targetIds.filter(Boolean))];
  const resolvedTagIds = [];

  for (const idOrName of uniqueIds) {
    let tag = await tagRepository.findById(idOrName);
    if (!tag) {
      tag = await tagRepository.findByName(idOrName);
    }

    if (!tag) {
      throw ApiError.badRequest(
        `Tag "${idOrName}" was not found.`,
        [{ field: "tagIds", message: `Invalid tag "${idOrName}"` }],
        "INVALID_TAG_ID"
      );
    }

    if (tag.status !== "Active" && tag.status !== "ACTIVE") {
      throw ApiError.badRequest(
        `Tag "${tag.name}" is inactive and cannot be assigned to products.`,
        [{ field: "tagIds", message: `Tag "${tag.name}" is inactive` }],
        "INACTIVE_TAG_ASSIGNMENT"
      );
    }

    resolvedTagIds.push(tag.id);
  }

  return [...new Set(resolvedTagIds)];
}

export const productService = {
  /**
   * List products with filtering, search, sorting and pagination
   */
  async getProducts(query = {}) {
    const { page, limit, skip } = getPaginationParams(query);
    const orderBy = getSortParams(query, ALLOWED_SORT_FIELDS, { createdAt: "desc" });

    const whereConditions = [];

    // Search filter across name, sku, slug, shortDescription, description
    const searchFilter = getSearchFilter(query.search, [
      "name",
      "sku",
      "slug",
      "shortDescription",
      "description",
    ]);
    if (searchFilter) {
      whereConditions.push(searchFilter);
    }

    // Status filter
    if (query.status && query.status !== "All") {
      whereConditions.push({ status: query.status });
    }

    // Stock status filter
    if (query.stockStatus && query.stockStatus !== "All") {
      whereConditions.push({ stockStatus: query.stockStatus });
    }

    // Category filter by ID or Slug
    if (query.categoryId && query.categoryId !== "All") {
      whereConditions.push({ categoryId: query.categoryId });
    } else if (query.categorySlug && query.categorySlug !== "All") {
      const catVal = query.categorySlug.trim();
      whereConditions.push({
        OR: [
          { category: { slug: { equals: catVal, mode: "insensitive" } } },
          { categoryId: catVal },
        ],
      });
    }

    // Subcategory filter by ID or Slug
    if (query.subcategoryId && query.subcategoryId !== "All") {
      whereConditions.push({ subcategoryId: query.subcategoryId });
    } else if (query.subcategorySlug && query.subcategorySlug !== "All") {
      const subVal = query.subcategorySlug.trim();
      whereConditions.push({
        OR: [
          { subcategory: { slug: { equals: subVal, mode: "insensitive" } } },
          { subcategoryId: subVal },
        ],
      });
    }

    // Collection filter by ID
    if (query.collectionId && query.collectionId !== "All") {
      whereConditions.push({ collectionId: query.collectionId });
    }

    // Collection filter by Slug
    if (query.collectionSlug && query.collectionSlug !== "All") {
      whereConditions.push({
        collection: {
          slug: query.collectionSlug.trim(),
        },
      });
    }

    // Gender filter: MEN, WOMEN, UNISEX
    if (query.gender && query.gender !== "All") {
      const g = query.gender.trim();
      if (g.toUpperCase() === "MEN" || g.toUpperCase() === "WOMEN") {
        whereConditions.push({
          OR: [
            { gender: { equals: g, mode: "insensitive" } },
            { gender: { equals: "UNISEX", mode: "insensitive" } },
          ],
        });
      } else {
        whereConditions.push({
          gender: { equals: g, mode: "insensitive" },
        });
      }
    }

    // Price range filters
    if (query.minPrice !== undefined && query.minPrice !== "" && !isNaN(Number(query.minPrice))) {
      whereConditions.push({
        price: {
          gte: Number(query.minPrice),
        },
      });
    }
    if (query.maxPrice !== undefined && query.maxPrice !== "" && !isNaN(Number(query.maxPrice))) {
      whereConditions.push({
        price: {
          lte: Number(query.maxPrice),
        },
      });
    }

    // Merchandising filters (Best Seller, New Arrival, Featured, Trending)
    const merch = (query.merchandising || "").toLowerCase();

    if (query.isBestSeller === true || merch === "bestseller" || merch === "best-seller" || merch === "best_seller") {
      whereConditions.push({ isBestSeller: true });
    }

    if (query.isNewArrival === true || merch === "newarrival" || merch === "new-arrival" || merch === "new_arrival") {
      whereConditions.push({
        isNewArrival: true,
        OR: [
          { newArrivalUntil: null },
          { newArrivalUntil: { gte: new Date() } },
        ],
      });
    }

    if (query.isFeatured === true || merch === "featured") {
      whereConditions.push({ isFeatured: true });
    }

    if (query.isTrending === true || merch === "trending") {
      whereConditions.push({ isTrending: true });
    }

    // Dynamic Attribute filter: attributeValueIds
    // Values within same attribute are OR'd (match any selected value of that attribute)
    // Selections across different attributes are AND'd (product must match all selected attribute criteria)
    if (query.attributeValueIds && Array.isArray(query.attributeValueIds) && query.attributeValueIds.length > 0) {
      const cleanValIds = query.attributeValueIds.filter(Boolean);
      if (cleanValIds.length > 0) {
        const values = await attributeValueRepository.findMany({
          where: { id: { in: cleanValIds } },
        });

        const valByAttr = {};
        for (const val of values) {
          if (!valByAttr[val.attributeId]) {
            valByAttr[val.attributeId] = [];
          }
          valByAttr[val.attributeId].push(val.id);
        }

        const knownIds = new Set(values.map((v) => v.id));
        const unknownIds = cleanValIds.filter((id) => !knownIds.has(id));

        for (const attrId of Object.keys(valByAttr)) {
          whereConditions.push({
            attributeValues: {
              some: {
                attributeValueId: { in: valByAttr[attrId] },
              },
            },
          });
        }

        for (const unknownId of unknownIds) {
          whereConditions.push({
            attributeValues: {
              some: {
                attributeValueId: unknownId,
              },
            },
          });
        }
      }
    }

    // Dynamic Tag filter: tagId
    if (query.tagId) {
      whereConditions.push({
        productTags: {
          some: {
            tagId: query.tagId,
          },
        },
      });
    }

    // Dynamic Tag filter: tagSlug
    if (query.tagSlug) {
      whereConditions.push({
        productTags: {
          some: {
            tag: {
              slug: query.tagSlug,
            },
          },
        },
      });
    }

    const where = whereConditions.length > 0 ? { AND: whereConditions } : {};

    const include = query.cardOnly ? PRODUCT_CARD_INCLUDE : undefined;

    const [products, total] = await Promise.all([
      productRepository.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        ...(include && { include }),
      }),
      productRepository.count(where),
    ]);

    const pagination = formatPaginationMeta(total, page, limit);

    return {
      products: products.map(formatProductResponse),
      pagination,
    };
  },

  /**
   * Get single product by ID or Slug in a single roundtrip query
   */
  async getProductById(idOrSlug) {
    const product = await productRepository.findByIdOrSlug(idOrSlug);
    if (!product) {
      throw ApiError.notFound(`Product "${idOrSlug}" was not found.`);
    }
    return formatProductResponse(product);
  },

  /**
   * Create a new product
   */
  async createProduct(payload) {
    const name = payload.name.trim();
    const sku = payload.sku.trim();
    let slug = payload.slug ? slugify(payload.slug) : slugify(name);

    if (!slug) {
      slug = `prod-${Date.now()}`;
    }

    // Check SKU uniqueness
    const existingSku = await productRepository.findBySku(sku);
    if (existingSku) {
      throw ApiError.conflict(
        `A product with SKU "${sku}" already exists.`,
        "DUPLICATE_SKU"
      );
    }

    // Check slug uniqueness
    const existingSlug = await productRepository.findBySlug(slug);
    if (existingSlug) {
      throw ApiError.conflict(
        `A product with slug "${slug}" already exists.`,
        "DUPLICATE_SLUG"
      );
    }

    // Validate Category
    const category = await categoryRepository.findById(payload.categoryId);
    if (!category) {
      throw ApiError.badRequest(
        `Category with ID "${payload.categoryId}" was not found. A valid category is required.`,
        [],
        "INVALID_CATEGORY_ID"
      );
    }

    // Validate Subcategory if provided
    if (payload.subcategoryId) {
      const subcategory = await subcategoryRepository.findById(payload.subcategoryId);
      if (!subcategory) {
        throw ApiError.badRequest(
          `Subcategory with ID "${payload.subcategoryId}" was not found.`,
          [],
          "INVALID_SUBCATEGORY_ID"
        );
      }

      // Verify subcategory belongs to the selected category
      if (subcategory.categoryId !== payload.categoryId) {
        throw ApiError.badRequest(
          `Subcategory "${subcategory.name}" does not belong to category "${category.name}".`,
          [],
          "SUBCATEGORY_CATEGORY_MISMATCH"
        );
      }
    }

    // Validate Collection if provided
    if (payload.collectionId) {
      const collection = await collectionRepository.findById(payload.collectionId);
      if (!collection) {
        throw ApiError.badRequest(
          `Collection with ID "${payload.collectionId}" was not found.`,
          [],
          "INVALID_COLLECTION_ID"
        );
      }
    }

    // Validate dynamic attribute assignments
    const attributeAssignments = await validateAndResolveAttributeAssignments(
      payload.attributes,
      payload.attributeValueIds
    );

    // Validate tag assignments
    const tagIds = await validateAndResolveTagAssignments(
      payload.tagIds,
      payload.tags
    );

    const stockQuantity = payload.stockQuantity !== undefined ? Number(payload.stockQuantity) : 0;
    const lowStockThreshold = payload.lowStockThreshold !== undefined ? Number(payload.lowStockThreshold) : 5;
    const stockStatus = deriveStockStatus(stockQuantity, lowStockThreshold, payload.stockStatus);

    const productData = {
      name,
      sku,
      slug,
      productType: payload.productType?.trim() || null,
      shortDescription: payload.shortDescription?.trim() || null,
      description: payload.description?.trim() || null,
      price: payload.price,
      comparePrice: payload.comparePrice !== undefined && payload.comparePrice !== null ? payload.comparePrice : null,
      taxRate: payload.taxRate !== undefined && payload.taxRate !== null ? payload.taxRate : 3.0,
      stockQuantity,
      lowStockThreshold,
      stockStatus,
      categoryId: payload.categoryId,
      subcategoryId: payload.subcategoryId || null,
      collectionId: payload.collectionId || null,
      material: (payload.metal || payload.material)?.trim() || null,
      gender: payload.gender?.trim() || null,
      colour: payload.colour?.trim() || null,
      finish: payload.finish?.trim() || null,
      seoTitle: (payload.metaTitle || payload.seoTitle)?.trim() || null,
      seoDescription: (payload.metaDescription || payload.seoDescription)?.trim() || null,
      status: payload.status || "DRAFT",
      isFeatured: Boolean(payload.isFeatured),
      isBestSeller: Boolean(payload.isBestSeller),
      isNewArrival: Boolean(payload.isNewArrival),
      isTrending: Boolean(payload.isTrending),
      displayPriority: typeof payload.displayPriority === "number" ? payload.displayPriority : Number(payload.displayPriority) || 0,
      newArrivalUntil: payload.newArrivalUntil ? new Date(payload.newArrivalUntil) : null,
    };

    const created = await productRepository.createWithImages(
      productData,
      payload.images || [],
      attributeAssignments,
      tagIds
    );

    memoryCache.flushStorefront();

    return formatProductResponse(created);
  },

  /**
   * Update existing product
   */
  async updateProduct(id, payload) {
    const existing = await productRepository.findById(id);
    if (!existing) {
      throw ApiError.notFound(`Product with ID "${id}" was not found.`);
    }

    const updateData = {};

    // SKU update + conflict check
    if (payload.sku !== undefined) {
      const sku = payload.sku.trim();
      if (sku.toUpperCase() !== existing.sku.toUpperCase()) {
        const duplicateSku = await productRepository.findBySku(sku);
        if (duplicateSku && duplicateSku.id !== id) {
          throw ApiError.conflict(
            `A product with SKU "${sku}" already exists.`,
            "DUPLICATE_SKU"
          );
        }
      }
      updateData.sku = sku;
    }

    // Slug update + conflict check
    if (payload.slug !== undefined) {
      const candidateSlug = slugify(payload.slug);
      if (candidateSlug && candidateSlug !== existing.slug) {
        const duplicateSlug = await productRepository.findBySlug(candidateSlug);
        if (duplicateSlug && duplicateSlug.id !== id) {
          throw ApiError.conflict(
            `A product with slug "${candidateSlug}" already exists.`,
            "DUPLICATE_SLUG"
          );
        }
        updateData.slug = candidateSlug;
      }
    }

    if (payload.name !== undefined) {
      updateData.name = payload.name.trim();
    }

    const targetCategoryId = payload.categoryId !== undefined ? payload.categoryId : existing.categoryId;
    const targetSubcategoryId = payload.subcategoryId !== undefined ? payload.subcategoryId : existing.subcategoryId;

    // Verify category if updated
    let category = null;
    if (payload.categoryId !== undefined) {
      category = await categoryRepository.findById(payload.categoryId);
      if (!category) {
        throw ApiError.badRequest(
          `Category with ID "${payload.categoryId}" was not found.`,
          [],
          "INVALID_CATEGORY_ID"
        );
      }
      updateData.categoryId = payload.categoryId;
    }

    // Verify subcategory if updated or category updated
    if (targetSubcategoryId) {
      const subcategory = await subcategoryRepository.findById(targetSubcategoryId);
      if (!subcategory) {
        throw ApiError.badRequest(
          `Subcategory with ID "${targetSubcategoryId}" was not found.`,
          [],
          "INVALID_SUBCATEGORY_ID"
        );
      }
      if (subcategory.categoryId !== targetCategoryId) {
        throw ApiError.badRequest(
          `Subcategory "${subcategory.name}" does not belong to the selected category.`,
          [],
          "SUBCATEGORY_CATEGORY_MISMATCH"
        );
      }
      updateData.subcategoryId = targetSubcategoryId;
    } else if (payload.subcategoryId === null || payload.subcategoryId === "") {
      updateData.subcategoryId = null;
    }

    // Verify collection if updated
    if (payload.collectionId !== undefined) {
      if (payload.collectionId) {
        const collection = await collectionRepository.findById(payload.collectionId);
        if (!collection) {
          throw ApiError.badRequest(
            `Collection with ID "${payload.collectionId}" was not found.`,
            [],
            "INVALID_COLLECTION_ID"
          );
        }
        updateData.collectionId = payload.collectionId;
      } else {
        updateData.collectionId = null;
      }
    }

    if (payload.price !== undefined) {
      updateData.price = payload.price;
    }
    if (payload.comparePrice !== undefined) {
      updateData.comparePrice = payload.comparePrice;
    }
    if (payload.taxRate !== undefined) {
      updateData.taxRate = payload.taxRate;
    }

    const stockQuantity = payload.stockQuantity !== undefined ? Number(payload.stockQuantity) : existing.stockQuantity;
    const lowStockThreshold = payload.lowStockThreshold !== undefined ? Number(payload.lowStockThreshold) : existing.lowStockThreshold;

    if (payload.stockQuantity !== undefined) {
      updateData.stockQuantity = stockQuantity;
    }
    if (payload.lowStockThreshold !== undefined) {
      updateData.lowStockThreshold = lowStockThreshold;
    }

    updateData.stockStatus = deriveStockStatus(stockQuantity, lowStockThreshold, payload.stockStatus);

    if (payload.productType !== undefined) {
      updateData.productType = payload.productType?.trim() || null;
    }
    if (payload.shortDescription !== undefined) {
      updateData.shortDescription = payload.shortDescription?.trim() || null;
    }
    if (payload.description !== undefined) {
      updateData.description = payload.description?.trim() || null;
    }
    if (payload.metal !== undefined || payload.material !== undefined) {
      updateData.material = (payload.metal !== undefined ? payload.metal : payload.material)?.trim() || null;
    }
    if (payload.gender !== undefined) {
      updateData.gender = payload.gender?.trim() || null;
    }
    if (payload.colour !== undefined) {
      updateData.colour = payload.colour?.trim() || null;
    }
    if (payload.finish !== undefined) {
      updateData.finish = payload.finish?.trim() || null;
    }
    if (payload.metaTitle !== undefined || payload.seoTitle !== undefined) {
      updateData.seoTitle = (payload.metaTitle || payload.seoTitle)?.trim() || null;
    }
    if (payload.metaDescription !== undefined || payload.seoDescription !== undefined) {
      updateData.seoDescription = (payload.metaDescription || payload.seoDescription)?.trim() || null;
    }
    if (payload.status !== undefined) {
      updateData.status = payload.status;
    }
    if (payload.isFeatured !== undefined) {
      updateData.isFeatured = Boolean(payload.isFeatured);
    }
    if (payload.isBestSeller !== undefined) {
      updateData.isBestSeller = Boolean(payload.isBestSeller);
    }
    if (payload.isNewArrival !== undefined) {
      updateData.isNewArrival = Boolean(payload.isNewArrival);
    }
    if (payload.isTrending !== undefined) {
      updateData.isTrending = Boolean(payload.isTrending);
    }
    if (payload.displayPriority !== undefined) {
      updateData.displayPriority = Number(payload.displayPriority) || 0;
    }
    if (payload.newArrivalUntil !== undefined) {
      updateData.newArrivalUntil = payload.newArrivalUntil ? new Date(payload.newArrivalUntil) : null;
    }

    // Validate dynamic attribute assignments if provided
    let attributeAssignments;
    if (payload.attributes !== undefined || payload.attributeValueIds !== undefined) {
      attributeAssignments = await validateAndResolveAttributeAssignments(
        payload.attributes,
        payload.attributeValueIds
      );
    }

    // Validate tag assignments if provided
    let resolvedTagIds;
    if (payload.tagIds !== undefined || payload.tags !== undefined) {
      resolvedTagIds = await validateAndResolveTagAssignments(
        payload.tagIds,
        payload.tags
      );
    }

    const updated = await productRepository.updateWithImages(
      id,
      updateData,
      payload.images,
      attributeAssignments,
      resolvedTagIds
    );

    memoryCache.flushStorefront();

    return formatProductResponse(updated);
  },

  /**
   * Delete product
   */
  async deleteProduct(id) {
    const product = await productRepository.findById(id);
    if (!product) {
      throw ApiError.notFound(`Product with ID "${id}" was not found.`);
    }

    await productRepository.delete(id);

    memoryCache.flushStorefront();

    return {
      message: `Product "${product.name}" (SKU: ${product.sku}) was successfully deleted.`,
      product: { id, name: product.name, sku: product.sku },
    };
  },

  /**
   * Fetch dynamic products for homepage merchandising sections (Best Sellers, New Arrivals, Featured, Trending)
   */
  async getHomepageMerchandising(limit = 8) {
    const take = Math.min(Math.max(Number(limit) || 8, 1), 24);
    const now = new Date();

    const orderBy = [
      { displayPriority: "desc" },
      { createdAt: "desc" },
    ];

    const [bestSellers, newArrivals, featured, trending] = await Promise.all([
      productRepository.findMany({
        where: {
          status: "PUBLISHED",
          isBestSeller: true,
        },
        orderBy,
        take,
        include: PRODUCT_CARD_INCLUDE,
      }),
      productRepository.findMany({
        where: {
          status: "PUBLISHED",
          isNewArrival: true,
          OR: [
            { newArrivalUntil: null },
            { newArrivalUntil: { gte: now } },
          ],
        },
        orderBy,
        take,
        include: PRODUCT_CARD_INCLUDE,
      }),
      productRepository.findMany({
        where: {
          status: "PUBLISHED",
          isFeatured: true,
        },
        orderBy,
        take,
        include: PRODUCT_CARD_INCLUDE,
      }),
      productRepository.findMany({
        where: {
          status: "PUBLISHED",
          isTrending: true,
        },
        orderBy,
        take,
        include: PRODUCT_CARD_INCLUDE,
      }),
    ]);

    return {
      bestSellers: bestSellers.map(formatProductResponse),
      newArrivals: newArrivals.map(formatProductResponse),
      featured: featured.map(formatProductResponse),
      trending: trending.map(formatProductResponse),
    };
  },
};

export default productService;
