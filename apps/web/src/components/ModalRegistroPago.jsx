import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { usePaymentManagement } from '@/hooks/usePaymentManagement';
import apiClient from '@/lib/pocketbaseClient';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ModalRegistroPago({ 
  isOpen, 
  onClose, 
  tipo, 
  clienteId = null, 
  facilitadorId = null, 
  tallerId = null, 
  pagoToEdit = null,
  onPaymentSaved 
}) {
  const { createPayment, updatePayment } = usePaymentManagement();
  const [loading, setLoading] = useState(false);
  const [clientesList, setClientesList] = useState([]);
  
  const [formData, setFormData] = useState({
    monto: '',
    fecha: new Date().toISOString().split('T')[0],
    metodoPago: 'efectivo',
    estado: 'pagado',
    referencia: '',
    notas: '',
    clienteId: clienteId || '',
    facilitadorId: facilitadorId || '',
    tallerId: tallerId || ''
  });

  useEffect(() => {
    if (isOpen && tipo === 'cliente' && !clienteId && !pagoToEdit) {
      console.log('[ModalRegistroPago] Intentando cargar lista de clientes...');
      apiClient.collection('clientes').getFullList()
        .then(data => {
          const sortedData = data.sort((a, b) => (a.nombre_completo || '').localeCompare(b.nombre_completo || ''));
          console.log('[ModalRegistroPago] Éxito al cargar clientes:', sortedData.length);
          setClientesList(sortedData);
        })
        .catch(err => {
          console.error('[ModalRegistroPago] ERROR al cargar clientes:', err);
          toast.error('Error al cargar la lista de clientes');
        });
    }
  }, [isOpen, tipo, clienteId, pagoToEdit]);

  useEffect(() => {
    if (isOpen) {
      if (pagoToEdit) {
        setFormData({
          monto: pagoToEdit.monto,
          fecha: pagoToEdit.fecha.split(' ')[0],
          metodoPago: pagoToEdit.metodoPago,
          estado: pagoToEdit.estado,
          referencia: pagoToEdit.referencia || '',
          notas: pagoToEdit.notas || '',
          clienteId: pagoToEdit.clienteId || '',
          facilitadorId: pagoToEdit.facilitadorId || '',
          tallerId: pagoToEdit.tallerId || ''
        });
      } else {
        setFormData({
          monto: '',
          fecha: new Date().toISOString().split('T')[0],
          metodoPago: 'efectivo',
          estado: 'pagado',
          referencia: '',
          notas: '',
          clienteId: clienteId || '',
          facilitadorId: facilitadorId || '',
          tallerId: tallerId || ''
        });
      }
    }
  }, [isOpen, pagoToEdit, clienteId, facilitadorId, tallerId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        tipo,
        monto: parseFloat(formData.monto)
      };

      // Clean up empty relations
      if (!payload.clienteId) delete payload.clienteId;
      if (!payload.facilitadorId) delete payload.facilitadorId;
      if (!payload.tallerId) delete payload.tallerId;

      console.log('[ModalRegistroPago] Enviando payload:', payload);

      let result;
      if (pagoToEdit) {
        result = await updatePayment(pagoToEdit.id, payload);
      } else {
        result = await createPayment(payload);
      }
      
      if (!result.success) {
        console.error('[ModalRegistroPago] La operación falló:', result.error);
        return; // Stop execution, don't close modal
      }

      if (onPaymentSaved) onPaymentSaved();
      onClose();
    } catch (error) {
      console.error('[ModalRegistroPago] Error inesperado en handleSubmit:', error);
      toast.error('Error inesperado al procesar el pago');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{pagoToEdit ? 'Editar Pago' : 'Registrar Nuevo Pago'}</DialogTitle>
          <DialogDescription>
            Complete los detalles del pago para el {tipo}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {tipo === 'cliente' && !clienteId && !pagoToEdit && (
            <div className="space-y-2">
              <Label htmlFor="clienteId">Cliente <span className="text-destructive">*</span></Label>
              <Select 
                value={formData.clienteId} 
                onValueChange={(val) => handleSelectChange('clienteId', val)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione un cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clientesList.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.nombre_completo}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="monto">Monto (DOP) <span className="text-destructive">*</span></Label>
              <Input 
                id="monto" 
                name="monto" 
                type="number" 
                step="0.01" 
                min="0" 
                required 
                value={formData.monto} 
                onChange={handleChange} 
                placeholder="0.00"
                className="text-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fecha">Fecha <span className="text-destructive">*</span></Label>
              <Input 
                id="fecha" 
                name="fecha" 
                type="date" 
                required 
                value={formData.fecha} 
                onChange={handleChange}
                className="text-foreground"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="metodoPago">Método de Pago <span className="text-destructive">*</span></Label>
              <Select value={formData.metodoPago} onValueChange={(val) => handleSelectChange('metodoPago', val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione método" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="efectivo">Efectivo</SelectItem>
                  <SelectItem value="transferencia">Transferencia</SelectItem>
                  <SelectItem value="tarjeta">Tarjeta</SelectItem>
                  <SelectItem value="cheque">Cheque</SelectItem>
                  <SelectItem value="otro">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="estado">Estado <span className="text-destructive">*</span></Label>
              <Select value={formData.estado} onValueChange={(val) => handleSelectChange('estado', val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pagado">Pagado</SelectItem>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="referencia">Referencia / Comprobante</Label>
            <Input 
              id="referencia" 
              name="referencia" 
              value={formData.referencia} 
              onChange={handleChange} 
              placeholder="Ej. #TX-12345"
              className="text-foreground"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notas">Notas Adicionales</Label>
            <Textarea 
              id="notas" 
              name="notas" 
              value={formData.notas} 
              onChange={handleChange} 
              placeholder="Detalles adicionales del pago..."
              className="resize-none text-foreground"
              rows={3}
            />
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {pagoToEdit ? 'Actualizar Pago' : 'Guardar Pago'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}