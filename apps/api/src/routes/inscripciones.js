import express from 'express';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';
import { authMiddleware } from '../middleware/rbac.js';

const router = express.Router();

/**
 * GET /inscripciones
 * List all registrations with pagination
 */
router.get('/', authMiddleware, async (req, res) => {
  const { page = 1, perPage = 50 } = req.query;
  logger.info(`[inscripciones] User ${req.user.email} fetching registrations list`);

  const inscripciones = await pb.collection('inscripciones').getList(parseInt(page), parseInt(perPage));

  res.json({
    items: inscripciones.items,
    page: inscripciones.page,
    perPage: inscripciones.perPage,
    totalItems: inscripciones.totalItems,
    totalPages: inscripciones.totalPages,
  });
});

/**
 * GET /inscripciones/:id
 * Get a specific registration
 */
router.get('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  logger.info(`[inscripciones] User ${req.user.email} fetching registration ${id}`);

  const inscripcion = await pb.collection('inscripciones').getOne(id);
  res.json(inscripcion);
});

/**
 * POST /inscripciones
 * Create a new registration
 */
router.post('/', authMiddleware, async (req, res) => {
  const { participantId, workshopId, enrollmentDate, status } = req.body;

  if (!participantId || !workshopId) {
    return res.status(400).json({ error: 'participantId and workshopId are required' });
  }

  logger.info(`[inscripciones] User ${req.user.email} creating new registration`);

  const inscripcion = await pb.collection('inscripciones').create({
    participantId,
    workshopId,
    enrollmentDate: enrollmentDate || new Date().toISOString(),
    status: status || 'active',
  });

  res.status(201).json(inscripcion);
});

/**
 * PATCH /inscripciones/:id
 * Update a registration
 */
router.patch('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { status, enrollmentDate } = req.body;

  logger.info(`[inscripciones] User ${req.user.email} updating registration ${id}`);

  const inscripcion = await pb.collection('inscripciones').getOne(id);
  const updated = await pb.collection('inscripciones').update(id, {
    status: status !== undefined ? status : inscripcion.status,
    enrollmentDate: enrollmentDate !== undefined ? enrollmentDate : inscripcion.enrollmentDate,
  });

  res.json(updated);
});

/**
 * DELETE /inscripciones/:id
 * Delete a registration
 */
router.delete('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  logger.info(`[inscripciones] User ${req.user.email} deleting registration ${id}`);

  await pb.collection('inscripciones').delete(id);
  res.json({ message: 'Registration deleted successfully', id });
});

export default router;