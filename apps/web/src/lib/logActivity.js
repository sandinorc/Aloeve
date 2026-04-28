import pb from '@/lib/pocketbaseClient.js';

/**
 * Logs an activity to the logs_actividad collection
 * @param {string} accion - 'crear', 'editar', 'eliminar', 'ver', 'exportar'
 * @param {string} modulo - 'Finanzas', 'Inventario', 'Agenda', 'CRM', 'Usuarios'
 * @param {string} descripcion - Description of the action
 * @param {string} tabla_afectada - Name of the affected table
 * @param {string} registro_id - ID of the affected record (optional)
 */
export const logActivity = async (accion, modulo, descripcion, tabla_afectada, registro_id = '') => {
  try {
    if (!pb.authStore.isValid || !pb.authStore.model) return;
    
    await pb.collection('logs_actividad').create({
      usuario_id: pb.authStore.model.id,
      accion,
      modulo,
      descripcion,
      tabla_afectada,
      registro_id
    }, { $autoCancel: false });
    
    console.log(`[AuditLog] Successfully logged: ${accion} on ${modulo}`);
  } catch (error) {
    console.error('[AuditLog] Failed to log activity:', error);
  }
};