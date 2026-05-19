-- =========================================================
-- SCRIPT: TABLA CURSOS + 10 REGISTROS REALES AGROSMART
-- Ejecutar en DBeaver sobre tu base PostgreSQL
-- =========================================================

-- 1. CREAR TABLA SI NO EXISTE (basada en el modelo de productos para que
--    el carrito unificado funcione: usa nombre, precio_clp, stock, sku, etc.)
CREATE TABLE IF NOT EXISTS cursos (
    id              SERIAL PRIMARY KEY,
    nombre          VARCHAR(200) NOT NULL,
    sku             VARCHAR(50)  UNIQUE NOT NULL,
    categoria       VARCHAR(50)  NOT NULL,  -- Tecnología | Maquinaria | Insumos | Asesorías
    precio_clp      NUMERIC(10,2) NOT NULL DEFAULT 0,
    stock           INTEGER       NOT NULL DEFAULT 99, -- cupos disponibles
    descripcion     TEXT,
    imagen_url      TEXT,
    horas           INTEGER       DEFAULT 0,
    modulos         INTEGER       DEFAULT 0,
    dificultad      VARCHAR(20)   DEFAULT 'Básico',   -- Básico | Intermedio | Avanzado
    instructor      VARCHAR(150),
    disponible      BOOLEAN       DEFAULT TRUE,
    fecha_creacion  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);

-- 2. LIMPIAR DATOS PREVIOS (opcional, comenta si ya tienes inscripciones)
-- TRUNCATE TABLE cursos RESTART IDENTITY CASCADE;

-- 3. INSERTAR 10 CURSOS REALES
INSERT INTO cursos (nombre, sku, categoria, precio_clp, stock, descripcion, imagen_url, horas, modulos, dificultad, instructor) VALUES
('Introducción a la Agronomía de Precisión',
 'CURSO-001', 'Tecnología', 0, 99,
 'Curso introductorio gratuito para entender los fundamentos del agro de precisión: sensores, mapeo georreferenciado, NDVI y tomas de decisión basadas en datos.',
 'https://images.unsplash.com/photo-1615811361523-6bd03d7748e7?q=80&w=600',
 20, 5, 'Intermedio', 'Dra. María Elena González'),

('Operación Avanzada de Drones Mapeadores X-Pro',
 'CURSO-002', 'Tecnología', 1200000, 30,
 'Aprende a operar drones agrícolas profesionales para mapeo multiespectral, fumigación dirigida y conteo de plantas con visión artificial.',
 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?q=80&w=600',
 15, 4, 'Avanzado', 'Ing. Carlos Ruiz'),

('Mantenimiento Preventivo de Tractores Compactos',
 'CURSO-003', 'Maquinaria', 0, 99,
 'Programa gratuito de mantenimiento para tractores compactos: cambios de aceite, calibración hidráulica, sistemas eléctricos y diagnóstico OBD.',
 'https://images.unsplash.com/photo-1592982537447-6f2a6a0c5c10?q=80&w=600',
 10, 3, 'Básico', 'Téc. Juan Pérez'),

('Sensores IoT v2: Instalación y Calibración en Suelos',
 'CURSO-004', 'Tecnología', 0, 99,
 'Instalación y configuración de sensores SoilSense en cultivos hortícolas. Conexión a gateway, calibración por tipo de suelo y dashboards.',
 'https://images.unsplash.com/photo-1586771107445-d3af2e84d436?q=80&w=600',
 25, 6, 'Intermedio', 'Dra. María Elena González'),

('Riego Tecnificado: Diseño de Sistemas por Goteo',
 'CURSO-005', 'Insumos', 450000, 40,
 'Cálculo hidráulico, dimensionamiento de bombas, selección de emisores y diseño de redes de riego por goteo para predios de hasta 50 ha.',
 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=600',
 18, 5, 'Intermedio', 'Ing. Patricia Soto'),

('Fertilización Inteligente con Análisis de Suelo',
 'CURSO-006', 'Insumos', 350000, 50,
 'Interpretación de análisis químico de suelos, cálculo de dosis de NPK, fertilizantes foliares y planes anuales de nutrición por cultivo.',
 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?q=80&w=600',
 14, 4, 'Básico', 'Ing. Roberto Manríquez'),

('Manejo Integrado de Plagas (MIP) con Trampas Inteligentes',
 'CURSO-007', 'Tecnología', 280000, 60,
 'Estrategias MIP combinando control biológico, trampas con conteo automático IoT y modelos predictivos para chinches, polillas y trips.',
 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?q=80&w=600',
 12, 4, 'Intermedio', 'Dra. Carolina Vidal'),

('Cosecha Mecanizada de Frutales: Operador Certificado',
 'CURSO-008', 'Maquinaria', 890000, 20,
 'Operación segura de cosechadoras automotrices y vibradoras de árboles. Certificación oficial para operadores en huertos de cerezos y manzanos.',
 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?q=80&w=600',
 30, 7, 'Avanzado', 'Téc. Luis Carrasco'),

('Agricultura Regenerativa: Cultivos de Cobertura',
 'CURSO-009', 'Asesorías', 0, 99,
 'Curso gratuito sobre rotación de cultivos, cobertura vegetal, mejora de carbono orgánico y reducción del uso de agroquímicos en viñas y huertos.',
 'https://images.unsplash.com/photo-1444858345840-1e1483bd0193?q=80&w=600',
 16, 5, 'Básico', 'Dra. Francisca Aravena'),

('Big Data Agrícola: Power BI para Productores',
 'CURSO-010', 'Tecnología', 520000, 45,
 'Construye dashboards de productividad, rentabilidad y rendimiento por cuartel usando Power BI con datos de sensores, ERP y estación meteorológica.',
 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=600',
 22, 6, 'Avanzado', 'Ing. Sebastián Rojas');

-- 4. VERIFICACIÓN
SELECT id, nombre, categoria, precio_clp, stock, dificultad FROM cursos ORDER BY id;
