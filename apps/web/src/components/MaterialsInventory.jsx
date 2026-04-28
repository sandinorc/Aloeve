import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Pencil, Trash2, AlertTriangle, Package } from 'lucide-react';
import pb from '@/lib/pocketbaseClient.js';
import { toast } from 'sonner';
import MaterialForm from './MaterialForm.jsx';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export default function MaterialsInventory() {
  const { hasPermission } = useAuth();
  const canEdit = hasPermission('editar_inventario');
  
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);

  const fetchMaterials = async () => {
    try {
      const records = await pb.collection('materiales').getFullList({
        sort: 'nombre',
        $autoCancel: false
      });
      setMaterials(records);
    } catch (error) {
      console.error('Error fetching materials:', error);
      toast.error('Error al cargar materiales');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const handleDelete = async (id) => {
    if (!canEdit) return;
    if (window.confirm('¿Estás seguro de eliminar este material?')) {
      try {
        await pb.collection('materiales').delete(id, { $autoCancel: false });
        toast.success('Material eliminado');
        fetchMaterials();
      } catch (error) {
        console.error('Error deleting material:', error);
        toast.error('Error al eliminar material');
      }
    }
  };

  const filteredMaterials = materials.filter(m => 
    m.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.codigo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar materiales..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        {canEdit ? (
          <Button onClick={() => { setSelectedMaterial(null); setIsFormOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" /> Nuevo Material
          </Button>
        ) : (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="cursor-not-allowed">
                  <Button disabled className="opacity-50">
                    <Plus className="w-4 h-4 mr-2" /> Nuevo Material
                  </Button>
                </div>
              </TooltipTrigger>
              <TooltipContent>No tienes permiso para editar inventario</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead className="text-right">Stock Actual</TableHead>
                <TableHead className="text-right">Stock Mínimo</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-4">Cargando...</TableCell></TableRow>
              ) : filteredMaterials.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-4">No se encontraron materiales</TableCell></TableRow>
              ) : (
                filteredMaterials.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono text-sm">{item.codigo}</TableCell>
                    <TableCell className="font-medium">{item.nombre}</TableCell>
                    <TableCell><Badge variant="outline">{item.categoria}</Badge></TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {item.cantidad_actual <= item.cantidad_minima && (
                          <AlertTriangle className="w-4 h-4 text-orange-500" />
                        )}
                        <span className={item.cantidad_actual <= item.cantidad_minima ? "text-orange-600 font-bold" : ""}>
                          {item.cantidad_actual} {item.unidad}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">{item.cantidad_minima}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {canEdit ? (
                          <>
                            <Button variant="ghost" size="icon" onClick={() => { setSelectedMaterial(item); setIsFormOpen(true); }}>
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)} className="text-destructive">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
                        ) : (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex gap-2">
                                  <Button variant="ghost" size="icon" disabled className="opacity-50 cursor-not-allowed">
                                    <Pencil className="w-4 h-4" />
                                  </Button>
                                  <Button variant="ghost" size="icon" disabled className="opacity-50 cursor-not-allowed text-destructive">
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>No tienes permiso para editar inventario</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {isFormOpen && (
        <MaterialForm 
          isOpen={isFormOpen} 
          onClose={() => setIsFormOpen(false)} 
          material={selectedMaterial} 
          onSuccess={fetchMaterials} 
        />
      )}
    </div>
  );
}