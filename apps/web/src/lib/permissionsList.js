export const PERMISSION_GROUPS = [
  {
    category: 'Dashboard',
    permissions: [
      { id: 'dashboard', label: 'Ver Dashboard' }
    ]
  },
  {
    category: 'Punto de Venta',
    permissions: [
      { id: 'punto_venta', label: 'Acceso a POS' },
      { id: 'crear_venta', label: 'Crear Venta' },
      { id: 'editar_venta', label: 'Editar Venta' }
    ]
  },
  {
    category: 'Inventario',
    permissions: [
      { id: 'inventario', label: 'Ver Inventario' },
      { id: 'editar_inventario', label: 'Editar Inventario' },
      { id: 'cargar_inventario', label: 'Cargar Inventario' }
    ]
  },
  {
    category: 'Finanzas',
    permissions: [
      { id: 'finanzas', label: 'Acceso a Finanzas' }
    ]
  },
  {
    category: 'Usuarios',
    permissions: [
      { id: 'usuarios', label: 'Gestionar Usuarios' },
      { id: 'gestionar_roles', label: 'Gestionar Roles' }
    ]
  },
  {
    category: 'Reportes',
    permissions: [
      { id: 'reportes', label: 'Ver Reportes' }
    ]
  }
];

export const ALL_PERMISSIONS = PERMISSION_GROUPS.flatMap(g => g.permissions.map(p => p.id));

export const getPermissionsByGroup = (groupName) => {
  const group = PERMISSION_GROUPS.find(g => g.category === groupName);
  return group ? group.permissions : [];
};