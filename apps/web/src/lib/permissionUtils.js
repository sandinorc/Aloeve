import pb from '@/lib/pocketbaseClient.js';

export const ROLES = {
  ADMIN: 'Admin',
  FUNDADORA: 'Fundadora',
  STUDIO_MANAGER: 'StudioManager',
  FACILITADOR: 'Facilitador',
  HOST: 'Host'
};

const ROLE_HIERARCHY = {
  [ROLES.ADMIN]: 50,
  [ROLES.FUNDADORA]: 50,
  [ROLES.STUDIO_MANAGER]: 40,
  [ROLES.FACILITADOR]: 30,
  [ROLES.HOST]: 20
};

/**
 * Base permission check based on role and action
 */
export const hasPermission = (user, action, resource) => {
  if (!user) return false;
  
  // Admins and Founders have full access
  if (user.rol === ROLES.ADMIN || user.rol === ROLES.FUNDADORA) return true;

  switch (user.rol) {
    case ROLES.STUDIO_MANAGER:
      // Managers can manage resources within their studio
      if (['view', 'create', 'edit', 'delete'].includes(action)) {
        return ['talleres', 'facilitadores', 'estudios', 'sesiones', 'inventario'].includes(resource);
      }
      return false;
      
    case ROLES.FACILITADOR:
      // Facilitators can view and edit their assigned workshops/sessions
      if (action === 'view') return ['talleres', 'sesiones', 'materiales'].includes(resource);
      if (action === 'edit') return ['sesiones'].includes(resource);
      return false;
      
    case ROLES.HOST:
      // Hosts can only view sessions and manage POS
      if (action === 'view') return ['sesiones', 'pos', 'clientes'].includes(resource);
      if (action === 'create') return ['ventas_pos', 'clientes'].includes(resource);
      return false;
      
    default:
      return false;
  }
};

/**
 * Verify user can edit a specific studio
 */
export const canEditStudio = (user, studioId) => {
  if (!user) return false;
  if (user.rol === ROLES.ADMIN || user.rol === ROLES.FUNDADORA) return true;
  if (user.rol === ROLES.STUDIO_MANAGER) return user.studioId === studioId;
  return false;
};

/**
 * Verify user can edit a specific workshop
 */
export const canEditWorkshop = async (user, workshopId) => {
  if (!user) return false;
  if (user.rol === ROLES.ADMIN || user.rol === ROLES.FUNDADORA) return true;
  
  try {
    const workshop = await pb.collection('talleres').getOne(workshopId, { $autoCancel: false });
    
    if (user.rol === ROLES.STUDIO_MANAGER) {
      return workshop.studioId === user.studioId;
    }
    
    if (user.rol === ROLES.FACILITADOR) {
      // Assuming facilitatorIds is an array or comma-separated string
      const facIds = Array.isArray(workshop.facilitatorIds) 
        ? workshop.facilitatorIds 
        : (workshop.facilitatorIds || '').split(',');
      return facIds.includes(user.id);
    }
    
    return false;
  } catch (error) {
    console.error('[PermissionUtils] Error checking workshop permission:', error);
    return false;
  }
};

/**
 * Verify user can edit a specific facilitator
 */
export const canEditFacilitator = async (user, facilitatorId) => {
  if (!user) return false;
  if (user.rol === ROLES.ADMIN || user.rol === ROLES.FUNDADORA) return true;
  
  try {
    if (user.rol === ROLES.STUDIO_MANAGER) {
      const facilitator = await pb.collection('facilitadores').getOne(facilitatorId, { $autoCancel: false });
      return facilitator.studioId === user.studioId;
    }
    return false;
  } catch (error) {
    console.error('[PermissionUtils] Error checking facilitator permission:', error);
    return false;
  }
};

/**
 * Return studios user can access
 */
export const getAccessibleStudios = async (user) => {
  if (!user) return [];
  
  try {
    if (user.rol === ROLES.ADMIN || user.rol === ROLES.FUNDADORA) {
      return await pb.collection('estudios').getFullList({ $autoCancel: false });
    }
    
    if (user.studioId) {
      const studio = await pb.collection('estudios').getOne(user.studioId, { $autoCancel: false });
      return [studio];
    }
    
    return [];
  } catch (error) {
    console.error('[PermissionUtils] Error fetching accessible studios:', error);
    return [];
  }
};

/**
 * Return workshops user can access
 */
export const getAccessibleWorkshops = async (user) => {
  if (!user) return [];
  
  try {
    if (user.rol === ROLES.ADMIN || user.rol === ROLES.FUNDADORA) {
      return await pb.collection('talleres').getFullList({ $autoCancel: false });
    }
    
    if (user.rol === ROLES.STUDIO_MANAGER && user.studioId) {
      return await pb.collection('talleres').getFullList({
        filter: `studioId = "${user.studioId}"`,
        $autoCancel: false
      });
    }
    
    if (user.rol === ROLES.FACILITADOR) {
      return await pb.collection('talleres').getFullList({
        filter: `facilitatorIds ~ "${user.id}"`,
        $autoCancel: false
      });
    }
    
    return [];
  } catch (error) {
    console.error('[PermissionUtils] Error fetching accessible workshops:', error);
    return [];
  }
};