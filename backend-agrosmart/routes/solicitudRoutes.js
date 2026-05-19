const express = require('express');
const router = express.Router();
const { crearSolicitud, listarSolicitudes, actualizarSolicitud } = require('../controllers/solicitudController');

router.post('/', crearSolicitud);
router.get('/', listarSolicitudes);
router.put('/:id', actualizarSolicitud);

module.exports = router;
