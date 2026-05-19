const API_URL = '/api/productos';

export const obtenerProductos = async () => {
    try {
        const respuesta = await fetch(API_URL);

        if (!respuesta.ok){
            throw new Error('No se pudo conectar con el backend');
        }

        const datos = await respuesta.json();
        return datos;
    } catch (error){
        console.error('Error en productoService:', error);
        return [];
    }
};