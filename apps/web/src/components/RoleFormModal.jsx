import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2 } from 'lucide-react';
import pb from '@/lib/pocketbaseClient.js';
import { toast } from 'sonner';
import { PERMISSION_GROUPS, ALL_PERMISSIONS } from '@/lib/permissionsList.js';

export default function RoleFormModal({ isOpen, onClose, onSuccess, roleData }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    estado: true,
    permisos: []
  });

  useEffect(() => {
    if (isOpen) {
      if (roleData) {
        setFormData({
          nombre: roleData.nombre || '',
          descripcion: roleData.descripcion || '',
          estado: roleData.estado !== false, // Default to true if undefined
          permisos: Array.isArray(roleData.permisos) ? roleData.permisos : []
        });
      } else {
        setFormData({
          nombre: '',
          descripcion: '',
          estado: true,
          permisos: []
        });
      }
    }
  }, [isOpen, roleData]);

  const handlePermissionToggle = (permId) => {
    setFormData(prev => {
      const newPerms = prev.permisos.includes(permId)
        ? prev.permisos.filter(p => p !== permId)
        : [...prev.permisos, permId];
      return { ...prev, permisos: newPerms };
    });
  };

  const handleSelectAll = () => {
    setFormData(prev => ({ ...prev, permisos: ALL_PERMISSIONS }));
  };

  const handleDeselectAll = () => {
    setFormData(prev => ({ ...prev, permisos: [] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const nombreTrimmed = formData.nombre?.trim();
    
    if (!nombreTrimmed) {
      toast.error('El nombre del rol es requerido');
      return;
    }

    setIsSubmitting(true);

    try {
      // Check uniqueness
      const filterQuery = roleData 
        ? `nombre="${nombreTrimmed}" && id!="${roleData.id}"`
        : `nombre="${nombreTrimmed}"`;
        
      const existing = await pb.collection('roles').getList(1, 1, {
        filter: filterQuery,
        $autoCancel: false
      });
      
      if (existing.items.length > 0) {
        toast.error('Ya existe un rol con este nombre');
        setIsSubmitting(false);
        return;
      }

      // Ensure strict data types before sending to PocketBase
      const dataToSave = {
        nombre: String(nombreTrimmed),
        descripcion: String(formData.descripcion || '').trim(),
        estado: Boolean(formData.estado),
        permisos: Array.isArray(formData.permisos) ? formData.permisos : []
      };

      console.log('Payload being sent to PocketBase:', dataToSave);

      if (roleData) {
        await pb.collection('roles').update(roleData.id, dataToSave, { $autoCancel: false });
        toast.success('Rol actualizado exitosamente');
      } else {
        await pb.collection('roles').create(dataToSave, { $autoCancel: false });
        toast.success('Rol creado exitosamente');
      }

      onSuccess();
      onClose();
    } catch (error) {
      // Comprehensive error logging for debugging
      console.error('Full error object:', error);
      if (error.response) {
        console.error('Error response data:', error.response.data);
      }

      // Extract specific PocketBase error message if available
      let errorMessage = error?.response?.message || error.message || 'Error desconocido';
      
      // Append specific field validation errors if they exist
      if (error.response?.data && typeof error.response.data === 'object') {
        const fieldErrors = Object.entries(error.response.data)
          .map(([field, errObj]) => `${field}: ${errObj?.message || 'inválido'}`)
          .join(', ');
        if (fieldErrors) {
          errorMessage += ` (${fieldErrors})`;
        }
      }

      // Display user-friendly error message based on operation type
      if (roleData) {
        toast.error(`Error al actualizar rol: ${errorMessage}`);
      } else {
        toast.error(`Error al crear rol: ${errorMessage}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !isSubmitting && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle>{roleData ? 'Editar Rol' : 'Nuevo Rol'}</DialogTitle>
          <DialogDescription>
            Configura el nombre y los permisos asociados a este rol.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto max-h-[calc(100vh-200px)] p-6">
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre del Rol *</Label>
                  <Input 
                    id="nombre"
                    required
                    value={formData.nombre}
                    onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                    placeholder="Ej. Contable"
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-2 flex flex-col justify-center">
                  <Label>Estado</Label>
                  <div className="flex items-center space-x-2 mt-2">
                    <Switch 
                      checked={formData.estado}
                      onCheckedChange={(checked) => setFormData({...formData, estado: checked})}
                      disabled={isSubmitting}
                    />
                    <span className="text-sm text-muted-foreground">{formData.estado ? 'Activo' : 'Inactivo'}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea 
                  id="descripcion"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                  placeholder="Breve descripción de las responsabilidades de este rol..."
                  rows={2}
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Permisos</Label>
                  <div className="space-x-2">
                    <Button type="button" variant="outline" size="sm" onClick={handleSelectAll} disabled={isSubmitting}>
                      Seleccionar Todo
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={handleDeselectAll} disabled={isSubmitting}>
                      Limpiar
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {PERMISSION_GROUPS.map((group) => (
                    <div key={group.category} className="space-y-3 bg-muted/30 p-4 rounded-lg border">
                      <h4 className="font-medium text-sm text-foreground">{group.category}</h4>
                      <div className="space-y-2">
                        {group.permissions.map((perm) => (
                          <div key={perm.id} className="flex items-start space-x-2">
                            <Checkbox 
                              id={`perm-${perm.id}`}
                              checked={formData.permisos.includes(perm.id)}
                              onCheckedChange={() => handlePermissionToggle(perm.id)}
                              disabled={isSubmitting}
                            />
                            <label 
                              htmlFor={`perm-${perm.id}`}
                              className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                            >
                              {perm.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="p-6 pt-4 border-t bg-background">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {roleData ? 'Guardar Cambios' : 'Crear Rol'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}