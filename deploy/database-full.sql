-- =========================================================================
-- AGROSMART — SCRIPT COMPLETO DE BASE DE DATOS
-- Ejecuta este script UNA SOLA VEZ en tu RDS PostgreSQL desde DBeaver
-- =========================================================================

-- =====================
-- 1. TABLA USUARIOS
-- =====================
CREATE TABLE IF NOT EXISTS usuarios (
    id              SERIAL PRIMARY KEY,
    nombre_completo VARCHAR(150) NOT NULL,
    rut             VARCHAR(20) UNIQUE NOT NULL,
    email           VARCHAR(150) UNIQUE NOT NULL,
    telefono        VARCHAR(30),
    password_hash   VARCHAR(255) NOT NULL,
    rol             VARCHAR(20) DEFAULT 'cliente',
    fecha_registro  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS rol VARCHAR(20) DEFAULT 'cliente';

-- =====================
-- 2. TABLA PRODUCTOS
-- =====================
CREATE TABLE IF NOT EXISTS productos (
    id              SERIAL PRIMARY KEY,
    nombre          VARCHAR(200) NOT NULL,
    sku             VARCHAR(50) UNIQUE NOT NULL,
    categoria       VARCHAR(50) NOT NULL,
    precio_clp      NUMERIC(10,2) NOT NULL DEFAULT 0,
    stock           INTEGER NOT NULL DEFAULT 0,
    disponible      BOOLEAN DEFAULT TRUE,
    descripcion     TEXT,
    imagen_url      TEXT,
    imagen_alt      TEXT,
    fecha_creacion  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================
-- 3. TABLA CURSOS
-- =====================
DROP TABLE IF EXISTS cursos CASCADE;
CREATE TABLE cursos (
    id              SERIAL PRIMARY KEY,
    nombre          VARCHAR(200) NOT NULL,
    sku             VARCHAR(50) UNIQUE NOT NULL,
    categoria       VARCHAR(50) NOT NULL,
    precio_clp      NUMERIC(10,2) NOT NULL DEFAULT 0,
    stock           INTEGER NOT NULL DEFAULT 99,
    descripcion     TEXT,
    imagen_url      TEXT,
    horas           INTEGER DEFAULT 0,
    modulos         INTEGER DEFAULT 0,
    dificultad      VARCHAR(20) DEFAULT 'Básico',
    instructor      VARCHAR(150),
    disponible      BOOLEAN DEFAULT TRUE,
    fecha_creacion  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================
-- 4. TABLA VENTAS
-- =====================
CREATE TABLE IF NOT EXISTS ventas (
    id              SERIAL PRIMARY KEY,
    usuario_id      INTEGER REFERENCES usuarios(id),
    total           NUMERIC(10,2) NOT NULL DEFAULT 0,
    metodo_entrega  VARCHAR(50) DEFAULT 'Retiro en Tienda',
    sucursal        VARCHAR(100) DEFAULT 'Rancagua (Casa Matriz)',
    estado          VARCHAR(50) DEFAULT 'Pendiente de Retiro',
    fecha           TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================
-- 5. TABLA DETALLE_VENTAS (productos en cada venta)
-- =====================
CREATE TABLE IF NOT EXISTS detalle_ventas (
    id              SERIAL PRIMARY KEY,
    venta_id        INTEGER REFERENCES ventas(id) ON DELETE CASCADE,
    producto_id     INTEGER REFERENCES productos(id),
    cantidad        INTEGER NOT NULL DEFAULT 1,
    precio_unitario NUMERIC(10,2) NOT NULL DEFAULT 0
);

-- =====================
-- 6. TABLA INSCRIPCIONES_CURSOS (cursos comprados)
-- =====================
DROP TABLE IF EXISTS inscripciones_cursos CASCADE;
CREATE TABLE inscripciones_cursos (
    id                  SERIAL PRIMARY KEY,
    venta_id            INTEGER REFERENCES ventas(id) ON DELETE SET NULL,
    usuario_id          INTEGER REFERENCES usuarios(id),
    curso_id            INTEGER REFERENCES cursos(id),
    cantidad            INTEGER NOT NULL DEFAULT 1,
    precio_pagado       NUMERIC(10,2) NOT NULL DEFAULT 0,
    fecha_inscripcion   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado              VARCHAR(30) DEFAULT 'Inscrito'
);

-- =====================
-- 7. TABLA SOLICITUDES (visitas técnicas en terreno)
-- =====================
CREATE TABLE IF NOT EXISTS solicitudes (
    id                          SERIAL PRIMARY KEY,
    usuario_id                  INTEGER REFERENCES usuarios(id),
    asunto                      VARCHAR(200),
    tipo_soporte                VARCHAR(50),
    urgencia                    VARCHAR(30),
    equipos                     TEXT,
    fecha_preferida             DATE,
    ubicacion                   TEXT,
    descripcion                 TEXT,
    estado                      VARCHAR(50) DEFAULT 'Pendiente',
    fecha_visita_programada     DATE,
    tecnico_asignado            VARCHAR(150),
    notas_admin                 TEXT,
    fecha_creacion              TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE solicitudes ADD COLUMN IF NOT EXISTS tipo_soporte VARCHAR(50);
ALTER TABLE solicitudes ADD COLUMN IF NOT EXISTS urgencia VARCHAR(30);
ALTER TABLE solicitudes ADD COLUMN IF NOT EXISTS equipos TEXT;
ALTER TABLE solicitudes ADD COLUMN IF NOT EXISTS ubicacion TEXT;
ALTER TABLE solicitudes ADD COLUMN IF NOT EXISTS fecha_visita_programada DATE;
ALTER TABLE solicitudes ADD COLUMN IF NOT EXISTS tecnico_asignado VARCHAR(150);
ALTER TABLE solicitudes ADD COLUMN IF NOT EXISTS notas_admin TEXT;

-- =========================================================================
-- SEEDS: DATOS INICIALES
-- =========================================================================

-- ---------- USUARIO ADMIN ----------
-- Email: admin@agrosmart.cl  | Contraseña: admin123
DELETE FROM usuarios WHERE email = 'admin@agrosmart.cl';
INSERT INTO usuarios (nombre_completo, rut, email, telefono, password_hash, rol)
VALUES (
    'Administrador AgroSmart',
    '99.999.999-9',
    'admin@agrosmart.cl',
    '+56 9 0000 0000',
    '$2b$10$YatbStczKJNLG9aIiRBr/OOdVfn2GApcFiZdBg9OZlKgYeV2glaKC',
    'admin'
);

-- ---------- 10 CURSOS DE EJEMPLO ----------
INSERT INTO cursos (nombre, sku, categoria, precio_clp, stock, descripcion, imagen_url, horas, modulos, dificultad, instructor) VALUES
('Introducción a la Agronomía de Precisión', 'CURSO-001', 'Tecnología', 0, 99,
 'Curso introductorio gratuito para entender los fundamentos del agro de precisión: sensores, mapeo georreferenciado, NDVI y tomas de decisión basadas en datos.',
 'https://images.unsplash.com/photo-1615811361523-6bd03d7748e7?q=80&w=600', 20, 5, 'Intermedio', 'Dra. María Elena González'),

('Operación Avanzada de Drones Mapeadores X-Pro', 'CURSO-002', 'Tecnología', 1200000, 30,
 'Aprende a operar drones agrícolas profesionales para mapeo multiespectral, fumigación dirigida y conteo de plantas con visión artificial.',
 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?q=80&w=600', 15, 4, 'Avanzado', 'Ing. Carlos Ruiz'),

('Mantenimiento Preventivo de Tractores Compactos', 'CURSO-003', 'Maquinaria', 0, 99,
 'Programa gratuito de mantenimiento para tractores compactos: cambios de aceite, calibración hidráulica, sistemas eléctricos y diagnóstico OBD.',
 'https://images.unsplash.com/photo-1592982537447-6f2a6a0c5c10?q=80&w=600', 10, 3, 'Básico', 'Téc. Juan Pérez'),

('Sensores IoT v2: Instalación y Calibración en Suelos', 'CURSO-004', 'Tecnología', 0, 99,
 'Instalación y configuración de sensores SoilSense en cultivos hortícolas. Conexión a gateway, calibración por tipo de suelo y dashboards.',
 'https://images.unsplash.com/photo-1586771107445-d3af2e84d436?q=80&w=600', 25, 6, 'Intermedio', 'Dra. María Elena González'),

('Riego Tecnificado: Diseño de Sistemas por Goteo', 'CURSO-005', 'Insumos', 450000, 40,
 'Cálculo hidráulico, dimensionamiento de bombas, selección de emisores y diseño de redes de riego por goteo para predios de hasta 50 ha.',
 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=600', 18, 5, 'Intermedio', 'Ing. Patricia Soto'),

('Fertilización Inteligente con Análisis de Suelo', 'CURSO-006', 'Insumos', 350000, 50,
 'Interpretación de análisis químico de suelos, cálculo de dosis de NPK, fertilizantes foliares y planes anuales de nutrición por cultivo.',
 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?q=80&w=600', 14, 4, 'Básico', 'Ing. Roberto Manríquez'),

('Manejo Integrado de Plagas (MIP) con Trampas Inteligentes', 'CURSO-007', 'Tecnología', 280000, 60,
 'Estrategias MIP combinando control biológico, trampas con conteo automático IoT y modelos predictivos para chinches, polillas y trips.',
 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?q=80&w=600', 12, 4, 'Intermedio', 'Dra. Carolina Vidal'),

('Cosecha Mecanizada de Frutales: Operador Certificado', 'CURSO-008', 'Maquinaria', 890000, 20,
 'Operación segura de cosechadoras automotrices y vibradoras de árboles. Certificación oficial para operadores en huertos de cerezos y manzanos.',
 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?q=80&w=600', 30, 7, 'Avanzado', 'Téc. Luis Carrasco'),

('Agricultura Regenerativa: Cultivos de Cobertura', 'CURSO-009', 'Asesorías', 0, 99,
 'Curso gratuito sobre rotación de cultivos, cobertura vegetal, mejora de carbono orgánico y reducción del uso de agroquímicos en viñas y huertos.',
 'https://images.unsplash.com/photo-1444858345840-1e1483bd0193?q=80&w=600', 16, 5, 'Básico', 'Dra. Francisca Aravena'),

('Big Data Agrícola: Power BI para Productores', 'CURSO-010', 'Tecnología', 520000, 45,
 'Construye dashboards de productividad, rentabilidad y rendimiento por cuartel usando Power BI con datos de sensores, ERP y estación meteorológica.',
 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=600', 22, 6, 'Avanzado', 'Ing. Sebastián Rojas');

-- ---------- VERIFICACIÓN ----------
SELECT 'usuarios' AS tabla, COUNT(*) FROM usuarios
UNION ALL SELECT 'productos', COUNT(*) FROM productos
UNION ALL SELECT 'cursos', COUNT(*) FROM cursos
UNION ALL SELECT 'ventas', COUNT(*) FROM ventas
UNION ALL SELECT 'inscripciones_cursos', COUNT(*) FROM inscripciones_cursos
UNION ALL SELECT 'solicitudes', COUNT(*) FROM solicitudes;
