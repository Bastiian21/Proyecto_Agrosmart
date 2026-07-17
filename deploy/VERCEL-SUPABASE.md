# Despliegue en Vercel + Supabase

Alternativa a `AWS-DEPLOY.md` (EC2 + RDS). Un solo proyecto de Vercel sirve el
frontend estático y el backend como función serverless; Supabase aporta PostgreSQL
y el almacenamiento de imágenes.

```
Navegador ──> Vercel ──┬── / (estático)      -> frontend-agrosmart/dist
                       └── /api/*            -> api/index.js (Express serverless)
                                                   │
                                                   ├── PostgreSQL  -> Supabase (pooler :6543)
                                                   └── Imágenes    -> Supabase Storage (bucket)
```

## 1. Crear el proyecto en Supabase

1. https://supabase.com → **Start your project** → entrar con GitHub.
2. **New project**: nombre `agrosmart`, región **South America (São Paulo)**.
3. **Guardar la contraseña de la base de datos**: no se puede recuperar, solo resetear.

> **Plan gratuito**: el proyecto se **pausa tras ~1 semana sin actividad** y hay que
> reactivarlo a mano desde el panel. Si la evaluación se revisa días después, entrar
> antes al dashboard y despausarlo, o la demo aparecerá caída.

## 2. Importar el esquema

En el panel de Supabase → **SQL Editor** → **New query** → pegar el contenido
completo de `deploy/database-full.sql` → **Run**.

Crea las 10 tablas con sus datos semilla (productos, cursos y el usuario admin).
El dump no trae `OWNER TO`, `CREATE EXTENSION` ni `GRANT`, que es lo que suele
fallar al importar dumps de PostgreSQL a Supabase.

Verificar: **Table Editor** debería listar `productos`, `ventas`, `usuarios`,
`cursos`, `solicitudes`, `detalle_ventas`, `inscripciones_cursos` y las 3 tablas
`producto_detalle_*`.

## 3. Crear el bucket de imágenes

**Storage** → **New bucket**:
- Name: `agrosmart`
- **Public bucket: activado** (las URLs se muestran directo en el catálogo).

Sin esto, `POST /api/productos/:id/imagen` responde 503.

## 4. Obtener las credenciales

**Connection string** (Project Settings → Database → Connection string → **URI**):

Usar la del **Transaction pooler (puerto 6543)**, NO la conexión directa al 5432.
Cada invocación serverless abre su propia conexión y el pooler es el que evita
agotar el límite de conexiones de Postgres.

```
postgresql://postgres.<ref>:<PASSWORD>@aws-0-sa-east-1.pooler.supabase.com:6543/postgres
```

**API keys** (Project Settings → API):
- `Project URL` → `SUPABASE_URL`
- `service_role` (secret) → `SUPABASE_SERVICE_ROLE_KEY`

> La `service_role` salta las políticas RLS. Es de servidor: nunca ponerla en el
> frontend ni con prefijo `VITE_`, o cualquiera podría escribir en el bucket.

## 5. Subir el repo a GitHub

```bash
git add -A
git commit -m "Preparar despliegue en Vercel + Supabase"
git push origin main
```

## 6. Crear el proyecto en Vercel

1. https://vercel.com/signup → entrar con GitHub.
2. **Add New → Project** → importar el repo.
3. **Root Directory: dejar la raíz del repo** (no `frontend-agrosmart`). El
   `vercel.json` de la raíz ya define el build del frontend y el rewrite de `/api`.
4. Framework Preset: **Other** (lo fuerza `vercel.json` con `"framework": null`).
5. Agregar las variables de entorno (paso 7) y **Deploy**.

## 7. Variables de entorno en Vercel

Project Settings → **Environment Variables** (marcar Production, Preview y Development):

| Variable | Valor |
|---|---|
| `DATABASE_URL` | connection string del pooler (puerto **6543**) |
| `JWT_SECRET` | el mismo secreto del `.env` local (o uno nuevo y largo) |
| `SUPABASE_URL` | Project URL de Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | key `service_role` |
| `SUPABASE_BUCKET` | `agrosmart` |
| `CHILEX_COBERTURA_API_KEY` | igual que en el `.env` local |
| `CHILEX_COTIZADOR_API_KEY` | igual que en el `.env` local |
| `CHILEX_ENVIOS_API_KEY` | igual que en el `.env` local |
| `CORS_ORIGIN` | `https://<tu-app>.vercel.app` |
| `BACKEND_URL` | `https://<tu-app>.vercel.app` |
| `FRONTEND_URL` | `https://<tu-app>.vercel.app` |

**No definir `DB_SSL`.** Ausente = SSL activo, que es lo que Supabase exige.
`DB_SSL=false` es solo para el PostgreSQL local, que no soporta SSL.

**Huevo y gallina con la URL**: no se conoce el dominio hasta el primer deploy.
Desplegar una vez, copiar la URL asignada, cargar `CORS_ORIGIN`/`BACKEND_URL`/
`FRONTEND_URL` y **redesplegar** (Deployments → ⋯ → Redeploy). Sin esto, el retorno
de Webpay redirige a `localhost` y el pago no cierra.

## 8. Verificar el despliegue

```bash
curl https://<tu-app>.vercel.app/api/productos          # 200 + JSON del catálogo
curl -X DELETE https://<tu-app>.vercel.app/api/productos/1   # debe dar 401
```

En el navegador: catálogo con productos, `/admin` con `admin@agrosmart.cl` /
`admin123`, y una subida de imagen desde la pestaña Imagen del Backoffice.

## 9. Migrar la imagen existente (opcional)

Hay una sola imagen histórica en `backend-agrosmart/uploads/productos/`, apuntada
por una fila de `productos` con `imagen_url = '/api/uploads/productos/...'`. Esa ruta
ya no existe en Vercel. Opciones: volver a subirla desde el Backoffice ya desplegado
(lo más simple), o subirla a mano al bucket y actualizar la fila.

## Notas

- **Cambiar el password del admin** antes de entregar: `admin123` está en texto
  plano en `sql/admin_user.sql`, que está versionado en el repo.
- **Webpay sigue en `Environment.Integration`** (credenciales de prueba de Transbank
  hardcodeadas en `webpayController.js`). No procesa pagos reales; para producción
  hay que cambiar a `Environment.Production` con códigos de comercio propios.
- **Chile Express** apunta a `testservices.chilexpress.cl`, cuyo subdominio a veces
  no resuelve. El modo de respaldo (`simulado: true`) hace que cotizar y listar
  comunas nunca bloqueen la compra.
- **Cold starts**: la primera petición tras un rato de inactividad tarda unos
  segundos (arranca la función y abre conexión a la BD). Es normal en serverless.
- `maxDuration` está en 30 s en `vercel.json`; el plan gratuito de Vercel permite
  hasta 60 s.
