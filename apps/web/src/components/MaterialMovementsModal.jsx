import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2 } from 'lucide-react';
import pb from '@/lib/pocketbaseClient';
import { format } from 'date-fns';

export default function MaterialMovementsModal({ isOpen, onClose, material }) {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && material?.id) {
      fetchMovements();
    }
  }, [isOpen, material]);

  const fetchMovements = async () => {
    setLoading(true);
    try {
      const records = await pb.collection('movimientos_inventario').getFullList({
        filter: `material_id = "${material.id}"`,
        sort: '-fecha',
        $autoCancel: false
      });
      setMovements(records);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Historial de Movimientos: {material?.nombre}</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto mt-4">
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
          ) : movements.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No hay movimientos registrados.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Cantidad</TableHead>
                  <TableHead>Razón</TableHead>
                  <TableHead>Usuario</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movements.map((mov) => (
                  <TableRow key={mov.id}>
                    <TableCell>{format(new Date(mov.fecha), 'dd/MM/yyyy')}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        mov.tipo === 'Entrada' ? 'bg-secondary/10 text-secondary' :
                        mov.tipo === 'Salida' ? 'bg-destructive/10 text-destructive' :
                        'bg-accent/10 text-accent-foreground'
                      }`}>
                        {mov.tipo}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium">{mov.cantidad}</TableCell>
                    <TableCell>{mov.razon}</TableCell>
                    <TableCell>{mov.usuario}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}