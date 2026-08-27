/*
  Protección de precio ante sobreescritura por sincronizaciones externas (Access)

  Problema:
  - El proceso que sincroniza datos desde Access hace UPDATE de products
    incluyendo la columna price, pero como Access/el script no maneja precio,
    manda 0. Eso pisaba cualquier precio cargado a mano desde el panel admin.

  Solución:
  - Un trigger BEFORE UPDATE que, si la sincronización intenta dejar el precio
    en 0 (o NULL) pero el producto ya tenía un precio real cargado, conserva
    el precio anterior en lugar del que llega en la sincronización.

  Importante / límite conocido:
  - Si en algún momento necesitás que un producto tenga precio 0 a propósito
    (por ejemplo, "a consultar" o regalo), este trigger lo va a impedir
    mientras el producto ya tenga un precio distinto de 0 cargado. Para ese
    caso puntual, hay que desactivar el trigger un momento:
      ALTER TABLE products DISABLE TRIGGER trg_protect_price;
      -- hacer el update --
      ALTER TABLE products ENABLE TRIGGER trg_protect_price;
  - Esto NO protege otras columnas (stock, nombre, etc.) — esas sí se
    actualizan con lo que mande la sincronización, que es lo esperado porque
    el stock real vive en Access.
*/

CREATE OR REPLACE FUNCTION public.rsi_protect_price()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF (NEW.price IS NULL OR NEW.price = 0)
     AND OLD.price IS NOT NULL
     AND OLD.price <> 0 THEN
    NEW.price := OLD.price;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_price ON products;

CREATE TRIGGER trg_protect_price
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION public.rsi_protect_price();
