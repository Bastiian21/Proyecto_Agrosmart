const { WebpayPlus, Options, IntegrationApiKeys, Environment, IntegrationCommerceCodes } = require('transbank-sdk');

const tx = new WebpayPlus.Transaction(new Options(
    IntegrationCommerceCodes.WEBPAY_PLUS,
    IntegrationApiKeys.WEBPAY,
    Environment.Integration
));

const iniciarPago = async (req, res) => {
    try {
        const { monto, sessionId, ordenCompra } = req.body;

        const backendUrl = process.env.BACKEND_URL || 'http://localhost:3000';
        const returnUrl = `${backendUrl}/api/webpay/retorno`;

        const createResponse = await tx.create(ordenCompra, sessionId, monto, returnUrl);
        res.json({ url: createResponse.url, token: createResponse.token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al iniciar el pago con Transbank" });
    }
};


const retornoWebpay = (req, res) => {

    const token_ws = req.body?.token_ws || req.query?.token_ws;


    const tbk_token = req.body?.TBK_TOKEN || req.query?.TBK_TOKEN;

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    if (!token_ws || tbk_token) {
        return res.redirect(`${frontendUrl}/cliente/carrito?pago=cancelado`);
    }

    res.redirect(`${frontendUrl}/cliente/verificar-pago?token_ws=${token_ws}`);
};
const confirmarPago = async (req, res) => {
    try {
        const { token_ws } = req.body;
        const commitResponse = await tx.commit(token_ws);
        res.json(commitResponse);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al confirmar el pago" });
    }
};

module.exports = { iniciarPago, retornoWebpay, confirmarPago };