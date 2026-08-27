/*
  Repuestos San Isidro - Categorización v3

  Basado en el análisis de las ~4351 filas que quedaron en "Otros repuestos"
  tras v2. Se agregan ~35 términos nuevos, todos verificados contra productos
  reales antes de agregarlos (no se agrega nada "a ciegas"). Motivos:

  1) Variantes sin "de" que el v2 exigía literal y el catálogo no usa:
     "extremo dir" (no "extremo de dirección"), "deposito agua" / "dep agua"
     (no "deposito de agua"), "modulo enc" (no "modulo de encendido"),
     "disco emb" (no "disco de embrague"), "electro vent" (no "electro v").
  2) Error de tipeo muy frecuente en el catálogo: "selenoide" por "solenoide"
     (562 apariciones) -> Eléctrico y Batería.
  3) Jerga / abreviaturas de mostrador no contempladas:
     - calef, rigido, resistencia, vaso exp -> Refrigeración (caños/depósito
       de calefacción y sistema de refrigeración)
     - ficha, fichas, planetario (engranaje de arranque), campos (bobinado
       de campo), impulsor/cubre impulsor (bendix arranque), collar y seg,
       pivote de horquilla, plaqueta rectif, terminal ojal/ojal ->
       Eléctrico y Batería
     - rotor enc, modulo enc, porta platinos, platinos (plural que faltaba)
       -> Encendido
     - destellador -> Iluminación
     - acel, diaf, comb, tanque, tapa tanque, bomba pique -> Combustible
     - velocimetro -> Sensores y Gestión
     - disco emb, placa emb, soporte caja, comando, palanca, cambio
       (singular que faltaba), engranaje caja -> Transmisión y Embrague
     - fuelle crem -> Suspensión y Dirección
     - temporizador (de limpiaparabrisas) -> Carrocería y Accesorios
     - venteo, engranaje leva, engranaje mando -> Motor

  Cada término fue chequeado contra ejemplos reales de productos antes de
  agregarlo. Donde una misma palabra podía significar dos cosas distintas
  (ej. "plaqueta" = porta platinos de encendido O plaqueta rectificadora de
  alternador; "resorte" = resorte de arranque O resorte de suspensión) se
  usó la frase completa en vez de la palabra suelta, para no mezclar
  categorías.

  Es seguro correr esto de nuevo. No borra productos. Solo reemplaza la
  función de categorización y reasigna category_id.

  NOTA: este archivo se aplicó originalmente contra la base de datos vía la
  API de administración de Supabase (fuera del flujo normal de git push),
  y se agrega acá después para que el historial de migraciones locales
  coincida con el remoto y el check "Supabase Preview" de GitHub deje de
  fallar por desincronización.
*/

BEGIN;

