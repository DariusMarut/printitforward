-- PrintItForward Database Schema
-- Run this in your Supabase SQL Editor

-- ============================================================
-- EXTENSIONS
-- ============================================================
create extension if not exists "uuid-ossp";

-- ============================================================
-- PROFILES TABLE (extends Supabase auth.users)
-- ============================================================
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  first_name text not null default '',
  last_name text not null default '',
  phone text default '',
  address text default '',
  city text default '',
  postal_code text default '',
  avatar_url text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable Row Level Security
alter table public.profiles enable row level security;

-- Policies
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, first_name, last_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'first_name', ''),
    coalesce(new.raw_user_meta_data->>'last_name', '')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Auto-update updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

-- ============================================================
-- ORDERS TABLE (comenzi custom STL)
-- ============================================================
create table public.orders (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  order_number text unique not null,
  stl_file_name text not null,
  stl_file_url text,
  color_name text not null,
  color_hex text not null,
  quantity integer not null default 1,
  notes text default '',
  status text not null default 'pending'
    check (status in ('pending', 'processing', 'printing', 'completed', 'delivered', 'cancelled')),
  total_price numeric(10,2),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.orders enable row level security;

create policy "Users can view own orders"
  on public.orders for select
  using (auth.uid() = user_id);

create policy "Users can insert own orders"
  on public.orders for insert
  with check (auth.uid() = user_id);

create trigger orders_updated_at
  before update on public.orders
  for each row execute function public.handle_updated_at();

-- Auto-generate order number
create or replace function public.generate_order_number()
returns trigger as $$
begin
  new.order_number = 'ORD-' || to_char(now(), 'YYMM') || '-' || lpad(nextval('order_seq')::text, 4, '0');
  return new;
end;
$$ language plpgsql;

create sequence if not exists order_seq start 1000;

create trigger set_order_number
  before insert on public.orders
  for each row execute function public.generate_order_number();

-- ============================================================
-- MARKETPLACE PRODUCTS TABLE
-- ============================================================
create table public.products (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text default '',
  price numeric(10,2) not null,
  image_url text default '',
  category text default 'general',
  stock integer default 0,
  is_active boolean default true,
  created_at timestamptz default now()
);

alter table public.products enable row level security;

create policy "Anyone can view active products"
  on public.products for select
  using (is_active = true);

-- ============================================================
-- CART ITEMS TABLE
-- ============================================================
create table public.cart_items (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete cascade not null,
  quantity integer not null default 1 check (quantity > 0),
  created_at timestamptz default now(),
  unique (user_id, product_id)
);

alter table public.cart_items enable row level security;

create policy "Users can manage own cart"
  on public.cart_items for all
  using (auth.uid() = user_id);

-- ============================================================
-- CONTACT MESSAGES TABLE
-- ============================================================
create table public.contact_messages (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  email text not null,
  subject text default '',
  message text not null,
  user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz default now()
);

alter table public.contact_messages enable row level security;

create policy "Anyone can insert contact messages"
  on public.contact_messages for insert
  with check (true);

create policy "Users can view own contact messages"
  on public.contact_messages for select
  using (auth.uid() = user_id);

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================
-- Run these in the Supabase Storage section or via SQL:
insert into storage.buckets (id, name, public) values ('stl-files', 'stl-files', false);
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true);

create policy "Users can upload own STL files"
  on storage.objects for insert
  with check (bucket_id = 'stl-files' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can view own STL files"
  on storage.objects for select
  using (bucket_id = 'stl-files' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Anyone can view avatars"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Users can upload own avatar"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can update own avatar"
  on storage.objects for update
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================================
-- SEED: Sample Marketplace Products
-- ============================================================
insert into public.products (name, description, price, category, stock, image_url) values
  ('Suport Motor NEMA17', 'Suport robust pentru motor stepper NEMA17, compatibil cu majoritatea imprimantelor 3D.', 25.99, 'mecanice', 50, ''),
  ('Carcasă Raspberry Pi 4', 'Carcasă premium pentru RPi4 cu ventilație optimizată și acces la toate porturile.', 35.50, 'electronice', 30, ''),
  ('Holder Filament Universal', 'Suport universal pentru role de filament, compatibil cu role de 1kg și 3kg.', 18.00, 'accesorii', 100, ''),
  ('Clips Cablu Organizator', 'Set de 20 clipuri pentru organizarea cablurilor, diverse mărimi incluse.', 12.00, 'accesorii', 200, ''),
  ('Suport Telefon Birou', 'Suport ergonomic reglabil pentru telefon sau tabletă, unghi ajustabil 0-90°.', 22.00, 'birou', 75, ''),
  ('Protetor Colțuri Masă', 'Set 4 protectori de colțuri pentru mobilier, material semi-rigid.', 8.50, 'casă', 150, '');
