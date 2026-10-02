import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useCart } from '@/contexts/CartContext.jsx';
import { useNavigate } from 'react-router-dom';

export default function CartPanel() {
  const { cartItems, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, clearCart, totals } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    setIsCartOpen(false);
    navigate('/pos/checkout');
  };

  return (
    <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
      <SheetContent className="w-full sm:max-w-md flex flex-col bg-background border-l">
        <SheetHeader className="px-1 py-2">
          <SheetTitle className="flex items-center gap-2 font-serif text-2xl">
            <ShoppingBag className="w-5 h-5 text-primary" />
            Carrito de Compras
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-hidden flex flex-col mt-4">
          {cartItems.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground space-y-4">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center">
                <ShoppingBag className="w-10 h-10 opacity-50" />
              </div>
              <p className="text-lg font-medium">El carrito está vacío</p>
              <Button variant="outline" onClick={() => setIsCartOpen(false)}>
                Continuar Comprando
              </Button>
            </div>
          ) : (
            <ScrollArea className="flex-1 -mx-6 px-6">
              <div className="space-y-4 pb-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-4 bg-card p-3 rounded-xl shadow-sm border">
                    {item.imagen_url ? (
                      <img src={item.imagen_url} alt={item.nombre} className="w-16 h-16 object-cover rounded-lg bg-muted" />
                    ) : (
                      <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                        <ShoppingBag className="w-6 h-6 text-muted-foreground opacity-50" />
                      </div>
                    )}
                    
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium text-sm leading-tight line-clamp-2">{item.nombre}</h4>
                        <button 
                          onClick={() => removeFromCart(item.id)}
                          className="text-muted-foreground hover:text-destructive transition-colors p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="flex justify-between items-end mt-2">
                        <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-1 border">
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-background hover:shadow-sm transition-all"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-background hover:shadow-sm transition-all"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-primary">
                            RD$ {((item.precio_base * (1 + (item.itbis || 18)/100)) * item.quantity).toLocaleString('es-DO', { minimumFractionDigits: 2 })}
                          </div>
                          <div className="text-[10px] text-muted-foreground">
                            RD$ {(item.precio_base * (1 + (item.itbis || 18)/100)).toLocaleString('es-DO', { minimumFractionDigits: 2 })} c/u
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="pt-4 pb-2 space-y-4 bg-background">
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
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Total</span>
                <span className="text-primary">RD$ {totals.total.toLocaleString('es-DO', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Button 
                className="w-full h-12 text-lg font-medium shadow-md active:scale-[0.98]" 
                onClick={handleCheckout}
              >
                Proceder al Checkout
              </Button>
              <Button 
                variant="ghost" 
                className="w-full text-muted-foreground hover:text-destructive" 
                onClick={clearCart}
              >
                Vaciar Carrito
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}