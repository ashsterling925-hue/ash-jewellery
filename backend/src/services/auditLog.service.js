import { prisma } from "../config/prisma.js";

export const auditLogService = {
  /**
   * Log an audit event
   * @param {Object} params - { userId, adminId, action, entity, entityId, metadata, ipAddress }
   */
  async log({
    userId = null,
    adminId = null,
    action,
    entity = "AUTH",
    entityId = null,
    metadata = null,
    ipAddress = null,
  }) {
    try {
      // Sanitize metadata to never include sensitive credentials or tokens
      let safeMetadata = metadata;
      if (metadata && typeof metadata === "object") {
        safeMetadata = { ...metadata };
        delete safeMetadata.password;
        delete safeMetadata.passwordHash;
        delete safeMetadata.token;
        delete safeMetadata.refreshToken;
        delete safeMetadata.accessToken;
        delete safeMetadata.resetToken;
      }

      await prisma.auditLog.create({
        data: {
          userId,
          adminId,
          action,
          entity,
          entityId,
          metadata: safeMetadata,
          ipAddress,
        },
      });
    } catch (err) {
      // Fail safely without disrupting the calling authentication flow
      console.error("Failed to record audit log:", err.message);
    }
  },
};

export default auditLogService;
