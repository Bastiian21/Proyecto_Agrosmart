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
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre_completo,
                email: usuario.email,
                telefono: usuario.telefono,
                rol: usuario.rol,
                direccion_region: usuario.direccion_region,
                direccion_comuna: usuario.direccion_comuna,
                direccion_county_code: usuario.direccion_county_code,
                direccion_calle: usuario.direccion_calle,
                direccion_numero: usuario.direccion_numero,
                direccion_depto: usuario.direccion_depto,
            }
        });
    } catch (error) {
        console.error("🚨 ERROR EN LOGIN:", error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

const actualizarDireccion = async (req, res) => {
    try {
        const { id } = req.params;
        const { region, comuna, county_code, calle, numero, depto } = req.body;
        if (!region || !comuna || !calle || !numero) {
            return res.status(400).json({ error: 'Faltan datos de la dirección.' });
        }
        const usuario = await usuarioModel.updateDireccion(id, { region, comuna, county_code: county_code || null, calle, numero, depto });
        if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado.' });
        res.json({ mensaje: 'Dirección actualizada', usuario });
    } catch (error) {
        console.error("🚨 ERROR AL ACTUALIZAR DIRECCIÓN:", error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

module.exports = { registro, login, actualizarDireccion };