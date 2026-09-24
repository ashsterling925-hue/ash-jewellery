/**
 * Reusable Pagination Utilities
 */

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

/**
 * Parses and normalizes pagination parameters from request query
 * @param {Object} query - Express req.query
 * @param {Object} defaults - Optional overrides for defaults
 * @returns {{ page: number, limit: number, skip: number }}
 */
export function getPaginationParams(query = {}, defaults = {}) {
  const defaultPage = defaults.defaultPage || DEFAULT_PAGE;
  const defaultLimit = defaults.defaultLimit || DEFAULT_LIMIT;
  const maxLimit = defaults.maxLimit || MAX_LIMIT;

  let page = parseInt(query.page, 10);
  if (isNaN(page) || page < 1) {
    page = defaultPage;
  }

  let limit = parseInt(query.limit, 10);
  if (isNaN(limit) || limit < 1) {
    limit = defaultLimit;
  } else if (limit > maxLimit) {
    limit = maxLimit;
  }

  const skip = (page - 1) * limit;

  return {
    page,
    limit,
    skip,
  };
}

/**
 * Computes pagination metadata object for response
 * @param {number} total - Total record count
 * @param {number} page - Current page
 * @param {number} limit - Records per page
 * @returns {{ page: number, limit: number, total: number, totalPages: number }}
 */
export function formatPaginationMeta(total, page, limit) {
  const safeTotal = Math.max(0, total || 0);
  const totalPages = Math.ceil(safeTotal / limit) || (safeTotal > 0 ? 1 : 0);

  return {
    page,
    limit,
    total: safeTotal,
    totalPages,
  };
}

export default {
  getPaginationParams,
  formatPaginationMeta,
};
