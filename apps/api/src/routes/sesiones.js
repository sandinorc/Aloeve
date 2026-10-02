import express from 'express';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';
import { authMiddleware } from '../middleware/rbac.js';

const router = express.Router();

/**
 * GET /sesiones
 * List all sessions with pagination
 */
router.get('/', authMiddleware, async (req, res) => {
  const { page = 1, perPage = 50 } = req.query;
  logger.info(`[sesiones] User ${req.user.email} fetching sessions list`);

  const sesiones = await pb.collection('sesiones').getList(parseInt(page), parseInt(perPage));

  res.json({
    items: sesiones.items,
    page: sesiones.page,
    perPage: sesiones.perPage,
    totalItems: sesiones.totalItems,
    totalPages: sesiones.totalPages,
  });
});

/**
 * GET /sesiones/:id
 * Get a specific session
 */
router.get('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  logger.info(`[sesiones] User ${req.user.email} fetching session ${id}`);

  const sesion = await pb.collection('sesiones').getOne(id);
  res.json(sesion);
});

/**
 * POST /sesiones
 * Create a new session
 */
router.post('/', authMiddleware, async (req, res) => {
  const { workshopId, facilitatorId, sessionDate, startTime, endTime, location } = req.body;

  if (!workshopId || !facilitatorId || !sessionDate) {
    return res.status(400).json({ error: 'workshopId, facilitatorId, and sessionDate are required' });
  }

  logger.info(`[sesiones] User ${req.user.email} creating new session`);

  const sesion = await pb.collection('sesiones').create({
    workshopId,
    facilitatorId,
    sessionDate,
    startTime: startTime || '',
    endTime: endTime || '',
    location: location || '',
  });

  res.status(201).json(sesion);
});

/**
 * PATCH /sesiones/:id
 * Update a session
 */
router.patch('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { sessionDate, startTime, endTime, location } = req.body;

  logger.info(`[sesiones] User ${req.user.email} updating session ${id}`);

  const sesion = await pb.collection('sesiones').getOne(id);
  const updated = await pb.collection('sesiones').update(id, {
    sessionDate: sessionDate !== undefined ? sessionDate : sesion.sessionDate,
    startTime: startTime !== undefined ? startTime : sesion.startTime,
    endTime: endTime !== undefined ? endTime : sesion.endTime,
    location: location !== undefined ? location : sesion.location,
  });

  res.json(updated);
});

/**
 * DELETE /sesiones/:id
 * Delete a session
 */
router.delete('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  logger.info(`[sesiones] User ${req.user.email} deleting session ${id}`);

  await pb.collection('sesiones').delete(id);
  res.json({ message: 'Session deleted successfully', id });
});

export default router;