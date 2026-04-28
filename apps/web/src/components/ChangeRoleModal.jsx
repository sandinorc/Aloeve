import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, ShieldAlert } from 'lucide-react';
import pb from '@/lib/pocketbaseClient.js';
import { toast } from 'sonner';
import { logActivity } from '@/lib/logActivity.js';
import { useAuth } from '@/contexts/AuthContext.jsx';

export default function ChangeRoleModal({ isOpen, onClose, user, onSuccess, availableRoles = [] }) {
  const { currentUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newRoleId, setNewRoleId] = useState('');

  useEffect(() => {
    if (isOpen && user) {
      setNewRoleId(user.rol_id || '');
    }
  }, [isOpen, user]);

  if (!user) return null;

  const currentRoleName = availableRoles.find(r => r.id === user.rol_id)?.nombre || user.rol || 'Desconocido';

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (newRoleId === user.rol_id) {
      onClose();
      return;
    }

    if (user.id === currentUser.id) {
      toast.error('No puedes cambiar tu propio rol.');
      return;
    }

    setIsSubmitting(true);
    try {
      const newRoleName = availableRoles.find(r => r.id === newRoleId)?.nombre || 'Desconocido';
      
      await pb.collection('usuarios').update(user.id, { rol_id: newRoleId }, { $autoCancel: false });
      
      await logActivity(
        'editar', 
        'Usuarios', 
        `Cambio de rol de ${currentRoleName} a ${newRoleName} para el usuario ${user.email}`, 
        'usuarios', 
        user.id
      );
      
      toast.success('Rol actualizado exitosamente');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error changing role:', error);
      toast.error('Error al cambiar el rol del usuario');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Cambiar Rol de Usuario</DialogTitle>
          <DialogDescription>
            Modifica el nivel de acceso para <strong>{user.nombre_completo}</strong>.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="bg-muted/50 p-3 rounded-lg flex items-center gap-3 border">
            <ShieldAlert className="w-5 h-5 text-muted-foreground" />
            <div className="text-sm">
              <p className="text-muted-foreground">Rol actual:</p>
              <p className="font-medium text-foreground">{currentRoleName}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Nuevo Rol</Label>
            <Select value={newRoleId} onValueChange={setNewRoleId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un rol" />
              </SelectTrigger>
              <SelectContent>
                {availableRoles.map(role => (
                  <SelectItem key={role.id} value={role.id}>{role.nombre}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || newRoleId === user.rol_id || !newRoleId}>
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Guardar Cambios
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}