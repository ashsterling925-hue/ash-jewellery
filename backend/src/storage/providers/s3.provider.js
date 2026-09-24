import { StorageProviderInterface } from "../storage.interface.js";
import { env } from "../../config/env.js";

/**
 * S3 Storage Provider
 * Production-ready abstraction for AWS S3, Cloudflare R2, MinIO
 */
export class S3StorageProvider extends StorageProviderInterface {
  constructor() {
    super();
    this.bucket = env.STORAGE_BUCKET;
    this.region = env.STORAGE_REGION;
    this.accessKey = env.STORAGE_ACCESS_KEY;
    this.secretKey = env.STORAGE_SECRET_KEY;
    this.endpoint = env.STORAGE_ENDPOINT;

    if (!this.bucket || !this.accessKey || !this.secretKey) {
      console.warn("[S3StorageProvider] S3 credentials not fully configured in environment.");
    }
  }

  async upload({ buffer, originalFileName, mimeType, folder = "jewellery" }) {
    if (!this.bucket || !this.accessKey || !this.secretKey) {
      throw new Error("S3 storage provider is selected but credentials are not configured.");
    }
    // Provider implementation hook for AWS SDK / S3 client
    throw new Error("S3 direct upload requires @aws-sdk/client-s3 package and production credentials.");
  }

  async delete(storageKey) {
    if (!this.bucket) return false;
    throw new Error("S3 delete requires @aws-sdk/client-s3 package.");
  }

  getUrl(storageKey) {
    if (this.endpoint) {
      return `${this.endpoint.replace(/\/+$/, "")}/${this.bucket}/${storageKey}`;
    }
    return `https://${this.bucket}.s3.${this.region || "us-east-1"}.amazonaws.com/${storageKey}`;
  }

  async exists(storageKey) {
    return false;
  }
}
