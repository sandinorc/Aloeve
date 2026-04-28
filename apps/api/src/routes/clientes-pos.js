import express from 'express';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';
import { authMiddleware } from '../middleware/rbac.js';

const router = express.Router();

/**
 * GET /clientes-pos
 * List all POS clients with pagination
 */
router.get('/', authMiddleware, async (req, res) => {
  const { page = 1, perPage = 50 } = req.query;
  logger.info(`[clientes-pos] User ${req.user.email} fetching POS clients list`);

  const clientes = await pb.collection('clientes_pos').getList(parseInt(page), parseInt(perPage));

  res.json({
    items: clientes.items,
    page: clientes.page,
    perPage: clientes.perPage,
    totalItems: clientes.totalItems,
    totalPages: clientes.totalPages,
  });
});

/**
 * GET /clientes-pos/:id
 * Get a specific POS client
 */
router.get('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  logger.info(`[clientes-pos] User ${req.user.email} fetching POS client ${id}`);

  const cliente = await pb.collection('clientes_pos').getOne(id);
  res.json(cliente);
});

/**
 * POST /clientes-pos
 * Create a new POS client
 */
router.post('/', authMiddleware, async (req, res) => {
  const { name, email, phone, address } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'name is required' });
  }

  logger.info(`[clientes-pos] User ${req.user.email} creating new POS client`);

  const cliente = await pb.collection('clientes_pos').create({
    name,
    email: email || '',
    phone: phone || '',
    address: address || '',
  });

  res.status(201).json(cliente);
});

/**
 * PATCH /clientes-pos/:id
 * Update a POS client
 */
router.patch('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { name, email, phone, address } = req.body;

  logger.info(`[clientes-pos] User ${req.user.email} updating POS client ${id}`);

  const cliente = await pb.collection('clientes_pos').getOne(id);
  const updated = await pb.collection('clientes_pos').update(id, {
    name: name !== undefined ? name : cliente.name,
    email: email !== undefined ? email : cliente.email,
    phone: phone !== undefined ? phone : cliente.phone,
    address: address !== undefined ? address : cliente.address,
  });

  res.json(updated);
});

/**
 * DELETE /clientes-pos/:id
 * Delete a POS client
 */
router.delete('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  logger.info(`[clientes-pos] User ${req.user.email} deleting POS client ${id}`);

  await pb.collection('clientes_pos').delete(id);
  res.json({ message: 'POS client deleted successfully', id });
});

export default router;