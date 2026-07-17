# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Descripción del Proyecto

AgroSmart es una plataforma de e-commerce agrícola full-stack con un portal de clientes y un backoffice de administración. Usa un backend y frontend separados bajo la misma raíz del monorepo.

## Comandos de Desarrollo

### Backend (puerto 3000)
```bash
cd backend-agrosmart
node index.js
```
No hay recarga automática — reiniciar manualmente tras cambios en el servidor.  
**Siempre iniciar con `run_in_background: true`** en el PowerShell tool. Nunca abrir ventanas CMD externas.

### Frontend (puerto 5173)
```bash
cd frontend-agrosmart
pnpm dev        # servidor de desarrollo con recarga en caliente
pnpm build      # compilación de producción
pnpm lint       # ESLint
pnpm preview    # previsualización de la compilación de producción
```

**Windows:** Para matar procesos node usar PowerShell (`Stop-Process -Id <pid> -Force`). `pkill` desde Git Bash falla silenciosamente en Windows. Para encontrar el PID: `Get-NetTCPConnection -LocalPort 5173 -State Listen`.

### Pruebas (solo backend)
Jest + supertest, en `backend-agrosmart/tests/`. **No son pruebas unitarias pese al comentario en los archivos: son pruebas de integración que hacen HTTP contra `http://localhost:3000` hardcodeado y escriben en la base de datos real.** El backend debe estar corriendo antes de invocarlas, o todas fallan por conexión rechazada.

```bash
cd backend-agrosmart
pnpm test                            # jest --runInBand --verbose (todo)
npx jest tests/auth.test.js          # un solo archivo
npx jest -t "CA027"                  # un solo caso por nombre
```
`--runInBand` es obligatorio: los tests comparten estado de la base de datos (stock de productos, emails únicos) y en paralelo se pisan entre sí. No hay `jest.config` — se usan los defaults.

Los archivos mapean componentes a los casos de prueba de la Evaluación 3 (`3.1.4 Casos de Prueba - AgroSmart.xlsx`): `auth.test.js` = C1/CA001-CA006, `ventas.test.js` = C5/CA025-CA030, `envios.test.js` = C8/CA044-CA045. Al agregar tests, mantener la convención de nombre `CAxxx - debería ...`.

**Pruebas de autorización añadidas fuera del Excel**: `CA006c`/`CA006d` (auth) y `AUTZ01`-`AUTZ05` (ventas) cubren el middleware JWT. No están en el documento de casos de prueba — si hay que entregar ese Excel, considerar agregarlas.

Las suites hacen login para obtener token: `ventas.test.js` se loguea como admin (`admin@agrosmart.cl` / `admin123`, override con `TEST_ADMIN_EMAIL`/`TEST_ADMIN_PASSWORD`) para crear el producto de prueba y leer `/stats`, y como cliente para registrar ventas. **Si `sql/admin_user.sql` no se corrió en la base, el `beforeAll` falla con un mensaje explícito.** Ojo: el registro **no** devuelve token, solo el login.

El producto de prueba que crea `ventas.test.js` **queda en la base**: CA025 le asocia una venta y la FK impide borrarlo en el `afterAll`. Cada corrida completa deja uno más.

`tests/helpers.js` genera RUTs chilenos válidos (con dígito verificador calculado) y sufijos aleatorios para emails/SKUs, porque `usuarios.rut` y `usuarios.email` son únicos y los tests no limpian lo que insertan — cada corrida deja usuarios nuevos en la BD.

El frontend no tiene pruebas.

### Despliegue (`deploy/`)
Hay **dos destinos posibles**; el objetivo actual es Vercel + Supabase.

```
deploy/VERCEL-SUPABASE.md — guía Vercel (frontend + función serverless) + Supabase (BD + Storage)
deploy/AWS-DEPLOY.md      — guía AWS Academy (RDS PostgreSQL + EC2 + Nginx + PM2)
deploy/database-full.sql  — dump completo (esquema + datos semilla) para inicializar la BD
deploy/setup-aws.sh       — script de instalación para el EC2
```

**Vercel** (destino actual): un solo proyecto sirve `frontend-agrosmart/dist` como
estático y `api/index.js` como función serverless. Redeploy = `git push` (Vercel
compila solo). Config en `vercel.json` de la raíz.

**AWS** (montaje anterior): `git pull` en el EC2, `pnpm install` + `pm2 restart
agrosmart-api`, `pnpm build` en el frontend (servido por Nginx).

