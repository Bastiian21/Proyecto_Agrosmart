const chileexpress = require('../services/chileexpressService');

/**
 * POST /api/envios/cotizar
 * Body: { ciudad, pesoKg, valorDeclarado }
 */
const cotizarEnvio = async (req, res) => {
    try {
        const { ciudad, countyCode, pesoKg = 1, valorDeclarado = 10000 } = req.body;

        if (!ciudad && !countyCode) {
            return res.status(400).json({ error: 'Se requiere ciudad o countyCode.' });
        }

        // Resolver código de comuna si no viene directo (buscarComuna nunca falla:
        // si Chile Express no responde, sintetiza un código a partir del nombre)
        const code = countyCode || await chileexpress.buscarComuna(ciudad);

        const resultado = await chileexpress.cotizar(code, pesoKg, valorDeclarado);
        res.json({ countyCode: code, ...resultado });

    } catch (error) {
        console.error('Error cotizar envío:', error.response?.data || error.message);
        console.error('Detalle error Chile Express:', error.response?.data);
        res.status(500).json({ error: 'Error al cotizar envío con Chile Express.', detalle: error.response?.data?.message || error.message });
    }
};

/**
 * GET /api/envios/comunas?region=13
 */
const listarComunas = async (req, res) => {
    try {
        const { region = '13' } = req.query;
        const resultado = await chileexpress.getComunas(region);
        res.json(resultado);
    } catch (error) {
        console.error('Error listar comunas:', error.message);
        res.status(500).json({ error: 'Error al obtener comunas.' });
    }
};

/**
 * GET /api/envios/rastrear/:od
 */
const rastrearEnvio = async (req, res) => {
    try {
        const { od } = req.params;
        const resultado = await chileexpress.rastrear(od);
        res.json(resultado);
    } catch (error) {
        console.error('Error rastrear:', error.message);
        res.status(500).json({ error: 'Error al rastrear envío.' });
    }
};

module.exports = { cotizarEnvio, listarComunas, rastrearEnvio };
