import { heroRepository } from "../repositories/hero.repository.js";
import { mediaRepository } from "../repositories/media.repository.js";
import { ApiError } from "../utils/apiError.js";

export const heroService = {
  /**
   * Get single active hero configuration for storefront
   */
  async getStorefrontHero() {
    const hero = await heroRepository.findActive();
    return hero;
  },

  /**
   * Get current hero configuration for admin
   */
  async getAdminHero() {
    const hero = await heroRepository.findLatest();
    return hero;
  },

  /**
   * Save or update current hero configuration
   */
  async saveHero(payload) {
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
