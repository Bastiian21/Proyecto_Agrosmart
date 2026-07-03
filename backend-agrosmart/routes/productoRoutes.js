const express = require('express');
const router = express.Router();
const productoController = require('../controllers/productoController');
const upload = require('../middlewares/upload');

router.get('/', productoController.obtenerProductos);
router.get('/:id', productoController.obtenerProductoPorId);
router.post('/', productoController.agregarProducto);
router.put('/:id', productoController.editarProducto);
router.delete('/:id', productoController.eliminarProducto);
router.post('/:id/imagen', upload.single('imagen'), productoController.subirImagenProducto);
router.delete('/:id/imagen', productoController.eliminarImagenProducto);

module.exports = router;
