const express = require('express');
const router = express.Router();
const productoController = require('../controllers/productoController');
const upload = require('../middlewares/upload');
const { requireAdmin } = require('../middlewares/auth');

router.get('/', productoController.obtenerProductos);
router.get('/:id', productoController.obtenerProductoPorId);
router.post('/', requireAdmin, productoController.agregarProducto);
router.put('/:id', requireAdmin, productoController.editarProducto);
router.delete('/:id', requireAdmin, productoController.eliminarProducto);
router.post('/:id/imagen', requireAdmin, upload.single('imagen'), productoController.subirImagenProducto);
router.delete('/:id/imagen', requireAdmin, productoController.eliminarImagenProducto);

module.exports = router;
