import { useAuth } from '@/contexts/AuthContext.jsx';

export function useUserPermissions() {
  const { 
    permissions, 
    currentRole, 
    hasPermission, 
    hasAnyPermission, 
    hasAllPermissions 
  } = useAuth();

  return {
    permissions,
    role: currentRole,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions
  };
}