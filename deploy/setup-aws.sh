#!/bin/bash
# =========================================================================
# AGROSMART — Script de despliegue automatico en EC2 Ubuntu 22.04
# Uso:
#   1. Sube este archivo al EC2 (o cloneas el repo y lo encuentras en /deploy)
#   2. Edita las VARIABLES de la seccion CONFIG con tus datos reales
#   3. chmod +x setup-aws.sh && ./setup-aws.sh
# =========================================================================

set -e

# =========================================================================
# CONFIG: EDITAR ESTAS VARIABLES ANTES DE EJECUTAR
# =========================================================================
GITHUB_REPO="https://github.com/TU-USUARIO/agrosmart.git"
APP_DIR="/home/ubuntu/agrosmart"

# Datos RDS (sacalos del endpoint del RDS que creaste)
DB_HOST="tu-rds-endpoint.us-east-1.rds.amazonaws.com"
DB_PORT="5432"
DB_NAME="db_agrosmart"
DB_USER="postgres"
DB_PASSWORD="tu_password_seguro"

# Backend
JWT_SECRET="$(openssl rand -hex 32)"
CORS_ORIGIN="*"

# =========================================================================
# 1. INSTALAR DEPENDENCIAS DEL SISTEMA
# =========================================================================
echo ""
echo "============================================"
echo "1. Actualizando sistema e instalando paquetes..."
echo "============================================"
sudo apt-get update -y
sudo apt-get install -y curl git nginx postgresql-client build-essential

# Node.js 20 LTS
echo ""
echo "Instalando Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# pnpm + PM2
echo ""
echo "Instalando pnpm y PM2..."
sudo npm install -g pnpm pm2

# =========================================================================
# 2. CLONAR REPOSITORIO
# =========================================================================
echo ""
echo "============================================"
echo "2. Clonando repositorio..."
echo "============================================"
if [ -d "$APP_DIR" ]; then
    echo "Directorio existente, haciendo pull..."
    cd "$APP_DIR" && git pull
else
    git clone "$GITHUB_REPO" "$APP_DIR"
    cd "$APP_DIR"
fi

# =========================================================================
# 3. CONFIGURAR BACKEND
# =========================================================================
echo ""
echo "============================================"
echo "3. Configurando backend..."
echo "============================================"
cd "$APP_DIR/backend-agrosmart"

cat > .env <<EOF
DB_HOST=$DB_HOST
DB_PORT=$DB_PORT
DB_NAME=$DB_NAME
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD
PORT=3000
JWT_SECRET=$JWT_SECRET
CORS_ORIGIN=$CORS_ORIGIN
EOF

echo "Instalando dependencias del backend..."
pnpm install --prod

# =========================================================================
# 4. CONFIGURAR Y CONSTRUIR FRONTEND
# =========================================================================
echo ""
echo "============================================"
echo "4. Construyendo frontend (Vite)..."
echo "============================================"
cd "$APP_DIR/frontend-agrosmart"
pnpm install
pnpm build

# =========================================================================
# 5. CONFIGURAR NGINX
# =========================================================================
echo ""
echo "============================================"
echo "5. Configurando Nginx..."
echo "============================================"

sudo tee /etc/nginx/sites-available/agrosmart > /dev/null <<EOF
server {
    listen 80 default_server;
    server_name _;

    root $APP_DIR/frontend-agrosmart/dist;
    index index.html;

    # Frontend: SPA fallback
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Backend: reverse proxy a Node.js
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    client_max_body_size 10M;
}
EOF

# Habilitar el sitio
sudo ln -sf /etc/nginx/sites-available/agrosmart /etc/nginx/sites-enabled/agrosmart
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx

# =========================================================================
# 6. INICIAR BACKEND CON PM2
# =========================================================================
echo ""
echo "============================================"
echo "6. Iniciando backend con PM2..."
echo "============================================"
cd "$APP_DIR/backend-agrosmart"

pm2 stop agrosmart-api 2>/dev/null || true
pm2 delete agrosmart-api 2>/dev/null || true
pm2 start index.js --name agrosmart-api
pm2 save
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u ubuntu --hp /home/ubuntu

# =========================================================================
# DONE
# =========================================================================
PUBLIC_IP=$(curl -s ifconfig.me || echo "tu-ec2-ip")

echo ""
echo "=========================================================="
echo "  AGROSMART DESPLEGADO EXITOSAMENTE"
echo "=========================================================="
echo ""
echo "  Frontend: http://$PUBLIC_IP/"
echo "  API:      http://$PUBLIC_IP/api/productos"
echo ""
echo "  Comandos utiles:"
echo "    pm2 status              -> ver estado del backend"
echo "    pm2 logs agrosmart-api  -> ver logs en vivo"
echo "    pm2 restart agrosmart-api -> reiniciar backend"
echo "    sudo tail -f /var/log/nginx/error.log  -> logs nginx"
echo ""
echo "=========================================================="
