
import React, { createContext, useContext, useState, useEffect } from 'react';
import apiServerClient from '@/lib/apiServerClient.js';
import { toast } from 'sonner';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // RBAC states preserved for compatibility with existing components
  const [permissions, setPermissions] = useState([]);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('auth_token');
      
      if (token) {
        try {
          const res = await apiServerClient.fetch('/auth/me', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (res.ok) {
            const data = await res.json();
            setCurrentUser(data.user);
            // If the backend returns permissions in the user object, set them here
            if (data.user?.permissions) {
              setPermissions(data.user.permissions);
            }
          } else {
            // Token is invalid or expired
            localStorage.removeItem('auth_token');
            setCurrentUser(null);
            setPermissions([]);
          }
        } catch (error) {
          console.error('[AuthContext] Error restoring session:', error);
          localStorage.removeItem('auth_token');
          setCurrentUser(null);
          setPermissions([]);
        }
      }
      
      setLoading(false);
    };
    
    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await apiServerClient.fetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || errData.message || 'Credenciales inválidas');
      }
      
      const data = await res.json();
      
      // Store token and update state
      localStorage.setItem('auth_token', data.token);
      setCurrentUser(data.user);
      
      if (data.user?.permissions) {
        setPermissions(data.user.permissions);
      }
      
      toast.success('Inicio de sesión exitoso');
      return true;
    } catch (error) {
      console.error('[AuthContext] Login error:', error);
      toast.error(error.message || 'Error al iniciar sesión');
      throw error;
    }
  };

  const logout = async (reason = null) => {
    try {
      const token = localStorage.getItem('auth_token');
      if (token) {
        // Optional: notify backend of logout
        await apiServerClient.fetch('/auth/logout', { 
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }).catch(err => console.warn('Backend logout notification failed:', err));
      }
    } finally {
      localStorage.removeItem('auth_token');
      setCurrentUser(null);
      setPermissions([]);
      if (reason) {
        toast.info(reason);
      } else {
        toast.success('Sesión cerrada correctamente');
      }
    }
  };

  // RBAC Methods preserved for backward compatibility
  const hasPermission = (permission) => {
    if (currentUser?.rol === 'Admin' || currentUser?.rol === 'Fundadora') return true;
    return permissions.includes(permission);
  };

  const hasAnyPermission = (permsArray) => {
    if (currentUser?.rol === 'Admin' || currentUser?.rol === 'Fundadora') return true;
    return permsArray.some(p => permissions.includes(p));
  };

  const hasAllPermissions = (permsArray) => {
    if (currentUser?.rol === 'Admin' || currentUser?.rol === 'Fundadora') return true;
    return permsArray.every(p => permissions.includes(p));
  };

  return (
    <AuthContext.Provider value={{ 
      currentUser, 
      permissions,
      isAuthenticated: !!currentUser,
      login, 
      logout, 
      loading, 
      hasPermission,
      hasAnyPermission,
      hasAllPermissions
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
