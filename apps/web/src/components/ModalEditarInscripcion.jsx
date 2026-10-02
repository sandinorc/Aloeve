import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import apiClient from '@/lib/pocketbaseClient';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function ModalEditarInscripcion({ isOpen, onClose, inscripcion, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    estado: 'activo',
    fechaInicio: '',
    fechaFin: '',
    horasCompletadas: 0,
    horasTotales: 0,
    calificacion: 0,
    notas: ''
  });

  useEffect(() => {
    if (isOpen && inscripcion) {
      setFormData({
        estado: inscripcion.estado || 'activo',
        fechaInicio: inscripcion.fechaInicio ? inscripcion.fechaInicio.split(' ')[0] : '',
        fechaFin: inscripcion.fechaFin ? inscripcion.fechaFin.split(' ')[0] : '',
        horasCompletadas: inscripcion.horasCompletadas || 0,
        horasTotales: inscripcion.horasTotales || 0,
        calificacion: inscripcion.calificacion || 0,
        notas: inscripcion.notas || ''
      });
    }
  }, [isOpen, inscripcion]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value 
    }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Calculate progress
      let progreso = 0;
      const completadas = Number(formData.horasCompletadas) || 0;
      const totales = Number(formData.horasTotales) || 0;
      
      if (totales > 0) {
        progreso = Math.min(100, Math.round((completadas / totales) * 100));
      } else if (formData.estado === 'completado') {
        progreso = 100;
      }

      const payload = {
        ...formData,
        horasCompletadas: completadas,
        horasTotales: totales,
        calificacion: formData.calificacion === 0 ? null : formData.calificacion,
        progreso
      };

      // Clean empty dates
      if (!payload.fechaInicio) delete payload.fechaInicio;
      if (!payload.fechaFin) delete payload.fechaFin;

      await apiClient.collection('inscripciones').update(inscripcion.id, payload);
      
      toast.success('Inscripción actualizada correctamente');
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error('Error updating inscripcion:', error);
      toast.error('Error al actualizar la inscripción');
    } finally {
      setLoading(false);
    }
  };

  if (!inscripcion) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Inscripción</DialogTitle>
          <DialogDescription>
            Actualiza el progreso y estado para: <span className="font-semibold text-foreground">{inscripcion.expand?.tallerId?.nombre || 'Taller'}</span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="estado">Estado</Label>
              <Select value={formData.estado} onValueChange={(val) => handleSelectChange('estado', val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="activo">Activo</SelectItem>
                  <SelectItem value="completado">Completado</SelectItem>
                  <SelectItem value="pausado">Pausado</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Calificación (1-5)</Label>
              <div className="pt-2 px-2">
                <Slider 
                  value={[formData.calificacion]} 
                  min={0} 
                  max={5} 
                  step={1}
                  onValueChange={(vals) => handleSelectChange('calificacion', vals[0])}
                />
                <div className="text-center text-xs text-muted-foreground mt-1">
                  {formData.calificacion === 0 ? 'Sin calificar' : `${formData.calificacion} Estrellas`}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fechaInicio">Fecha Inicio</Label>
              <Input 
                id="fechaInicio" 
                name="fechaInicio" 
                type="date" 
                value={formData.fechaInicio} 
                onChange={handleChange}
                className="text-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fechaFin">Fecha Fin</Label>
              <Input 
                id="fechaFin" 
                name="fechaFin" 
                type="date" 
                value={formData.fechaFin} 
                onChange={handleChange}
                className="text-foreground"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="horasCompletadas">Horas Completadas</Label>
              <Input 
                id="horasCompletadas" 
                name="horasCompletadas" 
                type="number" 
                min="0"
                value={formData.horasCompletadas} 
                onChange={handleChange}
                className="text-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="horasTotales">Horas Totales</Label>
              <Input 
                id="horasTotales" 
                name="horasTotales" 
                type="number" 
                min="0"
                value={formData.horasTotales} 
                onChange={handleChange}
                className="text-foreground"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notas">Notas Adicionales</Label>
            <Textarea 
              id="notas" 
              name="notas" 
              value={formData.notas} 
              onChange={handleChange} 
              placeholder="Observaciones sobre el progreso..."
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
              Guardar Cambios
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}