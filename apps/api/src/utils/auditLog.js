import 'dotenv/config';
import pb from './pocketbaseClient.js';
import logger from './logger.js';

/**
 * Log an action to the audit_logs collection
 */
const logAction = async (userId, action, resourceType, resourceId, details = {}) => {
  try {
    const record = await pb.collection('audit_logs').create({
      userId,
      action,
      resourceType,
      resourceId,
      details: JSON.stringify(details),
      timestamp: new Date().toISOString(),
    });

    logger.info(
      `[auditLog] Action logged: ${action} on ${resourceType} ${resourceId} by user ${userId}`
    );
    return record;
  } catch (error) {
    logger.error(`[auditLog] Failed to log action: ${error.message}`);
    throw error;
  }
};

export default {
  logAction,
};