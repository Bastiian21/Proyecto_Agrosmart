// Pruebas unitarias — Componente C8: Integración Chile Express (/api/envios)
// Corresponden a los casos de prueba CA044 y CA045 de 3.1.4 Casos de Prueba - AgroSmart.xlsx
const request = require('supertest');

const BASE_URL = 'http://localhost:3000';

describe('C8 - Integración Chile Express', () => {
    test('CA044 - debería cotizar un envío con tarifa de respaldo si Chile Express no responde', async () => {
        const res = await request(BASE_URL)
            .post('/api/envios/cotizar')
            .send({ ciudad: 'Providencia', pesoKg: 1.5, valorDeclarado: 22000 });

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body.opciones)).toBe(true);
        expect(res.body.opciones.length).toBeGreaterThan(0);
    });

    test('CA045 - debería listar comunas de una región con respaldo local si el servicio externo falla', async () => {
        const res = await request(BASE_URL).get('/api/envios/comunas?region=13');

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body.comunas)).toBe(true);
        expect(res.body.comunas.length).toBeGreaterThan(0);
    });
});
