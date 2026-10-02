// MODIFIED: Removed duplicate 'pb' declaration (line 32)
// Now uses single imported instance from pocketbaseClient.js
// All functions use the centralized pb instance

import 'dotenv/config';
import pb from './pocketbaseClient.js';
import logger from './logger.js';

/**
 * Check if user can edit a studio
 * Admin/Fundadora can edit any studio
 * StudioManager can edit their own studio
 */
const canUserEditStudio = async (userId, studioId) => {
  try {
    const user = await pb.collection('usuarios').getOne(userId, { $autoCancel: false });

    // Admin and Fundadora can edit any studio
    if (user.role === 'Admin' || user.role === 'Fundadora') {
      return true;
    }

    // StudioManager can edit their own studio
    if (user.role === 'StudioManager') {
      const studio = await pb.collection('estudios').getOne(studioId, { $autoCancel: false });
      return studio.managerId === userId;
    }

    return false;
  } catch (error) {
    logger.error(`[canUserEditStudio] Error: ${error.message}`);
    throw error;
  }
};

/**
 * Check if user can edit a workshop
 * Admin/Fundadora can edit any workshop
 * StudioManager can edit workshops in their studio
 * Facilitador can edit workshops they're assigned to
 */
const canUserEditWorkshop = async (userId, workshopId) => {
  try {
    const user = await pb.collection('usuarios').getOne(userId, { $autoCancel: false });
    const workshop = await pb.collection('talleres').getOne(workshopId, { $autoCancel: false });

    // Admin and Fundadora can edit any workshop
    if (user.role === 'Admin' || user.role === 'Fundadora') {
      return true;
    }

    // StudioManager can edit workshops in their studio
    if (user.role === 'StudioManager') {
      const studio = await pb.collection('estudios').getOne(workshop.studioId, { $autoCancel: false });
      return studio.managerId === userId;
    }

    // Facilitador can edit workshops they're assigned to
    if (user.role === 'Facilitador') {
      const facilitatorIds = workshop.facilitatorIds || [];
      return facilitatorIds.includes(userId);
    }

    return false;
  } catch (error) {
    logger.error(`[canUserEditWorkshop] Error: ${error.message}`);
    throw error;
  }
};

/**
 * Check if user can edit a facilitator
 * Admin/Fundadora can edit any facilitator
 * StudioManager can edit facilitators in their studio
 */
const canUserEditFacilitator = async (userId, facilitatorId) => {
  try {
    const user = await pb.collection('usuarios').getOne(userId, { $autoCancel: false });
    const facilitator = await pb.collection('facilitadores').getOne(facilitatorId, { $autoCancel: false });

    // Admin and Fundadora can edit any facilitator
    if (user.role === 'Admin' || user.role === 'Fundadora') {
      return true;
    }

    // StudioManager can edit facilitators in their studio
    if (user.role === 'StudioManager') {
      const studio = await pb.collection('estudios').getOne(facilitator.studioId, { $autoCancel: false });
      return studio.managerId === userId;
    }

    return false;
  } catch (error) {
    logger.error(`[canUserEditFacilitator] Error: ${error.message}`);
    throw error;
  }
};

/**
 * Get user's role
 */
const getUserRole = async (userId) => {
  try {
    const user = await pb.collection('usuarios').getOne(userId, { $autoCancel: false });
    return user.role;
  } catch (error) {
    logger.error(`[getUserRole] Error: ${error.message}`);
    throw error;
  }
};

/**
 * Get studios accessible by user
 * Admin/Fundadora see all studios
 * StudioManager sees only their studio
 */
const getUserStudios = async (userId) => {
  try {
    const user = await pb.collection('usuarios').getOne(userId, { $autoCancel: false });

    if (user.role === 'Admin' || user.role === 'Fundadora') {
      return await pb.collection('estudios').getFullList({ $autoCancel: false });
    }

    if (user.role === 'StudioManager') {
      return await pb.collection('estudios').getFullList({
        filter: `managerId = "${userId}"`,
        $autoCancel: false
      });
    }

    return [];
  } catch (error) {
    logger.error(`[getUserStudios] Error: ${error.message}`);
    throw error;
  }
};

/**
 * Check if user can perform an action on a resource type
 * Admin/Fundadora: can do all actions
 * StudioManager: can create/edit/delete in own studio
 * Facilitador: can edit assigned workshops
 * Host: can view own sessions
 */
const canUserPerformAction = async (userId, action, resourceType) => {
  try {
    const user = await pb.collection('usuarios').getOne(userId, { $autoCancel: false });
    const role = user.role;

    // Admin and Fundadora can do everything
    if (role === 'Admin' || role === 'Fundadora') {
      return true;
    }

    // StudioManager permissions
    if (role === 'StudioManager') {
      if (['create', 'edit', 'delete'].includes(action)) {
        if (['workshop', 'facilitator', 'session'].includes(resourceType)) {
          return true;
        }
      }
      if (action === 'view' && resourceType === 'studio') {
        return true;
      }
    }

    // Facilitador permissions
    if (role === 'Facilitador') {
      if (action === 'edit' && resourceType === 'workshop') {
        return true;
      }
      if (action === 'view' && ['workshop', 'session'].includes(resourceType)) {
        return true;
      }
    }

    // Host permissions
    if (role === 'Host') {
      if (action === 'view' && resourceType === 'session') {
        return true;
      }
    }

    return false;
  } catch (error) {
    logger.error(`[canUserPerformAction] Error: ${error.message}`);
    throw error;
  }
};

export default {
  canUserEditStudio,
  canUserEditWorkshop,
  canUserEditFacilitator,
  getUserRole,
  getUserStudios,
  canUserPerformAction,
};