CREATE OR REPLACE FUNCTION public.rsi_category_slug(
  product_name text,
  product_description text,
  product_brand text,
  product_sku text
)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  t text;
BEGIN
  t := public.rsi_normalize_text(
    concat_ws(' ', product_name, product_description, product_brand, product_sku)
  );

  IF public.rsi_has(t, 'filtro|filtros|filtrante|prefiltro|purificador') THEN
    RETURN 'filtros';
  END IF;

  IF public.rsi_has(t, 'aceite|aceites|lubricante|lubricantes|grasa|grasas|aditivo|aditivos|antifriccion|inhibidor de corrosion|agua destilada|valvulina|refrigerante|anticongelante|liquido de freno|liquido hidraulico|fluido|5w30|5w40|10w40|15w40|20w50|0w20|0w30|75w80|75w90|80w90') THEN
    RETURN 'aceites-lubricantes';
  END IF;

  IF public.rsi_has(t, 'correa|correas|distribucion|dist|kit dist|tensor|tensores|polea|poleas|cadena de distribucion|kit distribucion|kit de distribucion') THEN
    RETURN 'correas-distribucion';
  END IF;

  IF public.rsi_has(t, 'pastilla|pastillas|disco de freno|discos de freno|cinta|cintas|caliper|calipers|mordaza|mordazas|campana|campanas|zapata|zapatas|cilindro de rueda|bomba de freno|servofreno|servo freno|flexible de freno|manguera de freno|abs|freno|frenos') THEN
    RETURN 'frenos';
  END IF;

  IF public.rsi_has(t, 'bujia|bujias|bobina|bobinas|cable de bujia|cables de bujia|distribuidor|platino|platinos|condensador|modulo de encendido|modulo enc|captor de encendido|encendido|ignicion|rotor enc|porta platinos') THEN
    RETURN 'encendido';
  END IF;

  IF public.rsi_has(t, 'bateria|baterias|alternador|alternadores|alt|rotoralt|burro de arranque|motor de arranque|arranque|arrancador|impulsor|impulsor arr|impulsor arrv|cubre impulsor|horquilla arr|contactor arr|carbones arr|diodo|diodos|fusible|fusibles|rele|reles|relay|relays|regulador de voltaje|regulador volt|portafusible|portafusibles|caja de fusibles|solenoide|solenoides|selenoide|selenoides|tecla|interruptor|llave de luz|terminal macho|terminal hembra|terminal electrico|terminal ojal|ojal|aislante terminal|aislaciones|spagueti|termocontraible|adaptador usb|antena|alarma|antirrobo|cargador pila|amperimetro|punta logica|limpia contacto|limpia contactos|electroiman|bocina|bocinas|bulbo marcha atr|bulbo marcha atras|bulbo de marcha atras|bulbo retroceso|ficha|fichas|planetario|campos|collar y seg|pivote de horquilla|plaqueta rectif|resorte arr') THEN
    RETURN 'electrico-bateria';
  END IF;

  IF public.rsi_has(t, 'faro|faros|optica|opticas|acrilico ambar|lampara|lamparas|lamp|porta lamp|ficha lamp|bombita|bombitas|led|lente trasero|lentes traseros|luz|luces|stop|intermitente|guino|guinos|posicion|giro|patente|antiniebla|baliza|balizas|destellador') THEN
    RETURN 'iluminacion';
  END IF;

  IF public.rsi_has(t, 'radiador|radiadores|rad|radidor|termostato|termostatos|porta term|base porta term|manguera de agua|mangueras de agua|manguera para agua|mang calef|mang sal|mang inf rad|mang mult|mang respiracion|calefaccion|calef|grifo calef|garganta agua|conexion agua|conexion en y dep agua|cano ent agua|cano agua|cano bba agua|bba agua|acople bomba agua|acolple bomba agua|antecuerpo bomba agua|bomba de agua|calentador de agua|enfriador|electroventilador|electroventiladores|electro v|electro vent|ventilador|deposito de agua|deposito agua|dep agua|tapa dep agua|deposito refrigerante|tapa de radiador|sensor de temperatura|bulbo de temperatura|bulbo temp|bulbo electro|refrigeracion|rigido|resistencia|vaso exp|vaso expansion') THEN
    RETURN 'refrigeracion';
  END IF;

  IF public.rsi_has(t, 'silenciador|silenciadores|escape|escapes|catalizador|catalizadores|multiple de escape|cano de escape|brida de escape|junta de escape|soporte de escape|goma de escape|flexible de escape|resonador') THEN
    RETURN 'escape';
  END IF;

  IF public.rsi_has(t, 'inyector|inyectores|iny|inyeccion|carburador|carburadores|carb|cuerpo acel|cuerpo aceleracion|mariposa|as y aguja|bomba alimentadora|bomba de nafta|bomba combustible|bomba de combustible|bomba comb|bba comb|bomba comb elect|bomba pique|bomba de pique|flotante|tanque de combustible|tanque|tanque comb|tapa tanque|manguera combustible|regulador de presion|reg de presion|reg presion|rampa de inyeccion|gnc|nafta|gasoil|diesel|combustible|acel|diaf|comb') THEN
    RETURN 'combustible-inyeccion';
  END IF;

  IF public.rsi_has(t, 'sensor|sensores|sonda|sondas|lambda|map|maf|tps|iac|captor|captadores|actuador|actuadores|valvula egr|egr|paso a paso|valvula paso a paso|termometro|computadora|ecu|inyeccion electronica|bulbo pre ac|bulbo presion aceite|bulbo de presion|velocimetro') THEN
    RETURN 'sensores-gestion';
  END IF;

  IF public.rsi_has(t, 'embrague|embragues|disco de embrague|disco emb|plato de embrague|placa emb|collarin|crapodina de embrague|kit de embrague|cable de embrague|bomba de embrague|bombin|caja de cambios|caja veloc|soporte caja|selector cambios|selectora|kit rep selector|patin horquilla caja|horquilla caja|rodillo caja|palanca de cambios|palanca|comando|cambio|cruceta|crucetas|homocinetica|homocineticas|homoc|semieje|semiejes|palier|paliers|acople palier|manchon de palier|manchon de paliers|punta pinon|pinon|triceta|cardan|diferencial|tripoide|fuelle caja|fuelle homoc|engranaje caja|transmision|transmisiones') THEN
    RETURN 'transmision-embrague';
  END IF;

  IF public.rsi_has(t, 'amortiguador|amortiguadores|rotula|rotulas|buje|bujes|cazoleta|cazoletas|parrilla|parrillas|brazo de suspension|brazo auxiliar|brazo pitman|brazo libre|barra estabilizadora|barra central|barra dir|bieleta|bieletas|terminal de direccion|terminales de direccion|extremo dir|cremallera|caja de direccion|bomba de direccion|bomba hidraulica|direccion hidraulica|extremo de direccion|fuelle crem|resorte susp|precaps|precap|suspension|direccion') THEN
    RETURN 'suspension-direccion';
  END IF;

  IF public.rsi_has(t, 'ruleman|rulemanes|rodamiento|rodamientos|rodam|reten|retenes|sello|sellos|oring|o ring|crapodina|crapodinas|maza|masa|maza de rueda|masa de rueda|cubo de rueda|punta eje|eje trasera') THEN
    RETURN 'rodamientos-retenes';
  END IF;

  IF public.rsi_has(t, 'paragolpe|paragolpes|parachoque|parachoques|espejo|espejos|manija|manijas|moldura|molduras|guardabarro|guardabarros|barrero|barreros|capot|capota|baul|porton|puerta|puertas|cerradura|cerraduras|vidrio|cristal|limpiaparabrisas|limpiaparabrizas|limpia parabrisas|limpia parabriza|limpia parabrizas|lava parabrisas|parabrisas|parabrisa|parabriza|parabrizas|burlete|burletes|agua preparada limpiaparabrisas|liquido lava parabrisas|sapito lava parabrisas|escobilla|escobillas|brazo limpiaparabrisas|brazo limpia parab|motor limpiaparabrisas|temporizador|levantavidrio|levantavidrios|alfombra|alfombras|emblema|emblemas|accesorio|accesorios|cubre volante|volante chico|volante grande|parasol|sop parasol|taza|tazas|centro de llanta|centro llanta|llavero|llaveros|tapon de rueda|spoiler|rejilla|grilla|linga remolque|remolque|carcasa ganchera|bandeja luneta') THEN
    RETURN 'carroceria-accesorios';
  END IF;

  IF public.rsi_has(t, 'aceitera|limpiador|limpia inyector|limpia inyectores|limpia contacto|limpia contactos|limpia manos|limpia tapizados|desengrasante|silicona|shampoo|cera|autopolish|lustre|pulir|pulidor|pano|pano limpiador|pasta pulir|perfume|revividor|freesur|repuesto dosificador|azul prusia|lampazo|escobillon|toalla papel|rollo quimico|sellador|pegamento|adhesivo|traba rosca|abrazadera|abrazaderas|precinto|precintos|bulon|bulones|tuerca|tuercas|tornillo|tornillos|arandela|arandelas|herramienta|herramientas|bocallave|pinza|alicate|alikate|destornillador|destornilladores|llave francesa|llave combinada|juego 12 llaves|llave torx|llave tubo|mango de fuerza|soplete|calibre|tester|probador|extractor|criquet|gato hidraulico|guante|guantes|hoja cierra|hoja sierra|amoladora|aspiradora|inserto|insertos|cepillo|pistola de calor|servis completo|alineacion|alinear|balancear rueda|bandeja adicional|caja multiuso|kit limpieza|botiquin|caballete') THEN
    RETURN 'herramientas-mantenimiento';
  END IF;

  IF public.rsi_has(t, 'piston|pistones|aro|aros|anillo|anillos|camisa|camisas|sub conj|bancada leva|arbol auxiliar|arbol de leva|arbol de levas|biela|bielas|ciguenal|cojinete|cojinetes|metal|metales|junta|juntas|tapa de cilindros|tapa cil|tapa frente block|block|turbo|valvula|valvulas|valv|pasta esmerilar valv|botador|botadores|taque|taques|carter|bomba de aceite|soporte de motor|soportes de motor|volante motor|multiple de admision|admision|avance al vacio|tapon tacita|racord tapa cil|peg power engine|motor|motores|venteo|engranaje leva|engranaje mando') THEN
    RETURN 'motor';
  END IF;

  RETURN 'otros-repuestos';
END;
$$;

UPDATE products AS p
SET category_id = c.id
FROM categories AS c
WHERE c.slug = public.rsi_category_slug(p.name, p.description, p.brand, p.sku)
  AND p.category_id IS DISTINCT FROM c.id;

COMMIT;