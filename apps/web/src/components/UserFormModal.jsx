import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Wand2, Eye, EyeOff } from 'lucide-react';
import pb from '@/lib/pocketbaseClient.js';
import { toast } from 'sonner';
import { logActivity } from '@/lib/logActivity.js';
import { generatePassword } from '@/lib/passwordGenerator.js';

export default function UserFormModal({ isOpen, onClose, user, onSuccess, availableRoles = [] }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    nombre_completo: '',
    email: '',
    rol_id: '',
    estado: 'Activo',
    password: ''
  });

  useEffect(() => {
    if (isOpen) {
      if (user) {
        setFormData({
          nombre_completo: user.nombre_completo || '',
          email: user.email || '',
          rol_id: user.rol_id || '',
          estado: user.estado || 'Activo',
          password: ''
        });
      } else {
        setFormData({
          nombre_completo: '',
          email: '',
          rol_id: availableRoles.length > 0 ? availableRoles[0].id : '',
          estado: 'Activo',
          password: generatePassword(12)
        });
      }
      setShowPassword(false);
    }
  }, [isOpen, user, availableRoles]);

  const handleGeneratePassword = () => {
    setFormData(prev => ({ ...prev, password: generatePassword(12) }));
    setShowPassword(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (user) {
        // Update existing user
        const updateData = {
          nombre_completo: formData.nombre_completo,
          estado: formData.estado
        };
        
        if (formData.rol_id !== user.rol_id) updateData.rol_id = formData.rol_id;

        await pb.collection('usuarios').update(user.id, updateData, { $autoCancel: false });
        await logActivity('editar', 'Usuarios', `Actualizó perfil de ${user.email}`, 'usuarios', user.id);
        toast.success('Usuario actualizado exitosamente');
      } else {
        // Create new user
        if (!formData.password || formData.password.length < 8) {
          toast.error('La contraseña debe tener al menos 8 caracteres');
          setIsSubmitting(false);
          return;
        }

        const record = await pb.collection('usuarios').create({
          ...formData,
          passwordConfirm: formData.password,
          emailVisibility: true
        }, { $autoCancel: false });
        
        await logActivity('crear', 'Usuarios', `Creó nuevo usuario: ${formData.email}`, 'usuarios', record.id);
        toast.success('Usuario creado exitosamente');
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving user:', error);
      if (error.response?.data?.email?.code === 'validation_not_unique') {
        toast.error('El correo electrónico ya está en uso');
      } else {
        toast.error('Error al guardar el usuario');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{user ? 'Editar Usuario' : 'Nuevo Usuario'}</DialogTitle>
          <DialogDescription>
            {user ? 'Modifica los datos básicos del usuario.' : 'Crea un nuevo acceso al sistema.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label>Nombre Completo *</Label>
            <Input 
              required
              value={formData.nombre_completo}
              onChange={(e) => setFormData({...formData, nombre_completo: e.target.value})}
              placeholder="Ej. Juan Pérez"
            />
          </div>

          <div className="space-y-2">
            <Label>Correo Electrónico *</Label>
            <Input 
              type="email"
              required
              disabled={!!user}
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="correo@ejemplo.com"
              className={user ? "bg-muted text-muted-foreground" : ""}
            />
            {user && <p className="text-xs text-muted-foreground">El correo no se puede modificar una vez creado.</p>}
          </div>

          {!user && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Rol *</Label>
                <Select value={formData.rol_id} onValueChange={(val) => setFormData({...formData, rol_id: val})}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar rol" /></SelectTrigger>
                  <SelectContent>
                    {availableRoles.map(role => (
                      <SelectItem key={role.id} value={role.id}>{role.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Estado *</Label>
                <Select value={formData.estado} onValueChange={(val) => setFormData({...formData, estado: val})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Activo">Activo</SelectItem>
                    <SelectItem value="Inactivo">Inactivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {user && (
            <div className="space-y-2">
              <Label>Estado *</Label>
              <Select value={formData.estado} onValueChange={(val) => setFormData({...formData, estado: val})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Activo">Activo</SelectItem>
                  <SelectItem value="Inactivo">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {!user && (
            <div className="space-y-2">
              <Label>Contraseña Temporal *</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input 
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="pr-10 font-mono"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <Button type="button" variant="outline" onClick={handleGeneratePassword} title="Generar contraseña segura">
                  <Wand2 className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Copia esta contraseña y entrégala al usuario.</p>
            </div>
          )}

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {user ? 'Guardar Cambios' : 'Crear Usuario'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}