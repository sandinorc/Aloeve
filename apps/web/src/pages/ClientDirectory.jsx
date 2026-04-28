import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Edit2, Eye, Loader2, UserX, Wallet, BookOpen } from 'lucide-react';
import apiClient from '@/lib/pocketbaseClient';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import ClientForm from '@/components/ClientForm';
import ClientDetail from '@/components/ClientDetail';
import PaymentManagementModal from '@/components/PaymentManagementModal';
import ModalAsignarTalleres from '@/components/ModalAsignarTalleres';

export default function ClientDirectory() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [segmentFilter, setSegmentFilter] = useState('all');
  
  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [paymentsOpen, setPaymentsOpen] = useState(false);
  const [asignarOpen, setAsignarOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const records = await apiClient.collection('clientes').getFullList();
      // Local sort since backend might not support PB sort syntax
      const sortedRecords = records.sort((a, b) => new Date(b.created || 0) - new Date(a.created || 0));
      setClients(sortedRecords);
    } catch (error) {
      console.error('[ClientDirectory] Error fetching clients:', error);
      toast.error("Error al cargar clientes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleMarkInactive = async (id) => {
    if (!window.confirm("¿Marcar este cliente como inactivo?")) return;
    try {
      await apiClient.collection('clientes').update(id, { estado: 'Inactivo' });
      toast.success("Cliente marcado como inactivo");
      fetchClients();
    } catch (error) {
      console.error('[ClientDirectory] Error updating client status:', error);
      toast.error("Error al actualizar estado");
    }
  };

  const openEdit = (client) => {
    setSelectedClient(client);
    setFormOpen(true);
  };

  const openDetail = (client) => {
    setSelectedClient(client);
    setDetailOpen(true);
  };

  const openPayments = (client) => {
    setSelectedClient(client);
    setPaymentsOpen(true);
  };

  const openAsignar = (client) => {
    setSelectedClient(client);
    setAsignarOpen(true);
  };

  const filteredClients = clients.filter(c => {
    const matchSearch = (c.nombre_completo || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                        (c.telefono || '').includes(searchTerm) || 
                        (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchType = typeFilter === 'all' || c.tipo === typeFilter;
    const matchSegment = segmentFilter === 'all' || c.segmento === segmentFilter;
    return matchSearch && matchType && matchSegment;
  });

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6 max-w-7xl mx-auto space-y-6">
      <Card className="shadow-lg border-0 rounded-2xl overflow-hidden">
        <CardHeader className="pb-4 border-b bg-muted/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <CardTitle className="text-xl font-serif">Directorio de Clientes</CardTitle>
          <Button onClick={() => { setSelectedClient(null); setFormOpen(true); }} className="bg-primary text-white shadow-md">
            <Plus className="w-4 h-4 mr-2" /> Nuevo Cliente
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="p-4 flex flex-wrap gap-4 bg-white border-b">
            <div className="relative flex-1 min-w-[250px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar por nombre, teléfono o email..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-muted/20 border-transparent focus-visible:bg-white"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[150px] bg-muted/20 border-transparent"><SelectValue placeholder="Tipo" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="Adulto">Adulto</SelectItem>
                <SelectItem value="Adolescente">Adolescente</SelectItem>
                <SelectItem value="Corporativo">Corporativo</SelectItem>
                <SelectItem value="Turista">Turista</SelectItem>
              </SelectContent>
            </Select>
            <Select value={segmentFilter} onValueChange={setSegmentFilter}>
              <SelectTrigger className="w-[150px] bg-muted/20 border-transparent"><SelectValue placeholder="Segmento" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los segmentos</SelectItem>
                <SelectItem value="Nuevo">Nuevo</SelectItem>
                <SelectItem value="Recurrente">Recurrente</SelectItem>
                <SelectItem value="Fiel">Fiel</SelectItem>
                <SelectItem value="VIP">VIP</SelectItem>
                <SelectItem value="Inactivo">Inactivo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/5">
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Contacto</TableHead>
                    <TableHead>Tipo / Segmento</TableHead>
                    <TableHead className="text-center">Sesiones</TableHead>
                    <TableHead>Última Visita</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients.length === 0 ? (
                    <TableRow><TableCell colSpan={7} className="text-center py-12 text-muted-foreground">No se encontraron clientes.</TableCell></TableRow>
                  ) : (
                    filteredClients.map((item) => (
                      <TableRow key={item.id} className="hover:bg-muted/10 transition-colors">
                        <TableCell className="font-medium">{item.nombre_completo}</TableCell>
                        <TableCell>
                          <div className="text-sm">{item.telefono}</div>
                          {item.email && <div className="text-xs text-muted-foreground">{item.email}</div>}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1 items-start">
                            <span className="text-xs text-muted-foreground">{item.tipo}</span>
                            <Badge variant="outline" className="text-[10px] h-5">{item.segmento || 'Nuevo'}</Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-center font-semibold">{item.numero_sesiones || 0}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {item.ultima_sesion ? format(new Date(item.ultima_sesion), 'dd/MM/yyyy') : '-'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={item.estado === 'Activo' ? 'default' : 'secondary'} className="text-xs">
                            {item.estado}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => openAsignar(item)} title="Asignar Taller" className="hover:text-blue-600">
                              <BookOpen className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => openPayments(item)} title="Gestionar Pagos" className="hover:text-green-600">
                              <Wallet className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => openDetail(item)} title="Ver ficha" className="hover:text-primary">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => openEdit(item)} title="Editar" className="hover:text-secondary">
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            {item.estado === 'Activo' && (
                              <Button variant="ghost" size="icon" onClick={() => handleMarkInactive(item.id)} title="Marcar inactivo" className="hover:text-destructive">
                                <UserX className="w-4 h-4" />
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
          )}
        </CardContent>
      </Card>

      <ClientForm isOpen={formOpen} onClose={() => setFormOpen(false)} client={selectedClient} onSuccess={fetchClients} />
      <ClientDetail isOpen={detailOpen} onClose={() => setDetailOpen(false)} client={selectedClient} onUpdate={fetchClients} onEdit={(c) => { setDetailOpen(false); openEdit(c); }} />
      
      {selectedClient && (
        <PaymentManagementModal 
          isOpen={paymentsOpen}
          onClose={() => setPaymentsOpen(false)}
          entityType="cliente"
          entityId={selectedClient.id}
          entityName={selectedClient.nombre_completo}
        />
      )}

      <ModalAsignarTalleres 
        isOpen={asignarOpen}
        onClose={() => setAsignarOpen(false)}
        clienteId={selectedClient?.id}
        clienteNombre={selectedClient?.nombre_completo}
        onSuccess={() => {
          // Optional: refresh client data if needed, or just show success
        }}
      />
    </motion.div>
  );
}