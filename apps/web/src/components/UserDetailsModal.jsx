import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { User, Mail, Shield, Activity, Calendar, Clock, Pencil, KeyRound, ToggleLeft, ToggleRight, Trash2, UserCog } from 'lucide-react';

export default function UserDetailsModal({ 
  isOpen, 
  onClose, 
  user, 
  onEdit, 
  onChangeRole, 
  onResetPassword, 
  onToggleStatus, 
  onDelete,
  currentUser
}) {
  if (!user) return null;

  const getRoleColor = (role) => {
    switch(role) {
      case 'Fundadora': return 'bg-primary/10 text-primary border-primary/20';
      case 'Admin': return 'bg-slate-800/10 text-slate-800 border-slate-800/20';
      case 'StudioManager': return 'bg-secondary/10 text-secondary border-secondary/20';
      case 'Host': return 'bg-accent/10 text-accent border-accent/20';
      case 'Facilitador': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isSelf = currentUser?.id === user.id;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Detalles del Usuario
          </DialogTitle>
          <DialogDescription>
            Información completa y acciones disponibles para este usuario.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-xl border">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold">
              {user.nombre_completo?.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">{user.nombre_completo}</h3>
              <div className="flex items-center gap-2 text-muted-foreground text-sm mt-1">
                <Mail className="w-4 h-4" />
                {user.email}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground flex items-center gap-1"><Shield className="w-3 h-3"/> Rol</span>
              <div><Badge variant="outline" className={getRoleColor(user.rol)}>{user.rol}</Badge></div>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground flex items-center gap-1"><Activity className="w-3 h-3"/> Estado</span>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${user.estado === 'Activo' ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <span className="text-sm font-medium">{user.estado}</span>
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground flex items-center gap-1"><Calendar className="w-3 h-3"/> Fecha Creación</span>
              <div className="text-sm font-medium">
                {user.fecha_creacion ? format(new Date(user.fecha_creacion), 'dd MMM yyyy', { locale: es }) : 'N/A'}
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3"/> Último Acceso</span>
              <div className="text-sm font-medium">
                {user.ultimo_acceso ? format(new Date(user.ultimo_acceso), 'dd MMM yyyy HH:mm', { locale: es }) : 'Nunca'}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0 border-t pt-4">
          <div className="flex flex-wrap gap-2 w-full justify-center sm:justify-start">
            <Button variant="outline" size="sm" onClick={() => { onClose(); onEdit(user); }} className="gap-2">
              <Pencil className="w-4 h-4" /> Editar
            </Button>
            <Button variant="outline" size="sm" onClick={() => { onClose(); onChangeRole(user); }} className="gap-2" disabled={isSelf}>
              <UserCog className="w-4 h-4" /> Rol
            </Button>
            <Button variant="outline" size="sm" onClick={() => { onClose(); onResetPassword(user); }} className="gap-2">
              <KeyRound className="w-4 h-4" /> Clave
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => { onClose(); onToggleStatus(user); }} 
              className={`gap-2 ${user.estado === 'Activo' ? 'text-orange-600 hover:text-orange-700' : 'text-green-600 hover:text-green-700'}`}
              disabled={isSelf}
            >
              {user.estado === 'Activo' ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
              {user.estado === 'Activo' ? 'Desactivar' : 'Activar'}
            </Button>
            <Button variant="destructive" size="sm" onClick={() => { onClose(); onDelete(user); }} className="gap-2" disabled={isSelf}>
              <Trash2 className="w-4 h-4" /> Eliminar
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}