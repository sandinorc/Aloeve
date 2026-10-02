import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import pb from '@/lib/pocketbaseClient';
import { toast } from 'sonner';

const TIPOS = ['Adulto', 'Adolescente', 'Corporativo', 'Turista'];
const FUENTES = ['Plaza', 'Digital', 'Referido', 'Otro'];
const ESTADOS = ['Activo', 'Inactivo'];

export default function ClientForm({ isOpen, onClose, client, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre_completo: '', telefono: '', whatsapp: '', email: '',
    tipo: 'Adulto', fecha_primera_visita: new Date().toISOString().split('T')[0],
    fuente: 'Digital', referido_por: '', notas_internas: '', estado: 'Activo'
  });

  useEffect(() => {
    if (client) {
      setFormData({
        ...client,
        fecha_primera_visita: client.fecha_primera_visita ? client.fecha_primera_visita.split(' ')[0] : ''
      });
    } else {
      setFormData({
        nombre_completo: '', telefono: '', whatsapp: '', email: '',
        tipo: 'Adulto', fecha_primera_visita: new Date().toISOString().split('T')[0],
        fuente: 'Digital', referido_por: '', notas_internas: '', estado: 'Activo'
      });
    }
  }, [client, isOpen]);

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
      const dataToSave = {
        ...formData,
        fecha_primera_visita: formData.fecha_primera_visita ? `${formData.fecha_primera_visita} 12:00:00` : null
      };

      if (client?.id) {
        await pb.collection('clientes').update(client.id, dataToSave, { $autoCancel: false });
        toast.success('Cliente actualizado');
      } else {
        await pb.collection('clientes').create(dataToSave, { $autoCancel: false });
        toast.success('Cliente creado');
      }
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error('Error al guardar el cliente');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{client ? 'Editar Cliente' : 'Nuevo Cliente'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nombre Completo *</Label>
              <Input name="nombre_completo" value={formData.nombre_completo} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label>Teléfono *</Label>
              <Input name="telefono" value={formData.telefono} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label>WhatsApp</Label>
              <Input name="whatsapp" value={formData.whatsapp} onChange={handleChange} placeholder="Opcional" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" name="email" value={formData.email} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label>Tipo *</Label>
              <Select value={formData.tipo} onValueChange={(v) => handleSelectChange('tipo', v)} required>
                <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                <SelectContent>
                  {TIPOS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Fuente *</Label>
              <Select value={formData.fuente} onValueChange={(v) => handleSelectChange('fuente', v)} required>
                <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                <SelectContent>
                  {FUENTES.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Fecha Primera Visita *</Label>
              <Input type="date" name="fecha_primera_visita" value={formData.fecha_primera_visita} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label>Referido por</Label>
              <Input name="referido_por" value={formData.referido_por} onChange={handleChange} placeholder="Nombre de quien refiere" />
            </div>
            <div className="space-y-2">
              <Label>Estado</Label>
              <Select value={formData.estado} onValueChange={(v) => handleSelectChange('estado', v)}>
                <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                <SelectContent>
                  {ESTADOS.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Notas Internas</Label>
            <Textarea name="notas_internas" value={formData.notas_internas} onChange={handleChange} rows={3} />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Guardar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}