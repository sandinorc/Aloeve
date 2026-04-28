import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, AlertOctagon } from 'lucide-react';
import pb from '@/lib/pocketbaseClient.js';
import { toast } from 'sonner';
import { logActivity } from '@/lib/logActivity.js';
import { useAuth } from '@/contexts/AuthContext.jsx';

export default function DeleteUserModal({ isOpen, onClose, user, onSuccess }) {
  const { currentUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!user) return null;

  const handleConfirm = async () => {
    if (user.id === currentUser.id) {
      toast.error('No puedes eliminar tu propia cuenta.');
      onClose();
      return;
    }

    if (currentUser.rol !== 'Admin' && currentUser.rol !== 'Fundadora') {
      toast.error('No tienes permisos para eliminar usuarios.');
      onClose();
      return;
    }

    setIsSubmitting(true);
    try {
      // Check if deleting the last admin
      if (user.rol === 'Admin') {
        const admins = await pb.collection('usuarios').getFullList({
          filter: `rol = 'Admin'`,
          $autoCancel: false
        });
        
        if (admins.length <= 1 && admins.some(a => a.id === user.id)) {
          toast.error('No puedes eliminar al último Administrador del sistema.');
          setIsSubmitting(false);
          return;
        }
      }

      await pb.collection('usuarios').delete(user.id, { $autoCancel: false });
      
      await logActivity(
        'eliminar', 
        'Usuarios', 
        `Eliminó permanentemente al usuario ${user.email}`, 
        'usuarios', 
        user.id
      );
      
      toast.success('Usuario eliminado exitosamente');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Error al eliminar el usuario');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertOctagon className="w-5 h-5" />
            Eliminar Usuario
          </DialogTitle>
          <DialogDescription>
            Esta acción es permanente y no se puede deshacer.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-destructive/10 text-destructive p-4 rounded-lg text-sm border border-destructive/20 mt-2">
          <p className="font-medium mb-1">Estás a punto de eliminar a:</p>
          <p><strong>Nombre:</strong> {user.nombre_completo}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p className="mt-2">Todos los datos de acceso de este usuario serán borrados del sistema.</p>
        </div>

        <DialogFooter className="pt-4">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleConfirm} 
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Sí, Eliminar Permanentemente
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}