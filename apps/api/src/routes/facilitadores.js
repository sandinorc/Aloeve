import express from 'express';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';
import { authMiddleware } from '../middleware/rbac.js';

const router = express.Router();

/**
 * GET /facilitadores
 * List all facilitators with pagination
 */
router.get('/', authMiddleware, async (req, res) => {
  const { page = 1, perPage = 50 } = req.query;
  logger.info(`[facilitadores] User ${req.user.email} fetching facilitators list`);

  const facilitadores = await pb.collection('facilitadores').getList(parseInt(page), parseInt(perPage));

  res.json({
    items: facilitadores.items,
    page: facilitadores.page,
    perPage: facilitadores.perPage,
    totalItems: facilitadores.totalItems,
    totalPages: facilitadores.totalPages,
  });
});

/**
 * GET /facilitadores/:id
 * Get a specific facilitator
 */
router.get('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  logger.info(`[facilitadores] User ${req.user.email} fetching facilitator ${id}`);

  const facilitador = await pb.collection('facilitadores').getOne(id);
  res.json(facilitador);
});

/**
 * POST /facilitadores
 * Create a new facilitator
 * Role-based validation:
 * - Admin/Fundadora: can create without studioId requirement
 * - StudioManager: must provide studioId matching their assigned studio
 * - Other roles: must have studioId assigned to their account
 */
router.post('/', authMiddleware, async (req, res) => {
  const { name, email, studioId, bio } = req.body;
  const isAdmin = req.user.role === 'Admin' || req.user.role === 'Fundadora';

  // Validate required fields
  if (!name || !email) {
    return res.status(400).json({ error: 'name and email are required' });
  }

  logger.info(`[facilitadores] User ${req.user.email} (${req.user.role}) creating new facilitator`);

  // Admin/Fundadora can create without studioId
  if (isAdmin) {
    const facilitador = await pb.collection('facilitadores').create({
      name,
      email,
      studioId: studioId || '',
      bio: bio || '',
    });

    logger.info(`[facilitadores] Facilitator ${facilitador.id} created by admin ${req.user.email}`);
    return res.status(201).json(facilitador);
  }

  // Non-admin users must have studioId
  if (!studioId) {
    logger.warn(`[facilitadores] User ${req.user.email} attempted to create facilitator without studioId`);
    throw new Error('Tu cuenta no tiene un estudio asignado');
  }

  // StudioManager: validate studioId matches their assigned studio
  if (req.user.role === 'StudioManager') {
    if (studioId !== req.user.studioId) {
      logger.warn(
        `[facilitadores] StudioManager ${req.user.email} attempted to create facilitator in studio ${studioId} (assigned: ${req.user.studioId})`
      );
      throw new Error('No tienes permiso para crear facilitadores en este estudio');
    }
  }

  const facilitador = await pb.collection('facilitadores').create({
    name,
    email,
    studioId,
    bio: bio || '',
  });

  logger.info(`[facilitadores] Facilitator ${facilitador.id} created by ${req.user.email}`);
  res.status(201).json(facilitador);
});

/**
 * PATCH /facilitadores/:id
 * Update a facilitator
 */
router.patch('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { name, email, bio } = req.body;

  logger.info(`[facilitadores] User ${req.user.email} updating facilitator ${id}`);

  const facilitador = await pb.collection('facilitadores').getOne(id);
  const updated = await pb.collection('facilitadores').update(id, {
    name: name !== undefined ? name : facilitador.name,
    email: email !== undefined ? email : facilitador.email,
    bio: bio !== undefined ? bio : facilitador.bio,
  });

  res.json(updated);
});

/**
 * DELETE /facilitadores/:id
 * Delete a facilitator
 */
router.delete('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  logger.info(`[facilitadores] User ${req.user.email} deleting facilitator ${id}`);

  await pb.collection('facilitadores').delete(id);
  res.json({ message: 'Facilitator deleted successfully', id });
});

export default router;
