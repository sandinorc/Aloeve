import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import pb from '@/lib/pocketbaseClient.js';
import { toast } from 'sonner';
import { useInventoryChange } from '@/hooks/useInventoryChange.js';
import { useAutoCodeGeneration } from '@/hooks/useAutoCodeGeneration.js';

const CATEGORIAS = ['Pinturas', 'Lienzos', 'Pinceles', 'Papeles', 'Lápices', 'Marcadores', 'Accesorios', 'Bebidas', 'Decoración', 'Otros'];
const UNIDADES = ['Unidad', 'Litro', 'Kg', 'Metro', 'Caja', 'Paquete'];

export default function MaterialForm({ isOpen, onClose, material, onSuccess }) {
  const { logInventoryChange } = useInventoryChange();
  const { generateMaterialCode } = useAutoCodeGeneration();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    nombre: '',
    codigo: '',
    cantidad_actual: 0,
    cantidad_minima: 0,
    precio_unitario: 0,
    unidad: 'Unidad',
    categoria: 'Pinturas',
    proveedor: '',
    estado: 'Activo'
  });

  useEffect(() => {
    if (isOpen) {
      if (material) {
        setFormData({
          nombre: material.nombre || '',
          codigo: material.codigo || '',
          cantidad_actual: material.cantidad_actual || 0,
          cantidad_minima: material.cantidad_minima || 0,
          precio_unitario: material.precio_unitario || 0,
          unidad: material.unidad || 'Unidad',
          categoria: material.categoria || 'Pinturas',
          proveedor: material.proveedor || '',
          estado: material.estado || 'Activo'
        });
      } else {
        setFormData({
          nombre: '',
          codigo: '', // Will be auto-generated on submit
          cantidad_actual: 0,
          cantidad_minima: 0,
          precio_unitario: 0,
          unidad: 'Unidad',
          categoria: 'Pinturas',
          proveedor: '',
          estado: 'Activo'
        });
      }
    }
  }, [isOpen, material]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let record;
      if (material?.id) {
        // Update
        const currentRecord = await pb.collection('materiales').getOne(material.id, { $autoCancel: false });
        record = await pb.collection('materiales').update(material.id, {
          ...currentRecord,
          ...formData
        }, { $autoCancel: false });
        
        if (currentRecord.cantidad_actual !== formData.cantidad_actual) {
          await logInventoryChange(
            'material',
            record.id,
            record.nombre,
            currentRecord.cantidad_actual,
            formData.cantidad_actual,
            'Ajuste de inventario',
            'Actualización desde formulario'
          );
        }
        toast.success('Material actualizado exitosamente');
      } else {
        // Create - Auto generate code
        const existing = await pb.collection('materiales').getFullList({ fields: 'id', $autoCancel: false });
        const newCode = generateMaterialCode(existing.length);
        
        const payload = {
          ...formData,
          codigo: newCode
        };

        record = await pb.collection('materiales').create(payload, { $autoCancel: false });
        
        if (formData.cantidad_actual > 0) {
          await logInventoryChange(
            'material',
            record.id,
            record.nombre,
            0,
            formData.cantidad_actual,
            'Compra',
            'Inventario inicial'
          );
        }
        toast.success(`Material creado exitosamente con código ${newCode}`);
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving material:', error);
      toast.error('Error al guardar el material');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{material ? 'Editar Material' : 'Nuevo Material'}</DialogTitle>
          <DialogDescription>
            Ingresa los detalles del material para el inventario interno.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nombre *</Label>
              <Input 
                required
                value={formData.nombre}
                onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                placeholder="Ej. Pintura Acrílica Azul"
              />
            </div>
            <div className="space-y-2">
              <Label>Código</Label>
              <Input 
                value={material ? formData.codigo : 'Autogenerado al guardar'}
                disabled
                className="bg-muted text-muted-foreground font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Categoría *</Label>
              <Select 
                value={formData.categoria} 
                onValueChange={(val) => setFormData({...formData, categoria: val})}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIAS.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Unidad de Medida *</Label>
              <Select 
                value={formData.unidad} 
                onValueChange={(val) => setFormData({...formData, unidad: val})}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {UNIDADES.map(u => (
                    <SelectItem key={u} value={u}>{u}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Cantidad Actual *</Label>
              <Input 
                type="number" 
                min="0"
                required
                value={formData.cantidad_actual}
                onChange={(e) => setFormData({...formData, cantidad_actual: parseInt(e.target.value) || 0})}
              />
            </div>
            <div className="space-y-2">
              <Label>Stock Mínimo *</Label>
              <Input 
                type="number" 
                min="0"
                required
                value={formData.cantidad_minima}
                onChange={(e) => setFormData({...formData, cantidad_minima: parseInt(e.target.value) || 0})}
              />
            </div>
            <div className="space-y-2">
              <Label>Precio Unitario (RD$)</Label>
              <Input 
                type="number" 
                min="0"
                step="0.01"
                value={formData.precio_unitario}
                onChange={(e) => setFormData({...formData, precio_unitario: parseFloat(e.target.value) || 0})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Proveedor</Label>
              <Input 
                value={formData.proveedor}
                onChange={(e) => setFormData({...formData, proveedor: e.target.value})}
                placeholder="Nombre del proveedor"
              />
            </div>
            <div className="space-y-2">
              <Label>Estado</Label>
              <Select 
                value={formData.estado} 
                onValueChange={(val) => setFormData({...formData, estado: val})}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Activo">Activo</SelectItem>
                  <SelectItem value="Inactivo">Inactivo</SelectItem>
                  <SelectItem value="Descontinuado">Descontinuado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Guardar Material
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}