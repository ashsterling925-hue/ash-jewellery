import { prisma } from "../config/prisma.js";
import { heroRepository } from "../repositories/hero.repository.js";
import { mediaRepository } from "../repositories/media.repository.js";
import { ApiError } from "../utils/apiError.js";
import { memoryCache } from "../utils/cache.js";

export const heroService = {
  /**
   * Get hero configuration for storefront (multi-slide pictures with no text overlay)
   */
  async getStorefrontHero() {
    const section = await prisma.homepageSection.findUnique({
      where: { sectionKey: "HERO_SLIDER" },
    });

    if (section) {
      const slides = Array.isArray(section?.configuration?.slides)
        ? section.configuration.slides
        : [];
      return {
        id: section.id,
        slides,
        status: section.status || "ACTIVE",
      };
    }

    // Fallback to legacy single hero record only if HERO_SLIDER section doesn't exist
    const hero = await heroRepository.findActive();
    if (hero) {
      const fallbackSlides = [];
      if (hero.mediaAsset?.url) {
        fallbackSlides.push({
          id: hero.id,
          mediaAssetId: hero.mediaAssetId,
          url: hero.mediaAsset.url,
          altText: hero.mediaAsset.altText || "ASH Jewellery Hero",
          sortOrder: 1,
        });
      }
      return {
        ...hero,
        slides: fallbackSlides,
      };
    }

    return { slides: [] };
  },

  /**
   * Get hero configuration for admin
   */
  async getAdminHero() {
    const section = await prisma.homepageSection.findUnique({
      where: { sectionKey: "HERO_SLIDER" },
    });

    if (section) {
      const slides = Array.isArray(section?.configuration?.slides)
        ? section.configuration.slides
        : [];
      return {
        id: section.id,
        slides,
        status: section.status || "ACTIVE",
      };
    }

    const hero = await heroRepository.findLatest();
    if (hero) {
      const fallbackSlides = [];
      if (hero.mediaAsset?.url) {
        fallbackSlides.push({
          id: hero.id,
          mediaAssetId: hero.mediaAssetId,
          url: hero.mediaAsset.url,
          altText: hero.mediaAsset.altText || "ASH Jewellery Hero",
          sortOrder: 1,
        });
      }
      return {
        ...hero,
        slides: fallbackSlides,
      };
    }

    return { slides: [] };
  },

  /**
   * Save or update multiple hero slides
   */
  async saveHero(payload) {
    if (Array.isArray(payload.slides)) {
      const cleanedSlides = payload.slides
        .map((s, idx) => ({
          id: s.id || `slide-${Date.now()}-${idx}`,
          mediaAssetId: s.mediaAssetId || null,
          url: s.url,
          altText: s.altText || `Hero Slide ${idx + 1}`,
          sortOrder: typeof s.sortOrder === "number" ? s.sortOrder : idx + 1,
        }))
        .filter((s) => Boolean(s.url));

      const section = await prisma.homepageSection.upsert({
        where: { sectionKey: "HERO_SLIDER" },
        update: {
          configuration: { slides: cleanedSlides },
          status: payload.status || "Active",
        },
        create: {
          sectionKey: "HERO_SLIDER",
          title: "Hero Slider",
          configuration: { slides: cleanedSlides },
          status: payload.status || "Active",
        },
      });

      // Keep legacy HeroSection in sync
      const firstMediaAssetId = cleanedSlides[0]?.mediaAssetId;
      const latest = await heroRepository.findLatest();
      if (latest) {
        if (firstMediaAssetId) {
          await heroRepository.update(latest.id, {
            mediaAssetId: firstMediaAssetId,
            status: payload.status || "ACTIVE",
          });
        } else {
          // If no slides or no mediaAssetId, clear legacy hero so it doesn't resurrect
          await heroRepository.update(latest.id, {
            mediaAssetId: null,
            status: "INACTIVE",
          });
        }
      }

      memoryCache.flushPrefix("storefront:hero");

      return {
        id: section.id,
        slides: cleanedSlides,
        status: section.status,
      };
    }

    // Legacy fallback if single hero object sent
    if (payload.mediaAssetId) {
      const media = await mediaRepository.findById(payload.mediaAssetId);
      if (!media) {
        throw ApiError.badRequest(
          `Media asset with ID "${payload.mediaAssetId}" does not exist.`,
          [{ field: "mediaAssetId", message: "Invalid mediaAssetId" }]
        );
      }
    }

    const latest = await heroRepository.findLatest();
    if (latest) {
      return heroRepository.update(latest.id, payload);
    }
    return heroRepository.create(payload);
  },

  /**
   * Update hero configuration by ID
   */
  async updateHero(id, payload) {
    if (Array.isArray(payload.slides)) {
      return this.saveHero(payload);
    }
    const existing = await heroRepository.findById(id);
    if (!existing) {
      throw ApiError.notFound(`Hero section with ID "${id}" was not found.`);
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

    return heroRepository.update(id, payload);
  },
};

export default heroService;
