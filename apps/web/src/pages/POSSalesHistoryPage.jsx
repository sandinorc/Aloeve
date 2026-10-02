import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Download, Receipt, Calendar as CalendarIcon } from 'lucide-react';
import apiClient from '@/lib/pocketbaseClient.js';
import { format } from 'date-fns';
import Papa from 'papaparse';
import { toast } from 'sonner';

export default function POSSalesHistoryPage() {
  const [sales, setSales] = useState([]);
  const [clients, setClients] = useState({});
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch clients to map IDs to names
        const clientsData = await apiClient.collection('clientes_pos').getFullList();
        const clientMap = {};
        clientsData.forEach(c => { clientMap[c.id] = c.nombre; });
        setClients(clientMap);

        // Fetch sales
        const salesData = await apiClient.collection('ventas_pos').getFullList();
        const sortedSales = salesData.sort((a, b) => {
          const dateA = new Date(`${a.fecha}T${a.hora || '00:00:00'}`);
          const dateB = new Date(`${b.fecha}T${b.hora || '00:00:00'}`);
          return dateB - dateA;
        });
        setSales(sortedSales);
      } catch (error) {
        console.error("[POSSalesHistoryPage] Error fetching sales history:", error);
        toast.error("Error al cargar el historial de ventas");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredSales = sales.filter(sale => {
    const clientName = sale.cliente_id ? (clients[sale.cliente_id] || 'Desconocido') : 'Consumidor Final';
    const matchSearch = clientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        (sale.id || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'all' || sale.estado === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleExportCSV = () => {
    const dataToExport = filteredSales.map(sale => ({
      'ID Venta': sale.id,
      'Fecha': sale.fecha,
      'Hora': sale.hora,
      'Cliente': sale.cliente_id ? (clients[sale.cliente_id] || 'Desconocido') : 'Consumidor Final',
      'Cant. Productos': sale.productos?.length || 0,
      'Subtotal (RD$)': sale.subtotal,
      'ITBIS (RD$)': sale.itbis,
      'Total (RD$)': sale.total,
      'Estado': sale.estado
    }));

    const csv = Papa.unparse(dataToExport);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `historial_ventas_pos_${format(new Date(), 'yyyyMMdd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Historial exportado correctamente");
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-serif tracking-tight">Historial de Ventas</h1>
          <p className="text-muted-foreground">Registro de transacciones del Punto de Venta</p>
        </div>
        <Button variant="outline" onClick={handleExportCSV} className="bg-white">
          <Download className="w-4 h-4 mr-2" /> Exportar CSV
        </Button>
      </div>

      <Card className="shadow-sm border-0 rounded-2xl overflow-hidden bg-card">
        <CardContent className="p-0">
          <div className="p-4 flex flex-col sm:flex-row flex-wrap gap-4 bg-muted/10 border-b">
            <div className="relative flex-1 min-w-[250px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar por cliente o ID..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-background text-foreground"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px] bg-background">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="Completada">Completada</SelectItem>
                <SelectItem value="Cancelada">Cancelada</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead>Fecha y Hora</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Productos</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-4 w-[100px] ml-auto" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-[80px] rounded-full" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredSales.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-48 text-center">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <Receipt className="w-12 h-12 mb-4 opacity-20" />
                        <p className="text-lg font-medium">No se encontraron ventas</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSales.map((sale) => (
                    <TableRow key={sale.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell>
                        <div className="font-medium flex items-center gap-2">
                          <CalendarIcon className="w-3 h-3 text-muted-foreground" />
                          {sale.fecha ? format(new Date(sale.fecha), 'dd/MM/yyyy') : '-'}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">{sale.hora || '-'}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {sale.cliente_id ? clients[sale.cliente_id] : 'Consumidor Final'}
                        </div>
                        <div className="text-xs text-muted-foreground font-mono mt-1">
                          ID: {sale.id ? sale.id.substring(0, 8) : '-'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-muted">
                          {sale.productos?.length || 0} items
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium text-primary">
                        RD$ {(sale.total || 0).toLocaleString('es-DO', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={
                          sale.estado === 'Completada' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
                        }>
                          {sale.estado || 'Desconocido'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}