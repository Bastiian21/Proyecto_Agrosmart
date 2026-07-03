const axios = require('axios');

// Chile Express usa Azure API Management con una Ocp-Apim-Subscription-Key por servicio
const BASE = process.env.CHILEX_BASE_URL || 'https://testservices.chilexpress.cl/v1';

function coberturaHeaders() {
    return { 'Ocp-Apim-Subscription-Key': process.env.CHILEX_COBERTURA_API_KEY };
}
function cotizadorHeaders() {
    return {
        'Ocp-Apim-Subscription-Key': process.env.CHILEX_COTIZADOR_API_KEY,
        'Content-Type': 'application/json',
    };
}
function enviosHeaders() {
    return {
        'Ocp-Apim-Subscription-Key': process.env.CHILEX_ENVIOS_API_KEY,
        'Content-Type': 'application/json',
    };
}

// Comunas frecuentes por región — respaldo local usado solo cuando la API de
// cobertura de Chile Express no responde (red sin salida al ambiente de pruebas).
const COMUNAS_FALLBACK = {
    '15': ['Arica', 'Camarones', 'Putre', 'General Lagos'],
    '01': ['Iquique', 'Alto Hospicio', 'Pozo Almonte', 'Pica', 'Huara'],
    '02': ['Antofagasta', 'Calama', 'Tocopilla', 'Mejillones', 'San Pedro de Atacama'],
    '03': ['Copiapó', 'Vallenar', 'Chañaral', 'Caldera', 'Diego de Almagro'],
    '04': ['La Serena', 'Coquimbo', 'Ovalle', 'Illapel', 'Vicuña'],
    '05': ['Valparaíso', 'Viña del Mar', 'Quilpué', 'Villa Alemana', 'San Antonio', 'Los Andes', 'Quillota', 'Concón'],
    '13': ['Santiago', 'Providencia', 'Las Condes', 'Ñuñoa', 'Maipú', 'La Florida', 'Puente Alto', 'San Bernardo', 'Vitacura', 'La Reina', 'Peñalolén', 'Recoleta', 'Independencia', 'Estación Central', 'Macul', 'San Miguel'],
    '06': ['Rancagua', 'San Fernando', 'Rengo', 'Machalí', 'Santa Cruz', 'Graneros'],
    '07': ['Talca', 'Curicó', 'Linares', 'Constitución', 'Molina'],
    '16': ['Chillán', 'Chillán Viejo', 'San Carlos', 'Bulnes'],
    '08': ['Concepción', 'Talcahuano', 'Los Ángeles', 'Chiguayante', 'San Pedro de la Paz', 'Coronel'],
    '09': ['Temuco', 'Padre Las Casas', 'Villarrica', 'Angol', 'Pucón'],
    '14': ['Valdivia', 'La Unión', 'Río Bueno', 'Panguipulli'],
    '10': ['Puerto Montt', 'Osorno', 'Castro', 'Ancud', 'Puerto Varas'],
    '11': ['Coyhaique', 'Aysén', 'Chile Chico'],
    '12': ['Punta Arenas', 'Puerto Natales', 'Porvenir'],
};

function slugCode(nombre) {
    return (nombre || '')
        .normalize('NFD').replace(/\p{M}/gu, '')
        .toUpperCase().replace(/[^A-Z]/g, '')
        .slice(0, 20) || 'DESCONOCIDO';
}

// Origen fijo: AgroSmart Rancagua
const ORIGEN = {
    countyCode: 'RANG',
    streetName: 'Avenida Libertador Bernardo O\'Higgins',
    streetNumber: '1234',
    complement: '',
    companyName: 'AgroSmart Chile S.A.',
    contactName: 'Despachos AgroSmart',
    contactPhone: '+56722345678',
    contactEmail: 'despachos@agrosmart.cl',
};

/**
 * Obtener comunas de una región.
 * regionCode: '06' para O'Higgins, '13' para Metropolitana, etc.
 */
async function getComunas(regionCode = '13') {
    try {
        const { data } = await axios.get(
            `${BASE}/coverage/coverage-areas?RegionCode=${regionCode}`,
            { headers: coberturaHeaders(), timeout: 5000 }
        );
        const comunas = data.data || [];
        if (comunas.length === 0) throw new Error('Sin datos de cobertura');
        return { comunas, simulado: false };
    } catch (err) {
        console.warn('Chile Express getComunas no disponible, usando respaldo local:', err.message);
        const nombres = COMUNAS_FALLBACK[regionCode] || [];
        return { comunas: nombres.map(n => ({ countyCode: slugCode(n), countyName: n })), simulado: true };
    }
}

/**
 * Buscar código de comuna por nombre de ciudad.
 * Si la API no responde, sintetiza un código a partir del nombre para no bloquear el flujo.
 */
async function buscarComuna(nombreCiudad) {
    try {
        const { data } = await axios.get(
            `${BASE}/coverage/coverage-areas?AreaName=${encodeURIComponent(nombreCiudad)}`,
            { headers: coberturaHeaders(), timeout: 5000 }
        );
        const areas = data.data || [];
        if (areas.length > 0) return areas[0].countyCode;
        return slugCode(nombreCiudad);
    } catch (err) {
        console.warn('Chile Express buscarComuna no disponible, usando respaldo local:', err.message);
        return slugCode(nombreCiudad);
    }
}

/**
 * Cotizar envío hacia una comuna destino.
 * @param {string} destinoCountyCode - Código de comuna destino
 * @param {number} pesoKg
 * @param {number} valorDeclarado - Valor en CLP
 */
