import 'dotenv/config';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';

/**
 * Middleware to authenticate requests using Horizons JWT tokens.
 * Validates the Bearer token by calling the Horizons /auth/me endpoint.
 */
export const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (!authHeader) {
    logger.warn('Unauthorized access attempt - Missing Authorization header');
    return res.status(401).json({ error: 'Unauthorized - Missing Authorization header' });
  }

  if (!authHeader.startsWith('Bearer ')) {
    logger.warn('Unauthorized access attempt - Malformed Authorization header (missing Bearer prefix)');
    return res.status(401).json({ error: 'Unauthorized - Invalid Authorization header format' });
  }

  const token = authHeader.substring(7);

  if (!token || token.trim() === '') {
    logger.warn('Unauthorized access attempt - Empty token');
    return res.status(401).json({ error: 'Unauthorized - Missing token' });
  }

  try {
    logger.info(`Validating token with Horizons API: ${token.substring(0, 10)}...`);

    const response = await fetch(`${process.env.HORIZONS_API_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      logger.warn(`Token validation failed - Status ${response.status}`);
      return res.status(401).json({ error: 'Unauthorized - Invalid or expired token' });
    }

    const userData = await response.json();
    req.user = userData.user;

    logger.info(`Authentication successful for user ${req.user?.id || 'unknown'}`);
    next();
  } catch (error) {
    logger.error(`Auth validation error: ${error.message}`);
    return res.status(401).json({ error: 'Unauthorized - Token validation failed' });
  }
};

/**
 * Middleware to restrict access based on user roles
 * Must be used AFTER authMiddleware
 */
export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized - User not authenticated' });
    }
    
    const userRole = req.user.rol || req.user.role;
    if (!roles.includes(userRole)) {
      logger.warn(`Forbidden access attempt - User ${req.user.id} lacks required roles`);
      return res.status(403).json({ error: 'Forbidden - Insufficient permissions' });
    }
    
    next();
  };
};

/**
 * Middleware to validate resource ownership
 * Checks if req.user.id matches the resource owner field
 * Supports different resource types with their respective owner field names
 * Must be used AFTER authMiddleware
 */
export const ownershipCheck = (resourceType) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized - User not authenticated' });
    }

    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: 'Resource ID is required' });
    }

    // Map resource types to their collection names and owner field names
    const resourceMap = {
      studio: { collection: 'estudios', ownerField: 'managerId' },
      workshop: { collection: 'talleres', ownerField: 'studioId' },
      facilitator: { collection: 'facilitadores', ownerField: 'studioId' },
    };

    const resourceConfig = resourceMap[resourceType];
    if (!resourceConfig) {
      logger.error(`[ownershipCheck] Unknown resource type: ${resourceType}`);
      return res.status(400).json({ error: 'Invalid resource type' });
    }

    // Fetch the resource
    const resource = await pb.collection(resourceConfig.collection).getOne(id);

    // Admin and Fundadora bypass ownership check
    if (req.user.role === 'Admin' || req.user.role === 'Fundadora') {
      return next();
    }

    // For studios: check if user is the manager
    if (resourceType === 'studio') {
      if (resource.managerId !== req.user.id) {
        logger.warn(`[ownershipCheck] User ${req.user.id} denied access to studio ${id}`);
        return res.status(403).json({ error: 'Forbidden - You do not own this resource' });
      }
      return next();
    }

    // For workshops and facilitators: check if user manages the studio
    if (resourceType === 'workshop' || resourceType === 'facilitator') {
      const studioId = resource.studioId;
      const studio = await pb.collection('estudios').getOne(studioId);
      
      if (studio.managerId !== req.user.id) {
        logger.warn(`[ownershipCheck] User ${req.user.id} denied access to ${resourceType} ${id}`);
        return res.status(403).json({ error: 'Forbidden - You do not own this resource' });
      }
      return next();
    }

    logger.warn(`[ownershipCheck] User ${req.user.id} denied access to ${resourceType} ${id}`);
    return res.status(403).json({ error: 'Forbidden - You do not own this resource' });
  };
};