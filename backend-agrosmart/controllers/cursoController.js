const cursoModel = require('../models/cursoModel');

const obtenerCursos = async (req, res) => {
    try {
        const cursos = await cursoModel.getAllCursos();
        res.json(cursos);
    } catch (error) {
        console.error('ERROR al obtener cursos:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

const obtenerCursoPorId = async (req, res) => {
    try {
        const curso = await cursoModel.getCursoById(req.params.id);
        if (!curso) return res.status(404).json({ error: 'Curso no encontrado.' });
        res.json(curso);
    } catch (error) {
        console.error('ERROR al obtener curso:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

const agregarCurso = async (req, res) => {
    try {
        const { nombre, sku, categoria, precio_clp } = req.body;
        if (!nombre || !sku || !categoria || precio_clp === undefined) {
            return res.status(400).json({ error: 'Faltan campos obligatorios: nombre, sku, categoria, precio_clp.' });
        }
        const nuevo = await cursoModel.createCurso(req.body);
        res.status(201).json({ mensaje: 'Curso creado correctamente', curso: nuevo });
    } catch (error) {
        console.error('ERROR al crear curso:', error);
        if (error.code === '23505') return res.status(400).json({ error: 'El SKU ya existe.' });
        res.status(500).json({ error: 'Error al guardar el curso.' });
    }
};

const editarCurso = async (req, res) => {
    try {
        const editado = await cursoModel.updateCurso(req.params.id, req.body);
        if (!editado) return res.status(404).json({ error: 'Curso no existe.' });
        res.json({ mensaje: 'Curso actualizado', curso: editado });
    } catch (error) {
        console.error('ERROR al actualizar curso:', error);
        res.status(500).json({ error: 'Error al actualizar.' });
    }
};

const eliminarCurso = async (req, res) => {
    try {
        const eliminado = await cursoModel.deleteCurso(req.params.id);
        if (!eliminado) return res.status(404).json({ error: 'Curso no existe.' });
        res.json({ mensaje: 'Curso eliminado correctamente' });
    } catch (error) {
        console.error('ERROR al eliminar curso:', error);
        if (error.code === '23503' || error.code === '23001') {
            return res.status(400).json({
                error: 'No se puede eliminar: este curso ya tiene inscripciones registradas. Marca su disponibilidad como inactiva en su lugar.'
            });
        }
        res.status(500).json({ error: 'Error interno al eliminar el curso.' });
    }
};

module.exports = {
    obtenerCursos, obtenerCursoPorId, agregarCurso, editarCurso, eliminarCurso
};
