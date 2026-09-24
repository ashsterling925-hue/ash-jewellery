import { env } from "../config/env.js";
import { LocalStorageProvider } from "./providers/localStorage.provider.js";
import { S3StorageProvider } from "./providers/s3.provider.js";

class StorageService {
  constructor() {
    this.provider = this.resolveProvider();
  }

  resolveProvider() {
    const providerType = (env.STORAGE_PROVIDER || "local").toLowerCase();
    switch (providerType) {
      case "s3":
        return new S3StorageProvider();
      case "local":
      default:
        return new LocalStorageProvider();
    }
  }

  /**
   * Upload file to active storage provider
   */
  async upload(params) {
    return this.provider.upload(params);
  }

  /**
   * Delete file by storageKey
   */
  async delete(storageKey) {
    return this.provider.delete(storageKey);
  }

  /**
   * Resolve public URL
   */
  getUrl(storageKey) {
    return this.provider.getUrl(storageKey);
  }

  /**
   * Check if file exists
   */
  async exists(storageKey) {
    return this.provider.exists(storageKey);
  }
}

export const storageService = new StorageService();
export default storageService;
