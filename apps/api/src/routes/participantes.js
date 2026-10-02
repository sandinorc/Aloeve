import express from 'express';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';
import { authMiddleware } from '../middleware/rbac.js';

const router = express.Router();

/**
 * GET /participantes
 * List all participants with pagination
 */
router.get('/', authMiddleware, async (req, res) => {
  const { page = 1, perPage = 50 } = req.query;
  logger.info(`[participantes] User ${req.user.email} fetching participants list`);

  const participantes = await pb.collection('participantes').getList(parseInt(page), parseInt(perPage));

  res.json({
    items: participantes.items,
    page: participantes.page,
    perPage: participantes.perPage,
    totalItems: participantes.totalItems,
    totalPages: participantes.totalPages,
  });
});

/**
 * GET /participantes/:id
 * Get a specific participant
 */
router.get('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  logger.info(`[participantes] User ${req.user.email} fetching participant ${id}`);

  const participante = await pb.collection('participantes').getOne(id);
  res.json(participante);
});

/**
 * POST /participantes
 * Create a new participant
 */
router.post('/', authMiddleware, async (req, res) => {
  const { name, email, phone, clientId } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'name and email are required' });
  }

  logger.info(`[participantes] User ${req.user.email} creating new participant`);

  const participante = await pb.collection('participantes').create({
    name,
    email,
    phone: phone || '',
    clientId: clientId || '',
  });

  res.status(201).json(participante);
});

/**
 * PATCH /participantes/:id
 * Update a participant
 */
router.patch('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { name, email, phone, clientId } = req.body;

  logger.info(`[participantes] User ${req.user.email} updating participant ${id}`);

  const participante = await pb.collection('participantes').getOne(id);
  const updated = await pb.collection('participantes').update(id, {
    name: name !== undefined ? name : participante.name,
    email: email !== undefined ? email : participante.email,
    phone: phone !== undefined ? phone : participante.phone,
    clientId: clientId !== undefined ? clientId : participante.clientId,
  });

  res.json(updated);
});

/**
 * DELETE /participantes/:id
 * Delete a participant
 */
router.delete('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  logger.info(`[participantes] User ${req.user.email} deleting participant ${id}`);

  await pb.collection('participantes').delete(id);
  res.json({ message: 'Participant deleted successfully', id });
});

export default router;