import express from 'express';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';
import { authMiddleware } from '../middleware/rbac.js';

const router = express.Router();

/**
 * GET /pagos
 * List all payments with pagination
 */
router.get('/', authMiddleware, async (req, res) => {
  const { page = 1, perPage = 50 } = req.query;
  logger.info(`[pagos] User ${req.user.email} fetching payments list`);

  const pagos = await pb.collection('pagos').getList(parseInt(page), parseInt(perPage));

  res.json({
    items: pagos.items,
    page: pagos.page,
    perPage: pagos.perPage,
    totalItems: pagos.totalItems,
    totalPages: pagos.totalPages,
  });
});

/**
 * GET /pagos/:id
 * Get a specific payment
 */
router.get('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  logger.info(`[pagos] User ${req.user.email} fetching payment ${id}`);

  const pago = await pb.collection('pagos').getOne(id);
  res.json(pago);
});

/**
 * POST /pagos
 * Create a new payment
 */
router.post('/', authMiddleware, async (req, res) => {
  const { clientId, amount, paymentDate, method, status } = req.body;

  if (!clientId || !amount) {
    return res.status(400).json({ error: 'clientId and amount are required' });
  }

  logger.info(`[pagos] User ${req.user.email} creating new payment`);

  const pago = await pb.collection('pagos').create({
    clientId,
    amount,
    paymentDate: paymentDate || new Date().toISOString(),
    method: method || 'cash',
    status: status || 'completed',
  });

  res.status(201).json(pago);
});

/**
 * PATCH /pagos/:id
 * Update a payment
 */
router.patch('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { amount, paymentDate, method, status } = req.body;

  logger.info(`[pagos] User ${req.user.email} updating payment ${id}`);

  const pago = await pb.collection('pagos').getOne(id);
  const updated = await pb.collection('pagos').update(id, {
    amount: amount !== undefined ? amount : pago.amount,
    paymentDate: paymentDate !== undefined ? paymentDate : pago.paymentDate,
    method: method !== undefined ? method : pago.method,
    status: status !== undefined ? status : pago.status,
  });

  res.json(updated);
});

/**
 * DELETE /pagos/:id
 * Delete a payment
 */
router.delete('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  logger.info(`[pagos] User ${req.user.email} deleting payment ${id}`);

  await pb.collection('pagos').delete(id);
  res.json({ message: 'Payment deleted successfully', id });
});

export default router;