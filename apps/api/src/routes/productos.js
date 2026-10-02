import express from 'express';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';
import { authMiddleware } from '../middleware/rbac.js';

const router = express.Router();

/**
 * GET /productos
 * List all products with pagination
 */
router.get('/', authMiddleware, async (req, res) => {
  const { page = 1, perPage = 50 } = req.query;
  logger.info(`[productos] User ${req.user.email} fetching products list`);

  const productos = await pb.collection('productos').getList(parseInt(page), parseInt(perPage));

  res.json({
    items: productos.items,
    page: productos.page,
    perPage: productos.perPage,
    totalItems: productos.totalItems,
    totalPages: productos.totalPages,
  });
});

/**
 * GET /productos/:id
 * Get a specific product
 */
router.get('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  logger.info(`[productos] User ${req.user.email} fetching product ${id}`);

  const producto = await pb.collection('productos').getOne(id);
  res.json(producto);
});

/**
 * POST /productos
 * Create a new product
 */
router.post('/', authMiddleware, async (req, res) => {
  const { name, description, price, sku, quantity } = req.body;

  if (!name || !price) {
    return res.status(400).json({ error: 'name and price are required' });
  }

  logger.info(`[productos] User ${req.user.email} creating new product`);

  const producto = await pb.collection('productos').create({
    name,
    description: description || '',
    price,
    sku: sku || '',
    quantity: quantity || 0,
  });

  res.status(201).json(producto);
});

/**
 * PATCH /productos/:id
 * Update a product
 */
router.patch('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { name, description, price, sku, quantity } = req.body;

  logger.info(`[productos] User ${req.user.email} updating product ${id}`);

  const producto = await pb.collection('productos').getOne(id);
  const updated = await pb.collection('productos').update(id, {
    name: name !== undefined ? name : producto.name,
    description: description !== undefined ? description : producto.description,
    price: price !== undefined ? price : producto.price,
    sku: sku !== undefined ? sku : producto.sku,
    quantity: quantity !== undefined ? quantity : producto.quantity,
  });

  res.json(updated);
});

/**
 * DELETE /productos/:id
 * Delete a product
 */
router.delete('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  logger.info(`[productos] User ${req.user.email} deleting product ${id}`);

  await pb.collection('productos').delete(id);
  res.json({ message: 'Product deleted successfully', id });
});

export default router;