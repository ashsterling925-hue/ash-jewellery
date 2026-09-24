import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";
import { StorageProviderInterface } from "../storage.interface.js";
import { env } from "../../config/env.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOADS_ROOT = path.resolve(__dirname, "../../../uploads");

export class LocalStorageProvider extends StorageProviderInterface {
  constructor() {
    super();
    this.uploadsRoot = UPLOADS_ROOT;
    this.baseUrl = env.STORAGE_LOCAL_BASE_URL.replace(/\/+$/, "");
  }

  /**
   * Sanitize filename to avoid path traversal and invalid characters
   * @param {string} originalName
   * @returns {string}
   */
  sanitizeFileName(originalName) {
    const ext = path.extname(originalName || "").toLowerCase();
    const base = path.basename(originalName || "file", ext)
      .replace(/[^a-zA-Z0-9_-]/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 50);
    return `${base || "asset"}${ext}`;
  }

  /**
   * Upload buffer to local disk
   */
  async upload({ buffer, originalFileName, mimeType, folder = "jewellery" }) {
    // Prevent path traversal in folder
    const safeFolder = folder.replace(/[^a-zA-Z0-9_-]/g, "");
    const safeName = this.sanitizeFileName(originalFileName);
    const uniqueId = crypto.randomUUID();
    const storageKey = `${safeFolder}/${uniqueId}-${safeName}`;
    const targetPath = path.resolve(this.uploadsRoot, storageKey);

    // Verify targetPath is strictly inside uploadsRoot
    if (!targetPath.startsWith(this.uploadsRoot)) {
      throw new Error("Invalid storage destination path.");
    }

    // Ensure directory exists
    await fs.mkdir(path.dirname(targetPath), { recursive: true });

    // Write file buffer
    await fs.writeFile(targetPath, buffer);

    const url = this.getUrl(storageKey);

    return {
      storageKey,
      url,
      fileName: `${uniqueId}-${safeName}`,
    };
  }

  /**
   * Delete file from disk
   */
  async delete(storageKey) {
    if (!storageKey) return false;
    const targetPath = path.resolve(this.uploadsRoot, storageKey);

    // Path traversal check
    if (!targetPath.startsWith(this.uploadsRoot)) {
      throw new Error("Invalid storage path traversal detected.");
    }

    try {
      await fs.unlink(targetPath);
      return true;
    } catch (err) {
      if (err.code === "ENOENT") {
        return false; // Already gone
      }
      throw err;
    }
  }

  /**
   * Get public URL for static express route
   */
  getUrl(storageKey) {
    if (!storageKey) return "";
    return `${this.baseUrl}/${storageKey.replace(/\\/g, "/")}`;
  }

  /**
   * Check if file exists on disk
   */
  async exists(storageKey) {
    if (!storageKey) return false;
    const targetPath = path.resolve(this.uploadsRoot, storageKey);
    if (!targetPath.startsWith(this.uploadsRoot)) {
      return false;
    }
    try {
      await fs.access(targetPath);
      return true;
    } catch {
      return false;
    }
  }
}
