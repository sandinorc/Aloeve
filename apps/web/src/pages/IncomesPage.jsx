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

const LINEAS_NEGOCIO = [
  'L1 Experiencias regulares',
  'L2 Formación',
  'L3 Privados',
  'L4 Turismo',
  'L5 Corporativo',
  'L6 Venta de productos'
];

const METODOS_PAGO = ['efectivo', 'transferencia', 'tarjeta'];

export default function IncomesPage() {
  const [ingresos, setIngresos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { formatCurrency } = useFinanceCalculations();

  // Form State
  const [formData, setFormData] = useState({
    fecha: format(new Date(), 'yyyy-MM-dd'),
    linea_negocio: '',
    descripcion: '',
    monto: '',
    participantes: '',
    metodo_pago: '',
    referencia_sesion: ''
  });

  // Filter State
  const [filters, setFilters] = useState({
    startDate: format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), 'yyyy-MM-dd'),
    endDate: format(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0), 'yyyy-MM-dd'),
    linea: 'all'
  });

  useEffect(() => {
    fetchIngresos();
  }, [filters]);

  const fetchIngresos = async () => {
    setLoading(true);
    try {
      let filterStr = `fecha >= "${filters.startDate} 00:00:00" && fecha <= "${filters.endDate} 23:59:59"`;
      if (filters.linea !== 'all') {
        filterStr += ` && linea_negocio = "${filters.linea}"`;
      }

      const records = await pb.collection('ingresos').getList(1, 100, {
        filter: filterStr,
        sort: '-fecha',
        $autoCancel: false
      });
      setIngresos(records.items);
    } catch (error) {
      toast.error("Error al cargar ingresos");
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
    if (!formData.linea_negocio || !formData.descripcion || !formData.monto || !formData.metodo_pago) {
      toast.error("Por favor completa los campos obligatorios");
      return;
    }

    setSubmitting(true);
    try {
      const dataToSubmit = {
        ...formData,
        fecha: `${formData.fecha} 12:00:00`, // Append time for PB date field
        monto: parseFloat(formData.monto),
        participantes: formData.participantes ? parseInt(formData.participantes) : null
      };

      await pb.collection('ingresos').create(dataToSubmit, { $autoCancel: false });
      toast.success("Ingreso registrado correctamente");
      
      // Reset form
      setFormData({
        fecha: format(new Date(), 'yyyy-MM-dd'),
        linea_negocio: '',
        descripcion: '',
        monto: '',
        participantes: '',
        metodo_pago: '',
        referencia_sesion: ''
      });
      
      fetchIngresos();
    } catch (error) {
      toast.error("Error al registrar ingreso");
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este registro?")) return;
    
    try {
      await pb.collection('ingresos').delete(id, { $autoCancel: false });
      toast.success("Registro eliminado");
      fetchIngresos();
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
          <CardHeader className="bg-primary/5 border-b border-primary/10 pb-4">
            <CardTitle className="text-lg font-semibold flex items-center gap-2 text-primary">
              <Plus className="w-5 h-5" />
              Nuevo Ingreso
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fecha">Fecha *</Label>
                <Input type="date" id="fecha" name="fecha" value={formData.fecha} onChange={handleInputChange} required className="bg-white" />
              </div>
              
              <div className="space-y-2">
                <Label>Línea de Negocio *</Label>
                <Select value={formData.linea_negocio} onValueChange={(v) => handleSelectChange('linea_negocio', v)}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Seleccionar línea" />
                  </SelectTrigger>
                  <SelectContent>
                    {LINEAS_NEGOCIO.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción *</Label>
                <Input id="descripcion" name="descripcion" value={formData.descripcion} onChange={handleInputChange} placeholder="Ej. Taller de cerámica" required className="bg-white" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="monto">Monto (DOP) *</Label>
                  <Input type="number" id="monto" name="monto" value={formData.monto} onChange={handleInputChange} min="0" step="0.01" required className="bg-white" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="participantes">Participantes</Label>
                  <Input type="number" id="participantes" name="participantes" value={formData.participantes} onChange={handleInputChange} min="1" className="bg-white" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Método de Pago *</Label>
                <Select value={formData.metodo_pago} onValueChange={(v) => handleSelectChange('metodo_pago', v)}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Seleccionar método" />
                  </SelectTrigger>
                  <SelectContent>
                    {METODOS_PAGO.map(m => <SelectItem key={m} value={m} className="capitalize">{m}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="referencia_sesion">Ref. Sesión (Opcional)</Label>
                <Input id="referencia_sesion" name="referencia_sesion" value={formData.referencia_sesion} onChange={handleInputChange} placeholder="ID de sesión" className="bg-white" />
              </div>

              <Button type="submit" className="w-full mt-4" disabled={submitting}>
                {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Guardar Ingreso
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Table Section */}
        <Card className="lg:col-span-2 shadow-lg border-0 rounded-2xl">
          <CardHeader className="bg-muted/30 border-b pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="text-lg font-semibold">Historial de Ingresos</CardTitle>
            
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
              
              <Select value={filters.linea} onValueChange={(v) => setFilters(p => ({...p, linea: v}))}>
                <SelectTrigger className="h-10 w-[180px] bg-white">
                  <SelectValue placeholder="Todas las líneas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las líneas</SelectItem>
                  {LINEAS_NEGOCIO.map(l => <SelectItem key={l} value={l}>{l.split(' ')[0]}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
            ) : ingresos.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground flex flex-col items-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <Filter className="w-8 h-8 opacity-50" />
                </div>
                <p>No se encontraron ingresos en este período.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/10">
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Descripción</TableHead>
                      <TableHead>Línea</TableHead>
                      <TableHead>Método</TableHead>
                      <TableHead className="text-right">Monto</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ingresos.map((item) => (
                      <TableRow key={item.id} className="hover:bg-muted/20 transition-colors">
                        <TableCell className="whitespace-nowrap">{format(new Date(item.fecha), 'dd/MM/yyyy')}</TableCell>
                        <TableCell className="font-medium">{item.descripcion}</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                            {item.linea_negocio.split(' ')[0]}
                          </span>
                        </TableCell>
                        <TableCell className="capitalize text-muted-foreground">{item.metodo_pago}</TableCell>
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