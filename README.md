# Repuestos San Isidro

Catálogo React/Vite con Supabase Auth, base de datos y Storage.

## Desarrollo y comprobaciones

Requiere Node.js 22.12 o posterior.

```sh
npm ci
cp .env.example .env
# Completar .env con la URL y clave pública del proyecto existente.
npm run dev
```

No cambiar de proyecto Supabase ni usar una clave `service_role`/secreta en
variables `VITE_*`: todo ese contenido es público en el navegador.

```sh
npm test
npm run typecheck
npm run lint
npm run build
npm audit
```

Las pruebas utilizan PostgreSQL local en memoria (PGlite), sin credenciales ni
conexiones a producción. `dist/` es el directorio de despliegue de Cloudflare.

## Seguridad y actualización sin pérdida de datos

**Antes de desplegar esta versión**, seguir [docs/SECURITY.md](docs/SECURITY.md).
La migración de seguridad requiere confirmar explícitamente los UUID de los
administradores existentes; si faltan, aborta sin modificar la base. Aplicar la
migración antes del frontend para no bloquear temporalmente el panel.
