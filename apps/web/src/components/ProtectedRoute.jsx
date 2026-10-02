import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { logAccessDenied } from '@/lib/auditLog.js';

export default function ProtectedRoute({ children, requiredRoles = [], requiredPermission = null }) {
  const { currentUser, loading, isAuthenticated, hasPermission } = useAuth();
  const location = useLocation();
  const [isAuthorized, setIsAuthorized] = useState(null);

  console.log('[ProtectedRoute] Render cycle started for path:', location.pathname, {
    loading,
    isAuthenticated,
    userRol: currentUser?.rol,
    requiredRoles,
    isAuthorizedState: isAuthorized
  });

  useEffect(() => {
    if (loading) {
      console.log('[ProtectedRoute] Waiting for auth context to finish loading...');
      return;
    }

    const checkAuthorization = async () => {
      console.log('[ProtectedRoute] Checking authorization...');
      
      if (!isAuthenticated) {
        console.log('[ProtectedRoute] User is not authenticated. Denying access.');
        setIsAuthorized(false);
        return;
      }

      // Check Role
      if (requiredRoles && requiredRoles.length > 0) {
        const hasRequiredRole = requiredRoles.includes(currentUser.rol);
        console.log(`[ProtectedRoute] Role check: userRol=${currentUser.rol}, requiredRoles=${requiredRoles.join(',')}, passed=${hasRequiredRole}`);
        
        if (!hasRequiredRole) {
          console.log('[ProtectedRoute] Access denied due to role mismatch.');
          toast.error('Acceso denegado: No tienes el rol necesario para ver esta página.');
          await logAccessDenied('VIEW_ROUTE', location.pathname, currentUser.id, `Required roles: ${requiredRoles.join(',')}`);
          setIsAuthorized(false);
          return;
        }
      }

      // Check Specific Permission
      if (requiredPermission) {
        const { action, resource } = requiredPermission;
        const allowed = hasPermission(action, resource);
        console.log(`[ProtectedRoute] Permission check: action=${action}, resource=${resource}, passed=${allowed}`);
        
        if (!allowed) {
          console.log('[ProtectedRoute] Access denied due to missing specific permission.');
          toast.error('Acceso denegado: No tienes permisos para esta acción.');
          await logAccessDenied(action, resource, currentUser.id, 'Lacks specific permission');
          setIsAuthorized(false);
          return;
        }
      }

      console.log('[ProtectedRoute] Authorization successful. Granting access.');
      setIsAuthorized(true);
    };

    checkAuthorization();
  }, [loading, isAuthenticated, currentUser, requiredRoles, requiredPermission, location.pathname, hasPermission]);

  if (loading || isAuthorized === null) {
    console.log('[ProtectedRoute] Rendering loading spinner...');
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center w-full p-12">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground text-sm animate-pulse">Verificando permisos de acceso...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('[ProtectedRoute] Redirecting to /login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAuthorized) {
    console.log('[ProtectedRoute] Redirecting unauthorized user to safe default route based on role.');
    if (currentUser?.rol === 'Admin' || currentUser?.rol === 'Fundadora') return <Navigate to="/admin" replace />;
    if (currentUser?.rol === 'StudioManager') return <Navigate to="/studio-manager" replace />;
    if (currentUser?.rol === 'Facilitador') return <Navigate to="/facilitador" replace />;
    if (currentUser?.rol === 'Host') return <Navigate to="/host" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  console.log('[ProtectedRoute] Rendering protected content for path:', location.pathname);
  return <>{children}</>;
}