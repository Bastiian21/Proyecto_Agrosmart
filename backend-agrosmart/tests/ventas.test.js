// Pruebas unitarias — Componente C5: Ventas / Pedidos (/api/ventas)
// Corresponden a los casos de prueba CA025, CA027, CA028 y CA030 de 3.1.4 Casos de Prueba - AgroSmart.xlsx
const request = require('supertest');
const { randomRut, randomSuffix } = require('./helpers');

const BASE_URL = 'http://localhost:3000';

describe('C5 - Ventas / Pedidos', () => {
    const n = randomSuffix();
    let usuarioId;
    let productoId;

    beforeAll(async () => {
        // Usuario de prueba
        const resUsuario = await request(BASE_URL).post('/api/auth/registro').send({
            nombre_completo: 'Jest Ventas',
            rut: randomRut(),
            email: `jest.ventas${n}@agrosmart.cl`,
            telefono: '+56911111111',
            password: 'Abc.1234',
            rol: 'Agricultor',
        });
        usuarioId = resUsuario.body.usuario.id;

        // Producto de prueba con stock controlado
        const resProducto = await request(BASE_URL).post('/api/productos').send({
            nombre: `Jest Producto Test ${n}`,
            sku: `JEST-PRD-${n}`,
            categoria: 'Insumos',
            precio_clp: 5000,
            stock: 3,
        });
        productoId = resProducto.body.producto.id;
    });

    afterAll(async () => {
        // Solo se puede borrar si no quedó asociado a una venta con FK restrictiva
        await request(BASE_URL).delete(`/api/productos/${productoId}`);
    });

    test('CA025 - debería registrar una venta con retiro en tienda y descontar el stock', async () => {
        const res = await request(BASE_URL)
            .post('/api/ventas')
            .send({
                usuario_id: usuarioId,
                total: 5000,
                items: [{ id: productoId, cantidad: 1, precio_clp: 5000 }],
                metodo_entrega: 'Retiro en Tienda',
            });

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);

        const producto = await request(BASE_URL).get(`/api/productos/${productoId}`);
        expect(producto.body.stock).toBe(2); // 3 - 1
    });

    test('CA027 - debería rechazar una venta con stock insuficiente (sin descontar stock)', async () => {
        const res = await request(BASE_URL)
            .post('/api/ventas')
            .send({
                usuario_id: usuarioId,
                total: 25000,
                items: [{ id: productoId, cantidad: 5, precio_clp: 5000 }], // quedan 2, pide 5
                metodo_entrega: 'Retiro en Tienda',
            });

        expect(res.status).toBe(500);
        expect(res.body.error).toMatch(/Stock insuficiente/i);

        const producto = await request(BASE_URL).get(`/api/productos/${productoId}`);
        expect(producto.body.stock).toBe(2); // no cambió (rollback)
    });

    test('CA030 - debería rechazar el registro de una venta con el carrito vacío', async () => {
        const res = await request(BASE_URL)
            .post('/api/ventas')
            .send({ usuario_id: usuarioId, total: 0, items: [], metodo_entrega: 'Retiro en Tienda' });

        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/carrito está vacío/i);
    });

    test('CA028 - debería devolver estadísticas de ventas con las llaves esperadas', async () => {
        const res = await request(BASE_URL).get('/api/ventas/stats');

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('kpis');
        expect(res.body).toHaveProperty('ventasPorMes');
        expect(res.body).toHaveProperty('topProductos');
    });
});
