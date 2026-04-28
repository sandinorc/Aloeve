import express from 'express';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';
import { authMiddleware } from '../middleware/rbac.js';

const router = express.Router();

/**
 * GET /roles
 * List all roles with pagination
 */
router.get('/', authMiddleware, async (req, res) => {
  const { page = 1, perPage = 50 } = req.query;
  logger.info(`[roles] User ${req.user.email} fetching roles list`);

  const roles = await pb.collection('roles').getList(parseInt(page), parseInt(perPage));

  res.json({
    items: roles.items,
    page: roles.page,
    perPage: roles.perPage,
    totalItems: roles.totalItems,
    totalPages: roles.totalPages,
  });
});

/**
 * GET /roles/:id
 * Get a specific role
 */
router.get('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  logger.info(`[roles] User ${req.user.email} fetching role ${id}`);

  const role = await pb.collection('roles').getOne(id);
  res.json(role);
});

/**
 * POST /roles
 * Create a new role
 */
router.post('/', authMiddleware, async (req, res) => {
  const { name, description, permissions } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'name is required' });
  }

  logger.info(`[roles] User ${req.user.email} creating new role`);

  const role = await pb.collection('roles').create({
    name,
    description: description || '',
    permissions: permissions || [],
  });

  res.status(201).json(role);
});

/**
 * PATCH /roles/:id
 * Update a role
 */
router.patch('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { name, description, permissions } = req.body;

  logger.info(`[roles] User ${req.user.email} updating role ${id}`);

  const role = await pb.collection('roles').getOne(id);
  const updated = await pb.collection('roles').update(id, {
    name: name !== undefined ? name : role.name,
    description: description !== undefined ? description : role.description,
    permissions: permissions !== undefined ? permissions : role.permissions,
  });

  res.json(updated);
});

/**
 * DELETE /roles/:id
 * Delete a role
 */
router.delete('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  logger.info(`[roles] User ${req.user.email} deleting role ${id}`);

  await pb.collection('roles').delete(id);
  res.json({ message: 'Role deleted successfully', id });
});

export default router;