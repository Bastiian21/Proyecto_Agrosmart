const pool = require('../config/db');
const chileexpress = require('../services/chileexpressService');

const registrarVenta = async (req, res) => {
    const { usuario_id, total, items, metodo_entrega, direccion_envio, costo_envio, service_type } = req.body;

    if (!items || items.length === 0) {
        return res.status(400).json({ error: 'El carrito está vacío.' });
    }
    if (!usuario_id) {
        return res.status(400).json({ error: 'Debe estar logueado para realizar una compra.' });
    }

    const esEnvio = metodo_entrega === 'Chile Express';
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const ventaRes = await client.query(`
            INSERT INTO ventas (usuario_id, total, metodo_entrega, sucursal, estado, direccion_envio, costo_envio)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id;
        `, [
            usuario_id,
            total,
            esEnvio ? 'Chile Express' : 'Retiro en Tienda',
            esEnvio ? null : 'Rancagua (Casa Matriz)',
            esEnvio ? 'En Preparación' : 'Pendiente de Retiro',
            esEnvio ? JSON.stringify(direccion_envio) : null,
            esEnvio ? (costo_envio || 0) : 0,
        ]);
        const ventaId = ventaRes.rows[0].id;

        for (const item of items) {
            const esCurso = item.tipo === 'curso' || (item.sku && String(item.sku).startsWith('CURSO-'));

            if (esCurso) {

                const check = await client.query('SELECT nombre, precio_clp, stock FROM cursos WHERE id = $1', [item.id]);
                const curso = check.rows[0];
                if (!curso) throw new Error(`Curso no encontrado: ID ${item.id}`);
                if (curso.stock !== null && curso.stock < item.cantidad) {
                    throw new Error(`Sin cupos disponibles para: ${curso.nombre}`);
                }

                await client.query('UPDATE cursos SET stock = stock - $1 WHERE id = $2', [item.cantidad, item.id]);

                try {
                    await client.query(`
                        INSERT INTO inscripciones_cursos (venta_id, usuario_id, curso_id, cantidad, precio_pagado, estado)
                        VALUES ($1, $2, $3, $4, $5, 'Inscrito')
                    `, [ventaId, usuario_id, item.id, item.cantidad, item.precio_clp]);
                } catch (errInscr) {

                    console.warn('Esquema viejo de inscripciones_cursos, usando fallback:', errInscr.message);
                    await client.query(`
                        INSERT INTO inscripciones_cursos (usuario_id, curso_id)
                        VALUES ($1, $2)
                    `, [usuario_id, item.id]);
                }

            } else {

                const check = await client.query('SELECT stock, nombre FROM productos WHERE id = $1', [item.id]);
                const prod = check.rows[0];
                if (!prod || prod.stock < item.cantidad) {
                    throw new Error(`Stock insuficiente para: ${prod ? prod.nombre : 'Producto ID ' + item.id}`);
                }

                await client.query(
                    'INSERT INTO detalle_ventas (venta_id, producto_id, cantidad, precio_unitario) VALUES ($1, $2, $3, $4)',
                    [ventaId, item.id, item.cantidad, item.precio_clp]
                );
                await client.query('UPDATE productos SET stock = stock - $1 WHERE id = $2', [item.cantidad, item.id]);
            }
        }

        await client.query('COMMIT');

        // Si es envío Chile Express, crear guía (en background, no bloquea la respuesta)
        let trackingCode = null;
        let trackingUrl = null;
        if (esEnvio && direccion_envio && process.env.CHILEX_ENVIOS_API_KEY) {
            try {
                const pesoEstimado = Math.max(items.reduce((acc, i) => acc + (i.cantidad || 1) * 0.5, 0), 0.5);
                const guia = await chileexpress.crearGuia({
                    ventaId,
                    destinatario: {
                        nombre: direccion_envio.nombre_destinatario || '',
                        email: direccion_envio.email || '',
                        telefono: direccion_envio.telefono || '',
                    },
                    direccionDestino: {
                        countyCode: direccion_envio.county_code,
                        calle: direccion_envio.calle,
                        numero: direccion_envio.numero,
                        depto: direccion_envio.depto || '',
                    },
                    pesoKg: pesoEstimado,
                    valorDeclarado: total,
                    serviceType: service_type || 3,
                });
                trackingCode = guia.od;
                trackingUrl = guia.trackingUrl;
                // Guardar tracking en la venta
                if (trackingCode) {
                    await pool.query(
                        'UPDATE ventas SET tracking_code = $1, tracking_url = $2 WHERE id = $3',
                        [trackingCode, trackingUrl, ventaId]
                    );
                }
            } catch (errGuia) {
                console.warn('No se pudo crear guía Chile Express:', errGuia.message);
            }
        }

        res.status(201).json({ success: true, mensaje: 'Venta registrada.', ventaId, trackingCode, trackingUrl });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error en transacción:', error.message);
        res.status(500).json({ error: error.message || 'Error al procesar la venta.' });
    } finally {
        client.release();
    }
};

