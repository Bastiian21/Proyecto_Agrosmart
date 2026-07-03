// Pruebas unitarias — Componente C1: Autenticación y usuarios (/api/auth)
// Corresponden a los casos de prueba CA001-CA006 de 3.1.4 Casos de Prueba - AgroSmart.xlsx
const request = require('supertest');
const { randomRut, randomSuffix } = require('./helpers');

const BASE_URL = 'http://localhost:3000';

describe('C1 - Autenticación y usuarios', () => {
    const n = randomSuffix();
    const email = `jest.auth${n}@agrosmart.cl`;
    const rut = randomRut();
    const password = 'Abc.1234';
    let usuarioId;

    test('CA001 - debería registrar un usuario nuevo con datos válidos', async () => {
        const res = await request(BASE_URL)
            .post('/api/auth/registro')
            .send({
                nombre_completo: 'Jest Usuario Uno',
                rut,
                email,
                telefono: '+56911111111',
                password,
                rol: 'Agricultor',
            });

        expect(res.status).toBe(201);
        expect(res.body.usuario.email).toBe(email);
        expect(res.body.usuario.password_hash).toBeUndefined();
        usuarioId = res.body.usuario.id;
    });

    test('CA002 - debería rechazar el registro con un correo ya existente', async () => {
        const res = await request(BASE_URL)
            .post('/api/auth/registro')
            .send({
                nombre_completo: 'Jest Duplicado',
                rut: randomRut(),
                email, // mismo correo que CA001
                telefono: '+56922222222',
                password,
                rol: 'Agricultor',
            });

        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/correo ya está registrado/i);
    });

    test('CA003 - debería rechazar el registro con un RUT ya existente', async () => {
        const res = await request(BASE_URL)
            .post('/api/auth/registro')
            .send({
                nombre_completo: 'Jest Duplicado Rut',
                rut, // mismo RUT que CA001
                email: `jest.otro${n}@agrosmart.cl`,
                telefono: '+56933333333',
                password,
                rol: 'Agricultor',
            });

        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/RUT o Correo ya existe/i);
    });

    test('CA004 - debería iniciar sesión y devolver un token JWT', async () => {
        const res = await request(BASE_URL)
            .post('/api/auth/login')
            .send({ email, password });

        expect(res.status).toBe(200);
        expect(typeof res.body.token).toBe('string');
        expect(res.body.usuario.email).toBe(email);
        expect(res.body.usuario).toHaveProperty('direccion_region');
    });

    test('CA005 - debería rechazar el login con contraseña incorrecta', async () => {
        const res = await request(BASE_URL)
            .post('/api/auth/login')
            .send({ email, password: 'contraseña-incorrecta' });

        expect(res.status).toBe(401);
        expect(res.body.error).toMatch(/incorrectos/i);
    });

    test('CA006a - debería actualizar la dirección principal del usuario', async () => {
        const res = await request(BASE_URL)
            .put(`/api/auth/direccion/${usuarioId}`)
            .send({ region: '13', comuna: 'Providencia', county_code: 'PROVIDENCIA', calle: 'Los Aromos', numero: '123' });

        expect(res.status).toBe(200);
        expect(res.body.usuario.direccion_calle).toBe('Los Aromos');
    });

    test('CA006b - debería rechazar la actualización de dirección si falta un campo obligatorio', async () => {
        const res = await request(BASE_URL)
            .put(`/api/auth/direccion/${usuarioId}`)
            .send({ region: '13', comuna: 'Providencia', numero: '123' }); // falta "calle"

        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/Faltan datos/i);
    });
});