#### Restricciones de serverless (por qué el código está así)
En Vercel no hay proceso persistente ni disco escribible. Tres consecuencias que
NO se deben revertir:
- **`index.js` solo llama a `app.listen()` bajo `require.main === module`** y exporta
  la app. `api/index.js` la importa. Si se vuelve a llamar `listen()` incondicionalmente,
  la función serverless deja de responder.
- **`middlewares/upload.js` usa `multer.memoryStorage()`**, no `diskStorage`. La versión
  anterior además hacía `fs.mkdirSync()` al importar el módulo, lo que reventaba la carga
  de toda la API en un FS de solo lectura.
- **El `package.json` de la raíz duplica las dependencias del backend.** Vercel instala
  las deps de la raíz y los `require()` de `backend-agrosmart/` resuelven hacia arriba
  hasta ese `node_modules`. Al agregar una dependencia al backend, **hay que agregarla
  también en la raíz** o la función falla en producción aunque local funcione.

## Configuración del Entorno

`backend-agrosmart/.env` — variables actuales:
```
PORT=3000
DB_USER=
DB_HOST=
DB_NAME=
DB_PASSWORD=
DB_PORT=5432
JWT_SECRET=
CORS_ORIGIN=http://localhost:5173
BACKEND_URL=http://localhost:3000
FRONTEND_URL=http://localhost:5173

# Chile Express (Azure API Management — una key por grupo de servicios)
CHILEX_COBERTURA_API_KEY=4e77b3b3ec174990bb1e85d845b2c991
CHILEX_COTIZADOR_API_KEY=f6f5f0c256174395ade456720059c7ed
CHILEX_ENVIOS_API_KEY=147eceaeca9d4999b88c0a2ae15a9023
CHILEX_BASE_URL=https://testservices.chilexpress.cl/v1   # omitir en producción → usar URL prod
```
`DB_PORT` y `CHILEX_BASE_URL` no están en el `.env` actual — ambas caen a su valor por defecto (`5432` vía `pg`, y la URL de pruebas en `chileexpressService.js`).

Variables adicionales que lee el backend:
```
DB_SSL=false                  # solo en local; ver abajo
DATABASE_URL=                 # connection string; si está, gana sobre DB_USER/DB_HOST/...
DB_POOL_MAX=                  # opcional; default 10 local / 2 en Vercel
SUPABASE_URL=                 # Storage de imágenes
SUPABASE_SERVICE_ROLE_KEY=    # key de servidor — NUNCA exponer al frontend
SUPABASE_BUCKET=agrosmart
```

**`DB_SSL` — SSL activo por defecto.** `config/db.js` usa `ssl: process.env.DB_SSL === 'false' ? false : { rejectUnauthorized: false }`, es decir, **solo `DB_SSL=false` exacto lo desactiva**; ausente o cualquier otro valor deja SSL encendido. Supabase y RDS lo exigen. Contra el PostgreSQL local, que no lo soporta, el backend muere al arrancar con `The server does not support SSL connections` — por eso el `.env` de desarrollo lleva `DB_SSL=false` y en Vercel la variable simplemente no se define.

`config/db.js` detecta `process.env.VERCEL` para achicar el pool y omitir el chequeo de conexión del arranque (agregaría una conexión por cold start solo para loguear).

## Arquitectura

### Backend (`backend-agrosmart/`)
Servidor API con Express 5 + PostgreSQL (`pg`). Módulos CommonJS.

```
config/db.js            — Singleton del pg Pool, importado por todos los modelos
controllers/            — Lógica de negocio (un archivo por recurso)
models/                 — Consultas SQL directas (sin ORM)
routes/                 — Routers Express que conectan los controladores
middlewares/upload.js   — multer; enruta imágenes a uploads/productos/ o uploads/cursos/
services/chileexpressService.js — cliente para la API de Chile Express
uploads/                — Archivos estáticos servidos en /api/uploads
migrations/             — Scripts SQL ejecutados manualmente en la BD
sql/                    — Scripts de seed/setup de un solo uso (ver abajo)
tests/                  — Jest + supertest contra el servidor en vivo
```

`sql/` son scripts idempotentes-a-mano, ya ejecutados, que se corren manualmente en DBeaver (no hay runner de migraciones):
- `admin_user.sql` — crea el admin del backoffice (`admin@agrosmart.cl` / `admin123`, hash bcrypt ya generado). Hace `DELETE` del email antes de insertar.
- `inscripciones_cursos.sql` — crea la tabla `inscripciones_cursos`. **Empieza con `DROP TABLE IF EXISTS ... CASCADE`** — no re-ejecutar sobre una BD con datos.
- `cursos_seed.sql` — datos de ejemplo de cursos.

