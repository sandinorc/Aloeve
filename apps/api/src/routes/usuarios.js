import express from 'express';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';
import { authMiddleware } from '../middleware/rbac.js';

const router = express.Router();

/**
 * GET /usuarios
 * List all users with pagination
 */
router.get('/', authMiddleware, async (req, res) => {
  const { page = 1, perPage = 50 } = req.query;
  logger.info(`[usuarios] User ${req.user.email} fetching users list`);

  const usuarios = await pb.collection('usuarios').getList(parseInt(page), parseInt(perPage));

  res.json({
    items: usuarios.items,
    page: usuarios.page,
    perPage: usuarios.perPage,
    totalItems: usuarios.totalItems,
    totalPages: usuarios.totalPages,
  });
});

/**
 * GET /usuarios/:id
 * Get a specific user
 */
router.get('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  logger.info(`[usuarios] User ${req.user.email} fetching user ${id}`);

  const usuario = await pb.collection('usuarios').getOne(id);
  res.json(usuario);
});

/**
 * POST /usuarios
 * Create a new user
 */
router.post('/', authMiddleware, async (req, res) => {
  const { email, password, name, role } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'email, password, and name are required' });
  }

  logger.info(`[usuarios] User ${req.user.email} creating new user`);

  const usuario = await pb.collection('usuarios').create({
    email,
    password,
    passwordConfirm: password,
    name,
    role: role || 'Host',
  });

  res.status(201).json(usuario);
});

/**
 * PATCH /usuarios/:id
 * Update a user
 */
router.patch('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { name, email, role } = req.body;

  logger.info(`[usuarios] User ${req.user.email} updating user ${id}`);

  const usuario = await pb.collection('usuarios').getOne(id);
  const updated = await pb.collection('usuarios').update(id, {
    name: name !== undefined ? name : usuario.name,
    email: email !== undefined ? email : usuario.email,
    role: role !== undefined ? role : usuario.role,
  });

  res.json(updated);
});

/**
 * DELETE /usuarios/:id
 * Delete a user
 */
router.delete('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  logger.info(`[usuarios] User ${req.user.email} deleting user ${id}`);

  await pb.collection('usuarios').delete(id);
  res.json({ message: 'User deleted successfully', id });
});

export default router;