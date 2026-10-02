import express from 'express';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';
import { authMiddleware } from '../middleware/rbac.js';

const router = express.Router();

/**
 * GET /estudios
 * List all studies with pagination
 */
router.get('/', authMiddleware, async (req, res) => {
  const { page = 1, perPage = 50 } = req.query;
  logger.info(`[estudios] User ${req.user.email} fetching studies list`);

  const estudios = await pb.collection('estudios').getList(parseInt(page), parseInt(perPage));

  res.json({
    items: estudios.items,
    page: estudios.page,
    perPage: estudios.perPage,
    totalItems: estudios.totalItems,
    totalPages: estudios.totalPages,
  });
});

/**
 * GET /estudios/:id
 * Get a specific study
 */
router.get('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  logger.info(`[estudios] User ${req.user.email} fetching study ${id}`);

  const estudio = await pb.collection('estudios').getOne(id);
  res.json(estudio);
});

/**
 * POST /estudios
 * Create a new study
 */
router.post('/', authMiddleware, async (req, res) => {
  const { name, description, managerId } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'name is required' });
  }

  logger.info(`[estudios] User ${req.user.email} creating new study`);

  const estudio = await pb.collection('estudios').create({
    name,
    description: description || '',
    managerId: managerId || req.user.id,
  });

  res.status(201).json(estudio);
});

/**
 * PATCH /estudios/:id
 * Update a study
 */
router.patch('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { name, description, managerId } = req.body;

  logger.info(`[estudios] User ${req.user.email} updating study ${id}`);

  const estudio = await pb.collection('estudios').getOne(id);
  const updated = await pb.collection('estudios').update(id, {
    name: name !== undefined ? name : estudio.name,
    description: description !== undefined ? description : estudio.description,
    managerId: managerId !== undefined ? managerId : estudio.managerId,
  });

  res.json(updated);
});

/**
 * DELETE /estudios/:id
 * Delete a study
 */
router.delete('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  logger.info(`[estudios] User ${req.user.email} deleting study ${id}`);

  await pb.collection('estudios').delete(id);
  res.json({ message: 'Study deleted successfully', id });
});

export default router;