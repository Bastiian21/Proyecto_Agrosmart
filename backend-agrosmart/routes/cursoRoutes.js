const express = require('express');
const router = express.Router();
const cursoController = require('../controllers/cursoController');
const { requireAdmin } = require('../middlewares/auth');

router.get('/', cursoController.obtenerCursos);
router.get('/:id', cursoController.obtenerCursoPorId);
router.post('/', requireAdmin, cursoController.agregarCurso);
router.put('/:id', requireAdmin, cursoController.editarCurso);
router.delete('/:id', requireAdmin, cursoController.eliminarCurso);

module.exports = router;
