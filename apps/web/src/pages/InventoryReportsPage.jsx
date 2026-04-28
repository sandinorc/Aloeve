import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, FileText, Loader2 } from 'lucide-react';
import pb from '@/lib/pocketbaseClient';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function InventoryReportsPage() {
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  
  const [sesiones, setSesiones] = useState([]);
  const [materiales, setMateriales] = useState([]);
  const [movimientos, setMovimientos] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ses, mats, movs] = await Promise.all([
        pb.collection('sesiones_consumo').getFullList({ sort: '-fecha', expand: 'materiales_usados', $autoCancel: false }),
        pb.collection('materiales').getFullList({ sort: 'nombre', $autoCancel: false }),
        pb.collection('movimientos_inventario').getFullList({ sort: '-fecha', expand: 'material_id', $autoCancel: false })
      ]);
      setSesiones(ses);
      setMateriales(mats);
      setMovimientos(movs);
    } catch (error) {
      toast.error("Error al cargar reportes");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val) => new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(val || 0);

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

  const handleExportValor = (type) => {
    const headers = ['Código', 'Nombre', 'Categoría', 'Stock', 'Precio Unit.', 'Valor Total'];
    const rows = materiales.map(m => [
      m.codigo, m.nombre, m.categoria, m.cantidad_actual, m.precio_unitario, m.cantidad_actual * m.precio_unitario
    ]);
    if (type === 'csv') exportCSV(headers, rows, 'valor_inventario');
    else exportPDF('Valor de Inventario', headers, rows.map(r => [r[0], r[1], r[2], r[3], formatCurrency(r[4]), formatCurrency(r[5])]), 'valor_inventario');
  };

  const handleExportMovimientos = (type) => {
    const headers = ['Fecha', 'Material', 'Tipo', 'Cantidad', 'Razón', 'Usuario'];
    const rows = movimientos.map(m => [
      format(new Date(m.fecha), 'dd/MM/yyyy'), m.expand?.material_id?.nombre || '', m.tipo, m.cantidad, m.razon, m.usuario
    ]);
    if (type === 'csv') exportCSV(headers, rows, 'movimientos_inventario');
    else exportPDF('Historial de Movimientos', headers, rows, 'movimientos_inventario');
  };

  if (loading) return <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6 max-w-6xl mx-auto space-y-8">
      <Tabs defaultValue="valor" className="w-full">
        <TabsList className="grid w-full max-w-2xl grid-cols-3 mb-8">
          <TabsTrigger value="valor">Valor Inventario</TabsTrigger>
          <TabsTrigger value="movimientos">Movimientos</TabsTrigger>
          <TabsTrigger value="consumo">Consumo por Sesión</TabsTrigger>
        </TabsList>

        <TabsContent value="valor" className="space-y-4">
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => handleExportValor('csv')} disabled={exporting}><FileText className="w-4 h-4 mr-2" /> CSV</Button>
            <Button onClick={() => handleExportValor('pdf')} disabled={exporting}><Download className="w-4 h-4 mr-2" /> PDF</Button>
          </div>
          <Card className="shadow-md border-0">
            <CardContent className="p-0">
              <Table>
                <TableHeader><TableRow><TableHead>Código</TableHead><TableHead>Nombre</TableHead><TableHead>Categoría</TableHead><TableHead className="text-right">Stock</TableHead><TableHead className="text-right">Valor Total</TableHead></TableRow></TableHeader>
                <TableBody>
                  {materiales.map(m => (
                    <TableRow key={m.id}>
                      <TableCell className="font-mono text-xs">{m.codigo}</TableCell>
                      <TableCell className="font-medium">{m.nombre}</TableCell>
                      <TableCell>{m.categoria}</TableCell>
                      <TableCell className="text-right">{m.cantidad_actual}</TableCell>
                      <TableCell className="text-right font-semibold">{formatCurrency(m.cantidad_actual * m.precio_unitario)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="movimientos" className="space-y-4">
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => handleExportMovimientos('csv')} disabled={exporting}><FileText className="w-4 h-4 mr-2" /> CSV</Button>
            <Button onClick={() => handleExportMovimientos('pdf')} disabled={exporting}><Download className="w-4 h-4 mr-2" /> PDF</Button>
          </div>
          <Card className="shadow-md border-0">
            <CardContent className="p-0">
              <Table>
                <TableHeader><TableRow><TableHead>Fecha</TableHead><TableHead>Material</TableHead><TableHead>Tipo</TableHead><TableHead>Cant.</TableHead><TableHead>Razón</TableHead><TableHead>Usuario</TableHead></TableRow></TableHeader>
                <TableBody>
                  {movimientos.map(m => (
                    <TableRow key={m.id}>
                      <TableCell>{format(new Date(m.fecha), 'dd/MM/yyyy')}</TableCell>
                      <TableCell>{m.expand?.material_id?.nombre}</TableCell>
                      <TableCell>{m.tipo}</TableCell>
                      <TableCell>{m.cantidad}</TableCell>
                      <TableCell>{m.razon}</TableCell>
                      <TableCell>{m.usuario}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="consumo" className="space-y-4">
          <Card className="shadow-md border-0">
            <CardContent className="p-8 text-center text-muted-foreground">
              <p>El módulo de registro de consumo por sesión está en desarrollo.</p>
              <p className="text-sm mt-2">Próximamente podrás ver aquí el detalle de materiales usados por cada evento.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}