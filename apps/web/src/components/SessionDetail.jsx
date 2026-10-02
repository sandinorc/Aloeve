import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, DollarSign, CheckSquare, Package, FileText, Loader2 } from 'lucide-react';
import pb from '@/lib/pocketbaseClient';
import { format } from 'date-fns';
import { toast } from 'sonner';
import CheckInModal from './CheckInModal';
import PaymentControl from './PaymentControl';

export default function SessionDetail({ isOpen, onClose, session, onUpdate }) {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [checkInOpen, setCheckInOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);

  useEffect(() => {
    if (isOpen && session?.id) {
      fetchDetails();
    }
  }, [isOpen, session]);

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const parts = await pb.collection('participantes').getFullList({
        filter: `sesion_id = "${session.id}"`,
        $autoCancel: false
      });
      setParticipants(parts);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSession = async () => {
    if (!window.confirm("¿Estás seguro de cerrar esta sesión? Esto actualizará el estado a 'Cerrada'.")) return;
    try {
      const totalIngresos = participants.reduce((sum, p) => sum + (p.monto_pagado || 0), 0);
      const asistentesReales = participants.filter(p => p.asistio).length;

      await pb.collection('sesiones').update(session.id, {
        estado: 'Cerrada',
        ingresos_totales: totalIngresos,
        asistentes_reales: asistentesReales
      }, { $autoCancel: false });

      toast.success("Sesión cerrada exitosamente");
      if (onUpdate) onUpdate();
      onClose();
    } catch (error) {
      toast.error("Error al cerrar la sesión");
    }
  };

  if (!session) return null;

  const totalIngresos = participants.reduce((sum, p) => sum + (p.monto_pagado || 0), 0);
  const asistentes = participants.filter(p => p.asistio).length;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] flex flex-col">
          <DialogHeader className="border-b pb-4">
            <div className="flex justify-between items-start pr-6">
              <div>
                <DialogTitle className="text-2xl font-serif text-primary">{session.tipo}</DialogTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {session.fecha ? format(new Date(session.fecha), 'dd/MM/yyyy') : ''} • {session.hora_inicio} - {session.hora_fin}
                </p>
              </div>
              <Badge variant={session.estado === 'Cerrada' ? 'secondary' : 'default'} className="text-sm">
                {session.estado}
              </Badge>
            </div>
          </DialogHeader>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4">
            <div className="bg-muted/30 p-3 rounded-xl">
              <p className="text-xs text-muted-foreground mb-1">Facilitador</p>
              <p className="font-medium">{session.facilitador}</p>
            </div>
            <div className="bg-muted/30 p-3 rounded-xl">
              <p className="text-xs text-muted-foreground mb-1">Ocupación</p>
              <p className="font-medium">{asistentes} / {session.capacidad_maxima}</p>
            </div>
            <div className="bg-muted/30 p-3 rounded-xl">
              <p className="text-xs text-muted-foreground mb-1">Ingresos</p>
              <p className="font-medium text-secondary">${totalIngresos}</p>
            </div>
            <div className="bg-muted/30 p-3 rounded-xl">
              <p className="text-xs text-muted-foreground mb-1">Línea</p>
              <p className="font-medium text-xs truncate" title={session.linea_negocio}>{session.linea_negocio}</p>
            </div>
          </div>

          <div className="flex gap-2 mb-4">
            <Button onClick={() => setCheckInOpen(true)} variant="outline" className="flex-1" disabled={session.estado === 'Cerrada'}>
              <CheckSquare className="w-4 h-4 mr-2" /> Check-in
            </Button>
            <Button onClick={() => setPaymentOpen(true)} variant="outline" className="flex-1" disabled={session.estado === 'Cerrada'}>
              <DollarSign className="w-4 h-4 mr-2" /> Pagos
            </Button>
          </div>

          <Tabs defaultValue="participantes" className="flex-1 overflow-hidden flex flex-col">
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="participantes"><Users className="w-4 h-4 mr-2"/> Participantes</TabsTrigger>
              <TabsTrigger value="materiales"><Package className="w-4 h-4 mr-2"/> Materiales</TabsTrigger>
              <TabsTrigger value="notas"><FileText className="w-4 h-4 mr-2"/> Notas</TabsTrigger>
            </TabsList>
            
            <div className="flex-1 overflow-y-auto mt-4 border rounded-xl p-4">
              <TabsContent value="participantes" className="m-0">
                {loading ? <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div> : (
                  <div className="space-y-2">
                    {participants.length === 0 ? <p className="text-center text-muted-foreground py-4">No hay participantes.</p> : 
                      participants.map(p => (
                        <div key={p.id} className="flex justify-between items-center p-2 hover:bg-muted/50 rounded-lg">
                          <div>
                            <p className="font-medium text-sm">{p.nombre}</p>
                            <p className="text-xs text-muted-foreground">{p.tipo_participante}</p>
                          </div>
                          <div className="flex gap-2">
                            <Badge variant="outline" className={p.asistio ? 'bg-secondary/10 text-secondary border-secondary/20' : ''}>
                              {p.asistio ? 'Asistió' : 'No asistió'}
                            </Badge>
                            <Badge variant="outline" className={p.estado_pago === 'Pagado' ? 'bg-secondary/10 text-secondary border-secondary/20' : 'bg-destructive/10 text-destructive border-destructive/20'}>
                              {p.estado_pago}
                            </Badge>
                          </div>
                        </div>
                      ))
                    }
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="materiales" className="m-0">
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>El registro de materiales se realiza desde el módulo de Inventario.</p>
                </div>
              </TabsContent>
              
              <TabsContent value="notas" className="m-0">
                <div className="whitespace-pre-wrap text-sm">
                  {session.notas_facilitador || <span className="text-muted-foreground italic">No hay notas para esta sesión.</span>}
                </div>
              </TabsContent>
            </div>
          </Tabs>

          {session.estado !== 'Cerrada' && (
            <div className="pt-4 mt-4 border-t flex justify-end">
              <Button variant="destructive" onClick={handleCloseSession}>
                Cerrar Sesión
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <CheckInModal isOpen={checkInOpen} onClose={() => setCheckInOpen(false)} session={session} onSuccess={() => { fetchDetails(); if(onUpdate) onUpdate(); }} />
      <PaymentControl isOpen={paymentOpen} onClose={() => setPaymentOpen(false)} session={session} onSuccess={() => { fetchDetails(); if(onUpdate) onUpdate(); }} />
    </>
  );
}