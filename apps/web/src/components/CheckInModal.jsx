import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, UserPlus } from 'lucide-react';
import pb from '@/lib/pocketbaseClient';
import { toast } from 'sonner';

export default function CheckInModal({ isOpen, onClose, session, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [casualVisitor, setCasualVisitor] = useState({ nombre: '', edad: '', monto_pagado: '', metodo_pago: 'Efectivo' });

  useEffect(() => {
    if (isOpen && session?.id) {
      fetchParticipants();
    }
  }, [isOpen, session]);

  const fetchParticipants = async () => {
    try {
      const records = await pb.collection('participantes').getFullList({
        filter: `sesion_id = "${session.id}"`,
        sort: 'nombre',
        $autoCancel: false
      });
      setParticipants(records);
    } catch (error) {
      toast.error("Error al cargar participantes");
    }
  };

  const toggleAttendance = async (id, currentStatus) => {
    try {
      await pb.collection('participantes').update(id, { asistio: !currentStatus }, { $autoCancel: false });
      setParticipants(prev => prev.map(p => p.id === id ? { ...p, asistio: !currentStatus } : p));
    } catch (error) {
      toast.error("Error al actualizar asistencia");
    }
  };

  const handleAddCasual = async (e) => {
    e.preventDefault();
    if (!casualVisitor.nombre) return toast.error("El nombre es requerido");
    
    const edad = Number(casualVisitor.edad);
    if (session.edad_minima > 0 && edad < session.edad_minima) {
      return toast.error(`La edad mínima para esta sesión es ${session.edad_minima} años.`);
    }
    if (session.edad_maxima > 0 && edad > session.edad_maxima) {
      return toast.error(`La edad máxima para esta sesión es ${session.edad_maxima} años.`);
    }

    setLoading(true);
    try {
      const newParticipant = {
        sesion_id: session.id,
        nombre: casualVisitor.nombre,
        edad: edad || null,
        tipo_participante: 'Visitante casual',
        estado_pago: casualVisitor.monto_pagado ? 'Pagado' : 'Pendiente',
        monto_pagado: Number(casualVisitor.monto_pagado) || 0,
        metodo_pago: casualVisitor.metodo_pago,
        asistio: true,
        fecha_registro: new Date().toISOString()
      };

      await pb.collection('participantes').create(newParticipant, { $autoCancel: false });
      
      // Update session actual attendees count
      const currentAttendees = participants.filter(p => p.asistio).length + 1;
      await pb.collection('sesiones').update(session.id, { asistentes_reales: currentAttendees }, { $autoCancel: false });

      toast.success("Visitante registrado");
      setCasualVisitor({ nombre: '', edad: '', monto_pagado: '', metodo_pago: 'Efectivo' });
      fetchParticipants();
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error("Error al registrar visitante");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Check-in: {session?.tipo}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 mt-4">
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Participantes Reservados</h3>
            {participants.length === 0 ? (
              <p className="text-sm text-muted-foreground">No hay reservas para esta sesión.</p>
            ) : (
              <div className="space-y-2">
                {participants.map(p => (
                  <div key={p.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <Checkbox 
                        checked={p.asistio} 
                        onCheckedChange={() => toggleAttendance(p.id, p.asistio)} 
                        id={`check-${p.id}`}
                      />
                      <Label htmlFor={`check-${p.id}`} className="cursor-pointer font-medium">
                        {p.nombre} {p.tipo_participante === 'Visitante casual' && <span className="text-xs text-primary ml-2">(Casual)</span>}
                      </Label>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${p.estado_pago === 'Pagado' ? 'bg-secondary/10 text-secondary' : 'bg-destructive/10 text-destructive'}`}>
                      {p.estado_pago}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t pt-6">
            <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider flex items-center gap-2">
              <UserPlus className="w-4 h-4" /> Registrar Visitante Casual
            </h3>
            <form onSubmit={handleAddCasual} className="grid grid-cols-2 gap-4 bg-muted/20 p-4 rounded-xl border">
              <div className="space-y-2 col-span-2 sm:col-span-1">
                <Label>Nombre *</Label>
                <Input value={casualVisitor.nombre} onChange={e => setCasualVisitor({...casualVisitor, nombre: e.target.value})} required />
              </div>
              <div className="space-y-2 col-span-2 sm:col-span-1">
                <Label>Edad</Label>
                <Input type="number" value={casualVisitor.edad} onChange={e => setCasualVisitor({...casualVisitor, edad: e.target.value})} />
              </div>
              <div className="space-y-2 col-span-2 sm:col-span-1">
                <Label>Monto Pagado (DOP)</Label>
                <Input type="number" value={casualVisitor.monto_pagado} onChange={e => setCasualVisitor({...casualVisitor, monto_pagado: e.target.value})} />
              </div>
              <div className="space-y-2 col-span-2 sm:col-span-1">
                <Label>Método de Pago</Label>
                <Select value={casualVisitor.metodo_pago} onValueChange={v => setCasualVisitor({...casualVisitor, metodo_pago: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Efectivo">Efectivo</SelectItem>
                    <SelectItem value="Transferencia">Transferencia</SelectItem>
                    <SelectItem value="Tarjeta">Tarjeta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 flex justify-end mt-2">
                <Button type="submit" disabled={loading} size="sm">
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Agregar Visitante
                </Button>
              </div>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}