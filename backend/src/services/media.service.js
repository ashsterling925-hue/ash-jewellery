import imageSize from "image-size";
import { mediaRepository } from "../repositories/media.repository.js";
import { storageService } from "../storage/storage.service.js";
import { ApiError } from "../utils/apiError.js";

export class MediaService {
  /**
   * Format media entity for consistent API response
   */
  formatMedia(media) {
    if (!media) return null;
    return {
      id: media.id,
      fileName: media.fileName,
      originalFileName: media.originalFileName || media.fileName,
      storageKey: media.storageKey,
      url: media.url,
      mimeType: media.mimeType,
      fileSize: media.sizeBytes,
      sizeBytes: media.sizeBytes,
      width: media.width,
      height: media.height,
      altText: media.altText || "",
      title: media.title || "",
      folder: media.folder,
      status: media.status,
      createdAt: media.createdAt,
      updatedAt: media.updatedAt,
      usageCount: media._count
        ? (media._count.productImages || 0) + (media._count.categories || 0) + (media._count.collections || 0)
        : 0,
      usage: media._count
        ? {
            products: media._count.productImages || 0,
            categories: media._count.categories || 0,
            collections: media._count.collections || 0,
          }
        : undefined,
    };
  }

  /**
   * Get paginated media assets with search, filters, sorting
   */
  async getMedia(query = {}) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const where = {};

    // Status filter
    if (query.status && query.status !== "All") {
      where.status = query.status;
    }

    // MIME type filter
    if (query.mimeType && query.mimeType !== "All") {
      where.mimeType = query.mimeType;
    }

    // Folder filter
    if (query.folder) {
      where.folder = query.folder;
    }

    // Server-side search across relevant metadata: originalFileName, fileName, title, altText
    if (query.search && query.search.trim()) {
      const term = query.search.trim();
      where.OR = [
        { originalFileName: { contains: term, mode: "insensitive" } },
        { fileName: { contains: term, mode: "insensitive" } },
        { title: { contains: term, mode: "insensitive" } },
        { altText: { contains: term, mode: "insensitive" } },
      ];
    }

    // Whitelisted sorting
    const sortBy = query.sortBy === "fileSize" ? "sizeBytes" : query.sortBy || "createdAt";
    const sortOrder = query.sortOrder === "asc" ? "asc" : "desc";
    const orderBy = { [sortBy]: sortOrder };

    const [items, total] = await Promise.all([
      mediaRepository.findMany({ where, skip, take: limit, orderBy }),
      mediaRepository.count(where),
    ]);

    return {
      items: items.map(this.formatMedia),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  /**
   * Get media asset by ID
   */
  async getMediaById(id) {
    const media = await mediaRepository.findById(id);
    if (!media) {
      throw ApiError.notFound(`Media asset with ID '${id}' not found.`);
    }
    return this.formatMedia(media);
  }

  /**
   * Upload media asset
   * Validates file, uploads to storage, determines dimensions, creates DB record,
   * cleans up on failure.
   */
  async uploadMedia(file, metadata = {}) {
    if (!file || !file.buffer) {
      throw ApiError.badRequest("No file buffer provided for media upload.");
    }

    // 1. Determine image dimensions safely
    let width = null;
    let height = null;
    try {
      const dimensions = imageSize(file.buffer);
      width = dimensions.width || null;
      height = dimensions.height || null;
    } catch {
      // Dimensions not available for SVG or non-raster media types
    }

    // 2. Upload to storage provider
    const folder = metadata.folder || "jewellery";
    let uploadResult;
    try {
      uploadResult = await storageService.upload({
        buffer: file.buffer,
        originalFileName: file.originalname,
        mimeType: file.mimetype,
        folder,
      });
    } catch (storageErr) {
      console.error("[MediaService] Storage upload failed:", storageErr);
      throw ApiError.internal("Failed to upload file to storage provider.");
    }

    // 3. Insert metadata record in PostgreSQL/Neon
    try {
      const media = await mediaRepository.create({
        fileName: uploadResult.fileName,
        originalFileName: file.originalname || uploadResult.fileName,
        storageKey: uploadResult.storageKey,
        url: uploadResult.url,
        mimeType: file.mimetype,
        sizeBytes: file.size || file.buffer.length,
        width,
        height,
        altText: metadata.altText || metadata.title || null,
        title: metadata.title || file.originalname || null,
        folder,
        status: metadata.status || "ACTIVE",
      });

      return this.formatMedia(media);
    } catch (dbErr) {
      console.error("[MediaService] Database insertion failed after storage upload:", dbErr);
      // Clean up orphaned file from storage
      try {
        await storageService.delete(uploadResult.storageKey);
        console.log(`[MediaService] Cleaned up orphaned file '${uploadResult.storageKey}' from storage.`);
      } catch (cleanupErr) {
        console.error(`[MediaService] Failed to clean up orphaned storage file '${uploadResult.storageKey}':`, cleanupErr);
      }
      throw ApiError.internal("Failed to save media metadata to database.");
    }
  }

  /**
   * Update media metadata (altText, title, status)
   */
  async updateMedia(id, data = {}) {
    const existing = await mediaRepository.findById(id);
    if (!existing) {
      throw ApiError.notFound(`Media asset with ID '${id}' not found.`);
    }

    const updatePayload = {};
    if (data.altText !== undefined) updatePayload.altText = data.altText;
    if (data.title !== undefined) updatePayload.title = data.title;
    if (data.status !== undefined) updatePayload.status = data.status;

    const updated = await mediaRepository.update(id, updatePayload);
    return this.formatMedia(updated);
  }

  /**
   * Safe delete / archive media
   */
  async deleteMedia(id) {
    const existing = await mediaRepository.findById(id);
    if (!existing) {
      throw ApiError.notFound(`Media asset with ID '${id}' not found.`);
    }

    // Check if referenced by Products, Categories, Collections
    const usage = await mediaRepository.countUsage(id);
    if (usage.totalUsage > 0) {
      // Archive instead of deleting to protect referential integrity and storefront assets
      const archived = await mediaRepository.update(id, { status: "ARCHIVED" });
      return {
        archived: true,
        message: `Media is currently referenced by ${usage.productCount} product(s), ${usage.categoryCount} category(ies), and ${usage.collectionCount} collection(s). It has been archived instead of deleted.`,
        media: this.formatMedia(archived),
      };
    }

    // Safe to delete completely from database and storage
    await mediaRepository.delete(id);

    if (existing.storageKey) {
      try {
        await storageService.delete(existing.storageKey);
      } catch (err) {
        console.warn(`[MediaService] Failed to delete storage file '${existing.storageKey}':`, err.message);
      }
    }

    return {
      archived: false,
      message: "Media asset deleted successfully from library and storage.",
    };
  }
}

export const mediaService = new MediaService();
export default mediaService;
