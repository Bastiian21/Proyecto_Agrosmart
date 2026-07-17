const express = require('express');
const router = express.Router();
const ventaController = require('../controllers/ventaController');
const { verifyToken, requireAdmin, requireSelfOrAdmin } = require('../middlewares/auth');

router.post('/', verifyToken, ventaController.registrarVenta);
router.get('/', requireAdmin, ventaController.listarVentas);
router.get('/stats', requireAdmin, ventaController.obtenerEstadisticas);
router.get('/productos', requireAdmin, ventaController.ventasProductos);
router.get('/cursos', requireAdmin, ventaController.ventasCursos);
router.get('/mis-pedidos/:usuario_id', requireSelfOrAdmin('usuario_id'), ventaController.misPedidos);

module.exports = router;
