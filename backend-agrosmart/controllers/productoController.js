const productoModel = require('../models/productoModel');

const obtenerProductos = async (req, res) => {
    try {
        const productos = await productoModel.getAllProductos();
        res.json(productos);
    } catch (error) {
        console.error("🚨 ERROR AL OBTENER PRODUCTOS:", error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

const obtenerProductoPorId = async (req, res) => {
    try {
        const producto = await productoModel.getProductoById(req.params.id);
        if (!producto) return res.status(404).json({ error: 'Producto no encontrado.' });
        res.json(producto);
    } catch (error) {
        console.error("🚨 ERROR AL OBTENER PRODUCTO:", error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

const agregarProducto = async (req, res) => {
    try {
        const { nombre, sku, categoria, precio_clp, stock, descripcion, imagen_url, imagen_alt } = req.body;
        if (!nombre || !sku || !categoria || !precio_clp || stock === undefined) {
          return res.status(400).json({ error: 'Faltan campos obligatorios.' });
        }
        const nuevoProducto = await productoModel.createProducto(nombre, sku, categoria, precio_clp, stock, descripcion, imagen_url, imagen_alt);
        res.status(201).json({ mensaje: 'Producto agregado', producto: nuevoProducto });
    } catch (error) {
        if (error.code === '23505') return res.status(400).json({ error: 'El SKU ya existe.' });
        res.status(500).json({ error: 'Error al guardar.' });
    }
};

const editarProducto = async (req, res) => {
    try {
        const { nombre, sku, categoria, precio_clp, stock, disponible, descripcion, imagen_url, imagen_alt } = req.body;
        const productoEditado = await productoModel.updateProducto(req.params.id, nombre, sku, categoria, precio_clp, stock, disponible, descripcion, imagen_url, imagen_alt);
        if (!productoEditado) return res.status(404).json({ error: 'Producto no existe.' });
        res.json({ mensaje: 'Producto actualizado', producto: productoEditado });
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar.' });
    }
};

const eliminarProducto = async (req, res) => {
    try {
        const eliminado = await productoModel.deleteProducto(req.params.id);
        if (!eliminado) return res.status(404).json({ error: 'Producto no existe.' });
        res.json({ mensaje: 'Producto eliminado' });
    } catch (error) {
        console.error("🚨 ERROR AL ELIMINAR PRODUCTO:", error);


        if (error.code === '23001' || error.code === '23503') {
            return res.status(400).json({
                error: 'No se puede eliminar porque este producto ya está registrado en el historial de ventas. Te sugerimos editarlo y cambiar su stock a 0.'
            });
        }
        res.status(500).json({ error: 'Error interno al intentar eliminar el producto.' });
    }
};

module.exports = { obtenerProductos, obtenerProductoPorId, agregarProducto, editarProducto, eliminarProducto };