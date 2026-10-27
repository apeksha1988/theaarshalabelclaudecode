import React, { createContext, useContext, useState, useEffect } from 'react';
import { trackAddToCart } from '../lib/analytics';

export const MAX_QTY = 6; // max units of a single item per order

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Allow other parts of the app (e.g. logout in AuthContext) to empty the cart.
  useEffect(() => {
    const handler = () => setCartItems([]);
    window.addEventListener('clear-cart', handler);
    return () => window.removeEventListener('clear-cart', handler);
  }, []);

  // A cart line is identified by product_id + size, so the same bangle in two
  // sizes are two separate lines.
  const sameLine = (item, productId, size) =>
    item.product_id === productId && (item.size || '') === (size || '');

  const addToCart = (product, quantity = 1, size = null) => {
    trackAddToCart(product, quantity);
    const sz = size || product.size || null;
    setCartItems(prev => {
      const existing = prev.find(item => sameLine(item, product.product_id, sz));
      if (existing) {
        return prev.map(item =>
          sameLine(item, product.product_id, sz)
            ? { ...item, quantity: Math.min(MAX_QTY, item.quantity + quantity) }
            : item
        );
      }
      return [...prev, { ...product, size: sz, quantity: Math.min(MAX_QTY, quantity) }];
    });
  };

  const removeFromCart = (productId, size = null) => {
    setCartItems(prev => prev.filter(item => !sameLine(item, productId, size)));
  };

  const updateQuantity = (productId, quantity, size = null) => {
    if (quantity <= 0) {
      removeFromCart(productId, size);
      return;
    }
    const capped = Math.min(MAX_QTY, quantity);
    setCartItems(prev =>
      prev.map(item =>
        sameLine(item, productId, size) ? { ...item, quantity: capped } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}