import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';

const CartContext = createContext();

export function useCart() {
  return useContext(CartContext);
}

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('paintAndWineCart');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('paintAndWineCart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, quantity = 1) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        if (existing.quantity + quantity > product.stock) {
          toast.error(`Stock insuficiente. Solo hay ${product.stock} disponibles.`);
          return prev;
        }
        toast.success(`Cantidad actualizada: ${product.nombre}`);
        return prev.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + quantity } 
            : item
        );
      }
      
      if (product.stock < quantity) {
        toast.error('Producto agotado o stock insuficiente');
        return prev;
      }
      
      toast.success(`${product.nombre} agregado al carrito`);
      return [...prev, { ...product, quantity }];
    });
  };

  const removeFromCart = (productId) => {
    setCartItems(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCartItems(prev => prev.map(item => {
      if (item.id === productId) {
        if (newQuantity > item.stock) {
          toast.error(`Stock insuficiente. Solo hay ${item.stock} disponibles.`);
          return item;
        }
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getCartItems = () => {
    return cartItems;
  };

  const totals = useMemo(() => {
    let subtotal = 0;
    let itbisTotal = 0;
    
    cartItems.forEach(item => {
      const itemSubtotal = item.precio_base * item.quantity;
      const itemItbis = itemSubtotal * ((item.itbis || 18) / 100);
      
      subtotal += itemSubtotal;
      itbisTotal += itemItbis;
    });
    
    return {
      subtotal,
      itbis: itbisTotal,
      total: subtotal + itbisTotal,
      itemCount: cartItems.reduce((acc, item) => acc + item.quantity, 0)
    };
  }, [cartItems]);

  const getTotal = () => {
    return totals.total;
  };

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartItems,
    getTotal,
    totals,
    isCartOpen,
    setIsCartOpen
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}