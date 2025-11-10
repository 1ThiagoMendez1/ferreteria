'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import type { ReactNode } from 'react';
import type { CartItem, Product } from '@/lib/types';
import { useToast } from './use-toast';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe ser usado dentro de un CartProvider');
  }
  return context;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedItems = localStorage.getItem('cartItems');
      if (storedItems) {
        setItems(JSON.parse(storedItems));
      }
    } catch (error) {
      console.error('Failed to parse cart items from localStorage', error);
      setItems([]);
    }
  }, []);

  const updateLocalStorage = (updatedItems: CartItem[]) => {
    try {
      localStorage.setItem('cartItems', JSON.stringify(updatedItems));
    } catch (error) {
      console.error('Failed to save cart items to localStorage', error);
    }
  };

  const addToCart = useCallback(
    (product: Product, quantity = 1) => {
      setItems(prevItems => {
        const existingItem = prevItems.find(
          item => item.product.id === product.id
        );
        let newItems;
        if (existingItem) {
          newItems = prevItems.map(item =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        } else {
          newItems = [...prevItems, { product, quantity }];
        }
        updateLocalStorage(newItems);
        toast({
            title: 'Producto Agregado',
            description: `"${product.name}" fue agregado al carrito.`,
        });
        return newItems;
      });
    },
    [toast]
  );

  const removeFromCart = useCallback((productId: string) => {
    setItems(prevItems => {
      const newItems = prevItems.filter(item => item.product.id !== productId);
      updateLocalStorage(newItems);
      return newItems;
    });
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    setItems(prevItems => {
      if (quantity <= 0) {
        const newItems = prevItems.filter(
          item => item.product.id !== productId
        );
        updateLocalStorage(newItems);
        return newItems;
      }
      const newItems = prevItems.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      );
      updateLocalStorage(newItems);
      return newItems;
    });
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    updateLocalStorage([]);
  }, []);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const total = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const value = {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    itemCount,
    total,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
