-- Migración: soporte para envíos Chile Express y mis pedidos
-- Ejecutar una sola vez en la base de datos

ALTER TABLE ventas
  ADD COLUMN IF NOT EXISTS direccion_envio    JSONB,
  ADD COLUMN IF NOT EXISTS costo_envio        INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tracking_code      VARCHAR(100),
  ADD COLUMN IF NOT EXISTS tracking_url       TEXT,
  ADD COLUMN IF NOT EXISTS fecha_entrega_estimada DATE;

-- Nuevos estados posibles en ventas:
-- 'Pendiente de Retiro'  → retiro en tienda
-- 'En Preparación'       → envío en preparación
-- 'Despachado'           → guía generada en Chile Express
-- 'En Tránsito'          → en camino
-- 'Entregado'            → entregado
-- 'Completada'           → finalizado (retiro confirmado)
-- 'Cancelada'

-- Índice para consultas de mis-pedidos (frecuentes)
CREATE INDEX IF NOT EXISTS idx_ventas_usuario_id ON ventas (usuario_id);
