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

const CATEGORIAS = ['Vinos', 'Café', 'Pinturas', 'Materiales'];

export default function ProductForm({ isOpen, onClose, product, onSuccess }) {
  const { logInventoryChange } = useInventoryChange();
  const { generateProductSKU } = useAutoCodeGeneration();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    nombre: '',
    sku: '',
    stock: 0,
    stock_minimo: 0,
    precio_base: 0,
    categoria: 'Vinos',
    estado: 'Activo'
  });

  useEffect(() => {
    if (isOpen) {
      if (product) {
        setFormData({
          nombre: product.nombre || '',
          sku: product.sku || '',
          stock: product.stock || 0,
          stock_minimo: product.stock_minimo || 0,
          precio_base: product.precio_base || 0,
          categoria: product.categoria || 'Vinos',
          estado: product.estado || 'Activo'
        });
      } else {
        setFormData({
          nombre: '',
          sku: '', // Will be auto-generated
          stock: 0,
          stock_minimo: 0,
          precio_base: 0,
          categoria: 'Vinos',
          estado: 'Activo'
        });
      }
    }
  }, [isOpen, product]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let record;
      if (product?.id) {
        // Update
        const currentRecord = await pb.collection('productos').getOne(product.id, { $autoCancel: false });
        record = await pb.collection('productos').update(product.id, {
          ...currentRecord,
          ...formData
        }, { $autoCancel: false });
        
        if (currentRecord.stock !== formData.stock) {
          await logInventoryChange(
            'producto',
            record.id,
            record.nombre,
            currentRecord.stock,
            formData.stock,
            'Ajuste de inventario',
            'Actualización desde formulario'
          );
        }
        toast.success('Producto actualizado exitosamente');
      } else {
        // Create - Auto generate SKU
        const existing = await pb.collection('productos').getFullList({ fields: 'id', $autoCancel: false });
        const newSku = generateProductSKU(existing.length);
        
        const payload = {
          ...formData,
          sku: newSku
        };

        record = await pb.collection('productos').create(payload, { $autoCancel: false });
        
        if (formData.stock > 0) {
          await logInventoryChange(
            'producto',
            record.id,
            record.nombre,
            0,
            formData.stock,
            'Compra',
            'Inventario inicial'
          );
        }
        toast.success(`Producto creado exitosamente con SKU ${newSku}`);
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Error al guardar el producto');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{product ? 'Editar Producto POS' : 'Nuevo Producto POS'}</DialogTitle>
          <DialogDescription>
            Ingresa los detalles del producto para la venta al público.
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
                placeholder="Ej. Botella Vino Tinto"
              />
            </div>
            <div className="space-y-2">
              <Label>SKU</Label>
              <Input 
                value={product ? formData.sku : 'Autogenerado al guardar'}
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
              <Label>Estado</Label>
              <Select 
                value={formData.estado} 
                onValueChange={(val) => setFormData({...formData, estado: val})}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Activo">Activo</SelectItem>
                  <SelectItem value="Inactivo">Inactivo</SelectItem>
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
                value={formData.stock}
                onChange={(e) => setFormData({...formData, stock: parseInt(e.target.value) || 0})}
              />
            </div>
            <div className="space-y-2">
              <Label>Stock Mínimo *</Label>
              <Input 
                type="number" 
                min="0"
                required
                value={formData.stock_minimo}
                onChange={(e) => setFormData({...formData, stock_minimo: parseInt(e.target.value) || 0})}
              />
            </div>
            <div className="space-y-2">
              <Label>Precio (RD$) *</Label>
              <Input 
                type="number" 
                min="0"
                step="0.01"
                required
                value={formData.precio_base}
                onChange={(e) => setFormData({...formData, precio_base: parseFloat(e.target.value) || 0})}
              />
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Guardar Producto
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}