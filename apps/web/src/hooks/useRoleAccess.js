import { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext.jsx';

export function useRoleAccess() {
  const { currentUser } = useAuth();
  const role = currentUser?.rol || 'Guest';

  const permissions = useMemo(() => {
    const basePerms = {
      finanzas: { crear: false, editar: false, eliminar: false, ver: false, exportar: false },
      inventario: { crear: false, editar: false, eliminar: false, ver: false, exportar: false },
      agenda: { crear: false, editar: false, eliminar: false, ver: false, exportar: false },
      crm: { crear: false, editar: false, eliminar: false, ver: false, exportar: false },
      usuarios: { crear: false, editar: false, eliminar: false, ver: false, exportar: false },
    };

    if (role === 'Fundadora' || role === 'Admin') {
      // Full access
      Object.keys(basePerms).forEach(mod => {
        Object.keys(basePerms[mod]).forEach(act => {
          basePerms[mod][act] = true;
        });
      });
    } else if (role === 'Studio Manager') {
      basePerms.finanzas.ver = true;
      
      basePerms.inventario = { crear: true, editar: true, eliminar: true, ver: true, exportar: true };
      basePerms.agenda = { crear: true, editar: true, eliminar: true, ver: true, exportar: true };
      
      basePerms.crm.ver = true;
    } else if (role === 'Host') {
      basePerms.agenda.ver = true;
      basePerms.agenda.editar = true; // For check-in
      
      basePerms.crm.crear = true;
      basePerms.crm.editar = true;
      basePerms.crm.ver = true;
      
      basePerms.inventario.ver = true;
      basePerms.inventario.crear = true; // For movements
      
      basePerms.finanzas.ver = true; // Limited read
    } else if (role === 'Facilitador') {
      basePerms.agenda.ver = true;
      basePerms.agenda.editar = true; // For notes
    }

    return basePerms;
  }, [role]);

  return { role, permissions, isFundadora: role === 'Fundadora' || role === 'Admin' };
}