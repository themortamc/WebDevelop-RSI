# Revisión de seguridad — 27 de septiembre de 2026

## Alcance y estado

Revisión del código, migraciones versionadas, configuración de despliegue y
árbol npm de WebDevelop-RSI. Correcciones implementadas en el repositorio y
probadas localmente. **No se aplicaron cambios a Supabase ni a la web de
producción**, no se borraron datos, no se revocaron sesiones, no se cambiaron
contraseñas, proveedores, claves ni vínculos de cuentas.

No se ha verificado la configuración real de Auth/Storage, las políticas
remotas añadidas fuera de Git, el proceso externo de Access ni el historial de
accesos. Esto no equivale a un pentest completo ni demuestra ausencia de otras
vulnerabilidades.

## Hallazgos y correcciones

| Prioridad | Hallazgo en el repositorio | Corrección |
| --- | --- | --- |
| Alta | Cualquier cuenta `authenticated` podía escribir/borrar catálogo y fotos y leer borradores. El frontend equiparaba sesión con administrador. Si el registro público está habilitado, una cuenta nueva obtiene esos permisos. | Lista privada de UUID aprobados, función `is_catalog_admin()` con `SECURITY DEFINER` y `search_path` vacío; políticas restrictivas para CRUD, borradores y fotos; panel verifica autorización en servidor. Ni email ni metadatos editables otorgan permisos. |
| Alta | `vehicle_brand_aliases` no habilitaba RLS. Con los grants habituales de Supabase, podía modificarse desde la API, afectando la extracción de marca/modelo. | RLS, lectura conservada para los triggers, escritura solo para administradores; revocación de `TRUNCATE`, `REFERENCES` y `TRIGGER` para los roles de navegador en las tres tablas. |
| Media | Texto del buscador interpolado directamente en `.or()`, también en actualizaciones masivas. Comas/paréntesis alteraban la gramática; comodines podían ampliar los productos afectados. No es una inyección SQL arbitraria ni permite saltarse RLS. | Constructor compartido con valores entre comillas, escapes PostgREST y regex literal `imatch`; los filtros de lectura y escritura usan la misma función. `%`, `_`, `*`, comillas y paréntesis se buscan como texto, no como operadores. |
| Media | Solo el navegador limitaba las subidas a 5 MB; aceptaba cualquier `image/*` y usaba la extensión proporcionada por el usuario. | Restricciones de MIME y tamaño en el bucket, formatos raster explícitos en UI y extensión según MIME. Conserva todas las fotos existentes. No sustituye un escáner antivirus ni valida la firma binaria del archivo. |
| Alta/media/baja | `npm audit` inicial: 21 alertas (13 altas, 5 moderadas, 3 bajas), incluyendo `ws`, Vite/esbuild y herramientas de desarrollo. | Actualización del lockfile y herramientas compatibles entre sí, Vite 7 y plugin React 5. Auditoría final: **0 vulnerabilidades conocidas** a la fecha de revisión. Requiere Node 22.12+. |
| Defensa adicional | Sin cabeceras de endurecimiento versionadas; una apertura de WhatsApp conservaba el opener. | `public/_headers`: CSP, protección contra enmarcado, `nosniff`, política de referer y permisos; WhatsApp con `noopener,noreferrer`. Exclusión de `.env.*` salvo plantilla. |

La CSP permite HTTPS/WSS para conexiones para no romper dominios personalizados
Supabase e imágenes externas existentes. Puede estrecharse a los orígenes reales
tras inventariarlos. Prohíbe scripts inline/eval, plugins y enmarcado del sitio.
`style-src 'unsafe-inline'` se conserva por estilos React. `_headers` se aplica
con Cloudflare Static Assets; otros hosts necesitan configuración equivalente.

## Despliegue seguro: conservar administradores e integraciones

1. Hacer una copia de seguridad/snapshot con los mecanismos habituales y revisar
   el historial remoto de migraciones. **No usar `db reset`, no recrear el
   proyecto ni reproducir todas las migraciones antiguas en producción**: algunas
   actualizan categorizaciones. La migración de categorización antigua referencia
   funciones (`rsi_normalize_text`, `rsi_has`) que no se definen en este checkout;
   no se han inventado ni reemplazado.
2. En el panel Supabase del **proyecto existente**, identificar los UUID de todos
   los administradores legítimos. También inventariar cómo autentica Access:
   - `service_role` del lado servidor conserva su bypass de RLS y no se rota;
   - una cuenta técnica `authenticated` debe incluirse en la lista explícita
     para mantener la sincronización (esta versión comparte el rol del catálogo);
   - una integración anónima no debe tener escritura: requiere autorización
     segura en el servidor antes de continuar.
   No incluir indiscriminadamente a todos los usuarios ni aprobar por dominio
   de correo. No enviar contraseñas ni claves a chats ni incorporarlas a Git.
