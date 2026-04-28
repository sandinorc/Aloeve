import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, Plus, Filter, Loader2 } from 'lucide-react';
import pb from '@/lib/pocketbaseClient';
import { useFinanceCalculations } from '@/hooks/useFinanceCalculations';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

const CATEGORIAS = [
  'alquiler', 'marketing plaza', 'servicios', 'contabilidad', 
  'sueldos', 'limpieza', 'software', 'materiales', 
  'bebidas', 'decoracion', 'otros'
];

const TIPOS_GASTO = ['fijo mensual', 'variable por sesion', 'extraordinario'];

export default function ExpensesPage() {
  const [gastos, setGastos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { formatCurrency } = useFinanceCalculations();

  // Form State
  const [formData, setFormData] = useState({
    fecha: format(new Date(), 'yyyy-MM-dd'),
    categoria: '',
    subcategoria: '',
    monto: '',
    tipo: '',
    comprobante: ''
  });

  // Filter State
  const [filters, setFilters] = useState({
    startDate: format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), 'yyyy-MM-dd'),
    endDate: format(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0), 'yyyy-MM-dd'),
    categoria: 'all',
    tipo: 'all'
  });

  useEffect(() => {
    fetchGastos();
  }, [filters]);

  const fetchGastos = async () => {
    setLoading(true);
    try {
      let filterStr = `fecha >= "${filters.startDate} 00:00:00" && fecha <= "${filters.endDate} 23:59:59"`;
      if (filters.categoria !== 'all') filterStr += ` && categoria = "${filters.categoria}"`;
      if (filters.tipo !== 'all') filterStr += ` && tipo = "${filters.tipo}"`;

      const records = await pb.collection('gastos').getList(1, 100, {
        filter: filterStr,
        sort: '-fecha',
        $autoCancel: false
      });
      setGastos(records.items);
    } catch (error) {
      toast.error("Error al cargar gastos");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.categoria || !formData.subcategoria || !formData.monto || !formData.tipo) {
      toast.error("Por favor completa los campos obligatorios");
      return;
    }

    setSubmitting(true);
    try {
      const dataToSubmit = {
        ...formData,
        fecha: `${formData.fecha} 12:00:00`,
        monto: parseFloat(formData.monto)
      };

      await pb.collection('gastos').create(dataToSubmit, { $autoCancel: false });
      toast.success("Gasto registrado correctamente");
      
      setFormData({
        fecha: format(new Date(), 'yyyy-MM-dd'),
        categoria: '',
        subcategoria: '',
        monto: '',
        tipo: '',
        comprobante: ''
      });
      
      fetchGastos();
    } catch (error) {
      toast.error("Error al registrar gasto");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este registro?")) return;
    
    try {
      await pb.collection('gastos').delete(id, { $autoCancel: false });
      toast.success("Registro eliminado");
      fetchGastos();
    } catch (error) {
      toast.error("Error al eliminar");
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 max-w-7xl mx-auto space-y-8"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Section */}
        <Card className="lg:col-span-1 shadow-lg border-0 rounded-2xl h-fit sticky top-24">
          <CardHeader className="bg-secondary/5 border-b border-secondary/10 pb-4">
            <CardTitle className="text-lg font-semibold flex items-center gap-2 text-secondary">
              <Plus className="w-5 h-5" />
              Nuevo Gasto
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fecha">Fecha *</Label>
                <Input type="date" id="fecha" name="fecha" value={formData.fecha} onChange={handleInputChange} required className="bg-white" />
              </div>
              
              <div className="space-y-2">
                <Label>Categoría *</Label>
                <Select value={formData.categoria} onValueChange={(v) => handleSelectChange('categoria', v)}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIAS.map(c => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subcategoria">Subcategoría / Detalle *</Label>
                <Input id="subcategoria" name="subcategoria" value={formData.subcategoria} onChange={handleInputChange} placeholder="Ej. Compra de arcilla" required className="bg-white" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="monto">Monto (DOP) *</Label>
                <Input type="number" id="monto" name="monto" value={formData.monto} onChange={handleInputChange} min="0" step="0.01" required className="bg-white" />
              </div>

              <div className="space-y-2">
                <Label>Tipo de Gasto *</Label>
                <Select value={formData.tipo} onValueChange={(v) => handleSelectChange('tipo', v)}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIPOS_GASTO.map(t => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="comprobante">Comprobante / Factura</Label>
                <Input id="comprobante" name="comprobante" value={formData.comprobante} onChange={handleInputChange} placeholder="NCF o # Factura" className="bg-white" />
              </div>

              <Button type="submit" className="w-full mt-4 bg-secondary hover:bg-secondary/90 text-white" disabled={submitting}>
                {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Guardar Gasto
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Table Section */}
        <Card className="lg:col-span-2 shadow-lg border-0 rounded-2xl">
          <CardHeader className="bg-muted/30 border-b pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="text-lg font-semibold">Historial de Gastos</CardTitle>
            
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2 bg-white rounded-md border px-2 py-1">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <Input 
                  type="date" 
                  value={filters.startDate} 
                  onChange={(e) => setFilters(p => ({...p, startDate: e.target.value}))}
                  className="h-8 border-0 w-[130px] p-0 focus-visible:ring-0"
                />
                <span className="text-muted-foreground">-</span>
                <Input 
                  type="date" 
                  value={filters.endDate} 
                  onChange={(e) => setFilters(p => ({...p, endDate: e.target.value}))}
                  className="h-8 border-0 w-[130px] p-0 focus-visible:ring-0"
                />
              </div>
              
              <Select value={filters.tipo} onValueChange={(v) => setFilters(p => ({...p, tipo: v}))}>
                <SelectTrigger className="h-10 w-[140px] bg-white">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  {TIPOS_GASTO.map(t => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-secondary" /></div>
            ) : gastos.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground flex flex-col items-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <Filter className="w-8 h-8 opacity-50" />
                </div>
                <p>No se encontraron gastos en este período.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/10">
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Categoría</TableHead>
                      <TableHead>Detalle</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead className="text-right">Monto</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {gastos.map((item) => (
                      <TableRow key={item.id} className="hover:bg-muted/20 transition-colors">
                        <TableCell className="whitespace-nowrap">{format(new Date(item.fecha), 'dd/MM/yyyy')}</TableCell>
                        <TableCell className="capitalize font-medium">{item.categoria}</TableCell>
                        <TableCell className="text-muted-foreground">{item.subcategoria}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            item.tipo === 'fijo mensual' ? 'bg-slate-100 text-slate-700' : 
                            item.tipo === 'variable por sesion' ? 'bg-secondary/10 text-secondary' : 
                            'bg-accent/10 text-accent-foreground'
                          }`}>
                            {item.tipo}
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-semibold">{formatCurrency(item.monto)}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)} className="text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
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