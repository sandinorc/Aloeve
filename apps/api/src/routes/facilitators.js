import express from 'express';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';
import { authMiddleware, ownershipCheck } from '../middleware/rbac.js';
import permissionChecker from '../utils/permissionChecker.js';
import auditLog from '../utils/auditLog.js';

const router = express.Router();

/**
 * GET /facilitators
 * List all facilitators (filtered by user role)
 */
router.get('/', authMiddleware, async (req, res) => {
  const { page = 1, perPage = 50 } = req.query;

  let facilitators;
  if (req.user.role === 'Admin' || req.user.role === 'Fundadora') {
    // Admin/Fundadora see all facilitators
    facilitators = await pb.collection('facilitadores').getList(parseInt(page), parseInt(perPage));
  } else if (req.user.role === 'StudioManager') {
    // StudioManager sees facilitators in their studio
    const studios = await permissionChecker.getUserStudios(req.user.id);
    const studioIds = studios.map((s) => s.id);
    if (studioIds.length > 0) {
      const filter = studioIds.map((id) => `studioId = "${id}"`).join(' || ');
      facilitators = await pb.collection('facilitadores').getList(parseInt(page), parseInt(perPage), {
        filter,
      });
    } else {
      facilitators = { items: [], page: 1, perPage, totalItems: 0, totalPages: 0 };
    }
  } else {
    // Other roles see no facilitators
    facilitators = { items: [], page: 1, perPage, totalItems: 0, totalPages: 0 };
  }

  logger.info(`[facilitators] User ${req.user.email} retrieved facilitators list`);

  res.json({
    items: facilitators.items,
    page: facilitators.page,
    perPage: facilitators.perPage,
    totalItems: facilitators.totalItems,
    totalPages: facilitators.totalPages,
  });
});

/**
 * GET /facilitators/:id
 * Get a specific facilitator
 */
router.get('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;

  const facilitator = await pb.collection('facilitadores').getOne(id);

  // Check if user has access to this facilitator
  const canEdit = await permissionChecker.canUserEditFacilitator(req.user.id, id);
  if (!canEdit && req.user.role !== 'Admin' && req.user.role !== 'Fundadora') {
    logger.warn(`[facilitators] User ${req.user.email} denied access to facilitator ${id}`);
    return res.status(403).json({ error: 'You do not have permission to access this facilitator' });
  }

  logger.info(`[facilitators] User ${req.user.email} retrieved facilitator ${id}`);

  res.json(facilitator);
});

/**
 * POST /facilitators
 * Create a new facilitator
 */
router.post('/', authMiddleware, async (req, res) => {
  const { name, email, studioId, bio } = req.body;

  if (!name || !email || !studioId) {
    return res.status(400).json({ error: 'name, email, and studioId are required' });
  }

  // Check permission
  const allowed = await permissionChecker.canUserPerformAction(req.user.id, 'create', 'facilitator');
  if (!allowed) {
    logger.warn(`[facilitators] User ${req.user.email} denied permission to create facilitator`);
    return res.status(403).json({ error: 'Insufficient permissions to create facilitator' });
  }

  // Verify user can edit the studio
  const canEditStudio = await permissionChecker.canUserEditStudio(req.user.id, studioId);
  if (!canEditStudio) {
    logger.warn(
      `[facilitators] User ${req.user.email} denied permission to create facilitator in studio ${studioId}`
    );
    return res.status(403).json({ error: 'You do not have permission to create facilitators in this studio' });
  }

  const facilitator = await pb.collection('facilitadores').create({
    name,
    email,
    studioId,
    bio: bio || '',
  });

  // Log the action
  await auditLog.logAction(req.user.id, 'create', 'facilitador', facilitator.id, {
    name,
    email,
    studioId,
  });

  logger.info(`[facilitators] Facilitator ${facilitator.id} created by ${req.user.email}`);

  res.status(201).json(facilitator);
});

/**
 * PUT /facilitators/:id
 * Update a facilitator
 */
router.put('/:id', authMiddleware, ownershipCheck('facilitator'), async (req, res) => {
  const { id } = req.params;
  const { name, email, bio } = req.body;

  const facilitator = await pb.collection('facilitadores').getOne(id);

  const updatedFacilitator = await pb.collection('facilitadores').update(id, {
    name: name !== undefined ? name : facilitator.name,
    email: email !== undefined ? email : facilitator.email,
    bio: bio !== undefined ? bio : facilitator.bio,
  });

  // Log the action
  await auditLog.logAction(req.user.id, 'update', 'facilitador', id, {
    changes: { name, email, bio },
  });

  logger.info(`[facilitators] Facilitator ${id} updated by ${req.user.email}`);

  res.json(updatedFacilitator);
});

/**
 * DELETE /facilitators/:id
 * Delete a facilitator
 */
router.delete('/:id', authMiddleware, ownershipCheck('facilitator'), async (req, res) => {
  const { id } = req.params;

  await pb.collection('facilitadores').delete(id);

  // Log the action
  await auditLog.logAction(req.user.id, 'delete', 'facilitador', id, {});

  logger.info(`[facilitators] Facilitator ${id} deleted by ${req.user.email}`);

  res.json({ message: 'Facilitator deleted successfully', id });
});

export default router;