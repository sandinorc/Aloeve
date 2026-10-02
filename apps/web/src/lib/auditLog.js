import pb from '@/lib/pocketbaseClient.js';

/**
 * Creates an audit log record in PocketBase
 */
export const logAction = async (action, resourceType, resourceId, details, userId) => {
  try {
    if (!userId && pb.authStore.isValid) {
      userId = pb.authStore.model.id;
    }
    
    if (!userId) return;

    await pb.collection('audit_logs').create({
      action,
      resourceType,
      resourceId,
      details,
      userId,
      timestamp: new Date().toISOString()
    }, { $autoCancel: false });
  } catch (error) {
    console.error('[AuditLog] Failed to log action:', error);
  }
};

/**
 * Logs failed access attempts
 */
export const logAccessDenied = async (action, resourceType, userId, reason) => {
  try {
    if (!userId && pb.authStore.isValid) {
      userId = pb.authStore.model.id;
    }

    await pb.collection('audit_logs').create({
      action: `DENIED: ${action}`,
      resourceType,
      userId: userId || 'anonymous',
      reason,
      timestamp: new Date().toISOString()
    }, { $autoCancel: false });
  } catch (error) {
    console.error('[AuditLog] Failed to log access denied:', error);
  }
};

/**
 * Logs role or permission changes
 */
export const logPermissionChange = async (userId, oldRole, newRole, changedBy) => {
  try {
    await pb.collection('audit_logs').create({
      action: 'UPDATE_ROLE',
      resourceType: 'usuarios',
      resourceId: userId,
      userId: changedBy,
      details: { oldRole, newRole },
      timestamp: new Date().toISOString()
    }, { $autoCancel: false });
  } catch (error) {
    console.error('[AuditLog] Failed to log permission change:', error);
  }
};