async function cotizar(destinoCountyCode, pesoKg = 1, valorDeclarado = 10000) {
    try {
        const { data } = await axios.post(
            `${BASE}/rates/coverage-areas/${destinoCountyCode}`,
            {
                originCountyCode: ORIGEN.countyCode,
                packageType: 3,
                declaredWorth: valorDeclarado,
                weight: pesoKg,
                height: 20,
                width: 20,
                length: 20,
            },
            { headers: cotizadorHeaders(), timeout: 6000 }
        );

        const servicios = data.data || [];
        if (servicios.length === 0) throw new Error('Sin tarifas disponibles');

        const estandar = servicios.find(s => [1, 3].includes(s.serviceType)) || servicios[0];
        const expreso  = servicios.find(s => s.serviceType === 2);

        return {
            opciones: servicios.map(s => ({
                serviceType: s.serviceType,
                serviceDescription: s.serviceDescription || 'Chile Express',
                price: s.price,
                deliveryTime: s.deliveryTime || '3-5 días hábiles',
            })),
            recomendado: estandar ? {
                serviceType: estandar.serviceType,
                precio: estandar.price,
                plazo: estandar.deliveryTime || '3-5 días hábiles',
            } : null,
            expreso: expreso ? {
                serviceType: expreso.serviceType,
                precio: expreso.price,
                plazo: expreso.deliveryTime || '1-2 días hábiles',
            } : null,
            simulado: false,
        };
    } catch (err) {
        console.warn('Chile Express cotizar no disponible, usando tarifa estimada:', err.message);
        return cotizarSimulado(pesoKg, valorDeclarado);
    }
}

/**
 * Tarifa estimada usada solo cuando el cotizador real de Chile Express no responde.
 * No es una tarifa oficial — permite seguir probando el flujo de compra sin conexión.
 */
function cotizarSimulado(pesoKg, valorDeclarado) {
    const base = 3200;
    const porKg = 900;
    const porValor = Math.round(valorDeclarado * 0.01);
    const estandarPrecio = Math.round((base + porKg * pesoKg + porValor) / 100) * 100;
    const expresoPrecio = Math.round((estandarPrecio * 1.6) / 100) * 100;

    return {
        opciones: [
            { serviceType: 3, serviceDescription: 'Estándar (estimado)', price: estandarPrecio, deliveryTime: '3-5 días hábiles' },
            { serviceType: 2, serviceDescription: 'Expreso (estimado)', price: expresoPrecio, deliveryTime: '1-2 días hábiles' },
        ],
        recomendado: { serviceType: 3, precio: estandarPrecio, plazo: '3-5 días hábiles' },
        expreso: { serviceType: 2, precio: expresoPrecio, plazo: '1-2 días hábiles' },
        simulado: true,
    };
}

/**
 * Crear guía de despacho en Chile Express.
 * Se llama DESPUÉS de confirmar el pago con Webpay.
 */
async function crearGuia({ ventaId, destinatario, direccionDestino, pesoKg, valorDeclarado, serviceType }) {
    const payload = {
        header: {
            certificateNumber: 0,
            customerCardNumber: process.env.CHILEX_CUSTOMER_CARD || '000000',
            countyOfOriginCoverageCode: ORIGEN.countyCode,
            labelType: 1,
            marketplaceRut: '',
        },
        details: [
            {
                addresses: [
                    {
                        countyCoverageCode: direccionDestino.countyCode,
                        streetName: direccionDestino.calle,
                        streetNumber: direccionDestino.numero,
                        supplement: direccionDestino.depto || '',
                        addressType: 'DEST',
                        firstName: destinatario.nombre,
                        lastName: '',
                        email: destinatario.email || '',
                        phoneNumber: destinatario.telefono || '',
                    },
                    {
                        countyCoverageCode: ORIGEN.countyCode,
                        streetName: ORIGEN.streetName,
                        streetNumber: ORIGEN.streetNumber,
                        supplement: ORIGEN.complement,
                        addressType: 'DEV',
                        firstName: ORIGEN.companyName,
                        lastName: '',
                        email: ORIGEN.contactEmail,
                        phoneNumber: ORIGEN.contactPhone,
                    },
                ],
                packages: [
                    {
                        weight: pesoKg,
                        height: 20,
                        width: 20,
                        length: 20,
                        serviceDeliveryCode: serviceType || 3,
                        declaredValue: valorDeclarado,
                        deliveryReference: `AGRO-${ventaId}`,
                        groupReference: `PEDIDO-${ventaId}`,
                        packing: 1,
                        multipleDeliveries: 1,
                    },
                ],
            },
        ],
    };

    const { data } = await axios.post(
        `${BASE}/shipments`,
        payload,
        { headers: enviosHeaders() }
    );

    const shipment = data.data?.details?.[0];
    const od = shipment?.od || null;

    return {
        od,
        trackingUrl: od
            ? `https://www.chilexpress.cl/views/chilex_template.aspx?seccion=5&accion=0&od=${od}`
            : null,
        labelUrl: shipment?.labelUrl || null,
    };
}

/**
 * Rastrear un envío por número OD.
 */
async function rastrear(od) {
    const { data } = await axios.get(
        `${BASE}/shipments/${od}/trackings`,
        { headers: enviosHeaders() }
    );

    const trackings = data.data?.shipmentTrackingData || [];
    const ultimo = trackings[trackings.length - 1];

    return {
        od,
        estadoActual: ultimo?.statusDescription || 'Sin información',
        fecha: ultimo?.eventDate || null,
        historial: trackings.map(t => ({
            estado: t.statusDescription,
            fecha: t.eventDate,
            lugar: t.eventLocation || '',
        })),
        trackingUrl: `https://www.chilexpress.cl/views/chilex_template.aspx?seccion=5&accion=0&od=${od}`,
    };
}

module.exports = { getComunas, buscarComuna, cotizar, crearGuia, rastrear, ORIGEN, slugCode };
