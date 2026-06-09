import React, { createContext, useContext, useState, useEffect } from 'react';

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem('wishlist');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const isWished = (productId) => wishlist.some((p) => p.product_id === productId);

  const toggleWishlist = (product) => {
    setWishlist((prev) =>
      prev.some((p) => p.product_id === product.product_id)
        ? prev.filter((p) => p.product_id !== product.product_id)
        : [...prev, product]
    );
  };

  const removeFromWishlist = (productId) => {
    setWishlist((prev) => prev.filter((p) => p.product_id !== productId));
  };

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, removeFromWishlist, isWished }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) {
    throw new Error('useWishlist must be used within WishlistProvider');
  }
  return ctx;
}
