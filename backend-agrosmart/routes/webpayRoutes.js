const express = require('express');
const router = express.Router();
const webpayController = require('../controllers/webpayController');

router.post('/iniciar', webpayController.iniciarPago);
router.post('/retorno', webpayController.retornoWebpay);
router.get('/retorno', webpayController.retornoWebpay);
router.post('/confirmar', webpayController.confirmarPago);

module.exports = router;