Rutas de la API:
- `POST /api/auth/registro`, `POST /api/auth/login` — Autenticación con JWT (hash con bcryptjs). El login devuelve `usuario: { id, nombre, email, telefono, rol, direccion_region, direccion_comuna, direccion_county_code, direccion_calle, direccion_numero, direccion_depto }`, precargado en `localStorage.usuarioAgrosmart`
- `PUT /api/auth/direccion/:id` — guarda/actualiza la dirección principal del cliente (llamado desde `AddressModal` cuando el checkbox "Guardar como dirección principal" está marcado)
- `GET|POST|PUT|DELETE /api/productos` — CRUD de productos; `POST /api/productos/:id/imagen`, `DELETE /api/productos/:id/imagen` para gestión de imagen
- `GET|POST|PUT|DELETE /api/cursos` — CRUD de cursos de capacitación
- `GET|POST /api/ventas`, `GET /api/ventas/stats`, `GET /api/ventas/productos|cursos`
- `GET /api/ventas/mis-pedidos/:usuario_id` — pedidos del cliente autenticado (con items)
- `POST|GET|PUT /api/solicitudes` — Solicitudes de servicio
- `POST /api/webpay/iniciar`, `POST|GET /api/webpay/retorno`, `POST /api/webpay/confirmar` — Transbank WebpayPlus
- `POST /api/envios/cotizar` — cotización de envío Chile Express `{ ciudad, pesoKg, valorDeclarado }`
- `GET /api/envios/comunas?region=13` — listado de comunas por región
- `GET /api/envios/rastrear/:od` — rastreo en tiempo real de un envío

### Autenticación y autorización (`middlewares/auth.js`)

El login firma un JWT `{ id, rol }` con 24 h de vigencia. `middlewares/auth.js` lo verifica **en el servidor** — la protección por `localStorage` del Backoffice es solo cosmética y no protege la API.

- `verifyToken` — exige `Authorization: Bearer <token>` válido; deja el payload en `req.usuario`.
- `requireAdmin` — además exige `rol === 'admin'`.
- `requireSelfOrAdmin(param)` — el `:param` de la URL debe ser el propio usuario del token, o admin.

Reparto por ruta:

| Acceso | Rutas |
|---|---|
| **Público** | `POST /api/auth/registro`, `POST /api/auth/login`, todos los `GET` de `/api/productos` y `/api/cursos`, todo `/api/envios/*`, todo `/api/webpay/*` |
| **`verifyToken`** (cliente logueado) | `POST /api/ventas`, `POST /api/solicitudes` |
| **`requireSelfOrAdmin`** | `PUT /api/auth/direccion/:id`, `GET /api/ventas/mis-pedidos/:usuario_id` |
| **`requireAdmin`** | `POST/PUT/DELETE` de `/api/productos` y `/api/cursos` (incl. imagen), `GET /api/ventas`, `/api/ventas/stats`, `/api/ventas/productos`, `/api/ventas/cursos`, `GET /api/solicitudes`, `PUT /api/solicitudes/:id` |

**Webpay debe seguir público**: Transbank hace `POST /api/webpay/retorno` desde sus servidores, sin token. Los `GET` del catálogo también, o el portal del cliente deja de cargar sin login.

`requireSelfOrAdmin` cierra dos IDOR que existían: cualquiera podía leer los pedidos de otro (`mis-pedidos/:usuario_id`) o sobrescribir su dirección (`direccion/:id`) con solo cambiar el id de la URL.

**Frontend** (`src/services/api.js`): `adminFetch` y `clienteFetch` envuelven `fetch` e inyectan el token desde `localStorage`. Las claves son distintas y conviven en el mismo navegador: `adminTokenAgrosmart` (AdminLogin) y `tokenAgrosmart` (ClienteLogin). `Backoffice.jsx` usa `adminFetch` en **todas** sus llamadas; `ClienteVerificarPago`, `ClienteMisPedidos`, `ClienteSolicitud` y `AddressModal` usan `clienteFetch`. Los wrappers no tocan `Content-Type` a propósito: la subida de imagen manda `FormData` y el navegador debe poner el boundary multipart.

Al agregar una ruta de escritura, aplicarle `requireAdmin`/`verifyToken` y llamarla desde el frontend con el wrapper correspondiente.

### Esquema de Base de Datos

