import express from 'express';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';
import { authMiddleware } from '../middleware/rbac.js';

const router = express.Router();

/**
 * GET /historial-sesiones-cliente
 * List all client session history with pagination
 */
router.get('/', authMiddleware, async (req, res) => {
  const { page = 1, perPage = 50 } = req.query;
  logger.info(`[historial-sesiones-cliente] User ${req.user.email} fetching client session history list`);

  const historial = await pb.collection('historial_sesiones_cliente').getList(parseInt(page), parseInt(perPage));

  res.json({
    items: historial.items,
    page: historial.page,
    perPage: historial.perPage,
    totalItems: historial.totalItems,
    totalPages: historial.totalPages,
  });
});

/**
 * GET /historial-sesiones-cliente/:id
 * Get a specific client session history record
 */
router.get('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  logger.info(`[historial-sesiones-cliente] User ${req.user.email} fetching client session history ${id}`);

  const record = await pb.collection('historial_sesiones_cliente').getOne(id);
  res.json(record);
});

/**
 * POST /historial-sesiones-cliente
 * Create a new client session history record
 */
router.post('/', authMiddleware, async (req, res) => {
  const { clientId, sessionId, attendanceDate, notes } = req.body;

  if (!clientId || !sessionId) {
    return res.status(400).json({ error: 'clientId and sessionId are required' });
  }

  logger.info(`[historial-sesiones-cliente] User ${req.user.email} creating new client session history record`);

  const record = await pb.collection('historial_sesiones_cliente').create({
    clientId,
    sessionId,
    attendanceDate: attendanceDate || new Date().toISOString(),
    notes: notes || '',
  });

  res.status(201).json(record);
});

/**
 * PATCH /historial-sesiones-cliente/:id
 * Update a client session history record
 */
router.patch('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { attendanceDate, notes } = req.body;

  logger.info(`[historial-sesiones-cliente] User ${req.user.email} updating client session history ${id}`);

  const record = await pb.collection('historial_sesiones_cliente').getOne(id);
  const updated = await pb.collection('historial_sesiones_cliente').update(id, {
    attendanceDate: attendanceDate !== undefined ? attendanceDate : record.attendanceDate,
    notes: notes !== undefined ? notes : record.notes,
  });

  res.json(updated);
});

/**
 * DELETE /historial-sesiones-cliente/:id
 * Delete a client session history record
 */
router.delete('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  logger.info(`[historial-sesiones-cliente] User ${req.user.email} deleting client session history ${id}`);

  await pb.collection('historial_sesiones_cliente').delete(id);
  res.json({ message: 'Client session history record deleted successfully', id });
});

export default router;