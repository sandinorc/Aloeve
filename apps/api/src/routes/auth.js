import express from 'express';
import logger from '../utils/logger.js';

const router = express.Router();

/**
 * POST /auth/login
 * Authenticate user with email and password against Horizons backend
 * Request: { email, password }
 * Response: { user, token }
 */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required' });
  }

  logger.info(`[auth] Login attempt for email: ${email}`);

  // Call Horizons backend to authenticate
  const response = await fetch(`${process.env.HORIZONS_API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    if (response.status === 401) {
      logger.warn(`[auth] Login failed for email: ${email} - Invalid credentials`);
      throw new Error('Invalid email or password');
    }
    logger.error(`[auth] Login failed for email: ${email} - Status ${response.status}`);
    throw new Error(`Authentication failed: ${response.statusText}`);
  }

  const authData = await response.json();

  logger.info(`[auth] Login successful for user: ${authData.user?.id || 'unknown'}`);

  res.json({
    user: authData.user,
    token: authData.token,
  });
});

/**
 * POST /auth/logout
 * Logout current user (invalidate token)
 */
router.post('/logout', async (req, res) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    logger.info(`[auth] Logout for token: ${token.substring(0, 10)}...`);
  } else {
    logger.info(`[auth] Logout without token`);
  }

  // Token invalidation is handled by the client (removing token from storage)
  // No need to call backend for logout
  res.json({ message: 'Logged out successfully' });
});

/**
 * GET /auth/me
 * Get current authenticated user
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

  // Call Horizons backend to get user data
  const response = await fetch(`${process.env.HORIZONS_API_URL}/auth/me`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      logger.warn('[auth] Token validation failed - Invalid or expired token');
      throw new Error('Unauthorized - Invalid or expired token');
    }
    logger.error(`[auth] User profile fetch failed - Status ${response.status}`);
    throw new Error(`Failed to fetch user profile: ${response.statusText}`);
  }

  const userData = await response.json();

  logger.info(`[auth] User profile retrieved: ${userData.user?.id || 'unknown'}`);

  res.json({
    user: userData.user,
  });
});

export default router;