'use client';
import { createContext, useContext, useState, useCallback } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [count, setCount] = useState(0);

  const fetchCart = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:5000/api/cart');
      const data = await res.json();
      if (data.success) {
        setItems(data.data.items);
        setCount(data.data.count);
      }
    } catch (e) { console.error('Cart fetch error:', e); }
  }, []);

  const addToCart = async (item) => {
    try {
      await fetch('http://localhost:5000/api/cart', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      });
      await fetchCart();
      return true;
    } catch { return false; }
  };

  const updateQuantity = async (itemId, quantity) => {
    try {
      await fetch(`http://localhost:5000/api/cart/${itemId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity })
      });
      await fetchCart();
    } catch (e) { console.error(e); }
  };

  const removeItem = async (itemId) => {
    try {
      await fetch(`http://localhost:5000/api/cart/${itemId}`, { method: 'DELETE' });
      await fetchCart();
    } catch (e) { console.error(e); }
  };

  return (
    <CartContext.Provider value={{ items, count, fetchCart, addToCart, updateQuantity, removeItem }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
