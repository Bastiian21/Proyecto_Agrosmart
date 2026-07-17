const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = process.env.SUPABASE_BUCKET || 'agrosmart';

let clienteCache = null;

function getCliente() {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
        throw new Error(
            'Storage no configurado: faltan SUPABASE_URL y/o SUPABASE_SERVICE_ROLE_KEY en el entorno.'
        );
    }
    if (!clienteCache) {
        clienteCache = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
            auth: { persistSession: false },
        });
    }
    return clienteCache;
}

const estaConfigurado = () => Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);

async function subirImagen(buffer, mimetype, extension, carpeta = 'productos') {
    const supabase = getCliente();
    const ruta = `${carpeta}/img-${Date.now()}${extension}`;

    const { error } = await supabase.storage.from(BUCKET).upload(ruta, buffer, {
        contentType: mimetype,
        upsert: false,
    });
    if (error) throw new Error(`Error subiendo a Supabase Storage: ${error.message}`);

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(ruta);
    return data.publicUrl;
}

async function eliminarImagen(imagenUrl) {
    if (!imagenUrl || !estaConfigurado()) return false;

    const marcador = `/storage/v1/object/public/${BUCKET}/`;
    const i = imagenUrl.indexOf(marcador);
    if (i === -1) return false;

    const ruta = decodeURIComponent(imagenUrl.slice(i + marcador.length));
    try {
        const { error } = await getCliente().storage.from(BUCKET).remove([ruta]);
        if (error) {
            console.error('No se pudo borrar la imagen del bucket:', error.message);
            return false;
        }
        return true;
    } catch (e) {
        console.error('No se pudo borrar la imagen del bucket:', e.message);
        return false;
    }
}

module.exports = { subirImagen, eliminarImagen, estaConfigurado, BUCKET };
