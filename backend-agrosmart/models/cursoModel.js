const pool = require('../config/db');

const getAllCursos = async () => {
    const { rows } = await pool.query('SELECT * FROM cursos ORDER BY id DESC');
    return rows;
};

const getCursoById = async (id) => {
    const { rows } = await pool.query('SELECT * FROM cursos WHERE id = $1', [id]);
    return rows[0];
};

const createCurso = async (data) => {
    const {
        nombre, sku, categoria, precio_clp, stock,
        descripcion, imagen_url, horas, modulos, dificultad, instructor
    } = data;
    const query = `
        INSERT INTO cursos
            (nombre, sku, categoria, precio_clp, stock, descripcion,
             imagen_url, horas, modulos, dificultad, instructor)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
        RETURNING *;
    `;
    const { rows } = await pool.query(query, [
        nombre, sku, categoria, precio_clp, stock || 99,
        descripcion, imagen_url, horas || 0, modulos || 0,
        dificultad || 'Básico', instructor
    ]);
    return rows[0];
};

const updateCurso = async (id, data) => {
    const {
        nombre, sku, categoria, precio_clp, stock, disponible,
        descripcion, imagen_url, horas, modulos, dificultad, instructor
    } = data;
    const query = `
        UPDATE cursos SET
            nombre = $1, sku = $2, categoria = $3, precio_clp = $4,
            stock = $5, disponible = COALESCE($6, disponible),
            descripcion = $7, imagen_url = $8, horas = $9, modulos = $10,
            dificultad = $11, instructor = $12
        WHERE id = $13
        RETURNING *;
    `;
    const { rows } = await pool.query(query, [
        nombre, sku, categoria, precio_clp, stock, disponible,
        descripcion, imagen_url, horas, modulos, dificultad, instructor, id
    ]);
    return rows[0];
};

const deleteCurso = async (id) => {
    const { rows } = await pool.query(
        'DELETE FROM cursos WHERE id = $1 RETURNING id',
        [id]
    );
    return rows[0];
};

module.exports = {
    getAllCursos, getCursoById, createCurso, updateCurso, deleteCurso
};
