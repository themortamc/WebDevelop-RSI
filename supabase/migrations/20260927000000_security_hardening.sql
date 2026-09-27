/*
  Non-destructive security fix. No product/account/image updates or deletions.
  BEFORE APPLYING: explicitly identify ALL legitimate admins (and any sync
  account using authenticated rather than service_role). See docs/SECURITY.md.
  First application requires SET rsi.admin_user_ids = 'uuid1,uuid2'; on the
  SAME database connection. Missing/invalid IDs abort the entire transaction.
*/
BEGIN;

CREATE SCHEMA IF NOT EXISTS rsi_private;
REVOKE ALL ON SCHEMA rsi_private FROM PUBLIC, anon, authenticated;

CREATE TABLE IF NOT EXISTS rsi_private.catalog_admins (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE rsi_private.catalog_admins ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON rsi_private.catalog_admins FROM PUBLIC, anon, authenticated;

DO $$
DECLARE
  configured text := nullif(trim(current_setting('rsi.admin_user_ids', true)), '');
  admin_id uuid;
BEGIN
  IF configured IS NOT NULL THEN
    FOREACH admin_id IN ARRAY string_to_array(configured, ',')::uuid[] LOOP
      IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = admin_id) THEN
        RAISE EXCEPTION 'Unknown admin UUID: %. No changes applied.', admin_id;
      END IF;
      INSERT INTO rsi_private.catalog_admins(user_id) VALUES (admin_id)
        ON CONFLICT (user_id) DO NOTHING;
    END LOOP;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM rsi_private.catalog_admins) THEN
    RAISE EXCEPTION 'Confirm existing admin UUIDs with SET rsi.admin_user_ids before applying. No changes applied.';
  END IF;
END;
$$;

-- The caller can check only their own identity. User-editable metadata,
-- email/domain, localStorage and frontend state never grant permissions.
CREATE OR REPLACE FUNCTION public.is_catalog_admin()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM rsi_private.catalog_admins WHERE user_id = (SELECT auth.uid())
  );
$$;
REVOKE ALL ON FUNCTION public.is_catalog_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_catalog_admin() TO anon, authenticated, service_role;

-- Restrictive policies intersect ALL permissive policies, including any
-- legacy ones deployed outside git. The existing admin CRUD policies remain,
-- but authentication alone no longer suffices. service_role is unchanged.
DO $$
DECLARE
  table_name text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY['products', 'categories', 'vehicle_brand_aliases'] LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_name);
    EXECUTE format('REVOKE TRUNCATE, REFERENCES, TRIGGER ON public.%I FROM anon, authenticated', table_name);
    EXECUTE format('DROP POLICY IF EXISTS rsi_admin_insert_guard ON public.%I', table_name);
    EXECUTE format('CREATE POLICY rsi_admin_insert_guard ON public.%I AS RESTRICTIVE FOR INSERT TO anon, authenticated WITH CHECK ((SELECT public.is_catalog_admin()))', table_name);
    EXECUTE format('DROP POLICY IF EXISTS rsi_admin_update_guard ON public.%I', table_name);
    EXECUTE format('CREATE POLICY rsi_admin_update_guard ON public.%I AS RESTRICTIVE FOR UPDATE TO anon, authenticated USING ((SELECT public.is_catalog_admin())) WITH CHECK ((SELECT public.is_catalog_admin()))', table_name);
    EXECUTE format('DROP POLICY IF EXISTS rsi_admin_delete_guard ON public.%I', table_name);
    EXECUTE format('CREATE POLICY rsi_admin_delete_guard ON public.%I AS RESTRICTIVE FOR DELETE TO anon, authenticated USING ((SELECT public.is_catalog_admin()))', table_name);
  END LOOP;
END;
$$;

DROP POLICY IF EXISTS rsi_product_visibility_guard ON public.products;
CREATE POLICY rsi_product_visibility_guard ON public.products AS RESTRICTIVE
FOR SELECT TO anon, authenticated
USING (published = true OR (SELECT public.is_catalog_admin()));

-- Alias lookup is used by invoker-rights triggers: keep reads available.
GRANT SELECT ON public.vehicle_brand_aliases TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.vehicle_brand_aliases TO authenticated;
DROP POLICY IF EXISTS rsi_read_vehicle_aliases ON public.vehicle_brand_aliases;
CREATE POLICY rsi_read_vehicle_aliases ON public.vehicle_brand_aliases
FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS rsi_manage_vehicle_aliases ON public.vehicle_brand_aliases;
CREATE POLICY rsi_manage_vehicle_aliases ON public.vehicle_brand_aliases
FOR ALL TO authenticated USING ((SELECT public.is_catalog_admin()))
WITH CHECK ((SELECT public.is_catalog_admin()));

-- Preserve other buckets and all existing objects/URLs. Check both old and
-- new rows so changing bucket_id cannot bypass authorization.
DROP POLICY IF EXISTS rsi_image_insert_guard ON storage.objects;
CREATE POLICY rsi_image_insert_guard ON storage.objects AS RESTRICTIVE
FOR INSERT TO anon, authenticated
WITH CHECK (bucket_id <> 'product-images' OR (SELECT public.is_catalog_admin()));
DROP POLICY IF EXISTS rsi_image_update_guard ON storage.objects;
CREATE POLICY rsi_image_update_guard ON storage.objects AS RESTRICTIVE
FOR UPDATE TO anon, authenticated
USING (bucket_id <> 'product-images' OR (SELECT public.is_catalog_admin()))
WITH CHECK (bucket_id <> 'product-images' OR (SELECT public.is_catalog_admin()));
DROP POLICY IF EXISTS rsi_image_delete_guard ON storage.objects;
CREATE POLICY rsi_image_delete_guard ON storage.objects AS RESTRICTIVE
FOR DELETE TO anon, authenticated
USING (bucket_id <> 'product-images' OR (SELECT public.is_catalog_admin()));

-- Storage enforces these limits server-side for NEW uploads, not just UI.
-- Existing files, including older formats, are not removed or rewritten.
UPDATE storage.buckets
SET file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
WHERE id = 'product-images';

COMMIT;
