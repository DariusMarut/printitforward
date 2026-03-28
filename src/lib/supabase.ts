import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env file.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// ============================================================
// DATABASE TYPES
// ============================================================

export interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  address: string;
  city: string;
  postal_code: string;
  avatar_url: string;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  order_number: string;
  stl_file_name: string;
  stl_file_url: string | null;
  color_name: string;
  color_hex: string;
  quantity: number;
  notes: string;
  status: 'pending' | 'processing' | 'printing' | 'completed' | 'delivered' | 'cancelled';
  total_price: number | null;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  stock: number;
  is_active: boolean;
  created_at: string;
}

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  product?: Product;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  user_id: string | null;
  created_at: string;
}

// ============================================================
// STATUS LABELS
// ============================================================

export const ORDER_STATUS_LABELS: Record<Order['status'], string> = {
  pending: 'În așteptare',
  processing: 'În procesare',
  printing: 'La printare',
  completed: 'Finalizat',
  delivered: 'Livrat',
  cancelled: 'Anulat',
};

export const ORDER_STATUS_COLORS: Record<Order['status'], string> = {
  pending: 'border-yellow-500/30 text-yellow-500',
  processing: 'border-blue-500/30 text-blue-500',
  printing: 'border-purple-500/30 text-purple-500',
  completed: 'border-green-500/30 text-green-500',
  delivered: 'border-primary/30 text-primary',
  cancelled: 'border-destructive/30 text-destructive',
};
