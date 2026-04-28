import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Plus, Edit2, History, Trash2, Loader2 } from 'lucide-react';
import pb from '@/lib/pocketbaseClient';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import MaterialForm from '@/components/MaterialForm';
import MaterialMovementsModal from '@/components/MaterialMovementsModal';

export default function MaterialsCatalog() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('Activo');
  
  const [formOpen, setFormOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyMaterial, setHistoryMaterial] = useState(null);

  const CATEGORIAS = ['Pinturas', 'Lienzos', 'Pinceles', 'Papeles', 'Lápices', 'Marcadores', 'Accesorios', 'Bebidas', 'Decoración', 'Otros'];

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const records = await pb.collection('materiales').getFullList({ sort: 'nombre', $autoCancel: false });
      setMaterials(records);
    } catch (error) {
      toast.error("Error al cargar materiales");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar este material? Esta acción no se puede deshacer.")) return;
    try {
      await pb.collection('materiales').delete(id, { $autoCancel: false });
      toast.success("Material eliminado");
      fetchMaterials();
    } catch (error) {
      toast.error("Error al eliminar material");
    }
  };

  const openEdit = (mat) => {
    setSelectedMaterial(mat);
    setFormOpen(true);
  };

  const openHistory = (mat) => {
    setHistoryMaterial(mat);
    setHistoryOpen(true);
  };

  const filteredMaterials = materials.filter(m => {
    const matchSearch = m.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || m.codigo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = categoryFilter === 'all' || m.categoria === categoryFilter;
    const matchStatus = statusFilter === 'all' || m.estado === statusFilter;
    return matchSearch && matchCat && matchStatus;
  });

  const formatCurrency = (val) => new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(val);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6 max-w-7xl mx-auto space-y-6">
      <Card className="shadow-md border-0 rounded-2xl">
        <CardHeader className="pb-4 border-b bg-muted/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <CardTitle className="text-xl">Catálogo de Materiales</CardTitle>
          <Button onClick={() => { setSelectedMaterial(null); setFormOpen(true); }} className="bg-primary text-white">
            <Plus className="w-4 h-4 mr-2" /> Nuevo Material
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="p-4 flex flex-wrap gap-4 bg-white border-b">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar por nombre o código..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Categoría" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {CATEGORIAS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]"><SelectValue placeholder="Estado" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="Activo">Activo</SelectItem>
                <SelectItem value="Inactivo">Inactivo</SelectItem>
                <SelectItem value="Descontinuado">Descontinuado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/10">
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead className="text-right">Stock</TableHead>
                    <TableHead className="text-right">Precio Unit.</TableHead>
                    <TableHead className="text-right">Valor Total</TableHead>
                    <TableHead className="text-center">Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMaterials.length === 0 ? (
                    <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No se encontraron materiales.</TableCell></TableRow>
                  ) : (
                    filteredMaterials.map((item) => {
                      const isLowStock = item.cantidad_actual < item.cantidad_minima;
                      return (
                        <TableRow key={item.id} className="hover:bg-muted/20">
                          <TableCell className="font-mono text-xs text-muted-foreground">{item.codigo}</TableCell>
                          <TableCell className="font-medium">{item.nombre}</TableCell>
                          <TableCell>{item.categoria}</TableCell>
                          <TableCell className="text-right">
                            <span className={`font-semibold ${isLowStock ? 'text-destructive' : ''}`}>
                              {item.cantidad_actual} {item.unidad}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">{formatCurrency(item.precio_unitario)}</TableCell>
                          <TableCell className="text-right font-medium">{formatCurrency(item.cantidad_actual * item.precio_unitario)}</TableCell>
                          <TableCell className="text-center">
                            <span className={`px-2 py-1 rounded-full text-xs ${item.estado === 'Activo' ? 'bg-secondary/10 text-secondary' : 'bg-muted text-muted-foreground'}`}>
                              {item.estado}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="icon" onClick={() => openHistory(item)} title="Movimientos">
                                <History className="w-4 h-4 text-muted-foreground" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => openEdit(item)} title="Editar">
                                <Edit2 className="w-4 h-4 text-primary" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)} title="Eliminar">
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <MaterialForm isOpen={formOpen} onClose={() => setFormOpen(false)} material={selectedMaterial} onSuccess={fetchMaterials} />
      <MaterialMovementsModal isOpen={historyOpen} onClose={() => setHistoryOpen(false)} material={historyMaterial} />
    </motion.div>
  );
}