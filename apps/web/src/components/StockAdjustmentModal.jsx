import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, PackageMinus, PackagePlus, Settings2 } from 'lucide-react';
import pb from '@/lib/pocketbaseClient.js';
import { toast } from 'sonner';
import { useInventoryChange } from '@/hooks/useInventoryChange.js';

export default function StockAdjustmentModal({ isOpen, onClose, item, onSuccess }) {
  const { logInventoryChange } = useInventoryChange();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    tipoAjuste: 'Entrada',
    cantidad: '',
    razon: 'Ajuste de inventario',
    notas: ''
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        tipoAjuste: 'Entrada',
        cantidad: '',
        razon: 'Ajuste de inventario',
        notas: ''
      });
    }
  }, [isOpen]);

  if (!item) return null;

  const currentStock = item.tipoItem === 'material' ? item.cantidad_actual : item.stock;
  const collectionName = item.tipoItem === 'material' ? 'materiales' : 'productos';
  const stockField = item.tipoItem === 'material' ? 'cantidad_actual' : 'stock';

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const adjustAmount = parseInt(formData.cantidad, 10);
    if (isNaN(adjustAmount) || adjustAmount < 0) {
      toast.error('La cantidad debe ser un número válido mayor o igual a 0');
      return;
    }

    let newStock = currentStock;
    if (formData.tipoAjuste === 'Entrada') {
      newStock = currentStock + adjustAmount;
    } else if (formData.tipoAjuste === 'Salida') {
      newStock = currentStock - adjustAmount;
    } else if (formData.tipoAjuste === 'Ajuste') {
      newStock = adjustAmount; // Set exact amount
    }

    if (newStock < 0) {
      toast.error('El stock resultante no puede ser negativo');
      return;
    }

    setIsSubmitting(true);
    try {
      // Fetch complete record first to preserve all fields
      const currentRecord = await pb.collection(collectionName).getOne(item.id, { $autoCancel: false });
      
      const updatePayload = {
        ...currentRecord,
        [stockField]: newStock
      };

      await pb.collection(collectionName).update(item.id, updatePayload, { $autoCancel: false });
      
      await logInventoryChange(
        item.tipoItem,
        item.id,
        item.nombre,
        currentStock,
        newStock,
        formData.razon,
        formData.notas
      );

      toast.success('Stock actualizado correctamente');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error adjusting stock:', error);
      toast.error('Error al actualizar el stock');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Ajustar Stock</DialogTitle>
          <DialogDescription>
            Actualizando inventario para: <strong className="text-foreground">{item.nombre}</strong>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="bg-muted/50 p-3 rounded-lg flex justify-between items-center border">
            <span className="text-sm font-medium text-muted-foreground">Stock Actual</span>
            <span className="text-lg font-bold">{currentStock}</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo de Ajuste</Label>
              <Select 
                value={formData.tipoAjuste} 
                onValueChange={(val) => setFormData({...formData, tipoAjuste: val})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Entrada">
                    <div className="flex items-center gap-2"><PackagePlus className="w-4 h-4 text-green-500"/> Entrada (+)</div>
                  </SelectItem>
                  <SelectItem value="Salida">
                    <div className="flex items-center gap-2"><PackageMinus className="w-4 h-4 text-red-500"/> Salida (-)</div>
                  </SelectItem>
                  <SelectItem value="Ajuste">
                    <div className="flex items-center gap-2"><Settings2 className="w-4 h-4 text-blue-500"/> Ajuste Exacto (=)</div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Cantidad</Label>
              <Input 
                type="number" 
                min="0"
                required
                value={formData.cantidad}
                onChange={(e) => setFormData({...formData, cantidad: e.target.value})}
                placeholder="Ej. 10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Razón</Label>
            <Select 
              value={formData.razon} 
              onValueChange={(val) => setFormData({...formData, razon: val})}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Compra">Compra / Reabastecimiento</SelectItem>
                <SelectItem value="Uso en sesión">Uso en sesión</SelectItem>
                <SelectItem value="Daño">Daño / Merma</SelectItem>
                <SelectItem value="Pérdida">Pérdida</SelectItem>
                <SelectItem value="Ajuste de inventario">Ajuste de inventario</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Notas (Opcional)</Label>
            <Textarea 
              value={formData.notas}
              onChange={(e) => setFormData({...formData, notas: e.target.value})}
              placeholder="Detalles adicionales sobre este ajuste..."
              className="resize-none h-20"
            />
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Confirmar Ajuste
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}