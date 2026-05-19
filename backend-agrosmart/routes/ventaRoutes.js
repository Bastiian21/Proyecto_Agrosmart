const express = require('express');
const router = express.Router();
const ventaController = require('../controllers/ventaController');

router.post('/', ventaController.registrarVenta);
router.get('/', ventaController.listarVentas);
router.get('/stats', ventaController.obtenerEstadisticas);

router.get('/productos', ventaController.ventasProductos);
router.get('/cursos', ventaController.ventasCursos);

module.exports = router;