import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, FileText, Loader2 } from 'lucide-react';
import pb from '@/lib/pocketbaseClient';
import { useFinanceCalculations } from '@/hooks/useFinanceCalculations';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  
  const [weeklyData, setWeeklyData] = useState({ ingresos: 0, gastosVariables: 0, total: 0, items: [] });
  const [monthlyData, setMonthlyData] = useState({ ingresos: 0, gastosFijos: 0, gastosVariables: 0, margen: 0, items: [] });
  
  const { getWeekRange, getMonthRange, formatCurrency } = useFinanceCalculations();

  useEffect(() => {
    fetchReportsData();
  }, []);

  const fetchReportsData = async () => {
    setLoading(true);
    try {
      const weekRange = getWeekRange();
      const monthRange = getMonthRange();

      // Fetch Week
      const weekIngresos = await pb.collection('ingresos').getFullList({ filter: `fecha >= "${weekRange.start}" && fecha <= "${weekRange.end}"`, $autoCancel: false });
      const weekGastos = await pb.collection('gastos').getFullList({ filter: `fecha >= "${weekRange.start}" && fecha <= "${weekRange.end}" && tipo != "fijo mensual"`, $autoCancel: false });
      
      const wIngresosTotal = weekIngresos.reduce((sum, i) => sum + i.monto, 0);
      const wGastosTotal = weekGastos.reduce((sum, g) => sum + g.monto, 0);

      setWeeklyData({
        ingresos: wIngresosTotal,
        gastosVariables: wGastosTotal,
        total: wIngresosTotal - wGastosTotal,
        items: [...weekIngresos.map(i => ({...i, type: 'Ingreso'})), ...weekGastos.map(g => ({...g, type: 'Gasto Variable'}))].sort((a,b) => new Date(b.fecha) - new Date(a.fecha))
      });

      // Fetch Month
      const monthIngresos = await pb.collection('ingresos').getFullList({ filter: `fecha >= "${monthRange.start}" && fecha <= "${monthRange.end}"`, $autoCancel: false });
      const monthGastos = await pb.collection('gastos').getFullList({ filter: `fecha >= "${monthRange.start}" && fecha <= "${monthRange.end}"`, $autoCancel: false });

      const mIngresosTotal = monthIngresos.reduce((sum, i) => sum + i.monto, 0);
      const mGastosFijos = monthGastos.filter(g => g.tipo === 'fijo mensual').reduce((sum, g) => sum + g.monto, 0);
      const mGastosVariables = monthGastos.filter(g => g.tipo !== 'fijo mensual').reduce((sum, g) => sum + g.monto, 0);

      setMonthlyData({
        ingresos: mIngresosTotal,
        gastosFijos: mGastosFijos,
        gastosVariables: mGastosVariables,
        margen: mIngresosTotal - (mGastosFijos + mGastosVariables),
        items: [...monthIngresos.map(i => ({...i, type: 'Ingreso'})), ...monthGastos.map(g => ({...g, type: 'Gasto'}))].sort((a,b) => new Date(b.fecha) - new Date(a.fecha))
      });

    } catch (error) {
      toast.error("Error al cargar reportes");
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = (data, filename) => {
    setExporting(true);
    try {
      const headers = ['Fecha', 'Tipo', 'Descripción/Categoría', 'Monto'];
      const rows = data.items.map(item => [
        format(new Date(item.fecha), 'dd/MM/yyyy'),
        item.type,
        item.descripcion || item.categoria,
        item.monto
      ]);
      
      const csvContent = [
        headers.join(','),
        ...rows.map(e => e.join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("CSV exportado");
    } catch (error) {
      toast.error("Error al exportar CSV");
    } finally {
      setExporting(false);
    }
  };

  const exportPDF = (data, title, filename) => {
    setExporting(true);
    try {
      const doc = new jsPDF();
      
      doc.setFontSize(18);
      doc.text(`Aloeve Art Studio - ${title}`, 14, 22);
      
      doc.setFontSize(11);
      doc.text(`Generado el: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 14, 30);

      const tableData = data.items.map(item => [
        format(new Date(item.fecha), 'dd/MM/yyyy'),
        item.type,
        item.descripcion || item.categoria,
        formatCurrency(item.monto)
      ]);

      doc.autoTable({
        startY: 40,
        head: [['Fecha', 'Tipo', 'Detalle', 'Monto']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [107, 71, 220] } // Morado
      });

      doc.save(`${filename}.pdf`);
      toast.success("PDF exportado");
    } catch (error) {
      toast.error("Error al exportar PDF");
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 max-w-5xl mx-auto space-y-8"
    >
      <Tabs defaultValue="mensual" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
          <TabsTrigger value="mensual">Reporte Mensual (P&L)</TabsTrigger>
          <TabsTrigger value="semanal">Reporte Semanal</TabsTrigger>
        </TabsList>

        <TabsContent value="mensual" className="space-y-6">
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => exportCSV(monthlyData, 'reporte_mensual')} disabled={exporting}>
              <FileText className="w-4 h-4 mr-2" /> CSV
            </Button>
            <Button onClick={() => exportPDF(monthlyData, 'Reporte Mensual (P&L)', 'reporte_mensual')} disabled={exporting}>
              <Download className="w-4 h-4 mr-2" /> PDF
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <SummaryCard title="Ingresos Totales" amount={monthlyData.ingresos} color="text-primary" />
            <SummaryCard title="Gastos Fijos" amount={monthlyData.gastosFijos} color="text-muted-foreground" />
            <SummaryCard title="Gastos Variables" amount={monthlyData.gastosVariables} color="text-muted-foreground" />
            <SummaryCard title="Margen Neto" amount={monthlyData.margen} color={monthlyData.margen >= 0 ? "text-secondary" : "text-destructive"} />
          </div>

          <Card className="shadow-md border-0">
            <CardHeader>
              <CardTitle className="text-lg">Detalle de Movimientos del Mes</CardTitle>
            </CardHeader>
            <CardContent>
              <MovementsTable items={monthlyData.items} formatCurrency={formatCurrency} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="semanal" className="space-y-6">
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => exportCSV(weeklyData, 'reporte_semanal')} disabled={exporting}>
              <FileText className="w-4 h-4 mr-2" /> CSV
            </Button>
            <Button onClick={() => exportPDF(weeklyData, 'Reporte Semanal', 'reporte_semanal')} disabled={exporting}>
              <Download className="w-4 h-4 mr-2" /> PDF
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SummaryCard title="Ingresos Semana" amount={weeklyData.ingresos} color="text-primary" />
            <SummaryCard title="Gastos Variables" amount={weeklyData.gastosVariables} color="text-muted-foreground" />
            <SummaryCard title="Balance Semanal" amount={weeklyData.total} color={weeklyData.total >= 0 ? "text-secondary" : "text-destructive"} />
          </div>

          <Card className="shadow-md border-0">
            <CardHeader>
              <CardTitle className="text-lg">Detalle de Movimientos de la Semana</CardTitle>
            </CardHeader>
            <CardContent>
              <MovementsTable items={weeklyData.items} formatCurrency={formatCurrency} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}

function SummaryCard({ title, amount, color }) {
  const { formatCurrency } = useFinanceCalculations();
  return (
    <Card className="border-0 shadow-sm bg-white">
      <CardContent className="p-4">
        <p className="text-sm text-muted-foreground mb-1">{title}</p>
        <p className={`text-2xl font-bold ${color}`}>{formatCurrency(amount)}</p>
      </CardContent>
    </Card>
  );
}

function MovementsTable({ items, formatCurrency }) {
  if (items.length === 0) return <p className="text-center text-muted-foreground py-8">No hay movimientos en este período.</p>;
  
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Fecha</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Detalle</TableHead>
            <TableHead className="text-right">Monto</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item, idx) => (
            <TableRow key={idx}>
              <TableCell>{format(new Date(item.fecha), 'dd/MM/yyyy')}</TableCell>
              <TableCell>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${item.type === 'Ingreso' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                  {item.type}
                </span>
              </TableCell>
              <TableCell className="capitalize">{item.descripcion || item.categoria}</TableCell>
              <TableCell className={`text-right font-medium ${item.type === 'Ingreso' ? 'text-foreground' : 'text-muted-foreground'}`}>
                {item.type === 'Ingreso' ? '+' : '-'}{formatCurrency(item.monto)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}