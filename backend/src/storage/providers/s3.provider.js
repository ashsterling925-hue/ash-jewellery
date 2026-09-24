import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import crypto from "crypto";
import path from "path";
import { StorageProviderInterface } from "../storage.interface.js";
import { env } from "../../config/env.js";

/**
 * S3 Storage Provider
 * Production-ready implementation for AWS S3, Cloudflare R2, MinIO, DigitalOcean Spaces
 */
export class S3StorageProvider extends StorageProviderInterface {
  constructor() {
    super();
    this.bucket = env.STORAGE_BUCKET;
    this.region = env.STORAGE_REGION || "ap-south-1";
    this.accessKey = env.STORAGE_ACCESS_KEY;
    this.secretKey = env.STORAGE_SECRET_KEY;
    this.endpoint = env.STORAGE_ENDPOINT?.trim() || null;

    if (!this.bucket || !this.accessKey || !this.secretKey) {
      console.warn("[S3StorageProvider] S3 credentials not fully configured in environment.");
      this.client = null;
    } else {
      const clientConfig = {
        region: this.region,
        credentials: {
          accessKeyId: this.accessKey,
          secretAccessKey: this.secretKey,
        },
      };

      // Custom endpoint for S3-compatible services (Cloudflare R2, MinIO, DigitalOcean)
      if (this.endpoint) {
        clientConfig.endpoint = this.endpoint;
        // Use path-style addressing if using MinIO or custom local endpoints
        if (this.endpoint.includes("localhost") || this.endpoint.includes("127.0.0.1") || this.endpoint.includes("minio")) {
          clientConfig.forcePathStyle = true;
        }
      }

      this.client = new S3Client(clientConfig);
    }
  }

  /**
   * Sanitize original filename
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
   * Upload buffer to S3 bucket
   */
  async upload({ buffer, originalFileName, mimeType, folder = "jewellery" }) {
    if (!this.client || !this.bucket) {
      throw new Error("S3 storage provider is selected but credentials or bucket are not configured.");
    }

    const safeFolder = folder.replace(/[^a-zA-Z0-9_-]/g, "");
    const safeName = this.sanitizeFileName(originalFileName);
    const uniqueId = crypto.randomUUID();
    const storageKey = `${safeFolder}/${uniqueId}-${safeName}`;

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: storageKey,
      Body: buffer,
      ContentType: mimeType || "application/octet-stream",
    });

    await this.client.send(command);

    const url = this.getUrl(storageKey);

    return {
      storageKey,
      url,
      fileName: `${uniqueId}-${safeName}`,
    };
  }

  /**
   * Delete object from S3 bucket
   */
  async delete(storageKey) {
    if (!this.client || !this.bucket || !storageKey) return false;

    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: storageKey,
      });
      await this.client.send(command);
      return true;
    } catch (err) {
      console.error(`[S3StorageProvider] Failed to delete object ${storageKey}:`, err);
      return false;
    }
  }

  /**
   * Construct public URL for an S3 object
   */
  getUrl(storageKey) {
    if (this.endpoint) {
      const cleanEndpoint = this.endpoint.replace(/\/+$/, "");
      return `${cleanEndpoint}/${this.bucket}/${storageKey}`;
    }
    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${storageKey}`;
  }

  /**
   * Check if object exists in S3
   */
  async exists(storageKey) {
    if (!this.client || !this.bucket || !storageKey) return false;

    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: storageKey,
      });
      await this.client.send(command);
      return true;
    } catch {
      return false;
    }
  }
}
