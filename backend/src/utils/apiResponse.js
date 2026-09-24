/**
 * Standard API Response Utilities
 */

export function sendSuccess(
  res,
  {
    message = "Operation successful",
    data = {},
    statusCode = 200,
  } = {}
) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

export function sendPaginated(
  res,
  {
    message = "Records fetched successfully",
    data = [],
    pagination = {
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0,
    },
    statusCode = 200,
  } = {}
) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    pagination,
  });
}

export default {
  sendSuccess,
  sendPaginated,
};
