const pool = require('../config/db');

const createSolicitud = async (data) => {
    const { usuario_id, tipo_soporte, urgencia, equipos, fecha_preferida, ubicacion, descripcion } = data;
    const asunto = `Solicitud de ${tipo_soporte} - ${urgencia}`;
    const query = `
        INSERT INTO solicitudes
            (usuario_id, asunto, tipo_soporte, urgencia, equipos, fecha_preferida, ubicacion, descripcion)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *;
    `;
    const { rows } = await pool.query(query, [
        usuario_id || null, asunto, tipo_soporte, urgencia, equipos, fecha_preferida, ubicacion, descripcion
    ]);
    return rows[0];
};

const getAllSolicitudes = async () => {
    const query = `
        SELECT s.*, u.nombre_completo, u.email, u.telefono
        FROM solicitudes s
        LEFT JOIN usuarios u ON s.usuario_id = u.id
        ORDER BY s.fecha_creacion DESC;
    `;
    const { rows } = await pool.query(query);
    return rows;
};

const updateSolicitud = async (id, data) => {
    const { estado, fecha_visita_programada, tecnico_asignado, notas_admin } = data;
    const query = `
        UPDATE solicitudes
        SET
            estado = COALESCE($1, estado),
            fecha_visita_programada = COALESCE($2, fecha_visita_programada),
            tecnico_asignado = COALESCE($3, tecnico_asignado),
            notas_admin = COALESCE($4, notas_admin)
        WHERE id = $5
        RETURNING *;
    `;
    const { rows } = await pool.query(query, [estado, fecha_visita_programada, tecnico_asignado, notas_admin, id]);
    return rows[0];
};

module.exports = { createSolicitud, getAllSolicitudes, updateSolicitud };
