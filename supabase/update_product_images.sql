-- ============================================================
-- UPDATE PRODUCT IMAGES
-- Rulează acest script în Supabase SQL Editor
-- Imaginile sunt de pe Unsplash (gratuite, fără licență necesară)
-- ============================================================

-- Suport Motor NEMA17
UPDATE public.products
SET image_url = 'https://images.unsplash.com/photo-1612392062798-f81cfc041834?w=400&q=80'
WHERE name = 'Suport Motor NEMA17';

-- Carcasă Raspberry Pi 4
UPDATE public.products
SET image_url = 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&q=80'
WHERE name = 'Carcasă Raspberry Pi 4';

-- Holder Filament Universal
UPDATE public.products
SET image_url = 'https://images.unsplash.com/photo-1565688534245-05d6b5be184a?w=400&q=80'
WHERE name = 'Holder Filament Universal';

-- Clips Cablu Organizator
UPDATE public.products
SET image_url = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80'
WHERE name = 'Clips Cablu Organizator';

-- Suport Telefon Birou
UPDATE public.products
SET image_url = 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&q=80'
WHERE name = 'Suport Telefon Birou';

-- Protetor Colțuri Masă
UPDATE public.products
SET image_url = 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80'
WHERE name = 'Protetor Colțuri Masă';

-- ============================================================
-- (OPȚIONAL) Adaugă produse noi cu imagini mai relevante
-- ============================================================

INSERT INTO public.products (name, description, price, category, stock, image_url) VALUES
  ('Suport Filament Perete', 'Suport montabil pe perete pentru role de filament 1kg și 3kg, include șuruburi.', 29.99, 'accesorii', 40,
   'https://images.unsplash.com/photo-1565688534245-05d6b5be184a?w=400&q=80'),
  ('Carcasă Arduino Uno', 'Carcasă protectoare pentru Arduino Uno cu acces la toate pinii și porturile USB.', 19.50, 'electronice', 60,
   'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&q=80'),
  ('Organizator Birou Modular', 'Sistem modular de organizare a biroului, include 4 module conectabile.', 45.00, 'birou', 25,
   'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=400&q=80'),
  ('Roată Curea GT2', 'Roată dințată GT2 20 dinți pentru imprimante 3D, compatibilă axe 5mm.', 8.99, 'mecanice', 200,
   'https://images.unsplash.com/photo-1612392062798-f81cfc041834?w=400&q=80');

-- Verifică produsele actualizate
SELECT id, name, image_url, price FROM public.products ORDER BY created_at;
