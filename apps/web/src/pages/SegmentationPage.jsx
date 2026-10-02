import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, MessageCircle, Eye } from 'lucide-react';
import pb from '@/lib/pocketbaseClient';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import ClientDetail from '@/components/ClientDetail';

export default function SegmentationPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const records = await pb.collection('clientes').getFullList({ sort: '-ultima_sesion', $autoCancel: false });
      
      // Apply auto-segmentation logic if not explicitly set
      const sixtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

      const segmented = records.map(c => {
        let calcSegment = c.segmento;
        if (!calcSegment) {
          if (c.tipo === 'Corporativo' || c.paquete_activo) calcSegment = 'VIP';
          else if (c.ultima_sesion && new Date(c.ultima_sesion) < sixtyDaysAgo) calcSegment = 'Inactivo';
          else if (c.numero_sesiones >= 5) calcSegment = 'Fiel';
          else if (c.numero_sesiones >= 2) calcSegment = 'Recurrente';
          else calcSegment = 'Nuevo';
        }
        return { ...c, calculatedSegment: calcSegment };
      });

      setClients(segmented);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const openDetail = (client) => {
    setSelectedClient(client);
    setDetailOpen(true);
  };

  const handleWhatsApp = (phone) => {
    if (!phone) return;
    const cleanPhone = phone.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanPhone}`, '_blank');
  };

  const renderTable = (segmentName) => {
    const filtered = clients.filter(c => c.calculatedSegment === segmentName);
    
    if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
    
    return (
      <Card className="shadow-md border-0 rounded-2xl overflow-hidden mt-4">
        <CardContent className="p-0">
          <div className="p-4 bg-muted/10 border-b flex justify-between items-center">
            <h3 className="font-semibold text-lg">Clientes: {segmentName}</h3>
            <Badge variant="secondary">{filtered.length} clientes</Badge>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead className="text-center">Sesiones</TableHead>
                  <TableHead>Última Visita</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No hay clientes en este segmento.</TableCell></TableRow>
                ) : (
                  filtered.map(c => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.nombre_completo}</TableCell>
                      <TableCell>{c.telefono}</TableCell>
                      <TableCell className="text-center">{c.numero_sesiones || 0}</TableCell>
                      <TableCell>{c.ultima_sesion ? format(new Date(c.ultima_sesion), 'dd/MM/yyyy') : '-'}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleWhatsApp(c.whatsapp || c.telefono)} className="text-green-600 hover:text-green-700 hover:bg-green-50">
                            <MessageCircle className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => openDetail(c)} className="text-primary hover:bg-primary/10">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground font-serif mb-2">Segmentación Automática</h2>
        <p className="text-muted-foreground text-sm">Los clientes se clasifican automáticamente según su historial de visitas y compras.</p>
      </div>

      <Tabs defaultValue="Nuevo" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 mb-4 h-auto gap-2 bg-transparent">
          <TabsTrigger value="Nuevo" className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-xl py-3 shadow-sm border">Nuevo (1)</TabsTrigger>
          <TabsTrigger value="Recurrente" className="data-[state=active]:bg-secondary data-[state=active]:text-white rounded-xl py-3 shadow-sm border">Recurrente (2-4)</TabsTrigger>
          <TabsTrigger value="Fiel" className="data-[state=active]:bg-accent data-[state=active]:text-white rounded-xl py-3 shadow-sm border">Fiel (5+)</TabsTrigger>
          <TabsTrigger value="VIP" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white rounded-xl py-3 shadow-sm border">VIP</TabsTrigger>
          <TabsTrigger value="Inactivo" className="data-[state=active]:bg-destructive data-[state=active]:text-white rounded-xl py-3 shadow-sm border">Inactivo (60d+)</TabsTrigger>
        </TabsList>

        <TabsContent value="Nuevo">{renderTable('Nuevo')}</TabsContent>
        <TabsContent value="Recurrente">{renderTable('Recurrente')}</TabsContent>
        <TabsContent value="Fiel">{renderTable('Fiel')}</TabsContent>
        <TabsContent value="VIP">{renderTable('VIP')}</TabsContent>
        <TabsContent value="Inactivo">{renderTable('Inactivo')}</TabsContent>
      </Tabs>

      <ClientDetail isOpen={detailOpen} onClose={() => setDetailOpen(false)} client={selectedClient} onUpdate={fetchClients} onEdit={() => {}} />
    </motion.div>
  );
}