**Tabla `productos`** — columnas completas:
```sql
id, nombre, sku, categoria, precio_clp, precio_oferta, stock, disponible, imagen_url, imagen_alt,
marca, modelo, peso, garantia, unidad_medida, ficha_tecnica, descripcion,
descripcion_corta, precio_anterior, destacado BOOLEAN DEFAULT false,
nuevo BOOLEAN DEFAULT false, etiquetas TEXT,
tiempo_entrega VARCHAR(100), documento_url TEXT,
pais_origen VARCHAR(100), certificaciones TEXT, stock_minimo INT DEFAULT 5
```

Existen **3 tablas de detalle** con relación 1:1 a `productos` (ON DELETE CASCADE):
- `producto_detalle_tecnologia` — conectividad, frecuencia_banda, sensores, protocolos, alimentacion, consumo_energia, dimensiones, peso_dispositivo, temperatura_operacion, humedad_operacion, certificaciones_tecnicas, idioma_interfaz, app_movil
- `producto_detalle_maquinaria` — potencia_motor, tipo_motor, capacidad_trabajo, ancho_trabajo, velocidad_trabajo, peso_maquina, dimensiones_maquina, traccion_requerida, nivel_ruido, consumo_combustible, capacidad_deposito, sistema_corte, tipo_transmision
- `producto_detalle_insumo` — composicion, concentracion, ingrediente_activo, modo_accion, cultivos_recomendados, dosis_recomendada, periodo_carencia, forma_aplicacion, compatibilidad, toxicidad, clase_toxicologica, almacenamiento, presentacion, registro_isa, vida_util

`getDetailTable(categoria)` en `productoModel.js` resuelve la tabla correcta con normalización NFD. `getProductoById` adjunta el detalle en `prod.detalle`. `upsertDetalle` hace INSERT o UPDATE según si ya existe fila.

**Tabla `ventas`** — columnas adicionales (migración `migrations/001_envios_pedidos.sql` ya ejecutada):
```sql
direccion_envio    JSONB           -- { calle, numero, depto, ciudad, region, codigo_postal, nombre_destinatario, email, telefono, county_code }
costo_envio        INT DEFAULT 0
tracking_code      VARCHAR(100)    -- OD de Chile Express
tracking_url       TEXT
fecha_entrega_estimada DATE
```
`metodo_entrega` puede ser `'Chile Express'` o `'Retiro en Tienda'`.  
`estado` puede ser: `'Pendiente de Retiro'`, `'En Preparación'`, `'Despachado'`, `'En Tránsito'`, `'Entregado'`, `'Completada'`, `'Cancelada'`.

**Tabla `usuarios`** — columnas de dirección principal (migración `migrations/002_direccion_usuario.sql` ya ejecutada):
```sql
direccion_region      VARCHAR(10)   -- código de región (ver REGIONES_CHILE en AddressModal.jsx)
direccion_comuna      VARCHAR(100)  -- countyName de Chile Express
direccion_county_code VARCHAR(20)   -- countyCode de Chile Express, usado directo en /api/envios/cotizar
direccion_calle       VARCHAR(200)
direccion_numero      VARCHAR(20)
direccion_depto       VARCHAR(50)
```
Se completan la primera vez que el cliente guarda una dirección en `AddressModal` (checkbox "Guardar como dirección principal"); antes de eso vienen `null`.

Columnas de identidad (`usuarioModel.createUser`): `nombre_completo`, `rut`, `email`, `telefono`, `password_hash`, `rol` (default `'Agricultor'`; el admin usa `'admin'`). **`rut` y `email` son únicos** — de ahí los helpers aleatorios en los tests. Ojo con el desajuste de nombres: la BD guarda `nombre_completo`, `POST /api/auth/registro` lo recibe con ese mismo nombre, pero el objeto `usuario` del login y `localStorage.usuarioAgrosmart` exponen la propiedad como `nombre`.

**Tabla `inscripciones_cursos`** (`sql/inscripciones_cursos.sql`) — registra la venta de cursos:
```sql
id, venta_id INT REFERENCES ventas(id) ON DELETE SET NULL, usuario_id INT REFERENCES usuarios(id),
curso_id INT REFERENCES cursos(id), cantidad INT DEFAULT 1, precio_pagado NUMERIC(10,2) DEFAULT 0,
fecha_inscripcion TIMESTAMP DEFAULT CURRENT_TIMESTAMP, estado VARCHAR(30) DEFAULT 'Inscrito'
```

### Chile Express (`services/chileexpressService.js`)
Autenticación: **Azure API Management** — header `Ocp-Apim-Subscription-Key`, una key distinta por grupo de servicios (`CHILEX_COBERTURA_API_KEY`, `CHILEX_COTIZADOR_API_KEY`, `CHILEX_ENVIOS_API_KEY`). **No es OAuth2.**

