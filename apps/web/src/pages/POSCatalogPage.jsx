import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, ShoppingCart, PackageX } from 'lucide-react';
import apiClient from '@/lib/pocketbaseClient.js';
import { useCart } from '@/contexts/CartContext.jsx';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { validateUserExists } from '@/lib/UserValidationUtil.js';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

export default function POSCatalogPage() {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('Todos');
  
  const { addToCart } = useCart();

  useEffect(() => {
    const validateAndFetch = async () => {
      if (currentUser) {
        const exists = await validateUserExists(currentUser.id);
        if (!exists) {
          toast.error('El usuario no existe o fue eliminado');
          logout();
          navigate('/login');
          return;
        }
      }

      try {
        const records = await apiClient.collection('productos').getFullList();
        // Local filtering and sorting
        const activeRecords = records
          .filter(p => p.estado === 'Activo')
          .sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''));
        setProducts(activeRecords);
      } catch (error) {
        console.error("[POSCatalogPage] Error fetching products:", error);
        toast.error('Error al cargar el catálogo de productos');
      } finally {
        setLoading(false);
      }
    };

    validateAndFetch();
  }, [currentUser, logout, navigate]);

  const categories = ['Todos', 'Vinos', 'Café', 'Pinturas', 'Materiales'];

  const filteredProducts = products.filter(p => {
    const matchesSearch = (p.nombre || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'Todos' || p.categoria === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (category) => {
    switch(category) {
      case 'Vinos': return 'bg-[hsl(var(--pos-wine))] text-white';
      case 'Café': return 'bg-[hsl(var(--pos-coffee))] text-white';
      case 'Pinturas': return 'bg-[hsl(var(--pos-paint))] text-white';
      case 'Materiales': return 'bg-[hsl(var(--pos-materials))] text-white';
      default: return 'bg-primary text-primary-foreground';
    }
  };

  const getStockIndicator = (stock) => {
    if (stock > 10) return <span className="flex items-center gap-1 text-xs font-medium text-green-600"><span className="w-2 h-2 rounded-full bg-green-500"></span> {stock} disp.</span>;
    if (stock > 0) return <span className="flex items-center gap-1 text-xs font-medium text-yellow-600"><span className="w-2 h-2 rounded-full bg-yellow-500"></span> {stock} disp.</span>;
    return <span className="flex items-center gap-1 text-xs font-medium text-destructive"><span className="w-2 h-2 rounded-full bg-destructive"></span> Agotado</span>;
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-serif tracking-tight">Punto de Venta</h1>
          <p className="text-muted-foreground">Catálogo de productos y facturación rápida</p>
        </div>
        
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar producto..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-card"
          />
        </div>
      </div>

      <Tabs defaultValue="Todos" value={activeCategory} onValueChange={setActiveCategory} className="w-full">
        <TabsList className="w-full flex flex-wrap h-auto p-1 bg-muted/50 justify-start">
          {categories.map(cat => (
            <TabsTrigger 
              key={cat} 
              value={cat}
              className={`flex-1 sm:flex-none data-[state=active]:shadow-sm ${activeCategory === cat && cat !== 'Todos' ? getCategoryColor(cat) : ''}`}
            >
              {cat}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1,2,3,4,5,6,7,8].map(i => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-48 w-full rounded-xl" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center text-muted-foreground bg-card rounded-2xl border border-dashed">
          <PackageX className="w-16 h-16 mb-4 opacity-20" />
          <h3 className="text-xl font-medium text-foreground">No se encontraron productos</h3>
          <p>Intenta con otra búsqueda o categoría.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product, index) => {
            const finalPrice = product.precio_base * (1 + (product.itbis || 18) / 100);
            
            return (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                key={product.id} 
                className="bg-card rounded-2xl border shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col group"
              >
                <div className="aspect-square bg-muted relative overflow-hidden">
                  {product.imagen_url ? (
                    <img src={product.imagen_url} alt={product.nombre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-secondary/10 text-secondary">
                      <ShoppingCart className="w-12 h-12 opacity-20" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3 bg-background/90 backdrop-blur-sm px-2 py-1 rounded-md shadow-sm">
                    {getStockIndicator(product.stock)}
                  </div>
                  <div className={`absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md shadow-sm ${getCategoryColor(product.categoria)}`}>
                    {product.categoria}
                  </div>
                </div>
                
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="font-semibold text-lg leading-tight mb-1 line-clamp-2">{product.nombre}</h3>
                  {product.descripcion && <p className="text-sm text-muted-foreground line-clamp-1 mb-3">{product.descripcion}</p>}
                  
                  <div className="mt-auto pt-4 flex items-end justify-between">
                    <div>
                      <div className="text-xs text-muted-foreground line-through">
                        RD$ {product.precio_base.toLocaleString('es-DO', { minimumFractionDigits: 2 })} + ITBIS
                      </div>
                      <div className="text-xl font-bold text-primary">
                        RD$ {finalPrice.toLocaleString('es-DO', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full mt-4 active:scale-[0.98]" 
                    disabled={product.stock <= 0}
                    onClick={() => addToCart(product, 1)}
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    {product.stock <= 0 ? 'Agotado' : 'Agregar'}
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}