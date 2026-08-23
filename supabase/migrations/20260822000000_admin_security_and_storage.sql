/*
# Asegurar el panel de administración

Hasta ahora, cualquiera con la clave pública (anon) podía insertar,
editar o borrar productos y categorías directamente por API, sin
loguearse. Esta migración cierra eso: de acá en más, solo usuarios
autenticados (los que entren por /admin con usuario y contraseña)
pueden modificar el catálogo. La lectura sigue siendo pública, para
que la tienda se siga viendo sin login.

También crea el bucket de Storage donde se suben las fotos de
producto desde el panel de admin.
*/

-- ── Categorías: solo lectura pública, escritura solo autenticado ──
DROP POLICY IF EXISTS "anon_insert_categories" ON categories;
DROP POLICY IF EXISTS "anon_update_categories" ON categories;
DROP POLICY IF EXISTS "anon_delete_categories" ON categories;

CREATE POLICY "authenticated_insert_categories" ON categories FOR INSERT
TO authenticated WITH CHECK (true);

CREATE POLICY "authenticated_update_categories" ON categories FOR UPDATE
TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "authenticated_delete_categories" ON categories FOR DELETE
TO authenticated USING (true);

-- ── Productos: solo lectura pública, escritura solo autenticado ──
DROP POLICY IF EXISTS "anon_insert_products" ON products;
DROP POLICY IF EXISTS "anon_update_products" ON products;
DROP POLICY IF EXISTS "anon_delete_products" ON products;

CREATE POLICY "authenticated_insert_products" ON products FOR INSERT
TO authenticated WITH CHECK (true);

CREATE POLICY "authenticated_update_products" ON products FOR UPDATE
TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "authenticated_delete_products" ON products FOR DELETE
TO authenticated USING (true);

-- ── Storage: bucket público para fotos de producto ──
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "public_read_product_images" ON storage.objects;
CREATE POLICY "public_read_product_images" ON storage.objects FOR SELECT
TO anon, authenticated USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "authenticated_upload_product_images" ON storage.objects;
CREATE POLICY "authenticated_upload_product_images" ON storage.objects FOR INSERT
TO authenticated WITH CHECK (bucket_id = 'product-images');

DROP POLICY IF EXISTS "authenticated_update_product_images" ON storage.objects;
CREATE POLICY "authenticated_update_product_images" ON storage.objects FOR UPDATE
TO authenticated USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "authenticated_delete_product_images" ON storage.objects;
CREATE POLICY "authenticated_delete_product_images" ON storage.objects FOR DELETE
TO authenticated USING (bucket_id = 'product-images');
