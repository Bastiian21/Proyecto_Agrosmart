# 🚀 GUÍA DE DESPLIEGUE AGROSMART EN AWS ACADEMY

Guía completa para llevar AgroSmart (Node.js + React/Vite + PostgreSQL) a un
**EC2 + RDS** dentro del Learner Lab.

---

## 📋 ANTES DE EMPEZAR

Necesitas tener:
- ✅ Tu proyecto en un repo GitHub (público, para que el EC2 lo pueda clonar)
- ✅ Tu Learner Lab encendido (círculo 🟢 verde)
- ✅ Click en "AWS" → Consola de AWS abierta
- ✅ Estás en la región **us-east-1 (N. Virginia)** (arriba a la derecha)

---

## 🗄️ PARTE 1 — CREAR LA BASE DE DATOS RDS

### 1.1 Ir a RDS
En la barra de búsqueda de AWS escribe **RDS** y entra al servicio.

### 1.2 Crear base de datos
Click en **"Crear base de datos"** (Create database).

### 1.3 Completar el formulario

| Campo | Valor |
|---|---|
| Método de creación | **Creación estándar** (Standard create) |
| Motor | **PostgreSQL** |
| Versión | La más reciente compatible (16.x) |
| Plantilla | **Capa gratuita** (Free tier) |
| Identificador de instancia | `agrosmart-db` |
| Nombre de usuario maestro | `postgres` |
| Contraseña maestra | **Anótala bien** — la vas a necesitar |
| Confirmar contraseña | (la misma) |
| Clase de instancia | `db.t3.micro` (debería estar preseleccionada) |
| Almacenamiento | 20 GB (default) |
| **Acceso público** | **Sí** ⚠️ (importante para conectarte desde DBeaver) |
| Grupo de seguridad VPC | Crear nuevo: `agrosmart-db-sg` |
| Base de datos inicial (Additional config) | `db_agrosmart` |

### 1.4 Crear y esperar
Click en **"Crear base de datos"**. **Demora 5-10 minutos** en estar disponible.

### 1.5 Anotar el endpoint
Cuando esté lista (estado "Disponible"), entra a la instancia y copia el **Endpoint**:
```
agrosmart-db.xxxxxxxxxxx.us-east-1.rds.amazonaws.com
```

### 1.6 Permitir tu IP en el Security Group
1. Click en la pestaña **"Conectividad y seguridad"** del RDS
2. Click en el security group (ej: `agrosmart-db-sg`)
3. En **"Reglas de entrada"** → Editar reglas de entrada
4. Add rule: Tipo `PostgreSQL`, Origen `Mi IP` (selecciona "My IP")
5. Guardar

### 1.7 Conectar con DBeaver y correr el script
- Host: el endpoint del paso 1.5
- Puerto: 5432
- Base de datos: `db_agrosmart`
- Usuario: `postgres`
- Contraseña: la que pusiste

Abre el archivo `deploy/database-full.sql` y ejecútalo. Debes ver al final:

```
tabla                  | count
-----------------------+-------
usuarios               | 1
productos              | 0
cursos                 | 10
ventas                 | 0
inscripciones_cursos   | 0
solicitudes            | 0
```

---

## 🖥️ PARTE 2 — CREAR LA INSTANCIA EC2

### 2.1 Ir a EC2
Buscador AWS → **EC2** → **Instancias** → **Lanzar instancia**.

### 2.2 Completar el formulario

| Campo | Valor |
|---|---|
| Nombre | `agrosmart-ec2` |
| AMI | **Ubuntu Server 22.04 LTS** (Free tier eligible) |
| Tipo de instancia | **t2.micro** o **t3.micro** |
| Key pair | **Crear nuevo**: `agrosmart-key` (descarga el .pem y guárdalo) |
| Configuración de red | **Crear security group** |
| Reglas de seguridad | Marca: **SSH (22)**, **HTTP (80)** → orígenes `0.0.0.0/0` |
| Almacenamiento | 30 GB gp3 |

### 2.3 Lanzar
Click **"Lanzar instancia"**. Espera ~1 minuto a que el estado sea "Running".

### 2.4 Anotar la IP pública
Entra a la instancia → copia la **IPv4 pública** (ej: `54.234.123.45`).

### 2.5 Permitir que EC2 acceda al RDS
1. Vuelve a RDS → instancia `agrosmart-db` → Security Group
2. Editar reglas de entrada → Add rule:
   - Tipo: **PostgreSQL**
   - Origen: el security group del **EC2** (lo buscas por nombre `launch-wizard-X`)
3. Guardar

---

## 🔌 PARTE 3 — CONECTARSE AL EC2 Y EJECUTAR EL DESPLIEGUE

### 3.1 Mover el .pem a un lugar seguro
Después de descargar `agrosmart-key.pem`, en **Windows PowerShell**:

```powershell
# Asume que el archivo está en C:\Users\TUUSUARIO\Downloads\
# Lo movemos a la carpeta del proyecto
Move-Item -Path "$env:USERPROFILE\Downloads\agrosmart-key.pem" -Destination "C:\Users\$env:USERNAME\.ssh\agrosmart-key.pem"
```

