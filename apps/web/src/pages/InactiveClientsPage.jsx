import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, MessageCircle, Send, UserCheck } from 'lucide-react';
import pb from '@/lib/pocketbaseClient';
import { format, differenceInDays } from 'date-fns';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function InactiveClientsPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rangeFilter, setRangeFilter] = useState('all');
  const [selectedClients, setSelectedClients] = useState([]);
  const [messageTemplate, setMessageTemplate] = useState('Hola [nombre], te extrañamos en Aloeve Art Studio. ¡Tenemos una promoción especial para tu próxima visita!');

  const fetchInactiveClients = async () => {
    setLoading(true);
    try {
      const sixtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
      const dateStr = sixtyDaysAgo.toISOString().split('T')[0];

      const records = await pb.collection('clientes').getFullList({
        filter: `ultima_sesion < "${dateStr} 00:00:00" || estado = "Inactivo"`,
        sort: 'ultima_sesion',
        $autoCancel: false
      });

      const today = new Date();
      const processed = records.map(c => {
        const days = c.ultima_sesion ? differenceInDays(today, new Date(c.ultima_sesion)) : 999;
        return { ...c, daysInactive: days };
      });

      setClients(processed);
    } catch (error) {
      console.error(error);
      toast.error("Error al cargar clientes inactivos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInactiveClients();
  }, []);

  const handleMarkActive = async (id) => {
    try {
      await pb.collection('clientes').update(id, { estado: 'Activo' }, { $autoCancel: false });
      toast.success("Cliente marcado como activo");
      fetchInactiveClients();
    } catch (error) {
      toast.error("Error al actualizar");
    }
  };

  const handleWhatsApp = (client) => {
    const phone = client.whatsapp || client.telefono;
    if (!phone) return toast.error("No hay número registrado");
    const cleanPhone = phone.replace(/\D/g, '');
    const msg = encodeURIComponent(messageTemplate.replace('[nombre]', client.nombre_completo.split(' ')[0]));
    window.open(`https://wa.me/${cleanPhone}?text=${msg}`, '_blank');
  };

  const handleBulkWhatsApp = () => {
    if (selectedClients.length === 0) return toast.error("Selecciona al menos un cliente");
    toast.info(`Se abrirán ${selectedClients.length} pestañas de WhatsApp. Asegúrate de permitir popups.`);
    
    selectedClients.forEach(id => {
      const client = clients.find(c => c.id === id);
      if (client) {
        const phone = client.whatsapp || client.telefono;
        if (phone) {
          const cleanPhone = phone.replace(/\D/g, '');
          const msg = encodeURIComponent(messageTemplate.replace('[nombre]', client.nombre_completo.split(' ')[0]));
          window.open(`https://wa.me/${cleanPhone}?text=${msg}`, '_blank');
        }
      }
    });
  };

  const toggleSelectAll = () => {
    if (selectedClients.length === filteredClients.length) {
      setSelectedClients([]);
    } else {
      setSelectedClients(filteredClients.map(c => c.id));
    }
  };

  const toggleSelect = (id) => {
    setSelectedClients(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const filteredClients = clients.filter(c => {
    if (rangeFilter === '60-90') return c.daysInactive >= 60 && c.daysInactive <= 90;
    if (rangeFilter === '90-180') return c.daysInactive > 90 && c.daysInactive <= 180;
    if (rangeFilter === '180+') return c.daysInactive > 180;
    return true;
  });

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6 max-w-7xl mx-auto space-y-6">
      <Card className="shadow-lg border-0 rounded-2xl overflow-hidden">
        <CardHeader className="pb-4 border-b bg-destructive/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-xl font-serif text-destructive">Recuperación de Clientes</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Clientes sin visitas en los últimos 60 días</p>
          </div>
          <div className="flex gap-2">
            <Select value={rangeFilter} onValueChange={setRangeFilter}>
              <SelectTrigger className="w-[180px] bg-white"><SelectValue placeholder="Rango de inactividad" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="60-90">60 a 90 días</SelectItem>
                <SelectItem value="90-180">90 a 180 días</SelectItem>
                <SelectItem value="180+">Más de 180 días</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="p-4 bg-muted/10 border-b flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex-1 w-full sm:max-w-md">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Plantilla de Mensaje</label>
              <Select value={messageTemplate} onValueChange={setMessageTemplate}>
                <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Hola [nombre], te extrañamos en Aloeve Art Studio. ¡Tenemos una promoción especial para tu próxima visita!">Promoción Retorno</SelectItem>
                  <SelectItem value="Hola [nombre], hace tiempo que no te vemos pintar. ¿Te gustaría conocer nuestras nuevas sesiones?">Nuevas Sesiones</SelectItem>
                  <SelectItem value="Hola [nombre], ¿cómo estás? Queríamos saludarte de parte del equipo de Aloeve.">Saludo Simple</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleBulkWhatsApp} disabled={selectedClients.length === 0} className="bg-green-600 hover:bg-green-700 text-white">
              <Send className="w-4 h-4 mr-2" /> Enviar a Seleccionados ({selectedClients.length})
            </Button>
          </div>

          {loading ? (
            <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-destructive" /></div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/5">
                  <TableRow>
                    <TableHead className="w-12 text-center">
                      <Checkbox checked={selectedClients.length === filteredClients.length && filteredClients.length > 0} onCheckedChange={toggleSelectAll} />
                    </TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Teléfono</TableHead>
                    <TableHead>Última Sesión</TableHead>
                    <TableHead className="text-center">Días Inactivo</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center py-12 text-muted-foreground">No hay clientes inactivos en este rango.</TableCell></TableRow>
                  ) : (
                    filteredClients.map((item) => (
                      <TableRow key={item.id} className="hover:bg-muted/10 transition-colors">
                        <TableCell className="text-center">
                          <Checkbox checked={selectedClients.includes(item.id)} onCheckedChange={() => toggleSelect(item.id)} />
                        </TableCell>
                        <TableCell className="font-medium">{item.nombre_completo}</TableCell>
                        <TableCell>{item.telefono}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {item.ultima_sesion ? format(new Date(item.ultima_sesion), 'dd/MM/yyyy') : 'Nunca'}
                        </TableCell>
                        <TableCell className="text-center">
                          <span className={`font-bold ${item.daysInactive > 180 ? 'text-destructive' : 'text-secondary'}`}>
                            {item.daysInactive === 999 ? '-' : item.daysInactive}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => handleWhatsApp(item)} title="Enviar WhatsApp" className="text-green-600 hover:bg-green-50">
                              <MessageCircle className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleMarkActive(item.id)} title="Marcar Activo" className="text-primary hover:bg-primary/10">
                              <UserCheck className="w-4 h-4" />
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
    </motion.div>
  );
}