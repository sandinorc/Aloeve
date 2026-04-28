import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, DollarSign } from 'lucide-react';
import pb from '@/lib/pocketbaseClient';
import { toast } from 'sonner';

export default function PaymentControl({ isOpen, onClose, session, onSuccess }) {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [paymentForm, setPaymentForm] = useState({ monto: '', metodo: 'Efectivo' });

  useEffect(() => {
    if (isOpen && session?.id) {
      fetchParticipants();
    }
  }, [isOpen, session]);

  const fetchParticipants = async () => {
    setLoading(true);
    try {
      const records = await pb.collection('participantes').getFullList({
        filter: `sesion_id = "${session.id}"`,
        sort: 'nombre',
        $autoCancel: false
      });
      setParticipants(records);
    } catch (error) {
      toast.error("Error al cargar pagos");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterPayment = async (e) => {
    e.preventDefault();
    if (!selectedParticipant) return;

    try {
      await pb.collection('participantes').update(selectedParticipant.id, {
        estado_pago: 'Pagado',
        monto_pagado: Number(paymentForm.monto),
        metodo_pago: paymentForm.metodo
      }, { $autoCancel: false });
      
      toast.success("Pago registrado");
      setSelectedParticipant(null);
      fetchParticipants();
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error("Error al registrar pago");
    }
  };

  const totalPagado = participants.reduce((sum, p) => sum + (p.monto_pagado || 0), 0);
  const pendientes = participants.filter(p => p.estado_pago === 'Pendiente').length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Control de Pagos: {session?.tipo}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-4 my-4">
          <div className="bg-muted/30 p-4 rounded-xl border text-center">
            <p className="text-sm text-muted-foreground">Total Participantes</p>
            <p className="text-2xl font-bold">{participants.length}</p>
          </div>
          <div className="bg-secondary/10 p-4 rounded-xl border border-secondary/20 text-center">
            <p className="text-sm text-secondary font-medium">Total Recaudado</p>
            <p className="text-2xl font-bold text-secondary">${totalPagado}</p>
          </div>
          <div className="bg-destructive/10 p-4 rounded-xl border border-destructive/20 text-center">
            <p className="text-sm text-destructive font-medium">Pagos Pendientes</p>
            <p className="text-2xl font-bold text-destructive">{pendientes}</p>
          </div>
        </div>

        {selectedParticipant ? (
          <div className="bg-muted/20 p-6 rounded-xl border mb-4">
            <h3 className="font-semibold mb-4">Registrar pago para: {selectedParticipant.nombre}</h3>
            <form onSubmit={handleRegisterPayment} className="flex items-end gap-4">
              <div className="space-y-2 flex-1">
                <Label>Monto (DOP)</Label>
                <Input type="number" value={paymentForm.monto} onChange={e => setPaymentForm({...paymentForm, monto: e.target.value})} required />
              </div>
              <div className="space-y-2 flex-1">
                <Label>Método</Label>
                <Select value={paymentForm.metodo} onValueChange={v => setPaymentForm({...paymentForm, metodo: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Efectivo">Efectivo</SelectItem>
                    <SelectItem value="Transferencia">Transferencia</SelectItem>
                    <SelectItem value="Tarjeta">Tarjeta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setSelectedParticipant(null)}>Cancelar</Button>
                <Button type="submit">Guardar</Button>
              </div>
            </form>
          </div>
        ) : null}

        <div className="flex-1 overflow-y-auto border rounded-xl">
          <Table>
            <TableHeader className="bg-muted/50 sticky top-0">
              <TableRow>
                <TableHead>Participante</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Monto</TableHead>
                <TableHead>Método</TableHead>
                <TableHead className="text-right">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></TableCell></TableRow>
              ) : participants.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No hay participantes registrados.</TableCell></TableRow>
              ) : (
                participants.map(p => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.nombre}</TableCell>
                    <TableCell>
                      <span className={`text-xs px-2 py-1 rounded-full ${p.estado_pago === 'Pagado' ? 'bg-secondary/10 text-secondary' : 'bg-destructive/10 text-destructive'}`}>
                        {p.estado_pago}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">${p.monto_pagado || 0}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{p.metodo_pago || '-'}</TableCell>
                    <TableCell className="text-right">
                      {p.estado_pago !== 'Pagado' && (
                        <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => {
                          setSelectedParticipant(p);
                          setPaymentForm({ monto: '', metodo: 'Efectivo' });
                        }}>
                          <DollarSign className="w-3 h-3 mr-1" /> Cobrar
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}