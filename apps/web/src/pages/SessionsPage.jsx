import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Edit2, Trash2, Eye, Loader2, Wallet } from 'lucide-react';
import pb from '@/lib/pocketbaseClient';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import SessionForm from '@/components/SessionForm';
import SessionDetail from '@/components/SessionDetail';
import ModalRegistroPago from '@/components/ModalRegistroPago';

export default function SessionsPage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const records = await pb.collection('sesiones').getFullList({ sort: '-fecha,-hora_inicio', $autoCancel: false });
      setSessions(records);
    } catch (error) {
      toast.error("Error al cargar sesiones");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar esta sesión? Se perderán los registros de participantes asociados.")) return;
    try {
      await pb.collection('sesiones').delete(id, { $autoCancel: false });
      toast.success("Sesión eliminada");
      fetchSessions();
    } catch (error) {
      toast.error("Error al eliminar sesión");
    }
  };

  const openEdit = (session) => {
    setSelectedSession(session);
    setFormOpen(true);
  };

  const openDetail = (session) => {
    setSelectedSession(session);
    setDetailOpen(true);
  };

  const openPaymentModal = (session) => {
    setSelectedSession(session);
    setPaymentModalOpen(true);
  };

  const filteredSessions = sessions.filter(s => {
    const matchSearch = s.tipo.toLowerCase().includes(searchTerm.toLowerCase()) || s.facilitador.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'all' || s.estado === statusFilter;
    return matchSearch && matchStatus;
  });

  const getStatusColor = (status) => {
    switch(status) {
      case 'Programada': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Confirmada': return 'bg-secondary/20 text-secondary border-secondary/30';
      case 'En curso': return 'bg-accent/20 text-accent-foreground border-accent/30';
      case 'Cerrada': return 'bg-muted text-muted-foreground border-muted-foreground/20';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6 max-w-7xl mx-auto space-y-6">
      <Card className="shadow-lg border-0 rounded-2xl overflow-hidden">
        <CardHeader className="pb-4 border-b bg-muted/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <CardTitle className="text-xl font-serif">Listado de Sesiones</CardTitle>
          <Button onClick={() => { setSelectedSession(null); setFormOpen(true); }} className="bg-primary text-white shadow-md">
            <Plus className="w-4 h-4 mr-2" /> Nueva Sesión
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="p-4 flex flex-wrap gap-4 bg-white border-b">
            <div className="relative flex-1 min-w-[250px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar por tipo o facilitador..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-muted/20 border-transparent focus-visible:bg-white"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px] bg-muted/20 border-transparent"><SelectValue placeholder="Estado" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="Programada">Programada</SelectItem>
                <SelectItem value="Confirmada">Confirmada</SelectItem>
                <SelectItem value="En curso">En curso</SelectItem>
                <SelectItem value="Cerrada">Cerrada</SelectItem>
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
                    <TableHead>Fecha y Hora</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Facilitador</TableHead>
                    <TableHead className="text-center">Ocupación</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSessions.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center py-12 text-muted-foreground">No se encontraron sesiones.</TableCell></TableRow>
                  ) : (
                    filteredSessions.map((item) => (
                      <TableRow key={item.id} className="hover:bg-muted/10 transition-colors">
                        <TableCell>
                          <div className="font-medium">{format(new Date(item.fecha), 'dd/MM/yyyy')}</div>
                          <div className="text-xs text-muted-foreground">{item.hora_inicio} - {item.hora_fin}</div>
                        </TableCell>
                        <TableCell className="font-medium">{item.tipo}</TableCell>
                        <TableCell>{item.facilitador}</TableCell>
                        <TableCell className="text-center">
                          <span className="font-semibold">{item.asistentes_reales || 0}</span>
                          <span className="text-muted-foreground text-xs"> / {item.capacidad_maxima}</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getStatusColor(item.estado)}>
                            {item.estado}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => openPaymentModal(item)} title="Registrar Pago" className="hover:text-green-600">
                              <Wallet className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => openDetail(item)} title="Ver detalles" className="hover:text-primary">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => openEdit(item)} title="Editar" className="hover:text-secondary">
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)} title="Eliminar" className="hover:text-destructive">
                              <Trash2 className="w-4 h-4" />
                            </Button>
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

      <SessionForm isOpen={formOpen} onClose={() => setFormOpen(false)} session={selectedSession} onSuccess={fetchSessions} />
      <SessionDetail isOpen={detailOpen} onClose={() => setDetailOpen(false)} session={selectedSession} onUpdate={fetchSessions} />
      
      {selectedSession && (
        <ModalRegistroPago 
          isOpen={paymentModalOpen}
          onClose={() => setPaymentModalOpen(false)}
          tipo="cliente"
          tallerId={selectedSession.id}
          onPaymentSaved={() => {
            toast.success('Pago registrado para la sesión');
            fetchSessions();
          }}
        />
      )}
    </motion.div>
  );
}