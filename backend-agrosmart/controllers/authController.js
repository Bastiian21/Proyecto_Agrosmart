const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const usuarioModel = require('../models/usuarioModel');

const registro = async (req, res) => {
    try {
        const { nombre_completo, rut, email, telefono, password, rol } = req.body;
        const usuarioExistente = await usuarioModel.getUserByEmail(email);
        if (usuarioExistente) return res.status(400).json({ error: 'El correo ya está registrado.' });

        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        const nuevoUsuario = await usuarioModel.createUser(nombre_completo, rut, email, telefono, password_hash, rol);
        res.status(201).json({ mensaje: 'Usuario registrado', usuario: nuevoUsuario });
    } catch (error) {
        console.error("🚨 ERROR EN BACKEND:", error);
        if (error.code === '23505') return res.status(400).json({ error: 'El RUT o Correo ya existe.' });
        res.status(500).json({ error: 'Error interno.' });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;


        const usuario = await usuarioModel.getUserByEmail(email);
        if (!usuario) return res.status(401).json({ error: 'Correo o contraseña incorrectos.' });


        const passwordCorrecta = await bcrypt.compare(password, usuario.password_hash);
        if (!passwordCorrecta) return res.status(401).json({ error: 'Correo o contraseña incorrectos.' });


        const token = jwt.sign({ id: usuario.id, rol: usuario.rol }, process.env.JWT_SECRET, { expiresIn: '24h' });

        res.json({
            mensaje: 'Login exitoso',
            token,
            usuario: { id: usuario.id, nombre: usuario.nombre_completo, rol: usuario.rol }
        });
    } catch (error) {
        console.error("🚨 ERROR EN LOGIN:", error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

module.exports = { registro, login };