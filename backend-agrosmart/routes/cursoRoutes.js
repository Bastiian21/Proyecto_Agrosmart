const express = require('express');
const router = express.Router();
const cursoController = require('../controllers/cursoController');

router.get('/', cursoController.obtenerCursos);
router.get('/:id', cursoController.obtenerCursoPorId);
router.post('/', cursoController.agregarCurso);
router.put('/:id', cursoController.editarCurso);
router.delete('/:id', cursoController.eliminarCurso);

module.exports = router;
