-- =========================================================
-- SCRIPT: USUARIO ADMINISTRADOR AGROSMART
-- Ejecutar en DBeaver UNA SOLA VEZ
-- =========================================================

-- 1. Asegurar que la columna 'rol' exista en la tabla usuarios
ALTER TABLE usuarios
ADD COLUMN IF NOT EXISTS rol VARCHAR(20) DEFAULT 'cliente';

-- 2. Limpiar admin anterior (opcional, evita conflicto de email único)
DELETE FROM usuarios WHERE email = 'admin@agrosmart.cl';

-- 3. Insertar el usuario admin
-- Email: admin@agrosmart.cl
-- Contraseña: admin123
-- Hash bcrypt generado con bcryptjs (rondas: 10)
INSERT INTO usuarios (nombre_completo, rut, email, telefono, password_hash, rol)
VALUES (
    'Administrador AgroSmart',
    '99.999.999-9',
    'admin@agrosmart.cl',
    '+56 9 0000 0000',
    '$2b$10$YatbStczKJNLG9aIiRBr/OOdVfn2GApcFiZdBg9OZlKgYeV2glaKC',
    'admin'
);

-- 4. Verificación
SELECT id, nombre_completo, email, rol FROM usuarios WHERE rol = 'admin';
