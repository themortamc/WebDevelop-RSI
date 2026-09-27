/*
  Imagen por defecto por categoría

  El Access nunca tuvo fotos: los ~29.500 productos no tienen `image_url`
  propio. En vez de eso, cada categoría puede tener UNA foto representativa
  (`categories.image_url`) que se muestra en los productos de esa
  categoría que no tengan foto propia — así se ve una foto real en vez del
  ícono, sin necesitar una foto por SKU (ni copiar fotos de otro sitio).

  Esto solo agrega la columna; queda en NULL hasta que se le pase una URL
  por categoría (el ícono sigue funcionando como respaldo mientras tanto).
*/

ALTER TABLE categories ADD COLUMN IF NOT EXISTS image_url text;
