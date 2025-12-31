import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

export interface CartItem {
  product: {
    id: string;
    name: string;
    price: number;
    images: string[];
  };
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: CartItem['product'], quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  isUpdating: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'dropzy_cart';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    // Initialize from localStorage for persistence
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [isUpdating, setIsUpdating] = useState(false);

  // Persist cart to localStorage
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addToCart = useCallback((product: CartItem['product'], quantity = 1) => {
    // Optimistic update - instant UI feedback
    setIsUpdating(true);
    
    setItems(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });

    // Simulate async operation completion
    setTimeout(() => setIsUpdating(false), 150);
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setIsUpdating(true);
    setItems(prev => prev.filter(item => item.product.id !== productId));
    setTimeout(() => setIsUpdating(false), 150);
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    setIsUpdating(true);
    
    if (quantity <= 0) {
      setItems(prev => prev.filter(item => item.product.id !== productId));
    } else {
      setItems(prev =>
        prev.map(item =>
          item.product.id === productId ? { ...item, quantity } : item
        )
      );
    }
    
    setTimeout(() => setIsUpdating(false), 150);
  }, []);

  const clearCart = useCallback(() => {
    setIsUpdating(true);
    setItems([]);
    setTimeout(() => setIsUpdating(false), 150);
  }, []);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        isUpdating,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
