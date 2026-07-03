import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ClientNavbar from '../components/ClientNavbar';
import './ClienteMisPedidos.css';

const ESTADO_CONFIG = {
    'Pendiente de Retiro': { color: '#f5c542', icon: '🕐', label: 'Pendiente de Retiro' },
    'En Preparación':       { color: '#00ddeb', icon: '📦', label: 'En Preparación' },
    'Despachado':           { color: '#3b82f6', icon: '🚚', label: 'Despachado' },
    'En Tránsito':          { color: '#8b5cf6', icon: '🛣️', label: 'En Tránsito' },
    'Entregado':            { color: '#28C76F', icon: '✅', label: 'Entregado' },
    'Completada':           { color: '#28C76F', icon: '✅', label: 'Completada' },
    'Cancelada':            { color: '#fc8181', icon: '❌', label: 'Cancelada' },
};

function EstadoBadge({ estado }) {
    const cfg = ESTADO_CONFIG[estado] || { color: '#94a3b8', icon: '?', label: estado };
    return (
        <span className="pedido-estado-badge" style={{ '--estado-color': cfg.color }}>
            {cfg.icon} {cfg.label}
        </span>
    );
}

function PedidoCard({ pedido }) {
    const [expandido, setExpandido] = useState(false);
    const [rastreo, setRastreo] = useState(null);
    const [rastreando, setRastreando] = useState(false);

    const tieneTracking = pedido.metodo_entrega === 'Chile Express' && pedido.tracking_code;

    const rastrear = async () => {
        if (rastreo) { setExpandido(true); return; }
        setRastreando(true);
        try {
            const res = await fetch(`/api/envios/rastrear/${pedido.tracking_code}`);
            const data = await res.json();
            setRastreo(data);
        } catch {
            setRastreo({ error: 'No se pudo obtener información de rastreo.' });
        } finally {
            setRastreando(false);
            setExpandido(true);
        }
    };

    const dir = pedido.direccion_envio;

    return (
        <div className="pedido-card">
            {/* Cabecera */}
            <div className="pedido-header">
                <div className="pedido-id-bloque">
                    <span className="pedido-label">Pedido</span>
                    <span className="pedido-id"># {pedido.id}</span>
                </div>
                <EstadoBadge estado={pedido.estado} />
                <div className="pedido-fecha">
                    {new Date(pedido.fecha).toLocaleDateString('es-CL', {
                        day: 'numeric', month: 'long', year: 'numeric'
                    })}
                </div>
            </div>

            {/* Items */}
            <div className="pedido-items">
                {pedido.items?.map((item, i) => (
                    <div key={i} className="pedido-item-row">
                        {item.imagen_url
                            ? <img src={item.imagen_url} alt={item.nombre} className="pedido-item-img" />
                            : <div className="pedido-item-img placeholder">📦</div>
                        }
                        <div className="pedido-item-info">
                            <span className="pedido-item-nombre">{item.nombre}</span>
                            <span className="pedido-item-meta">{item.sku} · x{item.cantidad}</span>
                        </div>
                        <span className="pedido-item-precio">
                            ${(item.precio_unitario * item.cantidad).toLocaleString('es-CL')}
                        </span>
                    </div>
                ))}
                {(!pedido.items || pedido.items.length === 0) && (
                    <p className="pedido-sin-items">Sin detalle de items disponible.</p>
                )}
            </div>

            {/* Info de entrega */}
            <div className="pedido-entrega-info">
                <div className="pedido-entrega-row">
                    <span>Método de entrega</span>
                    <strong>{pedido.metodo_entrega || 'Retiro en Tienda'}</strong>
                </div>
                {pedido.sucursal && (
                    <div className="pedido-entrega-row">
                        <span>Sucursal</span>
                        <strong>{pedido.sucursal}</strong>
                    </div>
                )}
                {dir && (
                    <div className="pedido-entrega-row">
                        <span>Dirección de envío</span>
                        <strong>{dir.calle} {dir.numero}{dir.depto ? `, ${dir.depto}` : ''}, {dir.ciudad}</strong>
                    </div>
                )}
                {pedido.costo_envio > 0 && (
                    <div className="pedido-entrega-row">
                        <span>Costo de envío</span>
                        <strong>${Number(pedido.costo_envio).toLocaleString('es-CL')}</strong>
                    </div>
                )}
                {pedido.fecha_entrega_estimada && (
                    <div className="pedido-entrega-row">
                        <span>Entrega estimada</span>
                        <strong>{new Date(pedido.fecha_entrega_estimada).toLocaleDateString('es-CL', { day: 'numeric', month: 'long' })}</strong>
                    </div>
                )}
            </div>

            {/* Total */}
            <div className="pedido-total-row">
                <span>Total pagado</span>
                <strong>${Number(pedido.total).toLocaleString('es-CL')}</strong>
            </div>

            {/* Acciones tracking */}
            {tieneTracking && (
                <div className="pedido-tracking-section">
                    <div className="tracking-code-row">
                        <span className="tracking-label">N° Seguimiento:</span>
                        <span className="tracking-code">{pedido.tracking_code}</span>
                        <a href={pedido.tracking_url} target="_blank" rel="noopener noreferrer" className="btn-rastrear-ext">
                            Ver en Chile Express ↗
                        </a>
                    </div>
                    <button className="btn-rastrear" onClick={rastrear} disabled={rastreando}>
                        {rastreando ? '⏳ Rastreando...' : expandido ? '▲ Ocultar seguimiento' : '📍 Ver seguimiento en tiempo real'}
                    </button>

                    {expandido && rastreo && !rastreo.error && (
                        <div className="tracking-historial">
                            <div className="tracking-estado-actual">
                                <span>Estado actual:</span>
                                <strong>{rastreo.estadoActual}</strong>
                            </div>
                            <div className="tracking-timeline">
                                {rastreo.historial?.map((ev, i) => (
                                    <div key={i} className="timeline-item">
                                        <div className="timeline-dot" />
                                        <div className="timeline-content">
                                            <span className="timeline-estado">{ev.estado}</span>
                                            {ev.lugar && <span className="timeline-lugar">{ev.lugar}</span>}
                                            <span className="timeline-fecha">
                                                {ev.fecha ? new Date(ev.fecha).toLocaleString('es-CL') : ''}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {expandido && rastreo?.error && (
                        <p className="tracking-error">{rastreo.error}</p>
                    )}
                </div>
            )}
        </div>
    );
}

export default function ClienteMisPedidos() {
    const navigate = useNavigate();
    const [pedidos, setPedidos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [filtro, setFiltro] = useState('todos');

    const usuario = (() => {
        try { return JSON.parse(localStorage.getItem('usuarioAgrosmart')); }
        catch { return null; }
    })();

    useEffect(() => {
        if (!usuario?.id) { navigate('/cliente/login'); return; }
        fetch(`/api/ventas/mis-pedidos/${usuario.id}`)
            .then(r => r.json())
            .then(data => { setPedidos(Array.isArray(data) ? data : []); })
            .catch(() => setPedidos([]))
            .finally(() => setCargando(false));
    }, [usuario?.id]);

    const pedidosFiltrados = pedidos.filter(p => {
        if (filtro === 'todos') return true;
        if (filtro === 'envio') return p.metodo_entrega === 'Chile Express';
        if (filtro === 'retiro') return p.metodo_entrega !== 'Chile Express';
        if (filtro === 'activos') return !['Completada', 'Entregado', 'Cancelada'].includes(p.estado);
        return true;
    });

    return (
        <div className="mispedidos-page">
            <ClientNavbar />
            <div className="mispedidos-container">
                <div className="mispedidos-header">
                    <div>
                        <h1 className="mispedidos-titulo">Mis Pedidos</h1>
                        <p className="mispedidos-sub">
                            {pedidos.length > 0
                                ? `${pedidos.length} pedido${pedidos.length !== 1 ? 's' : ''} en tu historial`
                                : 'Aún no tienes pedidos'}
                        </p>
                    </div>
                    <button className="btn-seguir-comprando" onClick={() => navigate('/cliente/catalogo')}>
                        Seguir comprando →
                    </button>
                </div>

                {/* Filtros */}
                <div className="mispedidos-filtros">
                    {[
                        { key: 'todos', label: 'Todos' },
                        { key: 'activos', label: 'En curso' },
                        { key: 'envio', label: 'Chile Express' },
                        { key: 'retiro', label: 'Retiro en tienda' },
                    ].map(f => (
                        <button
                            key={f.key}
                            className={`filtro-btn ${filtro === f.key ? 'active' : ''}`}
                            onClick={() => setFiltro(f.key)}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>

                {/* Estado de carga */}
                {cargando && (
                    <div className="mispedidos-loading">
                        <div className="loading-spinner" />
                        <p>Cargando tus pedidos...</p>
                    </div>
                )}

                {!cargando && pedidosFiltrados.length === 0 && (
                    <div className="mispedidos-empty">
                        <div className="empty-icon">📦</div>
                        <h3>No hay pedidos aquí</h3>
                        <p>
                            {filtro === 'todos'
                                ? 'Cuando realices tu primera compra, aparecerá aquí.'
                                : 'No hay pedidos que coincidan con este filtro.'}
                        </p>
                        {filtro === 'todos' && (
                            <button className="btn-empty-catalogo" onClick={() => navigate('/cliente/catalogo')}>
                                Ver catálogo
                            </button>
                        )}
                    </div>
                )}

                {!cargando && pedidosFiltrados.length > 0 && (
                    <div className="pedidos-lista">
                        {pedidosFiltrados.map(p => <PedidoCard key={p.id} pedido={p} />)}
                    </div>
                )}
            </div>
        </div>
    );
}
