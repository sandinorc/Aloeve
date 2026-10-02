import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle } from 'lucide-react';
import pb from '@/lib/pocketbaseClient.js';
import { toast } from 'sonner';
import { logActivity } from '@/lib/logActivity.js';
import { useAuth } from '@/contexts/AuthContext.jsx';

export default function ToggleUserStatusModal({ isOpen, onClose, user, onSuccess }) {
  const { currentUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!user) return null;

  const isActivating = user.estado === 'Inactivo';
  const newStatus = isActivating ? 'Activo' : 'Inactivo';

  const handleConfirm = async () => {
    if (user.id === currentUser.id) {
      toast.error('No puedes cambiar tu propio estado.');
      onClose();
      return;
    }

    setIsSubmitting(true);
    try {
      // Check if deactivating the last admin
      if (!isActivating && user.rol === 'Admin') {
        const activeAdmins = await pb.collection('usuarios').getFullList({
          filter: `rol = 'Admin' && estado = 'Activo'`,
          $autoCancel: false
        });
        
        if (activeAdmins.length <= 1 && activeAdmins.some(a => a.id === user.id)) {
          toast.error('No puedes desactivar al último Administrador activo del sistema.');
          setIsSubmitting(false);
          return;
        }
      }

      await pb.collection('usuarios').update(user.id, { estado: newStatus }, { $autoCancel: false });
      
      await logActivity(
        'editar', 
        'Usuarios', 
        `Cambió estado a ${newStatus} para el usuario ${user.email}`, 
        'usuarios', 
        user.id
      );
      
      toast.success(`Usuario ${isActivating ? 'activado' : 'desactivado'} exitosamente`);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error toggling status:', error);
      toast.error('Error al cambiar el estado del usuario');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className={`w-5 h-5 ${isActivating ? 'text-green-500' : 'text-orange-500'}`} />
            Confirmar Acción
          </DialogTitle>
          <DialogDescription>
            ¿Estás seguro de que deseas <strong>{isActivating ? 'activar' : 'desactivar'}</strong> al usuario <strong>{user.nombre_completo}</strong>?
          </DialogDescription>
        </DialogHeader>

        {!isActivating && (
          <div className="bg-orange-50 text-orange-800 p-3 rounded-md text-sm border border-orange-200 mt-2">
            El usuario no podrá iniciar sesión en el sistema mientras esté inactivo.
          </div>
        )}

        <DialogFooter className="pt-4">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button 
            variant={isActivating ? "default" : "destructive"} 
            onClick={handleConfirm} 
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Sí, {isActivating ? 'Activar' : 'Desactivar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}