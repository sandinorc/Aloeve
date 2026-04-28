import express from 'express';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';
import { authMiddleware, requireRole } from '../middleware/rbac.js';
import auditLog from '../utils/auditLog.js';

const router = express.Router();

/**
 * GET /users
 * List all users (Admin/Fundadora only)
 */
router.get('/', authMiddleware, requireRole(['Admin', 'Fundadora']), async (req, res) => {
  const { page = 1, perPage = 50 } = req.query;

  const users = await pb.collection('usuarios').getList(parseInt(page), parseInt(perPage));

  logger.info(`[users] User ${req.user.email} retrieved users list`);

  res.json({
    items: users.items,
    page: users.page,
    perPage: users.perPage,
    totalItems: users.totalItems,
    totalPages: users.totalPages,
  });
});

/**
 * GET /users/:id
 * Get a specific user
 */
router.get('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;

  // Users can only view their own profile unless they're Admin/Fundadora
  if (req.user.id !== id && req.user.role !== 'Admin' && req.user.role !== 'Fundadora') {
    logger.warn(`[users] User ${req.user.email} denied access to user ${id}`);
    return res.status(403).json({ error: 'You do not have permission to access this user' });
  }

  const user = await pb.collection('usuarios').getOne(id);

  logger.info(`[users] User ${req.user.email} retrieved user ${id}`);

  res.json(user);
});

/**
 * POST /users
 * Create a new user (Admin/Fundadora only)
 */
router.post('/', authMiddleware, requireRole(['Admin', 'Fundadora']), async (req, res) => {
  const { email, password, name, role, studioId } = req.body;

  if (!email || !password || !name || !role) {
    return res.status(400).json({ error: 'email, password, name, and role are required' });
  }

  const validRoles = ['Admin', 'Fundadora', 'StudioManager', 'Facilitador', 'Host'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ error: `Invalid role. Must be one of: ${validRoles.join(', ')}` });
  }

  const user = await pb.collection('usuarios').create({
    email,
    password,
    passwordConfirm: password,
    name,
    role,
    studioId: studioId || null,
  });

  // Log the action
  await auditLog.logAction(req.user.id, 'create', 'usuario', user.id, {
    email,
    name,
    role,
    studioId,
  });

  logger.info(`[users] User ${user.id} created by ${req.user.email}`);

  res.status(201).json({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    studioId: user.studioId,
  });
});

/**
 * PUT /users/:id
 * Update a user
 */
router.put('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { name, email, studioId } = req.body;

  // Users can only update their own profile unless they're Admin/Fundadora
  if (req.user.id !== id && req.user.role !== 'Admin' && req.user.role !== 'Fundadora') {
    logger.warn(`[users] User ${req.user.email} denied permission to update user ${id}`);
    return res.status(403).json({ error: 'You do not have permission to update this user' });
  }

  const user = await pb.collection('usuarios').getOne(id);

  const updatedUser = await pb.collection('usuarios').update(id, {
    name: name !== undefined ? name : user.name,
    email: email !== undefined ? email : user.email,
    studioId: studioId !== undefined ? studioId : user.studioId,
  });

  // Log the action
  await auditLog.logAction(req.user.id, 'update', 'usuario', id, {
    changes: { name, email, studioId },
  });

  logger.info(`[users] User ${id} updated by ${req.user.email}`);

  res.json({
    id: updatedUser.id,
    email: updatedUser.email,
    name: updatedUser.name,
    role: updatedUser.role,
    studioId: updatedUser.studioId,
  });
});

/**
 * DELETE /users/:id
 * Delete a user (Admin/Fundadora only)
 */
router.delete('/:id', authMiddleware, requireRole(['Admin', 'Fundadora']), async (req, res) => {
  const { id } = req.params;

  // Prevent deleting yourself
  if (req.user.id === id) {
    logger.warn(`[users] User ${req.user.email} attempted to delete their own account`);
    return res.status(400).json({ error: 'You cannot delete your own account' });
  }

  await pb.collection('usuarios').delete(id);

  // Log the action
  await auditLog.logAction(req.user.id, 'delete', 'usuario', id, {});

  logger.info(`[users] User ${id} deleted by ${req.user.email}`);

  res.json({ message: 'User deleted successfully', id });
});

export default router;