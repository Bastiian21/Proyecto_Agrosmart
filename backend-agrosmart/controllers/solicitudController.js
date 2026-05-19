const solicitudModel = require('../models/solicitudModel');

const crearSolicitud = async (req, res) => {
    try {
        const nueva = await solicitudModel.createSolicitud(req.body);
        res.status(201).json({ mensaje: 'Solicitud enviada correctamente', solicitud: nueva });
    } catch (error) {
        console.error('ERROR al crear solicitud:', error);
        res.status(500).json({ error: 'Error al crear la solicitud.' });
    }
};

const listarSolicitudes = async (req, res) => {
    try {
        const solicitudes = await solicitudModel.getAllSolicitudes();
        res.json(solicitudes);
    } catch (error) {
        console.error('ERROR al listar solicitudes:', error);
        res.status(500).json({ error: 'Error al obtener solicitudes.' });
    }
};

const actualizarSolicitud = async (req, res) => {
    try {
        const { id } = req.params;
        const actualizada = await solicitudModel.updateSolicitud(id, req.body);
        if (!actualizada) return res.status(404).json({ error: 'Solicitud no encontrada.' });
        res.json({ mensaje: 'Solicitud actualizada', solicitud: actualizada });
    } catch (error) {
        console.error('ERROR al actualizar solicitud:', error);
        res.status(500).json({ error: 'Error al actualizar la solicitud.' });
    }
};

module.exports = { crearSolicitud, listarSolicitudes, actualizarSolicitud };
