import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, FileText, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import pb from '@/lib/pocketbaseClient';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function AgendaReportsPage() {
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  
  const [sesiones, setSesiones] = useState([]);
  const [statsTipo, setStatsTipo] = useState([]);
  const [statsFacilitador, setStatsFacilitador] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const records = await pb.collection('sesiones').getFullList({ sort: '-fecha', $autoCancel: false });
      setSesiones(records);

      // Process data for charts
      const tipoMap = {};
      const facMap = {};

      records.forEach(s => {
        // By Type
        if (!tipoMap[s.tipo]) tipoMap[s.tipo] = { name: s.tipo, count: 0, ingresos: 0 };
        tipoMap[s.tipo].count++;
        tipoMap[s.tipo].ingresos += (s.ingresos_totales || 0);

        // By Facilitator
        if (!facMap[s.facilitador]) facMap[s.facilitador] = { name: s.facilitador, count: 0, ocupacionTotal: 0, sesionesConOcupacion: 0 };
        facMap[s.facilitador].count++;
        if (s.capacidad_maxima > 0) {
          facMap[s.facilitador].ocupacionTotal += ((s.asistentes_reales || 0) / s.capacidad_maxima) * 100;
          facMap[s.facilitador].sesionesConOcupacion++;
        }
      });

      setStatsTipo(Object.values(tipoMap).sort((a, b) => b.count - a.count));
      
      const facArray = Object.values(facMap).map(f => ({
        ...f,
        ocupacionPromedio: f.sesionesConOcupacion > 0 ? Math.round(f.ocupacionTotal / f.sesionesConOcupacion) : 0
      })).sort((a, b) => b.count - a.count);
      setStatsFacilitador(facArray);

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

  const handleExportOcupacion = (type) => {
    const headers = ['Fecha', 'Tipo', 'Facilitador', 'Ocupación %', 'Ingresos'];
    const rows = sesiones.map(s => {
      const pct = s.capacidad_maxima > 0 ? Math.round(((s.asistentes_reales || 0) / s.capacidad_maxima) * 100) : 0;
      return [format(new Date(s.fecha), 'dd/MM/yyyy'), s.tipo, s.facilitador, `${pct}%`, s.ingresos_totales || 0];
    });
    if (type === 'csv') exportCSV(headers, rows, 'reporte_ocupacion');
    else exportPDF('Reporte de Ocupación', headers, rows, 'reporte_ocupacion');
  };

  if (loading) return <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6 max-w-6xl mx-auto space-y-8">
      <Tabs defaultValue="ocupacion" className="w-full">
        <TabsList className="grid w-full max-w-2xl grid-cols-3 mb-8">
          <TabsTrigger value="ocupacion">Ocupación</TabsTrigger>
          <TabsTrigger value="tipo">Por Tipo</TabsTrigger>
          <TabsTrigger value="facilitadores">Facilitadores</TabsTrigger>
        </TabsList>

        <TabsContent value="ocupacion" className="space-y-4">
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => handleExportOcupacion('csv')} disabled={exporting}><FileText className="w-4 h-4 mr-2" /> CSV</Button>
            <Button onClick={() => handleExportOcupacion('pdf')} disabled={exporting}><Download className="w-4 h-4 mr-2" /> PDF</Button>
          </div>
          <Card className="shadow-md border-0 rounded-2xl overflow-hidden">
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/10">
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Facilitador</TableHead>
                    <TableHead className="text-center">Ocupación</TableHead>
                    <TableHead className="text-right">Ingresos</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sesiones.slice(0, 50).map(s => {
                    const pct = s.capacidad_maxima > 0 ? Math.round(((s.asistentes_reales || 0) / s.capacidad_maxima) * 100) : 0;
                    const isLow = pct < 50;
                    return (
                      <TableRow key={s.id}>
                        <TableCell>{format(new Date(s.fecha), 'dd/MM/yyyy')}</TableCell>
                        <TableCell className="font-medium">{s.tipo}</TableCell>
                        <TableCell>{s.facilitador}</TableCell>
                        <TableCell className="text-center">
                          <span className={`font-bold ${isLow ? 'text-destructive' : 'text-secondary'}`}>{pct}%</span>
                          <span className="text-xs text-muted-foreground ml-1">({s.asistentes_reales || 0}/{s.capacidad_maxima})</span>
                        </TableCell>
                        <TableCell className="text-right">${s.ingresos_totales || 0}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tipo" className="space-y-6">
          <Card className="shadow-md border-0 rounded-2xl">
            <CardHeader><CardTitle>Sesiones por Tipo</CardTitle></CardHeader>
            <CardContent>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statsTipo} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '12px', border: 'none' }} />
                    <Bar dataKey="count" name="Cantidad de Sesiones" radius={[6, 6, 0, 0]} fill="hsl(161, 69%, 36%)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="facilitadores" className="space-y-4">
          <Card className="shadow-md border-0 rounded-2xl overflow-hidden">
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/10">
                  <TableRow>
                    <TableHead>Facilitador</TableHead>
                    <TableHead className="text-center">Total Sesiones</TableHead>
                    <TableHead className="text-center">Ocupación Promedio</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {statsFacilitador.map((f, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{f.name}</TableCell>
                      <TableCell className="text-center">{f.count}</TableCell>
                      <TableCell className="text-center font-semibold text-primary">{f.ocupacionPromedio}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}