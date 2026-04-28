import React, { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2, FileText } from 'lucide-react';

export default function TablaHistorialPagos({ pagos = [], onEdit, onDelete, isLoading }) {
  const [filterEstado, setFilterEstado] = useState('Todos');

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-DO', {
      style: 'currency',
      currency: 'DOP'
    }).format(amount);
  };

  const getStatusBadge = (estado) => {
    switch (estado) {
      case 'pagado':
        return <Badge variant="outline" className="badge-pagado capitalize">Pagado</Badge>;
      case 'pendiente':
        return <Badge variant="outline" className="badge-pendiente capitalize">Pendiente</Badge>;
      case 'cancelado':
        return <Badge variant="outline" className="badge-cancelado capitalize">Cancelado</Badge>;
      default:
        return <Badge variant="outline" className="capitalize">{estado}</Badge>;
    }
  };

  const filteredPagos = pagos.filter(pago => {
    if (filterEstado === 'Todos') return true;
    return pago.estado.toLowerCase() === filterEstado.toLowerCase();
  });

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {['Todos', 'Pendiente', 'Pagado', 'Cancelado'].map(estado => (
          <Button
            key={estado}
            variant={filterEstado === estado ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterEstado(estado)}
            className="rounded-full"
          >
            {estado}
          </Button>
        ))}
      </div>

      <div className="border rounded-xl overflow-hidden bg-card">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Monto</TableHead>
              <TableHead>Método</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Referencia</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Cargando historial de pagos...
                </TableCell>
              </TableRow>
            ) : filteredPagos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  <div className="flex flex-col items-center justify-center">
                    <FileText className="h-8 w-8 mb-2 opacity-20" />
                    <p>No se encontraron pagos registrados.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredPagos.map((pago) => (
                <TableRow key={pago.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="font-medium">
                    {format(new Date(pago.fecha), 'dd MMM yyyy', { locale: es })}
                  </TableCell>
                  <TableCell className="font-semibold">
                    {formatCurrency(pago.monto)}
                  </TableCell>
                  <TableCell className="capitalize text-muted-foreground">
                    {pago.metodoPago}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(pago.estado)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-[150px] truncate" title={pago.referencia || pago.notas}>
                    {pago.referencia || '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {onEdit && (
                        <Button variant="ghost" size="icon" onClick={() => onEdit(pago)} title="Editar pago">
                          <Edit2 className="h-4 w-4 text-muted-foreground hover:text-primary" />
                        </Button>
                      )}
                      {onDelete && (
                        <Button variant="ghost" size="icon" onClick={() => {
                          if (window.confirm('¿Está seguro de eliminar este registro de pago?')) {
                            onDelete(pago.id);
                          }
                        }} title="Eliminar pago">
                          <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}