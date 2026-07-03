const productoModel = require('../models/productoModel');

const obtenerProductos = async (req, res) => {
    try {
        const productos = await productoModel.getAllProductos();
        res.json(productos);
    } catch (error) {
        console.error('Error al obtener productos:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

const obtenerProductoPorId = async (req, res) => {
    try {
        const producto = await productoModel.getProductoById(req.params.id);
        if (!producto) return res.status(404).json({ error: 'Producto no encontrado.' });
        res.json(producto);
    } catch (error) {
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

const agregarProducto = async (req, res) => {
    try {
        const { nombre, sku, categoria, precio_clp, stock } = req.body;
        if (!nombre || !sku || !categoria || !precio_clp || stock === undefined) {
            return res.status(400).json({ error: 'Faltan campos obligatorios.' });
        }
        const nuevoProducto = await productoModel.createProducto(req.body);
        res.status(201).json({ mensaje: 'Producto agregado', producto: nuevoProducto });
    } catch (error) {
        if (error.code === '23505') return res.status(400).json({ error: 'El SKU ya existe.' });
        console.error('Error al agregar producto:', error);
        res.status(500).json({ error: 'Error al guardar.' });
    }
};

const editarProducto = async (req, res) => {
    try {
        const productoEditado = await productoModel.updateProducto(req.params.id, req.body);
        if (!productoEditado) return res.status(404).json({ error: 'Producto no existe.' });
        res.json({ mensaje: 'Producto actualizado', producto: productoEditado });
    } catch (error) {
        console.error('Error al editar producto:', error);
        res.status(500).json({ error: 'Error al actualizar.' });
    }
};

const eliminarProducto = async (req, res) => {
    try {
        const eliminado = await productoModel.deleteProducto(req.params.id);
        if (!eliminado) return res.status(404).json({ error: 'Producto no existe.' });
        res.json({ mensaje: 'Producto eliminado' });
    } catch (error) {
        if (error.code === '23001' || error.code === '23503') {
            return res.status(400).json({
                error: 'No se puede eliminar porque este producto ya está registrado en el historial de ventas. Te sugerimos editarlo y cambiar su stock a 0.'
            });
        }
        console.error('Error al eliminar producto:', error);
        res.status(500).json({ error: 'Error interno al intentar eliminar el producto.' });
    }
};

const subirImagenProducto = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No se subió ninguna imagen.' });
        const imagen_url = `/api/uploads/productos/${req.file.filename}`;
        const producto = await productoModel.updateProductoImagen(req.params.id, imagen_url);
        if (!producto) return res.status(404).json({ error: 'Producto no encontrado.' });
        res.json({ mensaje: 'Imagen actualizada', imagen_url });
    } catch (error) {
        console.error('Error al subir imagen:', error);
        res.status(500).json({ error: 'Error al subir la imagen.' });
    }
};

const eliminarImagenProducto = async (req, res) => {
    try {
        const producto = await productoModel.deleteProductoImagen(req.params.id);
        if (!producto) return res.status(404).json({ error: 'Producto no encontrado.' });
        res.json({ mensaje: 'Imagen eliminada', producto });
    } catch (error) {
        console.error('Error al eliminar imagen:', error);
        res.status(500).json({ error: 'Error al eliminar la imagen.' });
    }
};

module.exports = {
    obtenerProductos, obtenerProductoPorId, agregarProducto,
    editarProducto, eliminarProducto, subirImagenProducto, eliminarImagenProducto,
};
