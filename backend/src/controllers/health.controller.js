import { getHealthStatus } from "../services/health.service.js";
import { sendSuccess } from "../utils/apiResponse.js";

/**
 * Handles GET /api/v1/health
 */
export async function healthCheck(req, res, next) {
  try {
    const healthData = await getHealthStatus();

    if (healthData.database === "connected") {
      return sendSuccess(res, {
        message: "ASH Jewellery API is healthy",
        data: healthData,
        statusCode: 200,
      });
    }

    // Degraded state (e.g. database not connected yet in dev)
    return res.status(503).json({
      success: false,
      message: "ASH Jewellery API is running, but database is unavailable",
      data: healthData,
    });
  } catch (error) {
    next(error);
  }
}

export default {
  healthCheck,
};
