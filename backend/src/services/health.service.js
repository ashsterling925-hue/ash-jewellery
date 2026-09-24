import { env } from "../config/env.js";
import { checkDatabaseConnection } from "../config/database.js";

/**
 * Health check service evaluating API and database status
 */
export async function getHealthStatus() {
  const dbStatus = await checkDatabaseConnection();

  return {
    status: dbStatus.connected ? "ok" : "degraded",
    environment: env.NODE_ENV,
    database: dbStatus.connected ? "connected" : "disconnected",
    timestamp: new Date().toISOString(),
  };
}

export default {
  getHealthStatus,
};