Funciones exportadas: `getComunas(regionCode)`, `buscarComuna(ciudad)`, `cotizar(countyCode, pesoKg, valorDeclarado)`, `crearGuia({ ventaId, destinatario, direccionDestino, pesoKg, valorDeclarado, serviceType })`, `rastrear(od)`.

Origen configurado: AgroSmart · Av. Libertador Bernardo O'Higgins 1234 · Rancagua · countyCode: `'RANG'`.  
La URL base lee `process.env.CHILEX_BASE_URL` con fallback a `https://testservices.chilexpress.cl/v1`. **Ese subdominio de pruebas puede no resolver por DNS** dependiendo de la red (confirmado: falla incluso cuando `chilexpress.cl` normal sí resuelve) — no asumir que un error ahí es un bug del código.

**Modo de respaldo (`simulado: true`)**: `getComunas` y `cotizar` nunca lanzan si Chile Express no responde — devuelven datos locales (`COMUNAS_FALLBACK` por región, tarifa estimada por peso/valor declarado en `cotizarSimulado`) y marcan la respuesta con `simulado: true`. El frontend (`AddressModal`, `ClienteCheckout`) muestra un aviso informativo (no bloqueante) cuando esto ocurre, para que el flujo de compra nunca se bloquee por la disponibilidad del ambiente de pruebas de Chile Express. `buscarComuna` igual nunca retorna `null`: sintetiza un `countyCode` con `slugCode(nombre)` si no hay match real. `getComunas` devuelve `{ comunas, simulado }` (no un array plano).

### Patrón de Subida de Imágenes (Supabase Storage)
`multer` (`middlewares/upload.js`) usa **`memoryStorage`**: valida MIME (jpg/png/webp/gif, máx 5 MB) y deja el archivo en `req.file.buffer`. Desde ahí `services/storageService.js` lo sube al bucket de Supabase y devuelve la URL pública, que se guarda en `productos.imagen_url`.

- `subirImagen(buffer, mimetype, extension, carpeta)` → URL pública. Nombra `<carpeta>/img-<timestamp>.<ext>`.
- `eliminarImagen(url)` → borra el objeto del bucket. **No lanza** si falla, e ignora URLs que no sean de este bucket (Unsplash, o las antiguas `/api/uploads/...`), para que limpiar la fila en la BD nunca quede bloqueado por el archivo.
- `estaConfigurado()` → si faltan `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY`, el endpoint responde **503** en vez de romper.

`subirImagenProducto` busca el producto **antes** de subir (para no dejar archivos huérfanos si el id no existe) y borra la imagen anterior tras reemplazarla.

**Solo existe upload para productos.** `cursoRoutes.js` no tiene ruta de imagen: los cursos usan URLs externas (Unsplash) cargadas por el semilla. La rama `tipo === 'cursos'` que existía en el multer viejo era código muerto.

`app.use('/api/uploads', express.static(...))` sigue en `index.js` solo para archivos locales heredados; en Vercel ese directorio no existe y la ruta simplemente da 404.

### Frontend (`frontend-agrosmart/`)
React 19 + Vite + React Router v7. Módulos ESM.

Vite redirige `/api` → `http://localhost:3000`. El alias `@` apunta a `src/`.

**Estilos:** Mezcla de CSS propio (archivos `.css` por componente/página) y Tailwind CSS 3 con `preflight: false`. Los iconos son `lucide-react`.

**Rutas en `App.jsx`:**
- `/` — `PortalSelector`
- `/cliente/home`, `/cliente/catalogo`, `/cliente/carrito`, `/cliente/checkout`, `/cliente/solicitud`, `/cliente/capacitacion`, `/cliente/login`, `/cliente/verificar-pago`, `/cliente/mis-pedidos` — portal cliente
- `/admin` — `AdminLogin`; `/admin/dashboard` — `Backoffice`

> `ClienteRegistro.jsx` existe pero **no tiene ruta en `App.jsx`** — no está conectada aún.

