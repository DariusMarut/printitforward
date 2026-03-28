/**
 * Coș local în localStorage pentru utilizatori neautentificați.
 * La autentificare, acest coș se merge cu cel din Supabase.
 */

import { useState, useEffect } from 'react';
import { Product } from '@/lib/supabase';

export interface LocalCartItem {
  product: Product;
  quantity: number;
}

const STORAGE_KEY = 'pif_guest_cart';

function readStorage(): LocalCartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeStorage(items: LocalCartItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function useLocalCart() {
  const [items, setItems] = useState<LocalCartItem[]>(readStorage);

  // Sincronizează cu localStorage la fiecare schimbare
  useEffect(() => {
    writeStorage(items);
  }, [items]);

  const addItem = (product: Product) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQty = (productId: string, newQty: number) => {
    if (newQty <= 0) {
      removeItem(productId);
      return;
    }
    setItems((prev) =>
      prev.map((i) =>
        i.product.id === productId ? { ...i, quantity: newQty } : i
      )
    );
  };

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((i) => i.product.id !== productId));
  };

  const clearCart = () => {
    setItems([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return { items, addItem, updateQty, removeItem, clearCart, itemCount };
}

/** Citește coșul din localStorage fără hook (folosit la merge după login) */
export function getLocalCartItems(): LocalCartItem[] {
  return readStorage();
}
