/*
  Separar marca y modelo de vehículo del nombre del producto

  El nombre del producto viene como "REPUESTO MARCA MODELO ESPECIFICACION"
  (ej: "BIELA CHEVROLET SONIC/CRUZE 1,6/1,8"). Esto agrega dos columnas
  nuevas (no toca `name`) y las completa automáticamente:

  - vehicle_brand: marca del vehículo (Chevrolet, Peugeot, VW→Volkswagen, etc.)
  - vehicle_model: lo que sigue a la marca, cortando antes de la primera
    "especificación técnica" que aparece (medidas con coma/punto decimal,
    números seguidos de MM/CM/CC/L, o palabras como DER/IZQ/SUP/GIRO/UNIV).

  Es un PRIMER PASE automático, no 100% perfecto: en nombres donde el
  código de motor va pegado al modelo sin nada que lo distinga (ej.
  "PEUGEOT 206 DW8 9731") puede quedar de más. Conviene revisar una
  muestra después de correrlo. Los productos sin marca reconocida (ej.
  "CILINDRO ARRANQUE UNIV", productos genéricos como cinta adhesiva)
  quedan con vehicle_brand/vehicle_model en NULL — es esperado, no todo
  repuesto es específico de un vehículo.

  Se puede ampliar la lista de marcas/alias agregando filas a
  vehicle_brand_aliases en cualquier momento, sin tocar la función.
*/

CREATE TABLE IF NOT EXISTS public.vehicle_brand_aliases (
  alias text PRIMARY KEY,   -- tal como aparece en el nombre (mayúsculas)
  brand text NOT NULL       -- marca canónica a guardar en vehicle_brand
);

INSERT INTO public.vehicle_brand_aliases (alias, brand) VALUES
  ('VOLKSWAGEN', 'Volkswagen'), ('VW', 'Volkswagen'),
  ('CHEVROLET', 'Chevrolet'), ('CHEV', 'Chevrolet'),
  ('PEUGEOT', 'Peugeot'), ('PEUG', 'Peugeot'),
  ('FORD', 'Ford'),
  ('FIAT', 'Fiat'),
  ('RENAULT', 'Renault'),
  ('CITROEN', 'Citroën'), ('CITROËN', 'Citroën'),
  ('TOYOTA', 'Toyota'),
  ('HONDA', 'Honda'),
  ('NISSAN', 'Nissan'),
  ('HYUNDAI', 'Hyundai'),
  ('KIA', 'Kia'),
  ('AUDI', 'Audi'),
  ('BMW', 'BMW'),
  ('MINI', 'Mini'),
  ('SUZUKI', 'Suzuki'),
  ('MITSUBISHI', 'Mitsubishi'),
  ('DODGE', 'Dodge'),
  ('JEEP', 'Jeep'),
  ('CHRYSLER', 'Chrysler'),
  ('SEAT', 'Seat'),
  ('IVECO', 'Iveco'),
  ('SCANIA', 'Scania'),
  ('VOLVO', 'Volvo'),
  ('MERCEDES BENZ', 'Mercedes-Benz'), ('M. BENZ', 'Mercedes-Benz'), ('MBENZ', 'Mercedes-Benz'),
  ('ALFA ROMEO', 'Alfa Romeo'),
  ('LADA', 'Lada'),
  ('DAIHATSU', 'Daihatsu'),
  ('SSANGYONG', 'SsangYong'),
  ('SUBARU', 'Subaru'),
  ('MAZDA', 'Mazda'),
  ('ISUZU', 'Isuzu'),
  ('GEELY', 'Geely'),
  ('CHERY', 'Chery'),
  ('JAC', 'JAC')
ON CONFLICT (alias) DO NOTHING;

ALTER TABLE products ADD COLUMN IF NOT EXISTS vehicle_brand text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS vehicle_model text;

CREATE OR REPLACE FUNCTION public.rsi_extract_vehicle(p_name text)
RETURNS TABLE(vehicle_brand text, vehicle_model text)
LANGUAGE plpgsql
AS $$
DECLARE
  r record;
  upper_name text := upper(p_name);
  start_pos int;
  after text;
  stop_pat text := '(\d+[.,]\d+|\d+\s*(MM|CM|CC|L)|\yC/CABLES\y|\y(DER|IZQ|SUP|INF|GIRO|UNIV|CABLES|ALIMUNIO|ALUMINIO)\y)';
  stop_txt text;
  stop_pos int;
  model text;
BEGIN
  vehicle_brand := NULL;
  vehicle_model := NULL;

  FOR r IN
    SELECT alias, brand FROM public.vehicle_brand_aliases ORDER BY length(alias) DESC
  LOOP
    IF upper_name ~ ('\y' || r.alias || '\y') THEN
      start_pos := position(r.alias IN upper_name);
      vehicle_brand := r.brand;
      after := trim(both ' -/.' from substring(p_name from start_pos + length(r.alias)));
      EXIT;
    END IF;
  END LOOP;

  IF vehicle_brand IS NULL THEN
    RETURN NEXT;
    RETURN;
  END IF;

  stop_txt := substring(after from stop_pat);

  IF stop_txt IS NOT NULL THEN
    stop_pos := position(stop_txt IN after);
    model := substring(after from 1 for stop_pos - 1);
  ELSE
    model := after;
  END IF;

  model := trim(both ' -/.' from model);
  IF model = '' THEN
    model := NULL;
  END IF;

  vehicle_model := model;
  RETURN NEXT;
  RETURN;
END;
$$;

-- Completa lo que ya existe en el catálogo
UPDATE products p
SET vehicle_brand = x.vehicle_brand,
    vehicle_model = x.vehicle_model
FROM (
  SELECT id, (rsi_extract_vehicle(name)).*
  FROM products
) x
WHERE x.id = p.id;

-- Auto-completa en cada producto nuevo/actualizado que llegue por la
-- sincronización con Access, igual que la auto-categorización: solo si
-- todavía no tiene marca/modelo asignados (no pisa correcciones manuales).
CREATE OR REPLACE FUNCTION public.rsi_auto_extract_vehicle()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v record;
BEGIN
  IF NEW.vehicle_brand IS NULL THEN
    SELECT * INTO v FROM public.rsi_extract_vehicle(NEW.name);
    NEW.vehicle_brand := v.vehicle_brand;
    NEW.vehicle_model := v.vehicle_model;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_auto_extract_vehicle ON products;

CREATE TRIGGER trg_auto_extract_vehicle
  BEFORE INSERT OR UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION public.rsi_auto_extract_vehicle();
