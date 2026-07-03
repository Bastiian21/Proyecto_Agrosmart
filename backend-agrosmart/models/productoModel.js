const pool = require('../config/db');

const getDetailTable = (categoria) => {
    if (!categoria) return null;
    const c = categoria.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '');
    if (c.includes('tecnolog')) return 'producto_detalle_tecnologia';
    if (c.includes('maquinar')) return 'producto_detalle_maquinaria';
    if (c.includes('insumo'))   return 'producto_detalle_insumo';
    return null;
};

const getAllProductos = async () => {
    const { rows } = await pool.query(
        'SELECT * FROM productos ORDER BY destacado DESC, nuevo DESC, id DESC'
    );
    return rows;
};

const getProductoById = async (id) => {
    const { rows } = await pool.query('SELECT * FROM productos WHERE id = $1', [id]);
    if (!rows[0]) return null;
    const prod = rows[0];

    const detailTable = getDetailTable(prod.categoria);
    if (detailTable) {
        const { rows: det } = await pool.query(
            `SELECT * FROM ${detailTable} WHERE producto_id = $1`, [id]
        );
        if (det[0]) {
            const { id: _id, producto_id: _pid, ...campos } = det[0];
            prod.detalle = campos;
        }
    }

    return prod;
};

const upsertDetalle = async (productoId, categoria, detalle) => {
    if (!detalle || typeof detalle !== 'object') return;
    const table = getDetailTable(categoria);
    if (!table) return;

    const campos = Object.keys(detalle).filter(k => k !== 'id' && k !== 'producto_id');
    if (campos.length === 0) return;

    const vals = campos.map(k => detalle[k] === '' ? null : detalle[k]);
    const { rows: existing } = await pool.query(`SELECT id FROM ${table} WHERE producto_id = $1`, [productoId]);

    if (existing.length > 0) {
        const setClauses = campos.map((k, i) => `${k} = $${i + 2}`).join(', ');
        await pool.query(`UPDATE ${table} SET ${setClauses} WHERE producto_id = $1`, [productoId, ...vals]);
    } else {
        const colList = campos.join(', ');
        const placeholders = campos.map((_, i) => `$${i + 2}`).join(', ');
        await pool.query(`INSERT INTO ${table} (producto_id, ${colList}) VALUES ($1, ${placeholders})`, [productoId, ...vals]);
    }
};

const createProducto = async (d) => {
    const { rows } = await pool.query(`
        INSERT INTO productos
          (nombre, sku, categoria, precio_clp, precio_anterior, precio_oferta, stock, stock_minimo,
           descripcion, descripcion_corta, imagen_url, imagen_alt,
           marca, modelo, peso, garantia, unidad_medida, ficha_tecnica,
           destacado, nuevo, etiquetas, tiempo_entrega, documento_url, pais_origen, certificaciones)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25)
        RETURNING *
    `, [
        d.nombre, d.sku, d.categoria,
        d.precio_clp, d.precio_anterior || null, d.precio_oferta || null,
        d.stock, d.stock_minimo || 5,
        d.descripcion || null, d.descripcion_corta || null,
        d.imagen_url || null, d.imagen_alt || null,
        d.marca || null, d.modelo || null, d.peso || null,
        d.garantia || null, d.unidad_medida || 'unidad',
        d.ficha_tecnica || null,
        d.destacado ? true : false, d.nuevo ? true : false,
        d.etiquetas || null, d.tiempo_entrega || null,
        d.documento_url || null, d.pais_origen || null, d.certificaciones || null,
    ]);
    const prod = rows[0];
    await upsertDetalle(prod.id, prod.categoria, d.detalle);
    return prod;
};

const updateProducto = async (id, d) => {
    const { rows } = await pool.query(`
        UPDATE productos SET
          nombre=$1, sku=$2, categoria=$3,
          precio_clp=$4, precio_anterior=$5, precio_oferta=$6,
          stock=$7, stock_minimo=$8, disponible=$9,
          descripcion=$10, descripcion_corta=$11, imagen_url=$12, imagen_alt=$13,
          marca=$14, modelo=$15, peso=$16, garantia=$17,
          unidad_medida=$18, ficha_tecnica=$19,
          destacado=$20, nuevo=$21,
          etiquetas=$22, tiempo_entrega=$23, documento_url=$24, pais_origen=$25, certificaciones=$26
        WHERE id=$27
        RETURNING *
    `, [
        d.nombre, d.sku, d.categoria,
        d.precio_clp, d.precio_anterior || null, d.precio_oferta || null,
        d.stock, d.stock_minimo || 5,
        d.disponible !== undefined ? d.disponible : true,
        d.descripcion || null, d.descripcion_corta || null,
        d.imagen_url || null, d.imagen_alt || null,
        d.marca || null, d.modelo || null, d.peso || null,
        d.garantia || null, d.unidad_medida || 'unidad',
        d.ficha_tecnica || null,
        d.destacado ? true : false, d.nuevo ? true : false,
        d.etiquetas || null, d.tiempo_entrega || null,
        d.documento_url || null, d.pais_origen || null, d.certificaciones || null,
        id,
    ]);
    const prod = rows[0];
    if (prod) await upsertDetalle(prod.id, prod.categoria, d.detalle);
    return prod;
};

const deleteProducto = async (id) => {
    const { rows } = await pool.query('DELETE FROM productos WHERE id = $1 RETURNING id', [id]);
    return rows[0];
};

const updateProductoImagen = async (id, imagen_url) => {
    const { rows } = await pool.query(
        'UPDATE productos SET imagen_url = $1 WHERE id = $2 RETURNING *',
        [imagen_url, id]
    );
    return rows[0];
};

const deleteProductoImagen = async (id) => {
    const { rows } = await pool.query(
        'UPDATE productos SET imagen_url = NULL WHERE id = $1 RETURNING *',
        [id]
    );
    return rows[0];
};

module.exports = {
    getAllProductos, getProductoById, createProducto, updateProducto,
    deleteProducto, updateProductoImagen, deleteProductoImagen,
};
