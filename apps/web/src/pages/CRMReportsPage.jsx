import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, FileText, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import pb from '@/lib/pocketbaseClient';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function CRMReportsPage() {
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  
  const [statsTipo, setStatsTipo] = useState([]);
  const [statsFuente, setStatsFuente] = useState([]);
  const [statsSegmento, setStatsSegmento] = useState([]);

  const COLORS = ['#6B47DC', '#C9963A', '#1D9E75', '#E11D48', '#3B82F6'];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const clients = await pb.collection('clientes').getFullList({ $autoCancel: false });

      const tipoMap = {};
      const fuenteMap = {};
      const segMap = {};

      const sixtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

      clients.forEach(c => {
        // Tipo
        if (!tipoMap[c.tipo]) tipoMap[c.tipo] = 0;
        tipoMap[c.tipo]++;

        // Fuente
        if (!fuenteMap[c.fuente]) fuenteMap[c.fuente] = 0;
        fuenteMap[c.fuente]++;

        // Segmento
        let segment = c.segmento;
        if (!segment) {
          if (c.tipo === 'Corporativo' || c.paquete_activo) segment = 'VIP';
          else if (c.ultima_sesion && new Date(c.ultima_sesion) < sixtyDaysAgo) segment = 'Inactivo';
          else if (c.numero_sesiones >= 5) segment = 'Fiel';
          else if (c.numero_sesiones >= 2) segment = 'Recurrente';
          else segment = 'Nuevo';
        }
        if (!segMap[segment]) segMap[segment] = 0;
        segMap[segment]++;
      });

      setStatsTipo(Object.keys(tipoMap).map(k => ({ name: k, count: tipoMap[k] })));
      setStatsFuente(Object.keys(fuenteMap).map(k => ({ name: k, count: fuenteMap[k] })));
      setStatsSegmento(Object.keys(segMap).map(k => ({ name: k, count: segMap[k] })));

    } catch (error) {
      toast.error("Error al cargar reportes");
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = (headers, rows, filename) => {
    setExporting(true);
    try {
      const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${filename}.csv`;
      link.click();
      toast.success("CSV exportado");
    } catch (error) {
      toast.error("Error al exportar CSV");
    } finally {
      setExporting(false);
    }
  };

  const exportPDF = (title, headers, rows, filename) => {
    setExporting(true);
    try {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text(`Aloeve Art Studio - ${title}`, 14, 22);
      doc.setFontSize(11);
      doc.text(`Generado el: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 14, 30);

      doc.autoTable({
        startY: 40,
        head: [headers],
        body: rows,
        theme: 'striped',
        headStyles: { fillColor: [107, 71, 220] }
      });

      doc.save(`${filename}.pdf`);
      toast.success("PDF exportado");
    } catch (error) {
      toast.error("Error al exportar PDF");
    } finally {
      setExporting(false);
    }
  };

  const handleExport = (type, data, title, filename) => {
    const headers = ['Categoría', 'Cantidad de Clientes'];
    const rows = data.map(d => [d.name, d.count]);
    if (type === 'csv') exportCSV(headers, rows, filename);
    else exportPDF(title, headers, rows, filename);
  };

  if (loading) return <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6 max-w-6xl mx-auto space-y-8">
      <Tabs defaultValue="tipo" className="w-full">
        <TabsList className="grid w-full max-w-2xl grid-cols-3 mb-8">
          <TabsTrigger value="tipo">Por Tipo</TabsTrigger>
          <TabsTrigger value="fuente">Por Fuente</TabsTrigger>
          <TabsTrigger value="segmento">Por Segmento</TabsTrigger>
        </TabsList>

        <TabsContent value="tipo" className="space-y-4">
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => handleExport('csv', statsTipo, '', 'clientes_tipo')} disabled={exporting}><FileText className="w-4 h-4 mr-2" /> CSV</Button>
            <Button onClick={() => handleExport('pdf', statsTipo, 'Clientes por Tipo', 'clientes_tipo')} disabled={exporting}><Download className="w-4 h-4 mr-2" /> PDF</Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="shadow-md border-0 rounded-2xl">
              <CardContent className="p-6 h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statsTipo}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px' }} />
                    <Bar dataKey="count" fill="hsl(254, 68%, 57%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card className="shadow-md border-0 rounded-2xl overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/10"><TableRow><TableHead>Tipo</TableHead><TableHead className="text-right">Cantidad</TableHead></TableRow></TableHeader>
                <TableBody>
                  {statsTipo.map(s => <TableRow key={s.name}><TableCell className="font-medium">{s.name}</TableCell><TableCell className="text-right">{s.count}</TableCell></TableRow>)}
                </TableBody>
              </Table>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="fuente" className="space-y-4">
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => handleExport('csv', statsFuente, '', 'clientes_fuente')} disabled={exporting}><FileText className="w-4 h-4 mr-2" /> CSV</Button>
            <Button onClick={() => handleExport('pdf', statsFuente, 'Clientes por Fuente', 'clientes_fuente')} disabled={exporting}><Download className="w-4 h-4 mr-2" /> PDF</Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="shadow-md border-0 rounded-2xl">
              <CardContent className="p-6 h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statsFuente} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="count">
                      {statsFuente.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '8px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card className="shadow-md border-0 rounded-2xl overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/10"><TableRow><TableHead>Fuente</TableHead><TableHead className="text-right">Cantidad</TableHead></TableRow></TableHeader>
                <TableBody>
                  {statsFuente.map(s => <TableRow key={s.name}><TableCell className="font-medium">{s.name}</TableCell><TableCell className="text-right">{s.count}</TableCell></TableRow>)}
                </TableBody>
              </Table>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="segmento" className="space-y-4">
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => handleExport('csv', statsSegmento, '', 'clientes_segmento')} disabled={exporting}><FileText className="w-4 h-4 mr-2" /> CSV</Button>
            <Button onClick={() => handleExport('pdf', statsSegmento, 'Clientes por Segmento', 'clientes_segmento')} disabled={exporting}><Download className="w-4 h-4 mr-2" /> PDF</Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="shadow-md border-0 rounded-2xl">
              <CardContent className="p-6 h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statsSegmento} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" />
                    <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px' }} />
                    <Bar dataKey="count" fill="hsl(161, 69%, 36%)" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card className="shadow-md border-0 rounded-2xl overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/10"><TableRow><TableHead>Segmento</TableHead><TableHead className="text-right">Cantidad</TableHead></TableRow></TableHeader>
                <TableBody>
                  {statsSegmento.map(s => <TableRow key={s.name}><TableCell className="font-medium">{s.name}</TableCell><TableCell className="text-right">{s.count}</TableCell></TableRow>)}
                </TableBody>
              </Table>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}