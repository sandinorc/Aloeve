import express from 'express';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';
import { authMiddleware } from '../middleware/rbac.js';

const router = express.Router();

/**
 * GET /ventas-pos
 * List all POS sales with pagination
 */
router.get('/', authMiddleware, async (req, res) => {
  const { page = 1, perPage = 50 } = req.query;
  logger.info(`[ventas-pos] User ${req.user.email} fetching POS sales list`);

  const ventas = await pb.collection('ventas_pos').getList(parseInt(page), parseInt(perPage));

  res.json({
    items: ventas.items,
    page: ventas.page,
    perPage: ventas.perPage,
    totalItems: ventas.totalItems,
    totalPages: ventas.totalPages,
  });
});

/**
 * GET /ventas-pos/:id
 * Get a specific POS sale
 */
router.get('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  logger.info(`[ventas-pos] User ${req.user.email} fetching POS sale ${id}`);

  const venta = await pb.collection('ventas_pos').getOne(id);
  res.json(venta);
});

/**
 * POST /ventas-pos
 * Create a new POS sale
 */
router.post('/', authMiddleware, async (req, res) => {
  const { clientId, items, total, paymentMethod, saleDate } = req.body;

  if (!clientId || !items || !total) {
    return res.status(400).json({ error: 'clientId, items, and total are required' });
  }

  logger.info(`[ventas-pos] User ${req.user.email} creating new POS sale`);

  const venta = await pb.collection('ventas_pos').create({
    clientId,
    items,
    total,
    paymentMethod: paymentMethod || 'cash',
    saleDate: saleDate || new Date().toISOString(),
  });

  res.status(201).json(venta);
});

/**
 * PATCH /ventas-pos/:id
 * Update a POS sale
 */
router.patch('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { items, total, paymentMethod, saleDate } = req.body;

  logger.info(`[ventas-pos] User ${req.user.email} updating POS sale ${id}`);

  const venta = await pb.collection('ventas_pos').getOne(id);
  const updated = await pb.collection('ventas_pos').update(id, {
    items: items !== undefined ? items : venta.items,
    total: total !== undefined ? total : venta.total,
    paymentMethod: paymentMethod !== undefined ? paymentMethod : venta.paymentMethod,
    saleDate: saleDate !== undefined ? saleDate : venta.saleDate,
  });

  res.json(updated);
});

/**
 * DELETE /ventas-pos/:id
 * Delete a POS sale
 */
router.delete('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  logger.info(`[ventas-pos] User ${req.user.email} deleting POS sale ${id}`);

  await pb.collection('ventas_pos').delete(id);
  res.json({ message: 'POS sale deleted successfully', id });
});

export default router;