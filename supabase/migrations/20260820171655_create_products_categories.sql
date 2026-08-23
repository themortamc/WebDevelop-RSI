/*
# Create categories and products tables for Repuestos San Isidro

This migration sets up the product catalog for an auto parts store.
The app is single-tenant (no sign-in), so data is publicly readable.

1. New Tables
- `categories`: product categories (e.g. Frenos, Motor, Suspensión)
  - id (uuid, primary key)
  - name (text, not null)
  - slug (text, unique, not null)
  - description (text)
  - icon_name (text) - lucide icon name for display
  - created_at (timestamp)
- `products`: auto parts in the catalog
  - id (uuid, primary key)
  - name (text, not null)
  - slug (text, unique, not null)
  - description (text, not null)
  - price (numeric, not null)
  - sku (text, unique, not null)
  - brand (text, not null)
  - category_id (uuid, foreign key to categories)
  - stock (integer, not null, default 0)
  - image_url (text)
  - featured (boolean, default false)
  - rating (numeric, default 5.0)
  - created_at (timestamp)

2. Security
- Enable RLS on both tables.
- Allow anon + authenticated CRUD because the data is intentionally public/shared (single-tenant, no auth).

3. Notes
- Indexes on slug and category_id for query performance.
*/

CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  icon_name text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text NOT NULL,
  price numeric(10, 2) NOT NULL,
  sku text UNIQUE NOT NULL,
  brand text NOT NULL,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  stock integer NOT NULL DEFAULT 0,
  image_url text,
  featured boolean NOT NULL DEFAULT false,
  rating numeric(2, 1) DEFAULT 5.0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_categories" ON categories;
CREATE POLICY "anon_select_categories" ON categories FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_categories" ON categories;
CREATE POLICY "anon_insert_categories" ON categories FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_categories" ON categories;
CREATE POLICY "anon_update_categories" ON categories FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_categories" ON categories;
CREATE POLICY "anon_delete_categories" ON categories FOR DELETE
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_select_products" ON products;
CREATE POLICY "anon_select_products" ON products FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_products" ON products;
CREATE POLICY "anon_insert_products" ON products FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_products" ON products;
CREATE POLICY "anon_update_products" ON products FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_products" ON products;
CREATE POLICY "anon_delete_products" ON products FOR DELETE
TO anon, authenticated USING (true);
