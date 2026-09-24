import bcrypt from "bcryptjs";
import crypto from "crypto";

const BCRYPT_SALT_ROUNDS = 12;

/**
 * Hash a password using bcrypt with cost factor 12
 * @param {string} password - Raw password
 * @returns {Promise<string>} - Password hash
 */
export async function hashPassword(password) {
  if (!password || typeof password !== "string") {
    throw new Error("Password must be a non-empty string");
  }
  const salt = await bcrypt.genSalt(BCRYPT_SALT_ROUNDS);
  return bcrypt.hash(password, salt);
}

/**
 * Verify a plain text password against a stored hash
 * @param {string} password - Raw password
 * @param {string} hash - Stored hash
 * @returns {Promise<boolean>}
 */
export async function verifyPassword(password, hash) {
  if (!password || !hash) return false;
  return bcrypt.compare(password, hash);
}

/**
 * Hash a raw token string (refresh token, reset token) using SHA-256
 * @param {string} token - Raw token string
 * @returns {string} - Hex digest
 */
export function hashToken(token) {
  if (!token || typeof token !== "string") {
    throw new Error("Token must be a non-empty string");
  }
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Generate a cryptographically secure random hex string
 * @param {number} bytes - Number of random bytes
 * @returns {string} - Hex string
 */
export function generateRandomToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString("hex");
}

export default {
  hashPassword,
  verifyPassword,
  hashToken,
  generateRandomToken,
};
