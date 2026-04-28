import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Edit2, Trash2, Wallet, FileText, Star } from 'lucide-react';

export default function TablaInscripciones({ inscripciones = [], onEdit, onDelete, onPayment, isLoading }) {
  const [filterEstado, setFilterEstado] = useState('Todos');

  // Validación de props
  useEffect(() => {
    if (!Array.isArray(inscripciones)) {
      console.error('[TablaInscripciones] Error de validación: inscripciones debe ser un array. Recibido:', typeof inscripciones, inscripciones);
    } else {
      inscripciones.forEach((ins, index) => {
        if (!ins.id) console.warn(`[TablaInscripciones] Advertencia: inscripción en índice ${index} no tiene ID`, ins);
        if (!ins.tallerId) console.warn(`[TablaInscripciones] Advertencia: inscripción ${ins.id} no tiene tallerId`, ins);
        if (!ins.clienteId) console.warn(`[TablaInscripciones] Advertencia: inscripción ${ins.id} no tiene clienteId`, ins);
      });
    }
  }, [inscripciones]);

  const safeInscripciones = Array.isArray(inscripciones) ? inscripciones : [];

  const getStatusBadge = (estado) => {
    const safeEstado = estado || 'desconocido';
    switch (safeEstado.toLowerCase()) {
      case 'activo':
        return <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 capitalize">Activo</Badge>;
      case 'completado':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 capitalize">Completado</Badge>;
      case 'pausado':
        return <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-200 capitalize">Pausado</Badge>;
      case 'cancelado':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200 capitalize">Cancelado</Badge>;
      default:
        return <Badge variant="outline" className="capitalize">{safeEstado}</Badge>;
    }
  };

  const filteredInscripciones = safeInscripciones.filter(ins => {
    if (filterEstado === 'Todos') return true;
    return (ins.estado || '').toLowerCase() === filterEstado.toLowerCase();
  });

  return (
    <div className="space-y-4">
      <div className="flex gap-2 overflow-x-auto pb-2">
        {['Todos', 'Activo', 'Completado', 'Pausado', 'Cancelado'].map(estado => (
          <Button
            key={estado}
            variant={filterEstado === estado ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterEstado(estado)}
            className="rounded-full whitespace-nowrap"
          >
            {estado}
          </Button>
        ))}
      </div>

      <div className="border rounded-xl overflow-hidden bg-card">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Taller</TableHead>
              <TableHead>Fecha Inscripción</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="w-[200px]">Progreso</TableHead>
              <TableHead className="text-center">Calificación</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Cargando inscripciones...
                </TableCell>
              </TableRow>
            ) : filteredInscripciones.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  <div className="flex flex-col items-center justify-center">
                    <FileText className="h-8 w-8 mb-2 opacity-20" />
                    <p>No se encontraron inscripciones.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredInscripciones.map((ins) => (
                <TableRow key={ins.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="font-medium">
                    {ins.expand?.tallerId?.nombre || 'Taller Desconocido'}
                    {ins.notas && (
                      <p className="text-xs text-muted-foreground truncate max-w-[200px]" title={ins.notas}>
                        {ins.notas}
                      </p>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">
                    {ins.fechaInscripcion ? format(new Date(ins.fechaInscripcion), 'dd MMM yyyy', { locale: es }) : '-'}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(ins.estado)}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">{ins.horasCompletadas || 0} / {ins.horasTotales || '?'} hrs</span>
                        <span className="font-medium">{ins.progreso || 0}%</span>
                      </div>
                      <Progress value={ins.progreso || 0} className="h-2" />
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {ins.calificacion ? (
                      <div className="flex items-center justify-center gap-1 text-yellow-500">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="text-sm font-medium">{ins.calificacion}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {onPayment && (
                        <Button variant="ghost" size="icon" onClick={() => onPayment(ins)} title="Registrar Pago">
                          <Wallet className="h-4 w-4 text-green-600 hover:text-green-700" />
                        </Button>
                      )}
                      {onEdit && (
                        <Button variant="ghost" size="icon" onClick={() => onEdit(ins)} title="Editar inscripción">
                          <Edit2 className="h-4 w-4 text-muted-foreground hover:text-primary" />
                        </Button>
                      )}
                      {onDelete && (
                        <Button variant="ghost" size="icon" onClick={() => {
                          if (window.confirm('¿Está seguro de eliminar esta inscripción?')) {
                            onDelete(ins.id);
                          }
                        }} title="Eliminar inscripción">
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