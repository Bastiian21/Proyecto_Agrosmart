const express = require('express');
const router = express.Router();
const { cotizarEnvio, listarComunas, rastrearEnvio } = require('../controllers/envioController');

router.post('/cotizar', cotizarEnvio);
router.get('/comunas', listarComunas);
router.get('/rastrear/:od', rastrearEnvio);

module.exports = router;
