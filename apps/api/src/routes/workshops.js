import express from 'express';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';
import { authMiddleware, ownershipCheck } from '../middleware/rbac.js';
import permissionChecker from '../utils/permissionChecker.js';
import auditLog from '../utils/auditLog.js';

const router = express.Router();

/**
 * GET /workshops
 * List all workshops (filtered by user role)
 */
router.get('/', authMiddleware, async (req, res) => {
  const { page = 1, perPage = 50 } = req.query;

  let workshops;
  if (req.user.role === 'Admin' || req.user.role === 'Fundadora') {
    // Admin/Fundadora see all workshops
    workshops = await pb.collection('talleres').getList(parseInt(page), parseInt(perPage));
  } else if (req.user.role === 'StudioManager') {
    // StudioManager sees workshops in their studio
    const studios = await permissionChecker.getUserStudios(req.user.id);
    const studioIds = studios.map((s) => s.id);
    if (studioIds.length > 0) {
      const filter = studioIds.map((id) => `studioId = "${id}"`).join(' || ');
      workshops = await pb.collection('talleres').getList(parseInt(page), parseInt(perPage), {
        filter,
      });
    } else {
      workshops = { items: [], page: 1, perPage, totalItems: 0, totalPages: 0 };
    }
  } else if (req.user.role === 'Facilitador') {
    // Facilitador sees workshops they're assigned to
    workshops = await pb.collection('talleres').getList(parseInt(page), parseInt(perPage), {
      filter: `facilitatorIds ~ "${req.user.id}"`,
    });
  } else {
    // Other roles see no workshops
    workshops = { items: [], page: 1, perPage, totalItems: 0, totalPages: 0 };
  }

  logger.info(`[workshops] User ${req.user.email} retrieved workshops list`);

  res.json({
    items: workshops.items,
    page: workshops.page,
    perPage: workshops.perPage,
    totalItems: workshops.totalItems,
    totalPages: workshops.totalPages,
  });
});

/**
 * GET /workshops/:id
 * Get a specific workshop
 */
router.get('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;

  const workshop = await pb.collection('talleres').getOne(id);

  // Check if user has access to this workshop
  const canEdit = await permissionChecker.canUserEditWorkshop(req.user.id, id);
  if (!canEdit && req.user.role !== 'Admin' && req.user.role !== 'Fundadora') {
    logger.warn(`[workshops] User ${req.user.email} denied access to workshop ${id}`);
    return res.status(403).json({ error: 'You do not have permission to access this workshop' });
  }

  logger.info(`[workshops] User ${req.user.email} retrieved workshop ${id}`);

  res.json(workshop);
});

/**
 * POST /workshops
 * Create a new workshop
 */
router.post('/', authMiddleware, async (req, res) => {
  const { name, description, studioId, facilitatorIds } = req.body;

  if (!name || !studioId) {
    return res.status(400).json({ error: 'name and studioId are required' });
  }

  // Check permission
  const allowed = await permissionChecker.canUserPerformAction(req.user.id, 'create', 'workshop');
  if (!allowed) {
    logger.warn(`[workshops] User ${req.user.email} denied permission to create workshop`);
    return res.status(403).json({ error: 'Insufficient permissions to create workshop' });
  }

  // Verify user can edit the studio
  const canEditStudio = await permissionChecker.canUserEditStudio(req.user.id, studioId);
  if (!canEditStudio) {
    logger.warn(
      `[workshops] User ${req.user.email} denied permission to create workshop in studio ${studioId}`
    );
    return res.status(403).json({ error: 'You do not have permission to create workshops in this studio' });
  }

  const workshop = await pb.collection('talleres').create({
    name,
    description: description || '',
    studioId,
    facilitatorIds: facilitatorIds || [],
  });

  // Log the action
  await auditLog.logAction(req.user.id, 'create', 'taller', workshop.id, {
    name,
    studioId,
    facilitatorIds,
  });

  logger.info(`[workshops] Workshop ${workshop.id} created by ${req.user.email}`);

  res.status(201).json(workshop);
});

/**
 * PUT /workshops/:id
 * Update a workshop
 */
router.put('/:id', authMiddleware, ownershipCheck('workshop'), async (req, res) => {
  const { id } = req.params;
  const { name, description, facilitatorIds } = req.body;

  const workshop = await pb.collection('talleres').getOne(id);

  const updatedWorkshop = await pb.collection('talleres').update(id, {
    name: name !== undefined ? name : workshop.name,
    description: description !== undefined ? description : workshop.description,
    facilitatorIds: facilitatorIds !== undefined ? facilitatorIds : workshop.facilitatorIds,
  });

  // Log the action
  await auditLog.logAction(req.user.id, 'update', 'taller', id, {
    changes: { name, description, facilitatorIds },
  });

  logger.info(`[workshops] Workshop ${id} updated by ${req.user.email}`);

  res.json(updatedWorkshop);
});

/**
 * DELETE /workshops/:id
 * Delete a workshop
 */
router.delete('/:id', authMiddleware, ownershipCheck('workshop'), async (req, res) => {
  const { id } = req.params;

  await pb.collection('talleres').delete(id);

  // Log the action
  await auditLog.logAction(req.user.id, 'delete', 'taller', id, {});

  logger.info(`[workshops] Workshop ${id} deleted by ${req.user.email}`);

  res.json({ message: 'Workshop deleted successfully', id });
});

export default router;