import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, Plus, Loader2 } from 'lucide-react';
import pb from '@/lib/pocketbaseClient';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

const TIPOS = ['Entrada', 'Salida', 'Ajuste'];
const RAZONES = ['Compra', 'Uso en sesión', 'Daño', 'Pérdida', 'Ajuste de inventario'];

export default function MovementsPage() {
  const [materials, setMaterials] = useState([]);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    fecha: format(new Date(), 'yyyy-MM-dd'),
    tipo: 'Salida',
    material_id: '',
    cantidad: '',
    razon: 'Uso en sesión',
    sesion_evento: '',
    usuario: '',
    notas: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [mats, movs] = await Promise.all([
        pb.collection('materiales').getFullList({ sort: 'nombre', $autoCancel: false }),
        pb.collection('movimientos_inventario').getList(1, 50, { sort: '-fecha', expand: 'material_id', $autoCancel: false })
      ]);
      setMaterials(mats);
      setMovements(movs.items);
    } catch (error) {
      toast.error("Error al cargar datos");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.material_id || !formData.cantidad || !formData.usuario) {
      toast.error("Completa los campos obligatorios"); return;
    }

    setSubmitting(true);
    try {
      const material = materials.find(m => m.id === formData.material_id);
      const qty = parseFloat(formData.cantidad);
      let newStock = material.cantidad_actual;

      if (formData.tipo === 'Salida') {
        if (qty > material.cantidad_actual) {
          toast.error(`Stock insuficiente. Actual: ${material.cantidad_actual}`);
          setSubmitting(false);
          return;
        }
        newStock -= qty;
      } else if (formData.tipo === 'Entrada') {
        newStock += qty;
      } else if (formData.tipo === 'Ajuste') {
        newStock = qty; // Ajuste sets the exact new stock
      }

      const dataToSave = {
        ...formData,
        fecha: `${formData.fecha} 12:00:00`,
        cantidad: qty
      };

      await pb.collection('movimientos_inventario').create(dataToSave, { $autoCancel: false });
      await pb.collection('materiales').update(material.id, { cantidad_actual: newStock }, { $autoCancel: false });
      
      toast.success("Movimiento registrado");
      setFormData(prev => ({ ...prev, cantidad: '', notas: '', sesion_evento: '' }));
      fetchData();
    } catch (error) {
      toast.error("Error al registrar movimiento");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, mov) => {
    if (!window.confirm("¿Eliminar movimiento? Esto NO revertirá el stock automáticamente.")) return;
    try {
      await pb.collection('movimientos_inventario').delete(id, { $autoCancel: false });
      toast.success("Movimiento eliminado");
      fetchData();
    } catch (error) {
      toast.error("Error al eliminar");
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6 max-w-7xl mx-auto space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <Card className="lg:col-span-1 shadow-lg border-0 rounded-2xl h-fit sticky top-24">
          <CardHeader className="bg-primary/5 border-b border-primary/10 pb-4">
            <CardTitle className="text-lg font-semibold flex items-center gap-2 text-primary">
              <Plus className="w-5 h-5" /> Registrar Movimiento
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Fecha *</Label>
                <Input type="date" name="fecha" value={formData.fecha} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label>Tipo *</Label>
                <Select value={formData.tipo} onValueChange={(v) => handleSelectChange('tipo', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TIPOS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Material *</Label>
                <Select value={formData.material_id} onValueChange={(v) => handleSelectChange('material_id', v)}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar material" /></SelectTrigger>
                  <SelectContent>
                    {materials.map(m => <SelectItem key={m.id} value={m.id}>{m.nombre} ({m.cantidad_actual} {m.unidad})</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{formData.tipo === 'Ajuste' ? 'Nuevo Stock Exacto *' : 'Cantidad *'}</Label>
                <Input type="number" name="cantidad" value={formData.cantidad} onChange={handleChange} min="0" step="0.01" required />
              </div>
              <div className="space-y-2">
                <Label>Razón *</Label>
                <Select value={formData.razon} onValueChange={(v) => handleSelectChange('razon', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {RAZONES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Usuario Responsable *</Label>
                <Input name="usuario" value={formData.usuario} onChange={handleChange} placeholder="Tu nombre" required />
              </div>
              <div className="space-y-2">
                <Label>Sesión / Evento</Label>
                <Input name="sesion_evento" value={formData.sesion_evento} onChange={handleChange} placeholder="Opcional" />
              </div>
              <div className="space-y-2">
                <Label>Notas</Label>
                <Textarea name="notas" value={formData.notas} onChange={handleChange} rows={2} />
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Guardar
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 shadow-lg border-0 rounded-2xl">
          <CardHeader className="bg-muted/30 border-b pb-4">
            <CardTitle className="text-lg font-semibold">Últimos Movimientos</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/10">
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Material</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead className="text-right">Cant.</TableHead>
                      <TableHead>Razón</TableHead>
                      <TableHead>Usuario</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {movements.length === 0 ? (
                      <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No hay movimientos.</TableCell></TableRow>
                    ) : (
                      movements.map((mov) => (
                        <TableRow key={mov.id} className="hover:bg-muted/20">
                          <TableCell className="whitespace-nowrap">{format(new Date(mov.fecha), 'dd/MM/yyyy')}</TableCell>
                          <TableCell className="font-medium">{mov.expand?.material_id?.nombre || 'Desconocido'}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              mov.tipo === 'Entrada' ? 'bg-secondary/10 text-secondary' :
                              mov.tipo === 'Salida' ? 'bg-destructive/10 text-destructive' :
                              'bg-accent/10 text-accent-foreground'
                            }`}>
                              {mov.tipo}
                            </span>
                          </TableCell>
                          <TableCell className="text-right font-semibold">{mov.cantidad}</TableCell>
                          <TableCell className="text-muted-foreground text-sm">{mov.razon}</TableCell>
                          <TableCell className="text-sm">{mov.usuario}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(mov.id, mov)} className="text-muted-foreground hover:text-destructive">
                              <Trash2 className="w-4 h-4" />
                            </Button>
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