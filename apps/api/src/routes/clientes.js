import express from 'express';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';
import { authMiddleware } from '../middleware/rbac.js';

const router = express.Router();

/**
 * GET /clientes
 * List all clients with pagination
 */
router.get('/', authMiddleware, async (req, res) => {
  const { page = 1, perPage = 50 } = req.query;
  logger.info(`[clientes] User ${req.user.email} fetching clients list`);

  const clientes = await pb.collection('clientes').getList(parseInt(page), parseInt(perPage));

  res.json({
    items: clientes.items,
    page: clientes.page,
    perPage: clientes.perPage,
    totalItems: clientes.totalItems,
    totalPages: clientes.totalPages,
  });
});

/**
 * GET /clientes/:id
 * Get a specific client
 */
router.get('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  logger.info(`[clientes] User ${req.user.email} fetching client ${id}`);

  const cliente = await pb.collection('clientes').getOne(id);
  res.json(cliente);
});

/**
 * POST /clientes
 * Create a new client
 */
router.post('/', authMiddleware, async (req, res) => {
  const { name, email, phone, address } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'name and email are required' });
  }

  logger.info(`[clientes] User ${req.user.email} creating new client`);

  const cliente = await pb.collection('clientes').create({
    name,
    email,
    phone: phone || '',
    address: address || '',
  });

  res.status(201).json(cliente);
});

/**
 * PATCH /clientes/:id
 * Update a client
 */
router.patch('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { name, email, phone, address } = req.body;

  logger.info(`[clientes] User ${req.user.email} updating client ${id}`);

  const cliente = await pb.collection('clientes').getOne(id);
  const updated = await pb.collection('clientes').update(id, {
    name: name !== undefined ? name : cliente.name,
    email: email !== undefined ? email : cliente.email,
    phone: phone !== undefined ? phone : cliente.phone,
    address: address !== undefined ? address : cliente.address,
  });

  res.json(updated);
});

/**
 * DELETE /clientes/:id
 * Delete a client
 */
router.delete('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  logger.info(`[clientes] User ${req.user.email} deleting client ${id}`);

  await pb.collection('clientes').delete(id);
  res.json({ message: 'Client deleted successfully', id });
});

export default router;