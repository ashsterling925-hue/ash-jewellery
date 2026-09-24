import { bannerRepository } from "../repositories/banner.repository.js";
import { mediaRepository } from "../repositories/media.repository.js";
import { ApiError } from "../utils/apiError.js";
import { getPaginationParams, formatPaginationMeta } from "../utils/pagination.js";
import { getSortParams, getSearchFilter } from "../utils/queryHelper.js";

const ALLOWED_SORT_FIELDS = ["title", "sortOrder", "startAt", "endAt", "createdAt", "updatedAt"];

export const bannerService = {
  /**
   * Get visible banners for storefront
   * Filtered by status=ACTIVE and current UTC time within [startAt, endAt] window
   */
  async getStorefrontBanners(position = "HOME_PROMOTION") {
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

    if (position && position !== "ALL") {
      whereConditions.push({
        position: {
          equals: position,
          mode: "insensitive",
        },
      });
    }

    const banners = await bannerRepository.findMany({
      where: { AND: whereConditions },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });

    return banners;
  },

  /**
   * Get all banners for admin with pagination, search, and status filter
   */
  async getAdminBanners(query = {}) {
    const { page, limit, skip } = getPaginationParams(query);
    const orderBy = getSortParams(query, ALLOWED_SORT_FIELDS, { sortOrder: "asc" });

    const whereConditions = [];

    const searchFilter = getSearchFilter(query.search, ["title", "subtitle"]);
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

    if (query.position && query.position !== "ALL") {
      whereConditions.push({
        position: {
          equals: query.position,
          mode: "insensitive",
        },
      });
    }

    const where = whereConditions.length > 0 ? { AND: whereConditions } : {};

    const [banners, total] = await Promise.all([
      bannerRepository.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      bannerRepository.count(where),
    ]);

    return {
      banners,
      pagination: formatPaginationMeta(total, page, limit),
    };
  },

  /**
   * Get single banner by ID
   */
  async getBannerById(id) {
    const banner = await bannerRepository.findById(id);
    if (!banner) {
      throw ApiError.notFound(`Banner with ID "${id}" was not found.`);
    }
    return banner;
  },

  /**
   * Create banner
   */
  async createBanner(payload) {
    if (payload.mediaAssetId) {
      const media = await mediaRepository.findById(payload.mediaAssetId);
      if (!media) {
        throw ApiError.badRequest(
          `Media asset with ID "${payload.mediaAssetId}" does not exist.`,
          [{ field: "mediaAssetId", message: "Invalid mediaAssetId" }]
        );
      }
    }

    if (payload.startAt && payload.endAt && new Date(payload.startAt) > new Date(payload.endAt)) {
      throw ApiError.badRequest("Banner start date cannot be after end date.", [
        { field: "endAt", message: "endAt must be after startAt" },
      ]);
    }

    return bannerRepository.create(payload);
  },

  /**
   * Update banner by ID
   */
  async updateBanner(id, payload) {
    const existing = await bannerRepository.findById(id);
    if (!existing) {
      throw ApiError.notFound(`Banner with ID "${id}" was not found.`);
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

    const effectiveStart = payload.startAt !== undefined ? payload.startAt : existing.startAt;
    const effectiveEnd = payload.endAt !== undefined ? payload.endAt : existing.endAt;

    if (effectiveStart && effectiveEnd && new Date(effectiveStart) > new Date(effectiveEnd)) {
      throw ApiError.badRequest("Banner start date cannot be after end date.", [
        { field: "endAt", message: "endAt must be after startAt" },
      ]);
    }

    return bannerRepository.update(id, payload);
  },

  /**
   * Delete banner by ID
   */
  async deleteBanner(id) {
    const existing = await bannerRepository.findById(id);
    if (!existing) {
      throw ApiError.notFound(`Banner with ID "${id}" was not found.`);
    }

    await bannerRepository.delete(id);
    return { message: "Banner deleted successfully", banner: existing };
  },
};

export default bannerService;
