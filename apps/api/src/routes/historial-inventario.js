import express from 'express';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';
import { authMiddleware } from '../middleware/rbac.js';

const router = express.Router();

/**
 * GET /historial-inventario
 * List all inventory history with pagination
 */
router.get('/', authMiddleware, async (req, res) => {
  const { page = 1, perPage = 50 } = req.query;
  logger.info(`[historial-inventario] User ${req.user.email} fetching inventory history list`);

  const historial = await pb.collection('historial_inventario').getList(parseInt(page), parseInt(perPage));

  res.json({
    items: historial.items,
    page: historial.page,
    perPage: historial.perPage,
    totalItems: historial.totalItems,
    totalPages: historial.totalPages,
  });
});

/**
 * GET /historial-inventario/:id
 * Get a specific inventory history record
 */
router.get('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  logger.info(`[historial-inventario] User ${req.user.email} fetching inventory history ${id}`);

  const record = await pb.collection('historial_inventario').getOne(id);
  res.json(record);
});

/**
 * POST /historial-inventario
 * Create a new inventory history record
 */
router.post('/', authMiddleware, async (req, res) => {
  const { productId, quantity, action, date, notes } = req.body;

  if (!productId || quantity === undefined || !action) {
    return res.status(400).json({ error: 'productId, quantity, and action are required' });
  }

  logger.info(`[historial-inventario] User ${req.user.email} creating new inventory history record`);

  const record = await pb.collection('historial_inventario').create({
    productId,
    quantity,
    action,
    date: date || new Date().toISOString(),
    notes: notes || '',
  });

  res.status(201).json(record);
});

/**
 * PATCH /historial-inventario/:id
 * Update an inventory history record
 */
router.patch('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { quantity, action, date, notes } = req.body;

  logger.info(`[historial-inventario] User ${req.user.email} updating inventory history ${id}`);

  const record = await pb.collection('historial_inventario').getOne(id);
  const updated = await pb.collection('historial_inventario').update(id, {
    quantity: quantity !== undefined ? quantity : record.quantity,
    action: action !== undefined ? action : record.action,
    date: date !== undefined ? date : record.date,
    notes: notes !== undefined ? notes : record.notes,
  });

  res.json(updated);
});

/**
 * DELETE /historial-inventario/:id
 * Delete an inventory history record
 */
router.delete('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  logger.info(`[historial-inventario] User ${req.user.email} deleting inventory history ${id}`);

  await pb.collection('historial_inventario').delete(id);
  res.json({ message: 'Inventory history record deleted successfully', id });
});

export default router;