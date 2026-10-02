import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Download, Loader2, Clock } from 'lucide-react';
import pb from '@/lib/pocketbaseClient.js';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { logActivity } from '@/lib/logActivity.js';

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [moduleFilter, setModuleFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');
  const [exporting, setExporting] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const records = await pb.collection('logs_actividad').getFullList({ 
        sort: '-fecha_hora', 
        expand: 'usuario_id',
        $autoCancel: false 
      });
      setLogs(records);
    } catch (error) {
      toast.error("Error al cargar logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleExport = async () => {
    setExporting(true);
    try {
      const headers = ['Fecha/Hora', 'Usuario', 'Acción', 'Módulo', 'Descripción', 'Tabla', 'ID Registro'];
      const rows = filteredLogs.map(l => [
        format(new Date(l.fecha_hora), 'yyyy-MM-dd HH:mm:ss'),
        l.expand?.usuario_id?.nombre_completo || 'Sistema',
        l.accion,
        l.modulo,
        l.descripcion,
        l.tabla_afectada,
        l.registro_id || ''
      ]);
      
      const csvContent = [headers.join(','), ...rows.map(e => e.map(item => `"${item}"`).join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `logs_actividad_${format(new Date(), 'yyyyMMdd')}.csv`;
      link.click();
      
      await logActivity('exportar', 'Usuarios', 'Exportó logs de actividad a CSV', 'logs_actividad');
      toast.success("Logs exportados");
    } catch (error) {
      toast.error("Error al exportar");
    } finally {
      setExporting(false);
    }
  };

  const filteredLogs = logs.filter(l => {
    const matchSearch = l.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        (l.expand?.usuario_id?.nombre_completo || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchModule = moduleFilter === 'all' || l.modulo === moduleFilter;
    const matchAction = actionFilter === 'all' || l.accion === actionFilter;
    return matchSearch && matchModule && matchAction;
  });

  const getActionColor = (action) => {
    switch(action) {
      case 'crear': return 'bg-green-100 text-green-800 border-green-200';
      case 'editar': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'eliminar': return 'bg-red-100 text-red-800 border-red-200';
      case 'exportar': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground font-serif flex items-center gap-2">
            <Clock className="w-6 h-6 text-primary" /> Logs de Actividad
          </h2>
          <p className="text-muted-foreground text-sm">Registro de auditoría de todas las acciones del sistema</p>
        </div>
        <Button onClick={handleExport} variant="outline" disabled={exporting || filteredLogs.length === 0} className="bg-white">
          {exporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
          Exportar CSV
        </Button>
      </div>

      <Card className="shadow-lg border-0 rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          <div className="p-4 flex flex-wrap gap-4 bg-white border-b">
            <div className="relative flex-1 min-w-[250px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar por descripción o usuario..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-muted/20 border-transparent focus-visible:bg-white"
              />
            </div>
            <Select value={moduleFilter} onValueChange={setModuleFilter}>
              <SelectTrigger className="w-[150px] bg-muted/20 border-transparent"><SelectValue placeholder="Módulo" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los módulos</SelectItem>
                <SelectItem value="Finanzas">Finanzas</SelectItem>
                <SelectItem value="Inventario">Inventario</SelectItem>
                <SelectItem value="Agenda">Agenda</SelectItem>
                <SelectItem value="CRM">CRM</SelectItem>
                <SelectItem value="Usuarios">Usuarios</SelectItem>
              </SelectContent>
            </Select>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-[150px] bg-muted/20 border-transparent"><SelectValue placeholder="Acción" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las acciones</SelectItem>
                <SelectItem value="crear">Crear</SelectItem>
                <SelectItem value="editar">Editar</SelectItem>
                <SelectItem value="eliminar">Eliminar</SelectItem>
                <SelectItem value="ver">Ver</SelectItem>
                <SelectItem value="exportar">Exportar</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : (
            <div className="overflow-x-auto max-h-[600px]">
              <Table>
                <TableHeader className="bg-muted/5 sticky top-0 shadow-sm">
                  <TableRow>
                    <TableHead className="w-[180px]">Fecha / Hora</TableHead>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Acción</TableHead>
                    <TableHead>Módulo</TableHead>
                    <TableHead className="w-[40%]">Descripción</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-12 text-muted-foreground">No se encontraron registros.</TableCell></TableRow>
                  ) : (
                    filteredLogs.map((item) => (
                      <TableRow key={item.id} className="hover:bg-muted/10 text-sm">
                        <TableCell className="text-muted-foreground whitespace-nowrap">
                          {format(new Date(item.fecha_hora), 'dd/MM/yyyy HH:mm:ss')}
                        </TableCell>
                        <TableCell className="font-medium">
                          {item.expand?.usuario_id?.nombre_completo || 'Sistema'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`text-[10px] uppercase tracking-wider ${getActionColor(item.accion)}`}>
                            {item.accion}
                          </Badge>
                        </TableCell>
                        <TableCell>{item.modulo}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {item.descripcion}
                          {item.registro_id && <span className="text-[10px] ml-2 opacity-50">ID: {item.registro_id.substring(0,5)}...</span>}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}