import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import ClientNavbar from '../components/ClientNavbar';
import AddressModal, { REGIONES_CHILE } from '../components/AddressModal';
import './ClienteCheckout.css';

function direccionDeUsuario(usuario) {
    if (!usuario?.direccion_calle) return null;
    return {
        region: usuario.direccion_region || '',
        comuna: usuario.direccion_comuna || '',
        county_code: usuario.direccion_county_code || '',
        calle: usuario.direccion_calle || '',
        numero: usuario.direccion_numero || '',
        depto: usuario.direccion_depto || '',
    };
}

export default function ClienteCheckout() {
    const navigate = useNavigate();
    const { cart, totalPrice } = useCart();

    const usuario = (() => {
        try { return JSON.parse(localStorage.getItem('usuarioAgrosmart')); }
        catch { return null; }
    })();

    const [paso, setPaso] = useState('entrega');
    const [metodo, setMetodo] = useState(null);
    const [direccion, setDireccion] = useState(() => direccionDeUsuario(usuario));
    const [mostrarAddressModal, setMostrarAddressModal] = useState(false);

    const [contacto, setContacto] = useState({
        nombre_destinatario: usuario?.nombre || '',
        email: usuario?.email || '',
        telefono: usuario?.telefono || '',
    });

    const [cotizacion, setCotizacion] = useState(null);
    const [cotizacionSimulada, setCotizacionSimulada] = useState(false);
    const [servicioSeleccionado, setServicioSeleccionado] = useState(null);
    const [cotizando, setCotizando] = useState(false);
    const [errorCotizacion, setErrorCotizacion] = useState('');
    const [errorEntrega, setErrorEntrega] = useState('');
    const [procesandoPago, setProcesandoPago] = useState(false);

    useEffect(() => {
        if (!usuario) { navigate('/cliente/login'); return; }
        if (cart.length === 0) { navigate('/cliente/carrito'); }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const cotizar = async (dir) => {
        if (!dir) return;
        setCotizando(true);
        setErrorCotizacion('');
        try {
            const res = await fetch('/api/envios/cotizar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(
                    dir.county_code
                        ? { countyCode: dir.county_code, pesoKg: 1.5, valorDeclarado: totalPrice }
                        : { ciudad: dir.comuna, pesoKg: 1.5, valorDeclarado: totalPrice }
                ),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Error al cotizar');
            setCotizacion(data);
            setCotizacionSimulada(!!data.simulado);
            const rec = data.recomendado;
            if (rec) setServicioSeleccionado({ ...rec, price: rec.precio, deliveryTime: rec.plazo });
        } catch (err) {
            setErrorCotizacion(err.message);
        } finally {
            setCotizando(false);
        }
    };

    useEffect(() => {
        if (metodo === 'envio' && direccion && !cotizacion) {
            cotizar(direccion);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [metodo, direccion]);

    const handleDireccionConfirmada = (dir) => {
        setDireccion(dir);
        setCotizacion(null);
        setServicioSeleccionado(null);
        setMostrarAddressModal(false);
    };

    const regionNombre = (code) => REGIONES_CHILE.find(r => r.code === code)?.name || code;

    const handleContinuar = () => {
        setErrorEntrega('');
        if (!metodo) { setErrorEntrega('Elige un tipo de entrega.'); return; }
        if (metodo === 'envio') {
            if (!direccion) { setErrorEntrega('Agrega una dirección de despacho.'); return; }
            if (!contacto.nombre_destinatario.trim()) { setErrorEntrega('Ingresa el nombre del destinatario.'); return; }
            if (!contacto.email.trim() || !contacto.email.includes('@')) { setErrorEntrega('Ingresa un email válido.'); return; }
            if (!contacto.telefono.trim()) { setErrorEntrega('Ingresa un teléfono de contacto.'); return; }
            if (!cotizacion || !servicioSeleccionado) { setErrorEntrega('Espera a que se cotice el envío.'); return; }
        }
        setPaso('pago');
    };

    const costoEnvio = metodo === 'envio' && servicioSeleccionado ? (servicioSeleccionado.precio ?? servicioSeleccionado.price) : 0;
    const totalConEnvio = totalPrice + costoEnvio;

    const handlePagar = async () => {
        setProcesandoPago(true);

        const direccionEnvio = metodo === 'envio' ? {
            ...direccion,
            ciudad: direccion.comuna,
            nombre_destinatario: contacto.nombre_destinatario,
            email: contacto.email,
            telefono: contacto.telefono,
        } : null;

        const datosCompraPendiente = {
            usuario_id: usuario.id,
            total: totalConEnvio,
            items: cart,
            metodo_entrega: metodo === 'retiro' ? 'Retiro en Tienda' : 'Chile Express',
            direccion_envio: direccionEnvio,
            costo_envio: costoEnvio,
            service_type: metodo === 'envio' ? servicioSeleccionado?.serviceType : null,
        };
        localStorage.setItem('ordenPendienteAgrosmart', JSON.stringify(datosCompraPendiente));

        const ordenCompra = 'AGRO-' + Math.floor(Math.random() * 1000000);
        const sessionId = 'SES-' + usuario.id + '-' + Date.now();

        try {
            const response = await fetch('/api/webpay/iniciar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ monto: totalConEnvio, sessionId, ordenCompra }),
            });
            const data = await response.json();

            if (data.url && data.token) {
                const form = document.createElement('form');
                form.action = data.url;
                form.method = 'POST';
                const inputToken = document.createElement('input');
                inputToken.type = 'hidden';
                inputToken.name = 'token_ws';
                inputToken.value = data.token;
                form.appendChild(inputToken);
                document.body.appendChild(form);
                form.submit();
            } else {
                alert('Hubo un problema al contactar a Webpay.');
                setProcesandoPago(false);
            }
        } catch (error) {
            console.error('Error al procesar el pago:', error);
            alert('Hubo un error de conexión con el servidor de pagos.');
            setProcesandoPago(false);
        }
    };

    if (!usuario || cart.length === 0) return null;

    return (
        <div className="co-page">
            <ClientNavbar />

            <div className="co-content">
            <div className="co-topline">
                <span className="co-topline-dot" />
                <b>AGROSMART</b>
                <span>/ SISTEMA DE PEDIDOS</span>
            </div>

            <div className="co-stepper">
                <Link to="/cliente/carrito" className="co-step done">
                    <span className="co-step-num">01</span> Carro
                </Link>
                <span className="co-step-sep" />
                {paso === 'pago' ? (
                    <button className="co-step done" onClick={() => setPaso('entrega')}>
                        <span className="co-step-num">02</span> Entrega
                    </button>
                ) : (
                    <span className="co-step active">
                        <span className="co-step-num">02</span> Entrega
                    </span>
                )}
                <span className="co-step-sep" />
                <span className={`co-step ${paso === 'pago' ? 'active' : ''}`}>
                    <span className="co-step-num">03</span> Pago
                </span>
            </div>

            <div className="co-layout">
                <div className="co-main">
                    {paso === 'entrega' && (
                        <div className="co-card">
                            <button className="co-btn-back co-btn-back-top" onClick={() => navigate('/cliente/carrito')}>← Volver al carrito</button>
                            <h2 className="co-title">Elige un tipo de entrega</h2>

                            <div className="co-metodo-grid">
                                <button
                                    className={`co-metodo-card ${metodo === 'retiro' ? 'selected' : ''}`}
                                    onClick={() => setMetodo('retiro')}
                                >
                                    <div className="co-metodo-info">
                                        <strong>Retiro en tienda</strong>
                                        <span>Av. Libertador B. O'Higgins 1234, Rancagua</span>
                                    </div>
                                    <span className="co-metodo-tag">$0 · Sin costo</span>
                                    {metodo === 'retiro' && <span className="co-metodo-check">✓</span>}
                                </button>
                                <button
                                    className={`co-metodo-card ${metodo === 'envio' ? 'selected' : ''}`}
                                    onClick={() => setMetodo('envio')}
                                >
                                    <div className="co-metodo-info">
                                        <strong>Despacho a domicilio</strong>
                                        <span>Chile Express — según comuna</span>
                                    </div>
                                    <span className="co-metodo-tag">Est. 3-5 días hábiles</span>
                                    {metodo === 'envio' && <span className="co-metodo-check">✓</span>}
                                </button>
                            </div>

                            {metodo === 'retiro' && (
                                <div className="co-retiro-info">
                                    <p><span>Dirección</span><strong>Av. Libertador Bernardo O'Higgins 1234, Rancagua</strong></p>
                                    <p><span>Horario</span><strong>Lun–Vie 09:00–18:00 · Sáb 09:00–13:00</strong></p>
                                    <p><span>Contacto</span><strong>+56 72 234 5678</strong></p>
                                </div>
                            )}

                            {metodo === 'envio' && (
                                <div className="co-envio-section">
                                    {direccion ? (
                                        <div className="co-direccion-card">
                                            <div className="co-direccion-info">
                                                <span className="co-direccion-label">Dirección</span>
                                                <strong>
                                                    {direccion.calle} {direccion.numero}{direccion.depto ? `, ${direccion.depto}` : ''} — {direccion.comuna}, {regionNombre(direccion.region)}
                                                </strong>
                                            </div>
                                            <button className="co-link-cambiar" onClick={() => setMostrarAddressModal(true)}>Cambiar</button>
                                        </div>
                                    ) : (
                                        <button className="co-btn-agregar-direccion" onClick={() => setMostrarAddressModal(true)}>
                                            + Agregar dirección
                                        </button>
                                    )}

                                    {direccion && (
                                        <div className="co-contacto-grid">
                                            <div className="co-field full">
                                                <label>Nombre destinatario</label>
                                                <input
                                                    value={contacto.nombre_destinatario}
                                                    onChange={e => setContacto(c => ({ ...c, nombre_destinatario: e.target.value }))}
                                                    placeholder="Nombre completo"
                                                />
                                            </div>
                                            <div className="co-field">
                                                <label>Teléfono</label>
                                                <input
                                                    value={contacto.telefono}
                                                    onChange={e => setContacto(c => ({ ...c, telefono: e.target.value }))}
                                                    placeholder="+56 9 1234 5678"
                                                />
                                            </div>
                                            <div className="co-field">
                                                <label>Email</label>
                                                <input
                                                    value={contacto.email}
                                                    onChange={e => setContacto(c => ({ ...c, email: e.target.value }))}
                                                    placeholder="correo@email.com"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {cotizando && <p className="co-cotizando">Cotizando envío...</p>}
                                    {errorCotizacion && <p className="co-error">{errorCotizacion}</p>}

                                    {cotizacion && (
                                        <div className="co-cotizacion-result">
                                            <p className="co-cotizacion-title">Elige tu servicio de envío</p>
                                            {cotizacionSimulada && (
                                                <p className="co-cotizando">Tarifa estimada — Chile Express no respondió en este momento, el costo real puede variar.</p>
                                            )}
                                            {cotizacion.opciones.map(op => (
                                                <button
                                                    key={op.serviceType}
                                                    className={`co-servicio-card ${servicioSeleccionado?.serviceType === op.serviceType ? 'selected' : ''}`}
                                                    onClick={() => setServicioSeleccionado({ ...op, precio: op.price })}
                                                >
                                                    <span className="co-svc-nombre">{op.serviceDescription}</span>
                                                    <span className="co-svc-plazo">{op.deliveryTime}</span>
                                                    <span className="co-svc-precio">${op.price?.toLocaleString('es-CL')}</span>
                                                    {servicioSeleccionado?.serviceType === op.serviceType && <span className="co-svc-check">✓</span>}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {errorEntrega && <p className="co-error">{errorEntrega}</p>}

                            <button className="co-btn-continuar" onClick={handleContinuar}>Continuar</button>
                        </div>
                    )}

                    {paso === 'pago' && (
                        <div className="co-card">
                            <button className="co-btn-back co-btn-back-top" onClick={() => setPaso('entrega')}>← Volver a Entrega</button>
                            <h2 className="co-title">Confirmar y pagar</h2>

                            <div className="co-pago-resumen">
                                {metodo === 'retiro' ? (
                                    <>
                                        <div className="co-confirm-row">
                                            <span>Método de entrega</span>
                                            <strong>Retiro en Tienda — Gratis</strong>
                                        </div>
                                        <div className="co-confirm-row">
                                            <span>Dirección de retiro</span>
                                            <strong>Av. Libertador B. O'Higgins 1234, Rancagua</strong>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="co-confirm-row">
                                            <span>Método de entrega</span>
                                            <strong>Chile Express – {servicioSeleccionado?.serviceDescription}</strong>
                                        </div>
                                        <div className="co-confirm-row">
                                            <span>Dirección</span>
                                            <strong>{direccion.calle} {direccion.numero}{direccion.depto ? `, ${direccion.depto}` : ''}, {direccion.comuna}</strong>
                                        </div>
                                        <div className="co-confirm-row">
                                            <span>Destinatario</span>
                                            <strong>{contacto.nombre_destinatario}</strong>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="co-sidebar">
                    <div className="co-resumen-card">
                        <h3>Resumen de la compra</h3>
                        <div className="co-fila-resumen">
                            <span>Productos ({cart.length})</span>
                            <span>${totalPrice.toLocaleString('es-CL')}</span>
                        </div>
                        <div className="co-fila-resumen">
                            <span>Entrega</span>
                            <span>{metodo === 'envio' && servicioSeleccionado ? `$${costoEnvio.toLocaleString('es-CL')}` : metodo === 'retiro' ? 'Gratis' : 'Por definir'}</span>
                        </div>
                        <div className="co-divisor" />
                        <div className="co-fila-resumen co-total">
                            <span>Total</span>
                            <strong>${totalConEnvio.toLocaleString('es-CL')}</strong>
                        </div>

                        {paso === 'pago' && (
                            <button className="co-btn-pagar" onClick={handlePagar} disabled={procesandoPago}>
                                {procesandoPago ? 'Redirigiendo...' : 'Pagar con Webpay'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
            </div>

            <AddressModal
                isOpen={mostrarAddressModal}
                onClose={() => setMostrarAddressModal(false)}
                onConfirm={handleDireccionConfirmada}
                usuarioId={usuario.id}
                direccionInicial={direccion}
            />
        </div>
    );
}
