import app from "./app.js";
import { env } from "./config/env.js";
import { checkDatabaseConnection, disconnectDatabase } from "./config/database.js";

const server = app.listen(env.PORT, async () => {
  console.log(`[ASH Backend] Server running in ${env.NODE_ENV} mode on http://localhost:${env.PORT}`);
  console.log(`[ASH Backend] Health endpoint: http://localhost:${env.PORT}/api/v1/health`);

  // Verify database connectivity
  const dbCheck = await checkDatabaseConnection();
  if (dbCheck.connected) {
    console.log("[ASH Backend] Database: Connected successfully to PostgreSQL");
  } else {
    console.warn(`[ASH Backend] Database: Not connected (${dbCheck.message})`);
  }
});

// Graceful shutdown handling
const handleShutdown = async (signal) => {
  console.log(`\n[ASH Backend] Received ${signal}. Initiating graceful shutdown...`);

  server.close(async () => {
    console.log("[ASH Backend] HTTP server closed.");
    await disconnectDatabase();
    console.log("[ASH Backend] Shutdown complete.");
    process.exit(0);
  });

  // Force shutdown after 10s if hanging
  setTimeout(() => {
    console.error("[ASH Backend] Forced shutdown due to timeout.");
    process.exit(1);
  }, 10000);
};

process.on("SIGINT", () => handleShutdown("SIGINT"));
process.on("SIGTERM", () => handleShutdown("SIGTERM"));
