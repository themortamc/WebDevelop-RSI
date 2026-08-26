/*
# Agregar campo "published" a productos

Permite marcar un producto como borrador para prepararlo o dejar de
venderlo sin borrarlo del catálogo. Los productos con published = false
no deben aparecer en la tienda pública, solo en el panel de admin.

1. Changes
- `products.published` (boolean, not null, default true) — por defecto
  todos los productos (los que ya existen y los nuevos) quedan
  publicados, para no romper la tienda actual.
- Índice sobre `published` para el filtro de la tienda pública.

2. Security
- Antes, la política de lectura pública ("anon_select_products") dejaba
  ver TODOS los productos a cualquiera, publicados o no. Eso significa
  que aunque la tienda filtre por `published` en el código, alguien
  podría seguir viendo los borradores llamando directo a la API con la
  clave anon (que es pública, viaja en el bundle del sitio).
- Esta migración separa la política de lectura en dos:
  - `anon`: solo puede leer productos con published = true.
  - `authenticated` (el admin logueado): sigue viendo todo, publicado
    o no, como necesita el panel.
*/

ALTER TABLE products
ADD COLUMN IF NOT EXISTS published boolean NOT NULL DEFAULT true;

CREATE INDEX IF NOT EXISTS idx_products_published ON products(published);

DROP POLICY IF EXISTS "anon_select_products" ON products;

-- Agregamos estas dos líneas para que sea idempotente
DROP POLICY IF EXISTS "anon_select_published_products" ON products;
DROP POLICY IF EXISTS "authenticated_select_products" ON products;

CREATE POLICY "anon_select_published_products" ON products FOR SELECT
TO anon USING (published = true);

CREATE POLICY "authenticated_select_products" ON products FOR SELECT
TO authenticated USING (true);