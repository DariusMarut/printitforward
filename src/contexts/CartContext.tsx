/**
 * CartContext — gestionează coșul unificat:
 * - Neautentificat: localStorage
 * - Autentificat: Supabase DB
 * - La login: merge coș local → DB, apoi curăță localStorage
 */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import { supabase, Product } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { getLocalCartItems, LocalCartItem } from '@/hooks/useLocalCart';
import { useToast } from '@/hooks/use-toast';

export interface CartItemUI {
  id: string;          // product.id (uniform pentru local și DB)
  product: Product;
  quantity: number;
  dbId?: string;       // id-ul rândului din cart_items (doar pentru useri autentificați)
}

interface CartContextType {
  items: CartItemUI[];
  loading: boolean;
  addItem: (product: Product) => Promise<void>;
  updateQty: (productId: string, newQty: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// ── localStorage helpers ──────────────────────────────────────
const STORAGE_KEY = 'pif_guest_cart';

function readLocal(): LocalCartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function writeLocal(items: LocalCartItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function clearLocal() {
  localStorage.removeItem(STORAGE_KEY);
}

// ── Provider ─────────────────────────────────────────────────
export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<CartItemUI[]>([]);
  const [loading, setLoading] = useState(true);

  // ── Fetch coș din DB (utilizator autentificat) ────────────
  const fetchDBCart = useCallback(async (userId: string): Promise<CartItemUI[]> => {
    const { data } = await supabase
      .from('cart_items')
      .select('*, product:products(*)')
      .eq('user_id', userId);

    return ((data as { id: string; quantity: number; product: Product }[]) || []).map((row) => ({
      id: row.product.id,
      product: row.product,
      quantity: row.quantity,
      dbId: row.id,
    }));
  }, []);

  // ── Merge coș local → DB după login ──────────────────────
  const mergeLocalToDB = useCallback(async (userId: string) => {
    const localItems = getLocalCartItems();
    if (localItems.length === 0) return;

    for (const localItem of localItems) {
      await supabase
        .from('cart_items')
        .upsert(
          { user_id: userId, product_id: localItem.product.id, quantity: localItem.quantity },
          { onConflict: 'user_id,product_id' }
        );
    }
    clearLocal();
  }, []);

  // ── Inițializare / schimbare user ────────────────────────
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      setLoading(true);

      if (user) {
        // 1. Mergeăm orice produse adăugate ca guest
        await mergeLocalToDB(user.id);
        // 2. Fetch coș din DB
        const dbItems = await fetchDBCart(user.id);
        if (mounted) setItems(dbItems);
      } else {
        // Guest: citim din localStorage
        const localItems = readLocal();
        if (mounted) {
          setItems(
            localItems.map((li) => ({
              id: li.product.id,
              product: li.product,
              quantity: li.quantity,
            }))
          );
        }
      }

      if (mounted) setLoading(false);
    };

    init();
    return () => { mounted = false; };
  }, [user, fetchDBCart, mergeLocalToDB]);

  // ── Sync items → localStorage când e guest ───────────────
  useEffect(() => {
    if (!user) {
      writeLocal(items.map((i) => ({ product: i.product, quantity: i.quantity })));
    }
  }, [items, user]);

  // ── addItem ───────────────────────────────────────────────
  const addItem = async (product: Product) => {
    const existing = items.find((i) => i.id === product.id);

    if (user) {
      const newQty = (existing?.quantity ?? 0) + 1;
      const { data, error } = await supabase
        .from('cart_items')
        .upsert(
          { user_id: user.id, product_id: product.id, quantity: newQty },
          { onConflict: 'user_id,product_id' }
        )
        .select('id')
        .single();

      if (!error) {
        setItems((prev) =>
          existing
            ? prev.map((i) => i.id === product.id ? { ...i, quantity: newQty, dbId: data?.id } : i)
            : [...prev, { id: product.id, product, quantity: 1, dbId: data?.id }]
        );
      }
    } else {
      // Guest: actualizează local
      setItems((prev) =>
        existing
          ? prev.map((i) => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i)
          : [...prev, { id: product.id, product, quantity: 1 }]
      );
    }
  };

  // ── updateQty ─────────────────────────────────────────────
  const updateQty = async (productId: string, newQty: number) => {
    if (newQty <= 0) { await removeItem(productId); return; }

    if (user) {
      await supabase
        .from('cart_items')
        .update({ quantity: newQty })
        .eq('user_id', user.id)
        .eq('product_id', productId);
    }

    setItems((prev) =>
      prev.map((i) => i.id === productId ? { ...i, quantity: newQty } : i)
    );
  };

  // ── removeItem ────────────────────────────────────────────
  const removeItem = async (productId: string) => {
    if (user) {
      await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);
    }
    setItems((prev) => prev.filter((i) => i.id !== productId));
  };

  // ── clearCart ─────────────────────────────────────────────
  const clearCart = async () => {
    if (user) {
      await supabase.from('cart_items').delete().eq('user_id', user.id);
    } else {
      clearLocal();
    }
    setItems([]);
  };

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, loading, addItem, updateQty, removeItem, clearCart, itemCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}
