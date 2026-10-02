import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Pencil, Trash2, AlertTriangle } from 'lucide-react';
import pb from '@/lib/pocketbaseClient.js';
import { toast } from 'sonner';
import ProductForm from './ProductForm.jsx';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export default function POSInventory() {
  const { hasPermission } = useAuth();
  const canEdit = hasPermission('editar_inventario');

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const fetchProducts = async () => {
    try {
      const records = await pb.collection('productos').getFullList({
        sort: 'nombre',
        $autoCancel: false
      });
      setProducts(records);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    if (!canEdit) return;
    if (window.confirm('¿Estás seguro de eliminar este producto?')) {
      try {
        await pb.collection('productos').delete(id, { $autoCancel: false });
        toast.success('Producto eliminado');
        fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
        toast.error('Error al eliminar producto');
      }
    }
  };

  const filteredProducts = products.filter(p => 
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        {canEdit ? (
          <Button onClick={() => { setSelectedProduct(null); setIsFormOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" /> Nuevo Producto
          </Button>
        ) : (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="cursor-not-allowed">
                  <Button disabled className="opacity-50">
                    <Plus className="w-4 h-4 mr-2" /> Nuevo Producto
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
                <TableHead>SKU</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead className="text-right">Precio</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-4">Cargando...</TableCell></TableRow>
              ) : filteredProducts.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-4">No se encontraron productos</TableCell></TableRow>
              ) : (
                filteredProducts.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono text-sm">{item.sku || '-'}</TableCell>
                    <TableCell className="font-medium">{item.nombre}</TableCell>
                    <TableCell><Badge variant="outline">{item.categoria}</Badge></TableCell>
                    <TableCell className="text-right font-medium">RD$ {item.precio_base?.toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {item.stock <= (item.stock_minimo || 5) && (
                          <AlertTriangle className="w-4 h-4 text-orange-500" />
                        )}
                        <span className={item.stock <= (item.stock_minimo || 5) ? "text-orange-600 font-bold" : ""}>
                          {item.stock}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {canEdit ? (
                          <>
                            <Button variant="ghost" size="icon" onClick={() => { setSelectedProduct(item); setIsFormOpen(true); }}>
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
        <ProductForm 
          isOpen={isFormOpen} 
          onClose={() => setIsFormOpen(false)} 
          product={selectedProduct} 
          onSuccess={fetchProducts} 
        />
      )}
    </div>
  );
}