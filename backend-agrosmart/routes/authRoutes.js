const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { requireSelfOrAdmin } = require('../middlewares/auth');

router.post('/registro', authController.registro);
router.post('/login', authController.login);
router.put('/direccion/:id', requireSelfOrAdmin('id'), authController.actualizarDireccion);

module.exports = router;