const obtenerEstadisticas = async (req, res) => {
    try {
        let kpis = { ingresos_totales: 0, total_ventas: 0, ticket_promedio: 0, pendientes: 0, completadas: 0 };
        try {
            const r = await pool.query(`
                SELECT
                    COALESCE(SUM(total), 0)::bigint AS ingresos_totales,
                    COUNT(*)::int AS total_ventas,
                    COALESCE(ROUND(AVG(total)), 0)::bigint AS ticket_promedio,
                    COUNT(*) FILTER (WHERE estado = 'Pendiente de Retiro')::int AS pendientes,
                    COUNT(*) FILTER (WHERE estado = 'Completada')::int AS completadas
                FROM ventas;
            `);
            kpis = r.rows[0];
        } catch (e) { console.warn('kpis error', e.message); }

        let ventasPorMes = [];
        try {
            const r = await pool.query(`
                SELECT
                    TO_CHAR(date_trunc('month', fecha), 'YYYY-MM') AS mes,
                    COALESCE(SUM(total), 0)::bigint AS ingresos,
                    COUNT(*)::int AS cantidad
                FROM ventas
                WHERE fecha >= NOW() - INTERVAL '6 months'
                GROUP BY date_trunc('month', fecha)
                ORDER BY mes ASC;
            `);
            ventasPorMes = r.rows;
        } catch (e) { console.warn('mes error', e.message); }

        let topProductos = [];
        try {
            const r = await pool.query(`
                SELECT p.id, p.nombre, p.categoria,
                    SUM(dv.cantidad)::int AS unidades_vendidas,
                    SUM(dv.cantidad * dv.precio_unitario)::bigint AS ingresos
                FROM detalle_ventas dv
                JOIN productos p ON dv.producto_id = p.id
                GROUP BY p.id, p.nombre, p.categoria
                ORDER BY unidades_vendidas DESC
                LIMIT 5;
            `);
            topProductos = r.rows;
        } catch (e) { console.warn('topProd error', e.message); }

        let topCursos = [];
        try {
            const r = await pool.query(`
                SELECT c.id, c.nombre, c.categoria,
                    COUNT(ic.id)::int AS inscritos,
                    (COUNT(ic.id) * c.precio_clp)::bigint AS ingresos
                FROM inscripciones_cursos ic
                JOIN cursos c ON ic.curso_id = c.id
                GROUP BY c.id, c.nombre, c.categoria, c.precio_clp
                ORDER BY inscritos DESC
                LIMIT 5;
            `);
            topCursos = r.rows;
        } catch (e) { console.warn('topCur error', e.message); }

        let porCategoria = [];
        try {
            const r = await pool.query(`
                SELECT p.categoria,
                    SUM(dv.cantidad * dv.precio_unitario)::bigint AS ingresos,
                    SUM(dv.cantidad)::int AS unidades
                FROM detalle_ventas dv
                JOIN productos p ON dv.producto_id = p.id
                GROUP BY p.categoria
                ORDER BY ingresos DESC;
            `);
            porCategoria = r.rows;
        } catch (e) { console.warn('porCat error', e.message); }

        let split = { productos: 0, cursos: 0 };
        try {
            const rp = await pool.query(`SELECT COALESCE(SUM(cantidad * precio_unitario), 0)::bigint AS s FROM detalle_ventas`);
            const rc = await pool.query(`SELECT COALESCE(SUM(c.precio_clp), 0)::bigint AS s FROM inscripciones_cursos ic JOIN cursos c ON ic.curso_id = c.id`);
            split = { productos: Number(rp.rows[0]?.s || 0), cursos: Number(rc.rows[0]?.s || 0) };
        } catch (e) { console.warn('split error', e.message); }

        let recientes = [];
        try {
            const r = await pool.query(`
                SELECT v.id, v.total, v.estado, v.fecha,
                    COALESCE(u.nombre_completo, 'Sin cuenta') AS cliente
                FROM ventas v
                LEFT JOIN usuarios u ON v.usuario_id = u.id
                ORDER BY v.fecha DESC
                LIMIT 10;
            `);
            recientes = r.rows;
        } catch (e) { console.warn('recientes error', e.message); }

        res.json({ kpis, ventasPorMes, topProductos, topCursos, porCategoria, split, recientes });
    } catch (error) {
        console.error('Error general en stats:', error);
        res.status(500).json({ error: 'Error al obtener estadísticas.' });
    }
};

