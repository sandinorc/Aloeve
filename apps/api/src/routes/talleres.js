import express from 'express';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';
import { authMiddleware } from '../middleware/rbac.js';

const router = express.Router();

/**
 * GET /talleres
 * List all workshops with pagination
 */
router.get('/', authMiddleware, async (req, res) => {
  const { page = 1, perPage = 50 } = req.query;
  logger.info(`[talleres] User ${req.user.email} fetching workshops list`);

  const talleres = await pb.collection('talleres').getList(parseInt(page), parseInt(perPage));

  res.json({
    items: talleres.items,
    page: talleres.page,
    perPage: talleres.perPage,
    totalItems: talleres.totalItems,
    totalPages: talleres.totalPages,
  });
});

/**
 * GET /talleres/:id
 * Get a specific workshop
 */
router.get('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  logger.info(`[talleres] User ${req.user.email} fetching workshop ${id}`);

  const taller = await pb.collection('talleres').getOne(id);
  res.json(taller);
});

/**
 * POST /talleres
 * Create a new workshop
 */
router.post('/', authMiddleware, async (req, res) => {
  const { name, description, studioId, facilitatorIds } = req.body;

  if (!name || !studioId) {
    return res.status(400).json({ error: 'name and studioId are required' });
  }

  logger.info(`[talleres] User ${req.user.email} creating new workshop`);

  const taller = await pb.collection('talleres').create({
    name,
    description: description || '',
    studioId,
    facilitatorIds: facilitatorIds || [],
  });

  res.status(201).json(taller);
});

/**
 * PATCH /talleres/:id
 * Update a workshop
 */
router.patch('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { name, description, facilitatorIds } = req.body;

  logger.info(`[talleres] User ${req.user.email} updating workshop ${id}`);

  const taller = await pb.collection('talleres').getOne(id);
  const updated = await pb.collection('talleres').update(id, {
    name: name !== undefined ? name : taller.name,
    description: description !== undefined ? description : taller.description,
    facilitatorIds: facilitatorIds !== undefined ? facilitatorIds : taller.facilitatorIds,
  });

  res.json(updated);
});

/**
 * DELETE /talleres/:id
 * Delete a workshop
 */
router.delete('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  logger.info(`[talleres] User ${req.user.email} deleting workshop ${id}`);

  await pb.collection('talleres').delete(id);
  res.json({ message: 'Workshop deleted successfully', id });
});

export default router;