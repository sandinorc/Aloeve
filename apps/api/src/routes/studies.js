import express from 'express';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';
import { authMiddleware, ownershipCheck } from '../middleware/rbac.js';
import permissionChecker from '../utils/permissionChecker.js';
import auditLog from '../utils/auditLog.js';

const router = express.Router();

/**
 * GET /studies
 * List all studies (filtered by user role)
 */
router.get('/', authMiddleware, async (req, res) => {
  const { page = 1, perPage = 50 } = req.query;

  let studies;
  if (req.user.role === 'Admin' || req.user.role === 'Fundadora') {
    // Admin/Fundadora see all studies
    studies = await pb.collection('estudios').getList(parseInt(page), parseInt(perPage));
  } else if (req.user.role === 'StudioManager') {
    // StudioManager sees only their studio
    studies = await pb.collection('estudios').getList(parseInt(page), parseInt(perPage), {
      filter: `managerId = "${req.user.id}"`,
    });
  } else {
    // Other roles see no studies
    studies = { items: [], page: 1, perPage, totalItems: 0, totalPages: 0 };
  }

  logger.info(`[studies] User ${req.user.email} retrieved studies list`);

  res.json({
    items: studies.items,
    page: studies.page,
    perPage: studies.perPage,
    totalItems: studies.totalItems,
    totalPages: studies.totalPages,
  });
});

/**
 * GET /studies/:id
 * Get a specific study
 */
router.get('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;

  const study = await pb.collection('estudios').getOne(id);

  // Check if user has access to this study
  if (req.user.role === 'StudioManager' && study.managerId !== req.user.id) {
    logger.warn(`[studies] User ${req.user.email} denied access to study ${id}`);
    return res.status(403).json({ error: 'You do not have permission to access this study' });
  }

  logger.info(`[studies] User ${req.user.email} retrieved study ${id}`);

  res.json(study);
});

/**
 * POST /studies
 * Create a new study (Admin/Fundadora/StudioManager only)
 */
router.post('/', authMiddleware, async (req, res) => {
  const { name, description, managerId } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'name is required' });
  }

  // Check permission
  const allowed = await permissionChecker.canUserPerformAction(req.user.id, 'create', 'studio');
  if (!allowed) {
    logger.warn(`[studies] User ${req.user.email} denied permission to create study`);
    return res.status(403).json({ error: 'Insufficient permissions to create study' });
  }

  // StudioManager can only create for themselves
  if (req.user.role === 'StudioManager' && managerId && managerId !== req.user.id) {
    logger.warn(`[studies] StudioManager ${req.user.email} attempted to create study for another manager`);
    return res.status(403).json({ error: 'StudioManager can only create studies for themselves' });
  }

  const study = await pb.collection('estudios').create({
    name,
    description: description || '',
    managerId: managerId || req.user.id,
  });

  // Log the action
  await auditLog.logAction(req.user.id, 'create', 'estudio', study.id, {
    name,
    managerId: study.managerId,
  });

  logger.info(`[studies] Study ${study.id} created by ${req.user.email}`);

  res.status(201).json(study);
});

/**
 * PUT /studies/:id
 * Update a study
 */
router.put('/:id', authMiddleware, ownershipCheck('studio'), async (req, res) => {
  const { id } = req.params;
  const { name, description, managerId } = req.body;

  const study = await pb.collection('estudios').getOne(id);

  const updatedStudy = await pb.collection('estudios').update(id, {
    name: name !== undefined ? name : study.name,
    description: description !== undefined ? description : study.description,
    managerId: managerId !== undefined ? managerId : study.managerId,
  });

  // Log the action
  await auditLog.logAction(req.user.id, 'update', 'estudio', id, {
    changes: { name, description, managerId },
  });

  logger.info(`[studies] Study ${id} updated by ${req.user.email}`);

  res.json(updatedStudy);
});

/**
 * DELETE /studies/:id
 * Delete a study
 */
router.delete('/:id', authMiddleware, ownershipCheck('studio'), async (req, res) => {
  const { id } = req.params;

  await pb.collection('estudios').delete(id);

  // Log the action
  await auditLog.logAction(req.user.id, 'delete', 'estudio', id, {});

  logger.info(`[studies] Study ${id} deleted by ${req.user.email}`);

  res.json({ message: 'Study deleted successfully', id });
});

export default router;