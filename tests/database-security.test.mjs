import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { PGlite } from '@electric-sql/pglite';

const admin = '00000000-0000-4000-8000-000000000001';
const member = '00000000-0000-4000-8000-000000000002';
const migration = await readFile(new URL('../supabase/migrations/20260927000000_security_hardening.sql', import.meta.url), 'utf8');

test('security migration: fail-safe bootstrap, RLS, accounts/data preservation, sync access', async (t) => {
  const db = new PGlite();
  const asRole = async (role, uid, sql) => {
    await db.exec(`SET ROLE ${role}; SELECT set_config('request.jwt.claim.sub', '${uid ?? ''}', false);`);
    try { return await db.query(sql); }
    finally { await db.exec('RESET ROLE'); }
  };
  const denied = (role, uid, sql) => assert.rejects(asRole(role, uid, sql), /row-level security|permission denied/);
  try {
    // Local Supabase-shaped schemas only. No network/database credentials.
    await db.exec(`
      CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS;
      CREATE SCHEMA auth; CREATE SCHEMA storage;
      CREATE TABLE auth.users (id uuid PRIMARY KEY, raw_user_meta_data jsonb DEFAULT '{}');
      CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS
        $$ SELECT nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
      GRANT USAGE ON SCHEMA public, auth, storage TO anon, authenticated, service_role;
      CREATE TABLE storage.buckets (id text PRIMARY KEY, name text, public boolean, file_size_limit bigint, allowed_mime_types text[]);
      CREATE TABLE storage.objects (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), bucket_id text REFERENCES storage.buckets(id), name text);
      ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
      ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
      GRANT ALL ON ALL TABLES IN SCHEMA storage TO anon, authenticated, service_role;
      INSERT INTO auth.users(id) VALUES ('${admin}'), ('${member}');
    `);
    for (const name of [
      '20260820171655_create_products_categories.sql',
      '20260822000000_admin_security_and_storage.sql',
      '20260823000000_add_published_products.sql',
      '20260826000000_protect_price_from_sync.sql',
      '20260923000000_extract_vehicle_brand_model.sql',
      '20260923010000_category_default_image.sql',
    ]) {
      await db.exec(await readFile(new URL(`../supabase/migrations/${name}`, import.meta.url), 'utf8'));
    }
    await db.exec(`
      INSERT INTO public.categories(name,slug) VALUES ('Original', 'original');
      INSERT INTO public.products(name,slug,description,price,sku,brand,published)
        VALUES ('Visible','visible','original',100,'visible','RSI',true), ('Draft','draft','original',200,'draft','RSI',false);
      INSERT INTO storage.objects(bucket_id,name) VALUES ('product-images','existing.svg');
      INSERT INTO storage.buckets(id,name,public) VALUES ('other','other',false);
      INSERT INTO storage.objects(bucket_id,name) VALUES ('other','keep.png');
      CREATE POLICY other_bucket_access ON storage.objects FOR ALL TO authenticated USING (bucket_id = 'other') WITH CHECK (bucket_id = 'other');
    `);
    const snapshot = async () => {
      const result = {};
      for (const table of ['auth.users', 'public.products', 'public.categories', 'public.vehicle_brand_aliases', 'storage.objects']) {
        result[table] = (await db.query(`SELECT * FROM ${table} ORDER BY 1`)).rows;
      }
      return result;
    };
    const original = await snapshot();

    await t.test('missing or unknown administrators abort atomically', async () => {
      await assert.rejects(db.exec(migration), /Confirm existing admin UUIDs/);
      await db.exec('ROLLBACK');
      assert.deepEqual(await snapshot(), original);
      assert.equal((await db.query("SELECT to_regnamespace('rsi_private') AS n")).rows[0].n, null);
      await db.exec("SET rsi.admin_user_ids = '00000000-0000-4000-8000-000000000099'");
      await assert.rejects(db.exec(migration), /Unknown admin UUID/);
      await db.exec('ROLLBACK');
      assert.deepEqual(await snapshot(), original);
    });
    await db.exec(`SET rsi.admin_user_ids = '${admin}'`);
    await db.exec(migration);
    await db.exec("SET rsi.admin_user_ids = ''");
    await db.exec(migration); // Idempotence without changing existing grants.

    await t.test('accounts, catalog, aliases, files and existing URLs are unchanged', async () => {
      assert.deepEqual(await snapshot(), original);
      const bucket = (await db.query("SELECT * FROM storage.buckets WHERE id = 'product-images'")).rows[0];
      assert.equal(Number(bucket.file_size_limit), 5242880);
      assert.ok(!bucket.allowed_mime_types.includes('image/svg+xml'));
      assert.equal(bucket.public, true);
    });
    for (const [role, uid] of [['anon', null], ['authenticated', member]]) {
      await t.test(`${role}: no drafts, writes, deletes or privilege escalation`, async () => {
        assert.equal((await asRole(role, uid, 'SELECT public.is_catalog_admin() AS ok')).rows[0].ok, false);
        assert.equal((await asRole(role, uid, 'SELECT * FROM public.products')).rows.length, 1);
        for (const table of ['products', 'categories', 'vehicle_brand_aliases']) {
          assert.equal((await asRole(role, uid, `DELETE FROM public.${table} RETURNING *`)).rows.length, 0);
          await denied(role, uid, `TRUNCATE public.${table}`);
        }
        assert.equal((await asRole(role, uid, "UPDATE public.products SET name='attacked' RETURNING *")).rows.length, 0);
        assert.equal((await asRole(role, uid, "UPDATE public.categories SET name='attacked' RETURNING *")).rows.length, 0);
        assert.equal((await asRole(role, uid, "UPDATE public.vehicle_brand_aliases SET brand='attacked' RETURNING *")).rows.length, 0);
        await denied(role, uid, "INSERT INTO public.categories(name,slug) VALUES ('bad','bad')");
        await denied(role, uid, "INSERT INTO public.products(name,slug,description,price,sku,brand) VALUES ('bad','bad','bad',1,'bad','bad')");
        await denied(role, uid, "INSERT INTO public.vehicle_brand_aliases(alias,brand) VALUES ('bad','bad')");
        await denied(role, uid, `INSERT INTO rsi_private.catalog_admins(user_id) VALUES ('${member}')`);
        await denied(role, uid, 'SELECT * FROM rsi_private.catalog_admins');
        await denied(role, uid, "INSERT INTO storage.objects(bucket_id,name) VALUES ('product-images','bad.svg')");
        assert.equal((await asRole(role, uid, "UPDATE storage.objects SET name='bad' WHERE bucket_id='product-images' RETURNING *")).rows.length, 0);
        assert.equal((await asRole(role, uid, "DELETE FROM storage.objects WHERE bucket_id='product-images' RETURNING *")).rows.length, 0);
        assert.deepEqual(await snapshot(), original);
      });
    }
    await t.test('self-assigned metadata and moving objects across buckets do not bypass RLS', async () => {
      await db.exec(`UPDATE auth.users SET raw_user_meta_data = '{"role":"admin","is_admin":true}' WHERE id='${member}'`);
      assert.equal((await asRole('authenticated', member, 'SELECT public.is_catalog_admin() AS ok')).rows[0].ok, false);
      await denied('authenticated', member, "UPDATE storage.objects SET bucket_id='product-images' WHERE bucket_id='other'");
      assert.equal((await asRole('authenticated', member, "UPDATE storage.objects SET bucket_id='other' WHERE bucket_id='product-images' RETURNING *")).rows.length, 0);
      assert.equal((await asRole('authenticated', member, "SELECT * FROM storage.objects WHERE bucket_id='other'")).rows.length, 1);
    });
    await t.test('approved admin keeps CRUD and service_role sync still works', async () => {
      assert.equal((await asRole('authenticated', admin, 'SELECT public.is_catalog_admin() AS ok')).rows[0].ok, true);
      for (const [role, uid] of [['authenticated', admin], ['service_role', null]]) {
        assert.equal((await asRole(role, uid, 'SELECT * FROM public.products')).rows.length, 2);
        await asRole(role, uid, "INSERT INTO public.products(name,slug,description,price,sku,brand) VALUES ('FORD FOCUS','test','test',50,'test','test')");
        assert.equal((await asRole(role, uid, "UPDATE public.products SET stock=5,price=0 WHERE sku='test' RETURNING price")).rows[0].price, '50.00');
        assert.equal((await asRole(role, uid, "DELETE FROM public.products WHERE sku='test' RETURNING *")).rows.length, 1);
        await asRole(role, uid, "INSERT INTO public.categories(name,slug) VALUES ('test','test')");
        await asRole(role, uid, "UPDATE public.categories SET name='edited' WHERE slug='test'");
        assert.equal((await asRole(role, uid, "DELETE FROM public.categories WHERE slug='test' RETURNING *")).rows.length, 1);
        await asRole(role, uid, "INSERT INTO public.vehicle_brand_aliases(alias,brand) VALUES ('TEST','test')");
        await asRole(role, uid, "UPDATE public.vehicle_brand_aliases SET brand='edited' WHERE alias='TEST'");
        assert.equal((await asRole(role, uid, "DELETE FROM public.vehicle_brand_aliases WHERE alias='TEST' RETURNING *")).rows.length, 1);
        await asRole(role, uid, "INSERT INTO storage.objects(bucket_id,name) VALUES ('product-images','test.png')");
        await asRole(role, uid, "UPDATE storage.objects SET name='edited.png' WHERE name='test.png'");
        assert.equal((await asRole(role, uid, "DELETE FROM storage.objects WHERE name='edited.png' RETURNING *")).rows.length, 1);
      }
    });
    await t.test('unexpected permissive policies cannot reopen catalog access', async () => {
      await db.exec('CREATE POLICY legacy_open_access ON public.products FOR ALL TO anon, authenticated USING (true) WITH CHECK (true)');
      assert.equal((await asRole('authenticated', member, 'SELECT * FROM public.products')).rows.length, 1);
      assert.equal((await asRole('anon', null, 'DELETE FROM public.products RETURNING *')).rows.length, 0);
    });
  } finally { await db.close(); }
});
