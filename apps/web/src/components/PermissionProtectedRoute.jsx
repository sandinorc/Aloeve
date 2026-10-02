import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function PermissionProtectedRoute({ 
  children, 
  requiredPermission, 
  requiredPermissions = [], 
  mode = 'any' // 'any' or 'all'
}) {
  const { isAuthenticated, loading, hasPermission, hasAnyPermission, hasAllPermissions } = useAuth();
  const location = useLocation();

  if (loading) {
    return null; // Or a loading spinner
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  let isAllowed = false;

  if (requiredPermission) {
    isAllowed = hasPermission(requiredPermission);
  } else if (requiredPermissions.length > 0) {
    isAllowed = mode === 'all' 
      ? hasAllPermissions(requiredPermissions) 
      : hasAnyPermission(requiredPermissions);
  } else {
    isAllowed = true; // No specific permissions required
  }

  if (!isAllowed) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
          <ShieldAlert className="w-8 h-8 text-destructive" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Acceso Denegado</h2>
        <p className="text-muted-foreground max-w-md mb-6">
          No tienes los permisos necesarios para acceder a esta sección. Si crees que esto es un error, contacta al administrador.
        </p>
        <Link to="/dashboard">
          <Button variant="default">Volver al Dashboard</Button>
        </Link>
      </div>
    );
  }

  return children;
}