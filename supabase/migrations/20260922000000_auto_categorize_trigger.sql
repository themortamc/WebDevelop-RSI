/*
  Auto-categorización automática (trigger)

  Hasta ahora la función rsi_category_slug() (ya definida y calibrada por
  el dueño, no se modifica acá) solo se aplicaba corriendo un UPDATE a mano
  cada vez. Esto agrega un trigger que la corre solo automáticamente
  cuando hace falta:

  - En cada INSERT o UPDATE de products, si category_id queda en NULL
    (por ejemplo un producto nuevo que llega de la sincronización con
    Access, que no sabe nada de categorías), se le asigna la categoría
    automática según nombre/descripción/marca/SKU.
  - Si el producto YA tiene una categoría asignada (automática o corregida
    a mano desde el panel), el trigger NO la toca. Así, una
    recategorización manual en el admin nunca se pisa sola en la próxima
    sincronización.

  Es seguro correr esto de nuevo (CREATE OR REPLACE / DROP TRIGGER IF EXISTS).
*/

CREATE OR REPLACE FUNCTION public.rsi_auto_categorize()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  slug text;
BEGIN
  IF NEW.category_id IS NULL THEN
    slug := public.rsi_category_slug(NEW.name, NEW.description, NEW.brand, NEW.sku);
    SELECT id INTO NEW.category_id FROM public.categories WHERE categories.slug = slug;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_auto_categorize ON products;

CREATE TRIGGER trg_auto_categorize
  BEFORE INSERT OR UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION public.rsi_auto_categorize();