**Patrones clave:**
- `CartContext` (`src/context/CartContext.jsx`) — carrito global en `localStorage` clave `agrosmart_cart`; expone `useCart()`. Stock se valida contra `producto.stock`.
- `CarroLateral.jsx` — cajón lateral con `createPortal` en `document.body`.
- `ClienteCheckout.jsx` — página completa de checkout (no modal) con stepper **Carro › Entrega › Pago**. Paso "Entrega": Retiro en Tienda vs Chile Express; si es envío, muestra la dirección guardada del cliente (o botón "Agregar dirección" que abre `AddressModal`) y cotiza automáticamente. Paso "Pago": resumen + botón "Pagar con Webpay". Concentra toda la lógica de inicio de pago (antes vivía en `ClienteCarrito.handleCheckoutConfirm`).
- `AddressModal.jsx` — popup con `createPortal` para agregar/editar la dirección de despacho (Región → Comuna vía `GET /api/envios/comunas?region=`, Calle, Número, Depto). Si el checkbox "Guardar como dirección principal" está marcado, persiste con `PUT /api/auth/direccion/:id` y actualiza `localStorage.usuarioAgrosmart`.
- `src/services/` — wrappers fetch (`productoService.js`, `cursoService.js`). Retornan `[]` en error.
- Protección backoffice: `Backoffice.jsx` lee `localStorage.getItem('adminAgrosmart')`, redirige si `rol !== 'admin'`.
- Usuario cliente: `localStorage.getItem('usuarioAgrosmart')` → `{ id, nombre, email, telefono, rol, direccion_region, direccion_comuna, direccion_county_code, direccion_calle, direccion_numero, direccion_depto }` (los campos `direccion_*` vienen `null` hasta que el cliente guarda una dirección principal).

**Componentes landing** (`src/components/landing/`) — `ClienteHome`:
Hero, TrustBar, Categories, FeaturedCarousel, HowItWorks, Pillars, Testimonials, Courses, FinalCTA, Contact, Footer, Navbar, SectionHeading. Usa `Reveal.jsx` + `useReveal.js` (`react-intersection-observer`) y `MagneticButton.jsx`.

### Flujo de Compra Completo

1. **Carrito** (`ClienteCarrito.jsx`) → botón "Finalizar Compra" navega a `/cliente/checkout` (o pide login si no hay usuario)
2. **ClienteCheckout paso "Entrega"** → usuario elige Retiro en Tienda o Chile Express. Si es envío y el cliente ya tiene `direccion_calle` guardada, se precarga; si no, botón "Agregar dirección" abre `AddressModal` (Región/Comuna/Calle/Número/Depto)
3. Al confirmar la dirección se cotiza automáticamente contra `POST /api/envios/cotizar` (con `countyCode`) y se muestran las opciones de servicio
4. **ClienteCheckout paso "Pago"** → resumen del pedido (retiro o envío), botón "Pagar con Webpay"
5. `handlePagar` en `ClienteCheckout.jsx` arma `{ metodo, costo_envio, direccion_envio, service_type }`, guarda en `localStorage('ordenPendienteAgrosmart')`, llama `POST /api/webpay/iniciar`
6. Redirige a Transbank → regresa a `/cliente/verificar-pago?token_ws=...`
7. `POST /api/webpay/confirmar` → si OK → `POST /api/ventas` con todos los datos del pedido
8. Si es Chile Express, `ventaController.registrarVenta` intenta crear guía automáticamente vía `chileexpressService.crearGuia` (background, no bloquea respuesta)
9. **Mis Pedidos** (`/cliente/mis-pedidos`) → `GET /api/ventas/mis-pedidos/:usuario_id` → muestra historial con rastreo en tiempo real

### Catálogo de Clientes — `ClienteCatalogo.jsx`

**Hero** (`cat-hero-section`):
- Fondo en `.catalogo-page-container` con `background-attachment: fixed`, 3 capas: dots + gradiente direccional + `fondo-catalogo.png`
- El hero NO tiene fondo propio — la imagen viene del contenedor padre
- El tamaño lo controla el padding del contenido, **NO usar `min-height` + `align-items: center`**
- Pseudoelementos: `::before` (viñeta radial, z-index:1) y `::after` (degradado inferior, z-index:2)

**Controles** (`cat-controls-wrapper`): fuera del hero para evitar que `mask-image` los borre.

**Modal de detalle:** `abrirModal(id)` → GET `/api/productos/:id`. `.modal-left` (420px, imagen fill) + `.modal-right` (scroll). Visor lightbox con ESC.

### Backoffice — `Backoffice.jsx`

CRUD de productos con formulario de 6 pestañas: General | Precios | Descripción | Logística | Ficha Técnica | Imagen. `DETALLE_FIELDS` mapea categoría → campos. `openEditModal(id)` → fetch `/api/productos/:id`.

