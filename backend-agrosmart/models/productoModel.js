const pool = require('../config/db');

const getAllProductos = async () => {
    const { rows } = await pool.query('SELECT * FROM productos ORDER BY id DESC');
    return rows;
};

const getProductoById = async (id) => {
    const { rows } = await pool.query('SELECT * FROM productos WHERE id = $1', [id]);
    return rows[0];
};

const createProducto = async (nombre, sku, categoria, precio_clp, stock, descripcion, imagen_url, imagen_alt) => {
    const query = `
        INSERT INTO productos (nombre, sku, categoria, precio_clp, stock, descripcion, imagen_url, imagen_alt)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *;
    `;
    const { rows } = await pool.query(query, [nombre, sku, categoria, precio_clp, stock, descripcion, imagen_url, imagen_alt]);
    return rows[0];
};

const updateProducto = async (id, nombre, sku, categoria, precio_clp, stock, disponible, descripcion, imagen_url, imagen_alt) => {
    const query = `
        UPDATE productos
        SET nombre = $1, sku = $2, categoria = $3, precio_clp = $4, stock = $5, disponible = $6, descripcion = $7, imagen_url = $8, imagen_alt = $9
        WHERE id = $10
        RETURNING *;
    `;
    const { rows } = await pool.query(query, [nombre, sku, categoria, precio_clp, stock, disponible, descripcion, imagen_url, imagen_alt, id]);
    return rows[0];
};

const deleteProducto = async (id) => {
    try {
        const { rows } = await pool.query('DELETE FROM productos WHERE id = $1 RETURNING id', [id]);
        return rows[0];
    } catch (error) {

        throw error;
    }
};

module.exports = { getAllProductos, getProductoById, createProducto, updateProducto, deleteProducto };