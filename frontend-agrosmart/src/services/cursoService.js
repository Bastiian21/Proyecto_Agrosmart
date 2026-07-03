const API_URL = '/api/cursos';

export const obtenerCursos = async () => {
    try {
        const respuesta = await fetch(API_URL);
        if (!respuesta.ok) throw new Error('No se pudo conectar con el backend');
        return await respuesta.json();
    } catch (error) {
        console.error('Error en cursoService:', error);
        return [];
    }
};
