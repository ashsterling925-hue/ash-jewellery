/**
 * Reusable Query, Sorting & Search Helpers for Prisma
 */

/**
 * Builds a safe Prisma orderBy object based on validated whitelist
 * @param {Object} query - Express req.query
 * @param {string[]} allowedFields - Whitelisted fields eligible for sorting
 * @param {Object} defaultSort - Default sort object e.g. { createdAt: "desc" }
 * @returns {Object} Prisma orderBy clause
 */
export function getSortParams(query = {}, allowedFields = [], defaultSort = { createdAt: "desc" }) {
  const sortBy = query.sortBy || query.sort;
  const orderDirection = (query.order || query.sortOrder || "desc").toLowerCase();
  const sortOrder = orderDirection === "asc" ? "asc" : "desc";

  if (sortBy && allowedFields.includes(sortBy)) {
    return { [sortBy]: sortOrder };
  }

  return defaultSort;
}

/**
 * Builds a safe Prisma case-insensitive search filter
 * @param {string} searchTerm - Search query string
 * @param {string[]} fields - String fields to search against
 * @returns {Object|undefined} Prisma where clause or undefined if empty
 */
export function getSearchFilter(searchTerm, fields = []) {
  if (!searchTerm || typeof searchTerm !== "string" || !fields.length) {
    return undefined;
  }

  const trimmed = searchTerm.trim();
  if (!trimmed) {
    return undefined;
  }

  return {
    OR: fields.map((field) => ({
      [field]: {
        contains: trimmed,
        mode: "insensitive",
      },
    })),
  };
}

export default {
  getSortParams,
  getSearchFilter,
};
