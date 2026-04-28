import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, CheckCircle2, User, ShoppingBag, Loader2 } from 'lucide-react';
import { useCart } from '@/contexts/CartContext.jsx';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { validateUserExists } from '@/lib/UserValidationUtil.js';
import apiClient from '@/lib/pocketbaseClient.js';
import { toast } from 'sonner';
import ReceiptModal from '@/components/ReceiptModal.jsx';
import { format } from 'date-fns';

export default function POSCheckoutPage() {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const { cartItems, totals, clearCart } = useCart();
  
  const [clientMode, setClientMode] = useState('anonimo'); // anonimo, existente, nuevo
  const [clients, setClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState('');
  
  // New client form
  const [newClient, setNewClient] = useState({
    nombre: '', email: '', telefono: '', cedula: '', direccion: ''
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [receiptData, setReceiptData] = useState(null);

  useEffect(() => {
    if (cartItems.length === 0 && !receiptData) {
      navigate('/pos');
    }
    
    const fetchClients = async () => {
      try {
        const records = await apiClient.collection('clientes_pos').getFullList();
        const sortedRecords = records.sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''));
        setClients(sortedRecords);
      } catch (error) {
        console.error("[Checkout] Error fetching clients:", error);
        toast.error('Error al cargar la lista de clientes');
      }
    };
    
    fetchClients();
  }, [cartItems.length, navigate, receiptData]);

  const handleConfirmPurchase = async () => {
    if (!cartItems || cartItems.length === 0) {
      toast.error('El carrito está vacío');
      return;
    }

    if (totals.total <= 0) {
      toast.error('El total de la compra debe ser mayor a 0');
      return;
    }
    
    if (clientMode === 'existente' && !selectedClientId) {
      toast.error('Por favor selecciona un cliente');
      return;
    }
    if (clientMode === 'nuevo' && !newClient.nombre) {
      toast.error('El nombre del cliente es obligatorio');
      return;
    }

    setIsProcessing(true);
    try {
      // Validate user exists before processing sale
      if (currentUser) {
        try {
          console.log(`[Checkout] Verifying current user existence for ID: ${currentUser.id}`);
          const exists = await validateUserExists(currentUser.id);
          if (!exists) {
            console.warn(`[Checkout] User ${currentUser.id} not found in database.`);
            toast.error('El usuario actual no existe o fue eliminado');
            logout();
            navigate('/login');
            return;
          }
        } catch (userError) {
          console.error(`[Checkout] Error validating user ${currentUser.id}:`, userError);
          toast.error('Sesión inválida. Por favor, inicia sesión nuevamente.');
          logout();
          navigate('/login');
          return;
        }
      }

      let finalClientId = null;
      let finalClientName = 'Consumidor Final';

      // 1. Handle Client
      if (clientMode === 'nuevo') {
        console.log(`[Checkout] Creating new client:`, newClient);
        const createdClient = await apiClient.collection('clientes_pos').create({
          ...newClient,
          puntos_fidelizacion: Math.floor(totals.total / 100), // 1 point per 100 RD$
          total_gastado: totals.total
        });
        finalClientId = createdClient.id;
        finalClientName = createdClient.nombre;
      } else if (clientMode === 'existente') {
        try {
          console.log(`[Checkout] Verifying existing client ID: ${selectedClientId}`);
          const existingClient = await apiClient.collection('clientes_pos').getOne(selectedClientId);
          
          if (!existingClient) throw new Error('Client not found');

          finalClientId = existingClient.id;
          finalClientName = existingClient.nombre || 'Cliente';
          
          const clientUpdatePayload = {
            total_gastado: (existingClient.total_gastado || 0) + totals.total,
            puntos_fidelizacion: (existingClient.puntos_fidelizacion || 0) + Math.floor(totals.total / 100)
          };
          
          console.log(`[Checkout] Updating client ${selectedClientId}. Payload:`, clientUpdatePayload);
          await apiClient.collection('clientes_pos').update(selectedClientId, clientUpdatePayload);
        } catch (clientError) {
          console.error(`[Checkout] Error fetching/updating client ${selectedClientId}:`, clientError);
          toast.error('El cliente seleccionado no existe. Se registrará como Consumidor Final.');
          finalClientId = null;
          finalClientName = 'Consumidor Final';
        }
      }

      // 2. Format products for JSON field
      const productosJson = cartItems.map(item => ({
        id: item.id,
        nombre: item.nombre,
        cantidad: item.quantity,
        precio_unitario: item.precio_base * (1 + (item.itbis || 18)/100),
        subtotal: (item.precio_base * (1 + (item.itbis || 18)/100)) * item.quantity
      }));

      // 3. Create Sale Record
      const now = new Date();
      const salePayload = {
        cliente_id: finalClientId,
        productos: productosJson,
        subtotal: totals.subtotal,
        itbis: totals.itbis,
        total: totals.total,
        fecha: now.toISOString(),
        hora: format(now, 'HH:mm:ss'),
        estado: 'Completada'
      };
      
      console.log(`[Checkout] Creating sale record. Payload:`, salePayload);
      const saleRecord = await apiClient.collection('ventas_pos').create(salePayload);

      // 4. Update Inventory Stock with strict validation
      await Promise.all(cartItems.map(async (item) => {
        try {
          console.log(`[Checkout] Fetching current product data for ID: ${item.id}`);
          const currentProduct = await apiClient.collection('productos').getOne(item.id);
          
          if (!currentProduct) {
            console.warn(`[Checkout] Product ${item.id} not found for stock update`);
            return;
          }

          console.log(`[Checkout] Current product data retrieved:`, currentProduct);
          
          // Ensure required fields have fallback values if they are missing in the DB
          const skuValue = currentProduct.sku || `SKU-${item.id.substring(0, 6)}`;
          const stockMinimoValue = currentProduct.stock_minimo !== undefined && currentProduct.stock_minimo !== null 
            ? currentProduct.stock_minimo 
            : 0;
            
          const newStock = Math.max(0, currentProduct.stock - item.quantity);

          // Merge existing data with the new stock value and ensure sku/stock_minimo are present
          const updatedPayload = {
            ...currentProduct,
            sku: skuValue,
            stock_minimo: stockMinimoValue,
            stock: newStock
          };
          
          console.log(`[Checkout] Updating product ${item.id} stock. Payload:`, updatedPayload);
          
          // Send the complete payload back
          await apiClient.collection('productos').update(item.id, updatedPayload);
        } catch (updateError) {
          console.error(`[Checkout] Failed to update stock for product ${item.id}. Error details:`, updateError);
          throw updateError; // Re-throw to be caught by the main try-catch block
        }
      }));

      // 5. Success & Show Receipt
      toast.success('Venta completada exitosamente');
      setReceiptData({
        ...saleRecord,
        cliente_nombre: finalClientName
      });
      
    } catch (error) {
      console.error("[Checkout] Critical error processing sale:", error);
      toast.error('Error al procesar la venta. Revisa la consola para más detalles.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNewSale = () => {
    clearCart();
    setReceiptData(null);
    navigate('/pos');
  };

  if (receiptData) {
    return (
      <ReceiptModal 
        isOpen={!!receiptData} 
        onClose={handleNewSale} 
        saleData={receiptData} 
        onNewSale={handleNewSale} 
      />
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/pos')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold font-serif tracking-tight">Checkout</h1>
          <p className="text-muted-foreground">Completa la información para finalizar la venta</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Client Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Información del Cliente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <RadioGroup value={clientMode} onValueChange={setClientMode} className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-center space-x-2 border p-3 rounded-lg flex-1 cursor-pointer hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value="anonimo" id="anonimo" />
                  <Label htmlFor="anonimo" className="cursor-pointer flex-1">Consumidor Final</Label>
                </div>
                <div className="flex items-center space-x-2 border p-3 rounded-lg flex-1 cursor-pointer hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value="existente" id="existente" />
                  <Label htmlFor="existente" className="cursor-pointer flex-1">Cliente Existente</Label>
                </div>
                <div className="flex items-center space-x-2 border p-3 rounded-lg flex-1 cursor-pointer hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value="nuevo" id="nuevo" />
                  <Label htmlFor="nuevo" className="cursor-pointer flex-1">Nuevo Cliente</Label>
                </div>
              </RadioGroup>

              {clientMode === 'existente' && (
                <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                  <Label>Seleccionar Cliente</Label>
                  <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Buscar cliente..." />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map(client => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.nombre} {client.telefono ? `(${client.telefono})` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedClientId && (
                    <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
                      Puntos de fidelización actuales: <strong className="text-primary">{clients.find(c => c.id === selectedClientId)?.puntos_fidelizacion || 0}</strong>
                    </div>
                  )}
                </div>
              )}

              {clientMode === 'nuevo' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                  <div className="space-y-2">
                    <Label>Nombre Completo *</Label>
                    <Input 
                      value={newClient.nombre} 
                      onChange={e => setNewClient({...newClient, nombre: e.target.value})} 
                      placeholder="Ej. Juan Pérez"
                      className="bg-background text-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Teléfono</Label>
                    <Input 
                      value={newClient.telefono} 
                      onChange={e => setNewClient({...newClient, telefono: e.target.value})} 
                      placeholder="Ej. 809-555-5555"
                      className="bg-background text-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input 
                      type="email"
                      value={newClient.email} 
                      onChange={e => setNewClient({...newClient, email: e.target.value})} 
                      placeholder="juan@ejemplo.com"
                      className="bg-background text-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Cédula / RNC</Label>
                    <Input 
                      value={newClient.cedula} 
                      onChange={e => setNewClient({...newClient, cedula: e.target.value})} 
                      placeholder="Opcional"
                      className="bg-background text-foreground"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Order Summary */}
        <div className="space-y-6">
          <Card className="shadow-sm bg-muted/10 border-primary/20">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-primary" />
                Resumen de Orden
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                {cartItems.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <div className="flex gap-2">
                      <span className="font-medium text-muted-foreground">{item.quantity}x</span>
                      <span className="line-clamp-1">{item.nombre}</span>
                    </div>
                    <span className="font-medium">
                      RD$ {((item.precio_base * (1 + (item.itbis || 18)/100)) * item.quantity).toLocaleString('es-DO', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
              </div>
              
              <Separator />
              
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>RD$ {totals.subtotal.toLocaleString('es-DO', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>ITBIS (18%)</span>
                  <span>RD$ {totals.itbis.toLocaleString('es-DO', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between font-bold text-xl pt-3 border-t mt-2">
                  <span>Total</span>
                  <span className="text-primary">RD$ {totals.total.toLocaleString('es-DO', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              <Button 
                className="w-full h-12 text-lg mt-6 shadow-md active:scale-[0.98]" 
                onClick={handleConfirmPurchase}
                disabled={isProcessing || cartItems.length === 0}
              >
                {isProcessing ? (
                  <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Procesando...</>
                ) : (
                  <><CheckCircle2 className="w-5 h-5 mr-2" /> Confirmar Compra</>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}