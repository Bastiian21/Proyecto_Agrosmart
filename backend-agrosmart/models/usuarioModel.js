const pool = require('../config/db');

const getUserByEmail = async (email) => {
    const { rows } = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    return rows[0];
};

const createUser = async (nombre_completo, rut, email, telefono, password_hash, rol = 'Agricultor') => {
    const query = `
        INSERT INTO usuarios (nombre_completo, rut, email, telefono, password_hash, rol)
        VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, nombre_completo, email, rol;
    `;
    const { rows } = await pool.query(query, [nombre_completo, rut, email, telefono, password_hash, rol]);
    return rows[0];
};

module.exports = { getUserByEmail, createUser };