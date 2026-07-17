const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    if (!process.env.JWT_SECRET) {
        console.error('🚨 JWT_SECRET no está definido en el entorno.');
        return res.status(500).json({ error: 'Error de configuración del servidor.' });
    }

    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Falta el token de autenticación.' });

    try {
        req.usuario = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Token inválido o expirado.' });
    }
};

const requireAdmin = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.usuario?.rol !== 'admin') {
            return res.status(403).json({ error: 'Se requiere rol de administrador.' });
        }
        next();
    });
};

const requireSelfOrAdmin = (param = 'id') => (req, res, next) => {
    verifyToken(req, res, () => {
        const objetivo = String(req.params[param]);
        const propio = String(req.usuario?.id);
        if (req.usuario?.rol === 'admin' || objetivo === propio) return next();
        return res.status(403).json({ error: 'No puedes acceder a datos de otro usuario.' });
    });
};

module.exports = { verifyToken, requireAdmin, requireSelfOrAdmin };