const ventasProductos = async (req, res) => {
    try {
        const { categoria, q } = req.query;
        const conditions = ['1=1'];
        const params = [];

        if (categoria && categoria !== 'Todas') {
            params.push(categoria);
            conditions.push(`p.categoria = $${params.length}`);
        }
        if (q) {
            params.push(`%${q}%`);
            conditions.push(`(p.nombre ILIKE $${params.length} OR u.nombre_completo ILIKE $${params.length})`);
        }

        const sql = `
            SELECT
                dv.id, dv.venta_id, dv.cantidad, dv.precio_unitario,
                (dv.cantidad * dv.precio_unitario)::bigint AS subtotal,
                p.nombre AS producto, p.sku, p.categoria,
                v.fecha, COALESCE(v.estado, 'Sin venta') AS estado,
                COALESCE(u.nombre_completo, 'Sin cuenta') AS cliente
            FROM detalle_ventas dv
            JOIN productos p ON dv.producto_id = p.id
            LEFT JOIN ventas v ON dv.venta_id = v.id
            LEFT JOIN usuarios u ON v.usuario_id = u.id
            WHERE ${conditions.join(' AND ')}
            ORDER BY v.fecha DESC NULLS LAST, dv.id DESC
            LIMIT 200;
        `;
        const { rows } = await pool.query(sql, params);
        res.json(rows);
    } catch (error) {
        console.error('Error ventas productos:', error);
        res.status(500).json({ error: 'Error al obtener ventas de productos.' });
    }
};

const ventasCursos = async (req, res) => {
    try {
        const { categoria, q } = req.query;
        const conditions = ['1=1'];
        const params = [];

        if (categoria && categoria !== 'Todas') {
            params.push(categoria);
            conditions.push(`c.categoria = $${params.length}`);
        }
        if (q) {
            params.push(`%${q}%`);
            conditions.push(`(c.nombre ILIKE $${params.length} OR u.nombre_completo ILIKE $${params.length})`);
        }

        const sql = `
            SELECT
                ic.id,
                COALESCE(ic.venta_id, 0) AS venta_id,
                COALESCE(ic.cantidad, 1) AS cantidad,
                COALESCE(ic.precio_pagado, c.precio_clp) AS precio_pagado,
                (COALESCE(ic.cantidad, 1) * COALESCE(ic.precio_pagado, c.precio_clp))::bigint AS subtotal,
                c.nombre AS curso, c.sku, c.categoria, c.dificultad, c.instructor,
                ic.fecha_inscripcion,
                COALESCE(ic.estado, 'Inscrito') AS estado,
                COALESCE(u.nombre_completo, 'Sin cuenta') AS cliente
            FROM inscripciones_cursos ic
            JOIN cursos c ON ic.curso_id = c.id
            LEFT JOIN usuarios u ON ic.usuario_id = u.id
            WHERE ${conditions.join(' AND ')}
            ORDER BY ic.fecha_inscripcion DESC
            LIMIT 200;
        `;
        const { rows } = await pool.query(sql, params);
        res.json(rows);
    } catch (error) {
        console.error('Error ventas cursos:', error);
        res.status(500).json({ error: 'Error al obtener ventas de cursos.' });
    }
};

const listarVentas = async (req, res) => {
    try {
        const { rows } = await pool.query(`
            SELECT v.id, v.usuario_id, v.total, v.metodo_entrega, v.sucursal, v.estado, v.fecha,
                u.nombre_completo, u.email
            FROM ventas v
            LEFT JOIN usuarios u ON v.usuario_id = u.id
            ORDER BY v.fecha DESC
            LIMIT 100;
        `);
        res.json(rows);
    } catch (error) {
        console.error('Error al listar ventas:', error);
        res.status(500).json({ error: 'Error al obtener ventas.' });
    }
};

const misPedidos = async (req, res) => {
    const { usuario_id } = req.params;
    try {
        const { rows: ventas } = await pool.query(`
            SELECT v.id, v.total, v.estado, v.fecha, v.metodo_entrega, v.sucursal,
                   v.direccion_envio, v.costo_envio, v.tracking_code, v.tracking_url,
                   v.fecha_entrega_estimada
            FROM ventas v
            WHERE v.usuario_id = $1
            ORDER BY v.fecha DESC
        `, [usuario_id]);

        // Para cada venta, traer sus items (productos + cursos)
        const pedidosCompletos = await Promise.all(ventas.map(async (v) => {
            const { rows: productos } = await pool.query(`
                SELECT dv.cantidad, dv.precio_unitario,
                       p.nombre, p.sku, p.imagen_url, p.categoria
                FROM detalle_ventas dv
                JOIN productos p ON dv.producto_id = p.id
                WHERE dv.venta_id = $1
            `, [v.id]);

            const { rows: cursos } = await pool.query(`
                SELECT ic.cantidad, ic.precio_pagado AS precio_unitario,
                       c.nombre, c.sku, c.imagen_url, c.categoria
                FROM inscripciones_cursos ic
                JOIN cursos c ON ic.curso_id = c.id
                WHERE ic.venta_id = $1
            `, [v.id]).catch(() => ({ rows: [] }));

            return {
                ...v,
                items: [...productos, ...cursos],
            };
        }));

        res.json(pedidosCompletos);
    } catch (error) {
        console.error('Error mis pedidos:', error);
        res.status(500).json({ error: 'Error al obtener pedidos.' });
    }
};

module.exports = {
    registrarVenta,
    listarVentas,
    obtenerEstadisticas,
    ventasProductos,
    ventasCursos,
    misPedidos,
};