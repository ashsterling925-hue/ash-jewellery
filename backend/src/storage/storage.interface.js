/**
 * Storage Provider Interface
 * All storage providers (Local, S3, Cloudinary, etc.) must implement this contract.
 */
export class StorageProviderInterface {
  /**
   * Upload a file buffer to storage
   * @param {Object} params
   * @param {Buffer} params.buffer - File buffer
   * @param {string} params.originalFileName - Original filename from client
   * @param {string} params.mimeType - MIME type of file
   * @param {string} [params.folder='jewellery'] - Storage destination folder/prefix
   * @returns {Promise<{ storageKey: string, url: string, fileName: string }>}
   */
  async upload({ buffer, originalFileName, mimeType, folder = "jewellery" }) {
    throw new Error("Method 'upload' must be implemented by storage provider.");
  }

  /**
   * Delete a file from storage by its storage key
   * @param {string} storageKey - Key/path of file in storage
   * @returns {Promise<boolean>}
   */
  async delete(storageKey) {
    throw new Error("Method 'delete' must be implemented by storage provider.");
  }

  /**
   * Get public/accessible URL for a storage key
   * @param {string} storageKey - Key/path of file in storage
   * @returns {string}
   */
  getUrl(storageKey) {
    throw new Error("Method 'getUrl' must be implemented by storage provider.");
  }

  /**
   * Check if a file exists in storage
   * @param {string} storageKey - Key/path of file in storage
   * @returns {Promise<boolean>}
   */
  async exists(storageKey) {
    throw new Error("Method 'exists' must be implemented by storage provider.");
  }
}
