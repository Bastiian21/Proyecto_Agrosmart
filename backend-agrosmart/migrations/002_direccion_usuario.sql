-- Migración: dirección guardada en el perfil del cliente
-- Ejecutar una sola vez en la base de datos

ALTER TABLE usuarios
  ADD COLUMN IF NOT EXISTS direccion_region      VARCHAR(10),
  ADD COLUMN IF NOT EXISTS direccion_comuna      VARCHAR(100),
  ADD COLUMN IF NOT EXISTS direccion_county_code VARCHAR(20),
  ADD COLUMN IF NOT EXISTS direccion_calle       VARCHAR(200),
  ADD COLUMN IF NOT EXISTS direccion_numero      VARCHAR(20),
  ADD COLUMN IF NOT EXISTS direccion_depto       VARCHAR(50);
