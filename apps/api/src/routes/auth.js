import express from 'express';
import logger from '../utils/logger.js';

const router = express.Router();

const PB_URL = process.env.POCKETBASE_URL;

/**
 * POST /auth/login
 * Request: { email, password }
 * Response: { user, token }
 */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required' });
  }

  logger.info(`[auth] Login attempt for email: ${email}`);

  const response = await fetch(`${PB_URL}/api/collections/usuarios/auth-with-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: email, password }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    if (response.status === 400 || response.status === 401) {
      logger.warn(`[auth] Login failed for email: ${email} - Invalid credentials`);
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    logger.error(`[auth] Login failed for email: ${email} - Status ${response.status}`);
    return res.status(response.status).json({ error: body.message || 'Authentication failed' });
  }

  const authData = await response.json();

  logger.info(`[auth] Login successful for user: ${authData.record?.id || 'unknown'}`);

  res.json({
    user: authData.record,
    token: authData.token,
  });
});

/**
 * POST /auth/logout
 */
router.post('/logout', async (req, res) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    logger.info(`[auth] Logout for token: ${authHeader.substring(7, 17)}...`);
  } else {
    logger.info(`[auth] Logout without token`);
  }

  res.json({ message: 'Logged out successfully' });
});

/**
 * GET /auth/me
 * Requires valid Bearer token in Authorization header
 */
router.get('/me', async (req, res) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (!authHeader) {
    logger.warn('[auth] Unauthorized access attempt - Missing Authorization header');
    return res.status(401).json({ error: 'Unauthorized - Missing Authorization header' });
  }

  if (!authHeader.startsWith('Bearer ')) {
    logger.warn('[auth] Unauthorized access attempt - Malformed Authorization header');
    return res.status(401).json({ error: 'Unauthorized - Invalid Authorization header format' });
  }

  const token = authHeader.substring(7);

  if (!token || token.trim() === '') {
    logger.warn('[auth] Unauthorized access attempt - Empty token');
    return res.status(401).json({ error: 'Unauthorized - Missing token' });
  }

  logger.info(`[auth] Fetching user profile with token: ${token.substring(0, 10)}...`);

  const response = await fetch(`${PB_URL}/api/collections/usuarios/auth-refresh`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      logger.warn('[auth] Token validation failed - Invalid or expired token');
      return res.status(401).json({ error: 'Unauthorized - Invalid or expired token' });
    }
    logger.error(`[auth] User profile fetch failed - Status ${response.status}`);
    return res.status(response.status).json({ error: 'Failed to fetch user profile' });
  }

  const userData = await response.json();

  logger.info(`[auth] User profile retrieved: ${userData.record?.id || 'unknown'}`);

  res.json({
    user: userData.record,
  });
});

export default router;
