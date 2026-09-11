'use client';
import { createContext, useContext, useState, useCallback } from 'react';

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const [items, setItems] = useState([]);
  const [count, setCount] = useState(0);
  const [wishlistIds, setWishlistIds] = useState(new Set());

  const fetchWishlist = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:5000/api/wishlist');
      const data = await res.json();
      if (data.success) {
        setItems(data.data.items);
        setCount(data.data.count);
        setWishlistIds(new Set(data.data.items.map(i => i.productId)));
      }
    } catch (e) { console.error(e); }
  }, []);

  const toggleWishlist = async (productId) => {
    try {
      if (wishlistIds.has(productId)) {
        await fetch(`http://localhost:5000/api/wishlist/${productId}`, { method: 'DELETE' });
      } else {
        await fetch('http://localhost:5000/api/wishlist', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId })
        });
      }
      await fetchWishlist();
    } catch (e) { console.error(e); }
  };

  const isInWishlist = (productId) => wishlistIds.has(productId);

  return (
    <WishlistContext.Provider value={{ items, count, fetchWishlist, toggleWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => useContext(WishlistContext);
