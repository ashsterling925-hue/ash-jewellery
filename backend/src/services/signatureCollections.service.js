import { prisma } from "../config/prisma.js";
import { categoryRepository } from "../repositories/category.repository.js";
import { memoryCache } from "../utils/cache.js";

const SECTION_KEY = "SIGNATURE_COLLECTIONS";

export const signatureCollectionsService = {
  /**
   * Get signature collections configuration and active categories
   */
  async getConfig() {
    // 1. Fetch all active categories ordered by sortOrder ascending
    const categories = await categoryRepository.findMany({
      where: { status: { equals: "Active", mode: "insensitive" } },
      orderBy: { sortOrder: "asc" },
      include: {
        mediaAsset: true,
      },
    });

    // 2. Fetch HomepageSection configuration
    const section = await prisma.homepageSection.findUnique({
      where: { sectionKey: SECTION_KEY },
    });

    const rawConfig = section?.configuration || {};
    let featuredCategoryId = rawConfig.featuredCategoryId || null;
    let wideCategoryId = rawConfig.wideCategoryId || null;

    // 3. Validation & Graceful Fallback
    const activeIds = new Set(categories.map((c) => c.id));

    if (categories.length === 3) {
      if (!featuredCategoryId || !activeIds.has(featuredCategoryId)) {
        featuredCategoryId = categories[0]?.id || null;
      }
      wideCategoryId = null; // Wide is not used in 3-category layout
    } else if (categories.length >= 4) {
      if (!featuredCategoryId || !activeIds.has(featuredCategoryId)) {
        featuredCategoryId = categories[0]?.id || null;
      }

      if (
        !wideCategoryId ||
        !activeIds.has(wideCategoryId) ||
        wideCategoryId === featuredCategoryId
      ) {
        const nextCat = categories.find((c) => c.id !== featuredCategoryId);
        wideCategoryId = nextCat?.id || null;
      }
    } else {
      // 1 or 2 categories: No featured/wide
      featuredCategoryId = null;
      wideCategoryId = null;
    }

    return {
      categories,
      configuration: {
        featuredCategoryId,
        wideCategoryId,
      },
      status: section?.status || "Active",
    };
  },

  /**
   * Save signature collections configuration and optionally reorder categories
   */
  async saveConfig(payload) {
    const { featuredCategoryId, wideCategoryId, orderedCategoryIds } = payload;

    // 1. If reordering categories, update sortOrder in a transaction
    if (Array.isArray(orderedCategoryIds) && orderedCategoryIds.length > 0) {
      const updates = orderedCategoryIds.map((id, index) =>
        prisma.category.update({
          where: { id },
          data: { sortOrder: index + 1 },
        })
      );
      await prisma.$transaction(updates);
    }

    // 2. Validate category selections against existing active categories
    const categories = await categoryRepository.findMany({
      where: { status: { equals: "Active", mode: "insensitive" } },
      orderBy: { sortOrder: "asc" },
      include: { mediaAsset: true },
    });

    const activeIds = new Set(categories.map((c) => c.id));
    let cleanFeaturedId = activeIds.has(featuredCategoryId) ? featuredCategoryId : null;
    let cleanWideId = activeIds.has(wideCategoryId) ? wideCategoryId : null;

    if (cleanWideId && cleanWideId === cleanFeaturedId) {
      cleanWideId = null;
    }

    // 3. Upsert HomepageSection
    const section = await prisma.homepageSection.upsert({
      where: { sectionKey: SECTION_KEY },
      update: {
        configuration: {
          featuredCategoryId: cleanFeaturedId,
          wideCategoryId: cleanWideId,
        },
        status: "Active",
      },
      create: {
        sectionKey: SECTION_KEY,
        title: "Signature Collections",
        configuration: {
          featuredCategoryId: cleanFeaturedId,
          wideCategoryId: cleanWideId,
        },
        status: "Active",
      },
    });

    // 4. Invalidate caches
    memoryCache.flushPrefix("storefront:signature-collections");
    memoryCache.flushPrefix("storefront:categories");

    return {
      categories,
      configuration: {
        featuredCategoryId: cleanFeaturedId,
        wideCategoryId: cleanWideId,
      },
      status: section.status,
    };
  },
};
