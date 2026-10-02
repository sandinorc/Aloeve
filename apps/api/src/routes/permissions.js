import express from 'express';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';
import { authMiddleware, requireRole } from '../middleware/rbac.js';
import permissionChecker from '../utils/permissionChecker.js';
import auditLog from '../utils/auditLog.js';

const router = express.Router();

/**
 * GET /permissions/user/:userId
 * Get user's role, accessible studios, and permission summary
 */
router.get('/user/:userId', authMiddleware, async (req, res) => {
  const { userId } = req.params;

  const user = await pb.collection('usuarios').getOne(userId);
  const role = user.role;
  const studios = await permissionChecker.getUserStudios(userId);

  // Get accessible workshops based on role
  let workshops = [];
  if (role === 'Admin' || role === 'Fundadora') {
    workshops = await pb.collection('talleres').getFullList();
  } else if (role === 'StudioManager') {
    const studioIds = studios.map((s) => s.id);
    if (studioIds.length > 0) {
      const filter = studioIds.map((id) => `studioId = "${id}"`).join(' || ');
      workshops = await pb.collection('talleres').getFullList({ filter });
    }
  } else if (role === 'Facilitador') {
    workshops = await pb.collection('talleres').getFullList({
      filter: `facilitatorIds ~ "${userId}"`,
    });
  }

  const permissionSummary = {
    canCreateStudio: role === 'Admin' || role === 'Fundadora',
    canCreateWorkshop: role === 'Admin' || role === 'Fundadora' || role === 'StudioManager',
    canCreateFacilitator: role === 'Admin' || role === 'Fundadora' || role === 'StudioManager',
    canEditUsers: role === 'Admin' || role === 'Fundadora',
    canViewAuditLogs: role === 'Admin' || role === 'Fundadora',
  };

  logger.info(`[permissions] User ${userId} permissions retrieved`);

  res.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role,
    },
    accessibleStudios: studios,
    accessibleWorkshops: workshops,
    permissionSummary,
  });
});

/**
 * GET /permissions/check
 * Check if user can perform an action on a resource
 * Query params: action, resource, resourceId (optional)
 */
router.get('/check', authMiddleware, async (req, res) => {
  const { action, resource, resourceId } = req.query;

  if (!action || !resource) {
    return res.status(400).json({ error: 'action and resource query parameters are required' });
  }

  const allowed = await permissionChecker.canUserPerformAction(req.user.id, action, resource);

  let reason = '';
  if (allowed) {
    reason = `User ${req.user.email} (${req.user.role}) is allowed to ${action} ${resource}`;
  } else {
    reason = `User ${req.user.email} (${req.user.role}) is not allowed to ${action} ${resource}`;
  }

  logger.info(`[permissions] Permission check: ${reason}`);

  res.json({
    allowed,
    reason,
    userId: req.user.id,
    userRole: req.user.role,
    action,
    resource,
    resourceId: resourceId || null,
  });
});

/**
 * POST /permissions/audit-logs
 * Create an audit log entry
 */
router.post('/audit-logs', authMiddleware, async (req, res) => {
  const { action, resourceType, resourceId, details } = req.body;

  if (!action || !resourceType || !resourceId) {
    return res
      .status(400)
      .json({ error: 'action, resourceType, and resourceId are required' });
  }

  const record = await auditLog.logAction(
    req.user.id,
    action,
    resourceType,
    resourceId,
    details || {}
  );

  logger.info(`[permissions] Audit log created: ${action} on ${resourceType} ${resourceId}`);

  res.json(record);
});

/**
 * GET /permissions/audit-logs
 * List audit logs (Admin/Fundadora only)
 * Query params: page, perPage
 */
router.get(
  '/audit-logs',
  authMiddleware,
  requireRole(['Admin', 'Fundadora']),
  async (req, res) => {
    const { page = 1, perPage = 50 } = req.query;

    const logs = await pb.collection('audit_logs').getList(parseInt(page), parseInt(perPage), {
      sort: '-timestamp',
    });

    logger.info(`[permissions] Audit logs retrieved: page ${page}, perPage ${perPage}`);

    res.json({
      items: logs.items,
      page: logs.page,
      perPage: logs.perPage,
      totalItems: logs.totalItems,
      totalPages: logs.totalPages,
    });
  }
);

/**
 * PUT /permissions/user/:userId/role
 * Update user's role (Admin/Fundadora only)
 */
router.put(
  '/user/:userId/role',
  authMiddleware,
  requireRole(['Admin', 'Fundadora']),
  async (req, res) => {
    const { userId } = req.params;
    const { newRole } = req.body;

    if (!newRole) {
      return res.status(400).json({ error: 'newRole is required' });
    }

    const validRoles = ['Admin', 'Fundadora', 'StudioManager', 'Facilitador', 'Host'];
    if (!validRoles.includes(newRole)) {
      return res.status(400).json({ error: `Invalid role. Must be one of: ${validRoles.join(', ')}` });
    }

    const user = await pb.collection('usuarios').getOne(userId);
    const oldRole = user.role;

    const updatedUser = await pb.collection('usuarios').update(userId, {
      role: newRole,
    });

    // Log the role change
    await auditLog.logAction(req.user.id, 'update_role', 'usuario', userId, {
      oldRole,
      newRole,
      changedBy: req.user.email,
    });

    logger.info(
      `[permissions] User ${userId} role changed from ${oldRole} to ${newRole} by ${req.user.email}`
    );

    res.json({
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      role: updatedUser.role,
      message: `Role updated from ${oldRole} to ${newRole}`,
    });
  }
);

export default router;