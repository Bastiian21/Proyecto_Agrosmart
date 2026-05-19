-- =========================================================
-- TABLA INSCRIPCIONES_CURSOS — Registra ventas de cursos
-- Ejecutar UNA SOLA VEZ en DBeaver
-- =========================================================

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

-- Verificación
SELECT 'OK: tabla creada' AS resultado;