### Flujo de Pago Webpay (Transbank WebpayPlus)
1. `POST /api/webpay/iniciar` `{ monto, sessionId, ordenCompra }` → `{ url, token }`
2. Frontend redirige a `url` de Transbank
3. Transbank POST a `/api/webpay/retorno` → backend redirige a `/cliente/verificar-pago?token_ws=...` (o `/cliente/carrito?pago=cancelado` si llega `TBK_TOKEN`)
4. Frontend llama `POST /api/webpay/confirmar` con el token

Credenciales de integración hardcodeadas en `webpayController.js` — cambiar a `Environment.Production` para producción.

---

## Notas Técnicas Importantes

### CSS Global — Regla Crítica
**Todo el CSS se bundlea globalmente en Vite. Los nombres de clase DEBEN ser únicos por página.** Nunca usar un nombre de clase genérico en más de un archivo `.css`. Convención de prefijos establecida:

| Página / Componente | Prefijo de clases |
|---|---|
| `ClienteCatalogo` | `cat-`, `.container-lg` (canónico aquí) |
| `ClienteCapacitacion` | `cap-` (incluyendo `.cap-container`, `.cap-stat-num`, `.cap-stat-label`, `.cap-animacion-entrada`) |
| `ClienteSolicitud` | `sol-` (incluyendo `.sol-container`) |
| `ClienteCarrito` | sin prefijo propio, clases descriptivas en español (tema "Panel de Instrumentos") |
| `ClienteMisPedidos` | `mispedidos-`, `pedido-`, `filtro-`, `tracking-`, `timeline-` |
| `ClienteCheckout` | `co-` (tema "Panel de Instrumentos") |
| `AddressModal` | `addr-` (tema "Panel de Instrumentos") |

`.animacion-portal-entrada` está definida en `ClienteCatalogo.css` y `ClienteHome.css` (ambas con keyframes similares — fade+slide). **No agregar otra definición de esta clase en ningún otro archivo CSS.**

### Patrón de Fondo con Imagen Fija (todas las páginas excepto Home)
```css
.pagina-container {
  background-color: #001428;
  background-image:
    radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
    linear-gradient(to right, rgba(0,18,46,0.97) 0%, rgba(0,18,46,0.72) 40%, rgba(0,15,35,0.22) 100%),
    url('../assets/Fondo-XXX.png');
  background-size: 25px 25px, 100% 100%, cover;
  background-position: 0 0, center, center;
  background-attachment: fixed;
}
```
Imágenes de fondo en uso: `Fondo-catalogo.png`, `Fondo-capacitacion.png`, `Fondo-solicitud.png`, `Fondo-carrito.png`.  
El héroe de cada página NO tiene imagen propia — la recibe del contenedor.

### Glassmorphism (estándar del sistema)
```css
background: rgba(0, 12, 32, 0.78);
backdrop-filter: blur(14px);
-webkit-backdrop-filter: blur(14px);
border: 1px solid rgba(255, 255, 255, 0.09);
```
Aplica a: cards de productos (catálogo), sidebar de filtros, cards de pedidos (MisPedidos), cards de cursos (Capacitación).

### Paleta del Sistema
- Fondo base: `#001428`
- Fondo oscuro hero/overlays: `#00122e` / `#00182e`
- Acento cian: `#00ddeb`
- Verde: `#28C76F`
- Texto secundario: `#64748b`, `#94a3b8`, `#cbd5e1`

