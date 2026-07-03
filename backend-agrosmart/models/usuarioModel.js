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

const updateDireccion = async (id, { region, comuna, county_code, calle, numero, depto }) => {
    const query = `
        UPDATE usuarios SET
            direccion_region = $1,
            direccion_comuna = $2,
            direccion_county_code = $3,
            direccion_calle = $4,
            direccion_numero = $5,
            direccion_depto = $6
        WHERE id = $7
        RETURNING id, nombre_completo, email, telefono, rol,
            direccion_region, direccion_comuna, direccion_county_code,
            direccion_calle, direccion_numero, direccion_depto;
    `;
    const { rows } = await pool.query(query, [region, comuna, county_code, calle, numero, depto || null, id]);
    return rows[0];
};

module.exports = { getUserByEmail, createUser, updateDireccion };