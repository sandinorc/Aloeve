import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Loader2, Download, Network } from 'lucide-react';
import pb from '@/lib/pocketbaseClient';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function ReferralsPage() {
  const [referrers, setReferrers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const clients = await pb.collection('clientes').getFullList({ $autoCancel: false });
      
      const refMap = {};
      
      // Build referral map
      clients.forEach(c => {
        if (c.referido_por) {
          const referrerName = c.referido_por.trim();
          if (!refMap[referrerName]) {
            refMap[referrerName] = { name: referrerName, count: 0, generatedSessions: 0, referredClients: [] };
          }
          refMap[referrerName].count++;
          refMap[referrerName].generatedSessions += (c.numero_sesiones || 0);
          refMap[referrerName].referredClients.push(c.nombre_completo);
        }
      });

      const sortedReferrers = Object.values(refMap).sort((a, b) => b.count - a.count);
      setReferrers(sortedReferrers);

    } catch (error) {
      console.error(error);
      toast.error("Error al cargar referidos");
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    try {
      const headers = ['Cliente Referidor', 'Cantidad Referidos', 'Sesiones Generadas', 'Nombres de Referidos'];
      const rows = referrers.map(r => [
        r.name, r.count, r.generatedSessions, r.referredClients.join('; ')
      ]);
      
      const csvContent = [headers.join(','), ...rows.map(e => e.map(item => `"${item}"`).join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `referidos_aloeve.csv`;
      link.click();
      toast.success("CSV exportado");
    } catch (error) {
      toast.error("Error al exportar");
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground font-serif">Red de Referidos</h2>
          <p className="text-muted-foreground text-sm">Análisis de clientes que traen nuevos clientes</p>
        </div>
        <Button onClick={exportCSV} variant="outline" className="bg-white">
          <Download className="w-4 h-4 mr-2" /> Exportar Datos
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 shadow-md border-0 rounded-2xl bg-primary/5 border-primary/10">
          <CardContent className="p-8 flex flex-col items-center justify-center text-center h-full min-h-[300px]">
            <Network className="w-16 h-16 text-primary mb-4 opacity-80" />
            <h3 className="text-xl font-bold mb-2">El Poder del Boca a Boca</h3>
            <p className="text-muted-foreground text-sm mb-6">
              Identifica a tus embajadores de marca. Los clientes que refieren a otros suelen tener mayor retención y valor de vida.
            </p>
            <div className="w-full bg-white p-4 rounded-xl border shadow-sm">
              <p className="text-sm text-muted-foreground mb-1">Total Embajadores</p>
              <p className="text-3xl font-bold text-primary">{referrers.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 shadow-lg border-0 rounded-2xl overflow-hidden">
          <CardHeader className="bg-muted/10 border-b">
            <CardTitle className="text-lg">Top Referidores</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
            ) : (
              <div className="overflow-x-auto max-h-[500px]">
                <Table>
                  <TableHeader className="sticky top-0 bg-white shadow-sm">
                    <TableRow>
                      <TableHead>Cliente Referidor</TableHead>
                      <TableHead className="text-center">Referidos Directos</TableHead>
                      <TableHead className="text-center">Sesiones Generadas</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {referrers.length === 0 ? (
                      <TableRow><TableCell colSpan={3} className="text-center py-12 text-muted-foreground">No hay datos de referidos registrados.</TableCell></TableRow>
                    ) : (
                      referrers.map((r, idx) => (
                        <TableRow key={idx} className="hover:bg-muted/10">
                          <TableCell className="font-medium">
                            {r.name}
                            <div className="text-xs text-muted-foreground mt-1 truncate max-w-[250px]" title={r.referredClients.join(', ')}>
                              A: {r.referredClients.slice(0, 3).join(', ')}{r.referredClients.length > 3 ? '...' : ''}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-secondary/10 text-secondary font-bold">
                              {r.count}
                            </span>
                          </TableCell>
                          <TableCell className="text-center font-semibold text-primary">
                            {r.generatedSessions}
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
      </div>
    </motion.div>
  );
}