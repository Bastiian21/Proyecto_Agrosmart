// Pruebas unitarias — Componente C5: Ventas / Pedidos (/api/ventas)
// Corresponden a los casos de prueba CA025, CA027, CA028 y CA030 de 3.1.4 Casos de Prueba - AgroSmart.xlsx
const request = require('supertest');
const { randomRut, randomSuffix } = require('./helpers');

const BASE_URL = 'http://localhost:3000';

const ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL || 'admin@agrosmart.cl';
const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD || 'admin123';

describe('C5 - Ventas / Pedidos', () => {
    const n = randomSuffix();
    let usuarioId;
    let productoId;
    let tokenCliente;
    let tokenAdmin;

    beforeAll(async () => {
        const resAdmin = await request(BASE_URL)
            .post('/api/auth/login')
            .send({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
        if (resAdmin.status !== 200) {
            throw new Error(
                `No se pudo iniciar sesión como admin (${ADMIN_EMAIL}). ` +
                `¿Corriste sql/admin_user.sql en la base? Respuesta: ${resAdmin.status}`
            );
        }
        tokenAdmin = resAdmin.body.token;

        // Usuario cliente de prueba
        const resUsuario = await request(BASE_URL).post('/api/auth/registro').send({
            nombre_completo: 'Jest Ventas',
            rut: randomRut(),
            email: `jest.ventas${n}@agrosmart.cl`,
            telefono: '+56911111111',
            password: 'Abc.1234',
            rol: 'Agricultor',
        });
        usuarioId = resUsuario.body.usuario.id;

        const resLogin = await request(BASE_URL)
            .post('/api/auth/login')
            .send({ email: `jest.ventas${n}@agrosmart.cl`, password: 'Abc.1234' });
        tokenCliente = resLogin.body.token;

        // Producto de prueba con stock controlado
        const resProducto = await request(BASE_URL)
            .post('/api/productos')
            .set('Authorization', `Bearer ${tokenAdmin}`)
            .send({
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
        await request(BASE_URL)
            .delete(`/api/productos/${productoId}`)
            .set('Authorization', `Bearer ${tokenAdmin}`);
    });

    test('CA025 - debería registrar una venta con retiro en tienda y descontar el stock', async () => {
        const res = await request(BASE_URL)
            .post('/api/ventas')
            .set('Authorization', `Bearer ${tokenCliente}`)
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
            .set('Authorization', `Bearer ${tokenCliente}`)
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
            .set('Authorization', `Bearer ${tokenCliente}`)
            .send({ usuario_id: usuarioId, total: 0, items: [], metodo_entrega: 'Retiro en Tienda' });

        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/carrito está vacío/i);
    });

    test('CA028 - debería devolver estadísticas de ventas con las llaves esperadas', async () => {
        const res = await request(BASE_URL)
            .get('/api/ventas/stats')
            .set('Authorization', `Bearer ${tokenAdmin}`);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('kpis');
        expect(res.body).toHaveProperty('ventasPorMes');
        expect(res.body).toHaveProperty('topProductos');
    });

    test('AUTZ01 - debería rechazar la creación de productos sin token', async () => {
        const res = await request(BASE_URL)
            .post('/api/productos')
            .send({ nombre: 'Pirata', sku: `JEST-HACK-${n}`, categoria: 'Insumos', precio_clp: 1, stock: 1 });

        expect(res.status).toBe(401);
    });

    test('AUTZ02 - debería rechazar la creación de productos con token de cliente (no admin)', async () => {
        const res = await request(BASE_URL)
            .post('/api/productos')
            .set('Authorization', `Bearer ${tokenCliente}`)
            .send({ nombre: 'Pirata', sku: `JEST-HACK2-${n}`, categoria: 'Insumos', precio_clp: 1, stock: 1 });

        expect(res.status).toBe(403);
    });

    test('AUTZ03 - debería rechazar las estadísticas de ventas con token de cliente', async () => {
        const res = await request(BASE_URL)
            .get('/api/ventas/stats')
            .set('Authorization', `Bearer ${tokenCliente}`);

        expect(res.status).toBe(403);
    });

    test('AUTZ04 - debería impedir ver los pedidos de otro usuario', async () => {
        const res = await request(BASE_URL)
            .get(`/api/ventas/mis-pedidos/${usuarioId + 1}`)
            .set('Authorization', `Bearer ${tokenCliente}`);

        expect(res.status).toBe(403);
    });

    test('AUTZ05 - debería permitir al cliente ver sus propios pedidos', async () => {
        const res = await request(BASE_URL)
            .get(`/api/ventas/mis-pedidos/${usuarioId}`)
            .set('Authorization', `Bearer ${tokenCliente}`);

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });
});