### Tema "Panel de Instrumentos" (`ClienteCarrito`, `ClienteCheckout`, `AddressModal`)
El flujo de compra (Carro → Entrega → Pago) usa una **estructura visual propia, deliberadamente distinta** del resto del sitio — no glassmorphism con blur, sino una estética técnica tipo HUD de sensor de campo (bordes rectos, tipografía monoespaciada para datos). Es una decisión de diseño explícita del usuario tras comparar variantes; **no "corregir" la estructura para que combine con el resto del sitio**. Pero los **colores de fondo SÍ deben ser el navy del sistema (`#001428`/`#00122e`), no negro/verde oscuro** — hubo una iteración previa con `--bg:#0c0f0b` que el usuario rechazó explícitamente por "verse negro" y no usar "los colores del sistema"; no reintroducir esos valores. Cada uno de los 3 archivos define estos tokens de forma independiente (mismos valores, sin compartir un archivo de variables):
```css
--bg: #001428;         --surface: #00122e;     --surface-2: #00182e;
--ink: #f1f5f9;         --dim: #94a3b8;         --line: rgba(255,255,255,0.1);
--accent: #00ddeb;      --accent-ink: #00122e;  --warn: #28C76F;   --danger: #ff6b5e;
```
Convenciones:
- Bordes rectos (sin `border-radius`), hairline `1px solid var(--line)` — no blur ni sombras suaves. La diferenciación con el resto del sitio es de **estructura** (bordes rectos + monoespaciada), no de paleta.
- Etiquetas, datos numéricos, SKUs, precios y botones en `ui-monospace, "SF Mono", Menlo, Consolas, monospace`; nombres de producto y texto descriptivo en la sans-serif del sistema.
- `--accent` (cian, igual que el resto del sitio) para navegación/confirmación (`Continuar`, checks, precios destacados); `--warn` (verde, igual que el resto del sitio) reservado para la acción de pago (`Pagar con Webpay`) — es la única diferenciación semántica de color en el flujo.
- Sin emojis como marcadores de sección (a diferencia del resto del sitio) — se reemplazan por etiquetas de texto en mayúsculas con `letter-spacing`.
- Barra "topline" (punto cian + `AGROSMART / SISTEMA DE PEDIDOS`) al inicio de `ClienteCarrito` y `ClienteCheckout` para reforzar la identidad técnica.
- **`ClienteCheckout` incluye `<ClientNavbar />`** igual que `ClienteCarrito` (envuelto en un `.co-content` con `position:relative; z-index:10` para no pisar el `sticky` del navbar) — el flujo completo debe verse como "la misma página" con la barra superior de siempre, no como una navegación a otra sección. Si se edita `ClienteCheckout.jsx`, no quitar el navbar.
- Fondo: reutiliza `Fondo-capacitacion.png` vía un `::before` (`.contenedor-pagina-carrito::before` / `.co-page::before`, **sin** `background-attachment: fixed`) con un degradado navy encima (`rgba(0,18,40,0.9→0.72→0.55)`, tonalidad de `--bg`, no negro). Las tarjetas de contenido (`.col-izquierda-carrito`, `.tarjeta-resumen`, `.co-card`, `.co-resumen-card`) tienen `background: var(--surface)` opaco — son las que garantizan legibilidad, el degradado del fondo por sí solo no alcanza a media/baja altura de la página.
- **Trampa al verificar visualmente con Playwright**: una captura `fullPage: true` de estas dos páginas puede mostrar el `::before` del fondo pintándose por encima de tarjetas opacas (bug de composición del propio Chromium headless al redimensionar la página para el screenshot completo), aunque el DOM/CSS estén perfectamente correctos (`getComputedStyle` lo confirma) y el usuario real nunca vea ese problema. Para verificar el fondo de estas páginas usar `page.screenshot({ fullPage: false })` (tamaño de viewport normal), no `fullPage: true`.

### Estado del Pedido Badge (`ClienteMisPedidos`)
El componente `EstadoBadge` recibe `--estado-color` (hex) como CSS variable. El badge usa `color-mix()` para derivar el fondo y el borde:
```css
background: color-mix(in srgb, var(--estado-color, #00ddeb) 12%, transparent);
border: 1px solid color-mix(in srgb, var(--estado-color, #00ddeb) 40%, transparent);
```
`color-mix()` requiere Chrome 111+, Firefox 113+, Safari 16.2+.

### Otras notas
- **Comparación de categorías**: siempre usar `.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '')` + `.includes()` para manejar NFD/NFC en "Tecnología"
- **Imagen como fill**: `position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover` + padre con `position: relative; overflow: hidden`
- **Hero sin altura mínima**: no usar `min-height` + `align-items: center` en heroes con fondo — genera espacio vacío donde el fondo asoma sin degradado
- **`package.json` raíz**: ya no es residual. Es el manifiesto de la función serverless de Vercel y **duplica a propósito las dependencias del backend** (ver "Restricciones de serverless"). Se le quitaron `pptxgenjs` y `react-router-dom`, que no se usaban en ningún lado. Los manifiestos de desarrollo siguen siendo `backend-agrosmart/package.json` y `frontend-agrosmart/package.json`
- **`pnpm lint` en el frontend falla desde antes de esta migración** (~48 errores en 32 archivos: `no-unused-vars`, `react-hooks/set-state-in-effect`, `__dirname` en `vite.config.js`). Es deuda preexistente, no la introdujo un cambio reciente. `pnpm build` sí pasa limpio, y es lo que corre Vercel
- **Dimensiones Chile Express**: actualmente hardcodeadas a 20×20×20cm y ~0.5kg por ítem en `ventaController.js` — pendiente calcular por categoría de producto
- **Patrón N+1 en `misPedidos`**: hace 2 queries por pedido (productos + cursos). Aceptable para volumen actual; a consolidar con JOIN cuando el volumen lo requiera