### 3.2 Conectarse por SSH
Reemplaza `IP_DE_TU_EC2` con la IP que anotaste:

```powershell
ssh -i "C:\Users\$env:USERNAME\.ssh\agrosmart-key.pem" ubuntu@IP_DE_TU_EC2
```

Si te pregunta `yes/no` → escribes `yes`.

### 3.3 Editar y correr el script de deploy

Dentro del EC2:

```bash
# Bajar el script desde tu repo
wget https://raw.githubusercontent.com/TU-USUARIO/TU-REPO/main/deploy/setup-aws.sh
chmod +x setup-aws.sh

# Editar las variables CONFIG del archivo
nano setup-aws.sh
```

Edita estas líneas con tus valores reales:
```bash
GITHUB_REPO="https://github.com/TU-USUARIO/TU-REPO.git"
DB_HOST="agrosmart-db.xxxxxxxxxxx.us-east-1.rds.amazonaws.com"
DB_PASSWORD="el_password_de_RDS"
```

Guarda con `Ctrl+O`, `Enter`, `Ctrl+X`.

Ejecuta:
```bash
./setup-aws.sh
```

**Demora ~5-7 minutos.** Va a:
- Instalar Node 20, pnpm, PM2, Nginx
- Clonar tu repo
- Configurar el `.env` del backend
- Compilar el frontend con Vite
- Configurar Nginx como reverse proxy
- Iniciar el backend con PM2 (queda corriendo permanente)

### 3.4 Probar
Al final del script verás:
```
Frontend: http://54.234.123.45/
API:      http://54.234.123.45/api/productos
```

Abre `http://54.234.123.45/` en el navegador → debe cargar AgroSmart.
Abre `http://54.234.123.45/api/cursos` → debe devolver JSON con 10 cursos.

---

## 🧪 PARTE 4 — PRUEBAS

### Test 1: Frontend cliente
- Ve a `http://IP_EC2/cliente/home`
- Login con cualquier cuenta que registres
- Catálogo, Capacitación, Carrito, todo debe funcionar

### Test 2: Backoffice admin
- Ve a `http://IP_EC2/admin`
- Email: `admin@agrosmart.cl`
- Contraseña: `admin123`
- Debe entrar al dashboard

### Test 3: Webpay
- Compra un curso o producto → Pagar con Webpay
- Tarjeta: `4051 8856 0044 6623` · Exp: `12/30` · CVV: `123`
- RUT: `11.111.111-1` · Clave: `123`
- Debe completar la venta

---

## 🛠️ TROUBLESHOOTING

### "No carga la página"
```bash
# En el EC2:
sudo systemctl status nginx     # debe estar active (running)
sudo nginx -t                   # debe decir ok
sudo tail -f /var/log/nginx/error.log
```

### "Error en el backend / 502 Bad Gateway"
```bash
pm2 status                      # debe estar online
pm2 logs agrosmart-api          # ver el error específico
pm2 restart agrosmart-api       # reiniciar
```

### "Backend no conecta a la BD"
- Verifica el security group del RDS: debe permitir entrada PostgreSQL desde el EC2
- Verifica el `.env` del backend (`cat backend-agrosmart/.env`)
- Prueba la conexión manual:
  ```bash
  psql -h tu-endpoint.rds.amazonaws.com -U postgres -d db_agrosmart
  ```

### "Cambié código y quiero re-desplegar"
```bash
cd /home/ubuntu/agrosmart
git pull
cd backend-agrosmart && pnpm install --prod
pm2 restart agrosmart-api
cd ../frontend-agrosmart && pnpm install && pnpm build
```

---

## 💰 GESTIÓN DEL PRESUPUESTO

Para no agotar los $100 USD:
- **Apaga el Lab** (botón "End Lab" en el panel del Learner Lab) cuando no lo uses
- RDS gratis por 750 horas/mes en la capa gratuita
- EC2 t2.micro gratis por 750 horas/mes
- Cuando reabras la sesión, los recursos siguen ahí (no se borran)

⚠️ **El IP público del EC2 CAMBIA cada vez que apagas y enciendes el Lab.**
Tienes 2 opciones:
- **Opción A:** Cada vez que reanudes, anotas la nueva IP y la usas
- **Opción B:** Asignar un Elastic IP (gratis si está adjunta a un EC2 corriendo)

---

## 🎓 PARA LA PRESENTACIÓN

Lo que demuestra tu proyecto en AWS:
- **EC2** corriendo Node.js + Nginx
- **RDS PostgreSQL** como base de datos administrada
- **VPC + Security Groups** configurados con el principio de mínimo privilegio
- **Integración Transbank Webpay** funcionando contra ambiente de pruebas
- **Reverse proxy Nginx** sirviendo frontend estático + API en el mismo dominio

Mockear esto en una arquitectura real costaría miles de USD/mes — el Learner Lab te da
todo gratis dentro del presupuesto.

¡Buena presentación! 🚀
