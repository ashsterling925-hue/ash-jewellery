/**
 * 404 Catch-all handler for undefined routes
 */
export function notFound(req, res, next) {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.method} ${req.originalUrl} not found`,
    code: "ROUTE_NOT_FOUND",
    errors: [],
  });
}

export default notFound;