3. Como propietario de la base, ejecutar **en la misma conexión**:

   ```sql
   -- Sustituir por UUID reales verificados; no son correos ni contraseñas.
   SET rsi.admin_user_ids = 'UUID_ADMIN_1,UUID_ADMIN_2,UUID_CUENTA_TECNICA';
   -- Inmediatamente a continuación, ejecutar el contenido de:
   -- supabase/migrations/20260927000000_security_hardening.sql
   RESET rsi.admin_user_ids;
   ```

   En SQL Editor se puede pegar el `SET`, el contenido completo del archivo y
   el `RESET` en una sola ejecución. El archivo incluye `BEGIN`/`COMMIT`. Si se
   usa un runner de migraciones, proporcionar el ajuste en su misma sesión; no
   configurarlo en una conexión diferente. Registrar la migración en el historial
   mediante el flujo habitual si se aplica manualmente; no reejecutar pendientes
   anteriores a ciegas.

   Si la lista está vacía en la primera aplicación o un UUID no existe, se aborta
   **toda la transacción**, sin cambiar cuentas ni permisos. Tras un error, hacer
   `ROLLBACK` en esa conexión antes de reintentar. La migración es idempotente:
   volver a aplicarla no elimina autorizaciones ya aprobadas.
4. Probar con una sesión de un administrador existente: `is_catalog_admin()`
   debe devolver `true`, los borradores deben ser visibles y la edición/subida
   debe funcionar. Probar la integración Access en un registro de prueba
   controlado. Comprobar públicamente que el catálogo y las fotos siguen visibles.
5. Solo después desplegar `npm ci && npm run build` usando **las mismas** variables
   del proyecto actual. No modificar `auth.users`, `auth.identities`, proveedores,
   contraseñas ni claves para esta actualización. No se obliga a volver a iniciar
   sesión: la función de permisos evalúa el UUID de la sesión existente.
6. Verificar las cabeceras HTTP en el despliegue y, desde un cliente anónimo y uno
   autenticado no aprobado, que no se leen borradores ni se puede escribir por API.
   Verificar también el rechazo de una subida >5 MB y de SVG por Storage real.

**Importante:** desplegar el frontend antes de la migración hará que el panel
muestre “Acceso administrativo no disponible”, porque falla cerrado. La sesión
no se borra. Si falta un administrador, añadir su UUID verificado desde SQL Editor:

```sql
INSERT INTO rsi_private.catalog_admins(user_id)
VALUES ('UUID_EXISTENTE_VERIFICADO')
ON CONFLICT (user_id) DO NOTHING;
```

Después pulsar “Reintentar”. No abrir de nuevo las políticas a todas las cuentas
para solucionar un problema de acceso. La tabla privada no se expone a los roles
del navegador ni se puede editar desde el panel público.

## Preservación de datos

La nueva migración no elimina tablas, productos, categorías, alias, archivos ni
cuentas; no hace actualizaciones masivas de catálogo. Añade una tabla de permisos,
una función y políticas de seguridad. Solo modifica en Storage el límite de
nuevas subidas y los MIME permitidos del bucket `product-images`: conserva su
nombre, visibilidad pública, objetos y URLs. No afecta políticas de otros buckets.
La protección de precios y la extracción de vehículos se conservan. Las cuentas
no aprobadas siguen existiendo y autenticándose, pero ya no administran el catálogo.

## Validación realizada

- `npm test`: 10 pruebas aprobadas (incluidos subtests). PostgreSQL en memoria
  mediante PGlite, con roles/esquemas que simulan Supabase y migraciones existentes
  relevantes. Verifica abortos atómicos, idempotencia, contenido idéntico tras
  migrar, RLS de anónimo/usuario/admin/service_role, protección de la lista privada,
  metadatos falsificados, movimiento entre buckets, precios, permisos heredados
  demasiado amplios, filtros literales y validación de archivos.
- `npm run typecheck`, `npm run lint` y `npm run build`.
- `npm audit`: 0 alertas conocidas después de actualizar.

Las pruebas no arrancan PostgREST ni el servicio HTTP de Storage: la gramática
se comprueba localmente y los patrones se ejecutan en PostgreSQL; la validación
HTTP de MIME/tamaño requiere la comprobación de integración del paso 6. Tampoco
reproducen la categorización heredada cuyas dependencias faltan en el repositorio.
El build presenta una advertencia de tamaño de bundle, no un error de seguridad.

## Recomendaciones operativas pendientes de comprobar

- Revisar si el registro público es necesario; deshabilitarlo si no lo es, sin
  eliminar cuentas existentes. RLS no depende de esta medida para proteger datos.
- Verificar rate limits de Auth, MFA para administradores, políticas de contraseña,
  correos de recuperación y URLs de redirección autorizadas.
- Examinar registros de accesos y cambios previos si hubo exposición. El parche
  previene accesos futuros; no determina si hubo modificaciones anteriores.
- Mantener las claves privadas solo en servidores y actualizar dependencias
  periódicamente. No se encontraron claves privadas literales en el checkout
  inspeccionado; no se ha auditado todo el historial Git ni secretos del despliegue.
