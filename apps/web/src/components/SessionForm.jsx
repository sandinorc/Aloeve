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

const TIPOS = ['Paint & Wine', 'Café & Paint', 'Adolescentes', 'Privado', 'Corporativo', 'Turismo', 'Pintura libre + café'];
const LINEAS = ['Experiencias regulares', 'Formación', 'Privados', 'Turismo', 'Corporativo', 'Venta de productos'];

export default function SessionForm({ isOpen, onClose, session, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [facilitadores, setFacilitadores] = useState([]);
  const [formData, setFormData] = useState({
    fecha: '', hora_inicio: '', hora_fin: '', tipo: '', linea_negocio: '',
    facilitador: '', capacidad_maxima: 10, edad_minima: 0, edad_maxima: 99, notas_facilitador: '', estado: 'Programada'
  });

  useEffect(() => {
    const fetchFacilitadores = async () => {
      try {
        const records = await pb.collection('facilitadores').getFullList({ filter: 'estado="Activo"', $autoCancel: false });
        setFacilitadores(records);
      } catch (error) {
        console.error(error);
      }
    };
    if (isOpen) fetchFacilitadores();
  }, [isOpen]);

  useEffect(() => {
    if (session) {
      setFormData({
        ...session,
        fecha: session.fecha ? session.fecha.split(' ')[0] : ''
      });
    } else {
      setFormData({
        fecha: new Date().toISOString().split('T')[0], hora_inicio: '18:00', hora_fin: '20:00', 
        tipo: 'Paint & Wine', linea_negocio: 'Experiencias regulares',
        facilitador: '', capacidad_maxima: 15, edad_minima: 18, edad_maxima: 99, notas_facilitador: '', estado: 'Programada'
      });
    }
  }, [session, isOpen]);

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
        fecha: `${formData.fecha} 12:00:00`,
        capacidad_maxima: Number(formData.capacidad_maxima),
        edad_minima: Number(formData.edad_minima),
        edad_maxima: Number(formData.edad_maxima)
      };

      if (session?.id) {
        await pb.collection('sesiones').update(session.id, dataToSave, { $autoCancel: false });
        toast.success('Sesión actualizada');
      } else {
        await pb.collection('sesiones').create(dataToSave, { $autoCancel: false });
        toast.success('Sesión creada');
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error('Error al guardar la sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{session ? 'Editar Sesión' : 'Nueva Sesión'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Fecha *</Label>
              <Input type="date" name="fecha" value={formData.fecha} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label>Facilitador *</Label>
              <Select value={formData.facilitador} onValueChange={(v) => handleSelectChange('facilitador', v)} required>
                <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                <SelectContent>
                  {facilitadores.map(f => <SelectItem key={f.id} value={f.nombre}>{f.nombre}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Hora Inicio *</Label>
              <Input type="time" name="hora_inicio" value={formData.hora_inicio} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label>Hora Fin *</Label>
              <Input type="time" name="hora_fin" value={formData.hora_fin} onChange={handleChange} required />
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
              <Label>Línea de Negocio *</Label>
              <Select value={formData.linea_negocio} onValueChange={(v) => handleSelectChange('linea_negocio', v)} required>
                <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                <SelectContent>
                  {LINEAS.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Capacidad Máxima *</Label>
              <Input type="number" name="capacidad_maxima" value={formData.capacidad_maxima} onChange={handleChange} min="1" required />
            </div>
            <div className="space-y-2">
              <Label>Estado</Label>
              <Select value={formData.estado} onValueChange={(v) => handleSelectChange('estado', v)}>
                <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                <SelectContent>
                  {['Programada', 'Confirmada', 'En curso', 'Cerrada'].map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Edad Mínima</Label>
              <Input type="number" name="edad_minima" value={formData.edad_minima} onChange={handleChange} min="0" />
            </div>
            <div className="space-y-2">
              <Label>Edad Máxima</Label>
              <Input type="number" name="edad_maxima" value={formData.edad_maxima} onChange={handleChange} min="0" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Notas para el Facilitador</Label>
            <Textarea name="notas_facilitador" value={formData.notas_facilitador} onChange={handleChange} rows={3} />
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