const express = require('express');
const router = express.Router();
const { crearSolicitud, listarSolicitudes, actualizarSolicitud } = require('../controllers/solicitudController');
const { verifyToken, requireAdmin } = require('../middlewares/auth');

router.post('/', verifyToken, crearSolicitud);
router.get('/', requireAdmin, listarSolicitudes);
router.put('/:id', requireAdmin, actualizarSolicitud);

module.exports = router;
