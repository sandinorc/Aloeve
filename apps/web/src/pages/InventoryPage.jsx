import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, Store } from 'lucide-react';
import MaterialsInventory from '@/components/MaterialsInventory.jsx';
import POSInventory from '@/components/POSInventory.jsx';

export default function InventoryPage() {
  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 w-full">
      <div>
        <h1 className="text-3xl font-bold font-serif tracking-tight">Gestión de Inventario</h1>
        <p className="text-muted-foreground mt-1">
          Controla el stock de materiales internos y productos para la venta.
        </p>
      </div>

      <Tabs defaultValue="materiales" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
          <TabsTrigger value="materiales" className="gap-2">
            <Package className="w-4 h-4" />
            Materiales
          </TabsTrigger>
          <TabsTrigger value="pos" className="gap-2">
            <Store className="w-4 h-4" />
            Productos POS
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="materiales" className="mt-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <MaterialsInventory />
        </TabsContent>
        
        <TabsContent value="pos" className="mt-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <POSInventory />
        </TabsContent>
      </Tabs>
    </div>
  );
}