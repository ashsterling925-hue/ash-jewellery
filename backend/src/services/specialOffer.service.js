import { specialOfferRepository } from "../repositories/specialOffer.repository.js";
import { mediaRepository } from "../repositories/media.repository.js";
import { productRepository } from "../repositories/product.repository.js";
import { collectionRepository } from "../repositories/collection.repository.js";
import { categoryRepository } from "../repositories/category.repository.js";
import { ApiError } from "../utils/apiError.js";
import { getPaginationParams, formatPaginationMeta } from "../utils/pagination.js";
import { getSortParams, getSearchFilter } from "../utils/queryHelper.js";

const ALLOWED_SORT_FIELDS = ["title", "sortOrder", "startAt", "endAt", "createdAt", "updatedAt"];

/**
 * Validate special offer target reference based on targetType
 */
async function validateOfferTarget(targetType, targetId) {
  if (!targetType || targetType === "CUSTOM") {
    return;
  }

  if (!targetId) {
    throw ApiError.badRequest(
      `A valid targetId is required when targetType is "${targetType}".`,
      [{ field: "targetId", message: "targetId is required" }]
    );
  }

  if (targetType === "PRODUCT") {
    const product = await productRepository.findById(targetId);
    if (!product) {
      throw ApiError.badRequest(
        `Target product with ID "${targetId}" does not exist.`,
        [{ field: "targetId", message: "Invalid product targetId" }]
      );
    }
  } else if (targetType === "COLLECTION") {
    const collection = await collectionRepository.findById(targetId);
    if (!collection) {
      throw ApiError.badRequest(
        `Target collection with ID "${targetId}" does not exist.`,
        [{ field: "targetId", message: "Invalid collection targetId" }]
      );
    }
  } else if (targetType === "CATEGORY") {
    const category = await categoryRepository.findById(targetId);
    if (!category) {
      throw ApiError.badRequest(
        `Target category with ID "${targetId}" does not exist.`,
        [{ field: "targetId", message: "Invalid category targetId" }]
      );
    }
  }
}

export const specialOfferService = {
  /**
   * Get active special offers for storefront
   * Filtered by status=ACTIVE and current UTC time within [startAt, endAt] window
   */
  async getStorefrontSpecialOffers() {
    const now = new Date();

    const whereConditions = [
      {
        status: {
          equals: "ACTIVE",
          mode: "insensitive",
        },
      },
      {
        OR: [
          { startAt: null },
          { startAt: { lte: now } },
        ],
      },
      {
        OR: [
          { endAt: null },
          { endAt: { gte: now } },
        ],
      },
    ];

    const offers = await specialOfferRepository.findMany({
      where: { AND: whereConditions },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });

    const enrichedOffers = await Promise.all(
      offers.map(async (offer) => {
        let computedUrl = offer.buttonUrl;
        if (!computedUrl && offer.targetId) {
          try {
            if (offer.targetType === "PRODUCT") {
              const product = await productRepository.findById(offer.targetId);
              if (product?.slug) computedUrl = `/product/${product.slug}`;
            } else if (offer.targetType === "CATEGORY") {
              const category = await categoryRepository.findById(offer.targetId);
              if (category?.slug) computedUrl = `/category/${category.slug}`;
            } else if (offer.targetType === "COLLECTION") {
              const collection = await collectionRepository.findById(offer.targetId);
              if (collection?.slug) computedUrl = `/catalogue?collection=${collection.slug}`;
            }
          } catch (e) {
            // Fallback gracefully
          }
        }
        return {
          ...offer,
          resolvedUrl: computedUrl || offer.buttonUrl || "/catalogue",
        };
      })
    );

    return enrichedOffers;
  },

  /**
   * Get all special offers for admin with pagination, search, status, and targetType filter
   */
  async getAdminSpecialOffers(query = {}) {
    const { page, limit, skip } = getPaginationParams(query);
    const orderBy = getSortParams(query, ALLOWED_SORT_FIELDS, { sortOrder: "asc" });

    const whereConditions = [];

    const searchFilter = getSearchFilter(query.search, ["title", "description"]);
    if (searchFilter) {
      whereConditions.push(searchFilter);
    }

    if (query.status && query.status !== "ALL") {
      whereConditions.push({
        status: {
          equals: query.status,
          mode: "insensitive",
        },
      });
    }

    if (query.targetType && query.targetType !== "ALL") {
      whereConditions.push({
        targetType: {
          equals: query.targetType,
          mode: "insensitive",
        },
      });
    }

    const where = whereConditions.length > 0 ? { AND: whereConditions } : {};

    const [offers, total] = await Promise.all([
      specialOfferRepository.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      specialOfferRepository.count(where),
    ]);

    return {
      offers,
      pagination: formatPaginationMeta(total, page, limit),
    };
  },

  /**
   * Get single special offer by ID
   */
  async getSpecialOfferById(id) {
    const offer = await specialOfferRepository.findById(id);
    if (!offer) {
      throw ApiError.notFound(`Special offer with ID "${id}" was not found.`);
    }
    return offer;
  },

  /**
   * Create special offer
   */
  async createSpecialOffer(payload) {
    if (payload.mediaAssetId) {
      const media = await mediaRepository.findById(payload.mediaAssetId);
      if (!media) {
        throw ApiError.badRequest(
          `Media asset with ID "${payload.mediaAssetId}" does not exist.`,
          [{ field: "mediaAssetId", message: "Invalid mediaAssetId" }]
        );
      }
    }

    await validateOfferTarget(payload.targetType, payload.targetId);

    if (payload.startAt && payload.endAt && new Date(payload.startAt) > new Date(payload.endAt)) {
      throw ApiError.badRequest("Offer start date cannot be after end date.", [
        { field: "endAt", message: "endAt must be after startAt" },
      ]);
    }

    return specialOfferRepository.create(payload);
  },

  /**
   * Update special offer by ID
   */
  async updateSpecialOffer(id, payload) {
    const existing = await specialOfferRepository.findById(id);
    if (!existing) {
      throw ApiError.notFound(`Special offer with ID "${id}" was not found.`);
    }

    if (payload.mediaAssetId) {
      const media = await mediaRepository.findById(payload.mediaAssetId);
      if (!media) {
        throw ApiError.badRequest(
          `Media asset with ID "${payload.mediaAssetId}" does not exist.`,
          [{ field: "mediaAssetId", message: "Invalid mediaAssetId" }]
        );
      }
    }

    const effectiveTargetType = payload.targetType !== undefined ? payload.targetType : existing.targetType;
    const effectiveTargetId = payload.targetId !== undefined ? payload.targetId : existing.targetId;

    if (payload.targetType !== undefined || payload.targetId !== undefined) {
      await validateOfferTarget(effectiveTargetType, effectiveTargetId);
    }

    const effectiveStart = payload.startAt !== undefined ? payload.startAt : existing.startAt;
    const effectiveEnd = payload.endAt !== undefined ? payload.endAt : existing.endAt;

    if (effectiveStart && effectiveEnd && new Date(effectiveStart) > new Date(effectiveEnd)) {
      throw ApiError.badRequest("Offer start date cannot be after end date.", [
        { field: "endAt", message: "endAt must be after startAt" },
      ]);
    }

    return specialOfferRepository.update(id, payload);
  },

  /**
   * Delete special offer by ID
   */
  async deleteSpecialOffer(id) {
    const existing = await specialOfferRepository.findById(id);
    if (!existing) {
      throw ApiError.notFound(`Special offer with ID "${id}" was not found.`);
    }

    await specialOfferRepository.delete(id);
    return { message: "Special offer deleted successfully", offer: existing };
  },
};

export default specialOfferService;
