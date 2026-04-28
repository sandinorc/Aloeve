import { useAuth } from '@/contexts/AuthContext.jsx';
import apiClient from '@/lib/pocketbaseClient.js';

export function useInventoryChange() {
  const { currentUser } = useAuth();

  const logInventoryChange = async (tipo, itemId, itemName, cantidadAnterior, cantidadNueva, razon, notas = '') => {
    if (!currentUser) return;
    
    try {
      await apiClient.collection('historial_inventario').create({
        tipo,
        item_id: itemId,
        item_name: itemName,
        cantidad_anterior: cantidadAnterior,
        cantidad_nueva: cantidadNueva,
        razon,
        notas,
        usuario_id: currentUser.id,
        usuario_nombre: currentUser.nombre_completo || currentUser.email,
      });
      
      console.log(`[InventoryLog] Successfully logged ${tipo} change for ${itemName}`);
    } catch (error) {
      console.error('[InventoryLog] Error logging inventory change:', error);
    }
  };

  return { logInventoryChange };
}