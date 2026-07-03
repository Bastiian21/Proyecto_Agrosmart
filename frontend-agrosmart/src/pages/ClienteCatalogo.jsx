import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ClientNavbar from '../components/ClientNavbar';
import { useCart } from '../context/CartContext';
import './ClienteCatalogo.css';

const RANGOS_PRECIO = [
  { label: 'Todos los precios', min: 0, max: Infinity },
  { label: 'Hasta $100.000', min: 0, max: 100000 },
  { label: '$100.000 – $500.000', min: 100000, max: 500000 },
  { label: '$500.000 – $2.000.000', min: 500000, max: 2000000 },
  { label: 'Más de $2.000.000', min: 2000000, max: Infinity },
];

const CATEGORIAS = [
  { name: 'Tecnología', icon: '💻', color: '#00ddeb' },
  { name: 'Maquinaria', icon: '⚙️', color: '#f5c542' },
  { name: 'Insumos',    icon: '🌿', color: '#28C76F' },
];

const LABELS_DETALLE = {
  'Tecnología': {
    conectividad: 'Conectividad', protocolo: 'Protocolo', tipo_alimentacion: 'Alimentación',
    autonomia: 'Autonomía', variables_medidas: 'Variables medidas', precision_medicion: 'Precisión',
    rango_medicion: 'Rango medición', ip_proteccion: 'Protección IP', rango_temperatura: 'Rango temperatura',
    dimensiones: 'Dimensiones', plataforma_app: 'App / Plataforma', integraciones: 'Integraciones',
    almacenamiento: 'Almacenamiento',
  },
  'Maquinaria': {
    motor_tipo: 'Motor', potencia: 'Potencia', combustible: 'Combustible', capacidad: 'Capacidad',
    rendimiento: 'Rendimiento', ancho_trabajo: 'Ancho de trabajo', requiere_tractor: '¿Requiere tractor?',
    hp_requerido: 'HP requerido', enganche: 'Enganche', pto_rpm: 'PTO / RPM', dimensiones: 'Dimensiones',
    peso_operativo: 'Peso operativo', material_estructura: 'Estructura',
  },
  'Insumos': {
    ingrediente_activo: 'Ingrediente activo', tipo_formulacion: 'Formulación', modo_accion: 'Modo de acción',
    cultivos_objetivo: 'Cultivos', plagas_objetivo: 'Plagas objetivo', dosis_recomendada: 'Dosis recomendada',
    momento_aplicacion: 'Momento aplicación', numero_aplicaciones: 'N° aplicaciones',
    periodo_carencia: 'Período carencia', reingreso_campo: 'Reingreso al campo',
    clase_toxicologica: 'Clase toxicológica', registro_sag: 'Registro SAG', epp_requerido: 'EPP requerido',
    temperatura_almacen: 'Almacenamiento', vida_util: 'Vida útil', presentacion: 'Presentación',
  },
};

const clp = (n) => '$' + Number(n).toLocaleString('es-CL');

const getPrecios = (prod) => {
  const tiene_oferta = prod.precio_oferta && Number(prod.precio_oferta) < Number(prod.precio_clp);
  const precio_actual = tiene_oferta ? Number(prod.precio_oferta) : Number(prod.precio_clp);
  let precio_tachado = null;
  if (tiene_oferta) precio_tachado = Number(prod.precio_clp);
  else if (prod.precio_anterior) precio_tachado = Number(prod.precio_anterior);
  return { precio_actual, precio_tachado, tiene_oferta };
};

const getBadge = (prod) => {
  if (prod.stock === 0) return { label: 'AGOTADO', cls: 'badge-agotado' };
  if (prod.precio_oferta && Number(prod.precio_oferta) < Number(prod.precio_clp)) return { label: 'OFERTA', cls: 'badge-oferta' };
  if (prod.nuevo)      return { label: 'NUEVO',   cls: 'badge-nuevo' };
  if (prod.destacado)  return { label: '★ TOP',   cls: 'badge-destacado' };
  return null;
};

function ClienteCatalogo() {
  const navigate  = useNavigate();
  const location  = useLocation();

  const [productos,           setProductos]          = useState([]);
  const [activeTab,           setActiveTab]           = useState('Todas');
  const [productoSeleccionado,setProductoSeleccionado]= useState(null);
  const [detalleProducto,     setDetalleProducto]     = useState(null);
  const [loadingDetalle,      setLoadingDetalle]      = useState(false);
  const [cantidad,            setCantidad]            = useState(1);
  const [lightboxSrc,         setLightboxSrc]         = useState(null);

  const [searchTerm,     setSearchTerm]     = useState('');
  const [stockFilter,    setStockFilter]    = useState('Todos');
  const [marcaFilter,    setMarcaFilter]    = useState('Todas');
  const [precioRango,    setPrecioRango]    = useState(0);
  const [sortBy,         setSortBy]         = useState('default');
  const [destacadoFilter,setDestacadoFilter]= useState(false);
  const [nuevoFilter,    setNuevoFilter]    = useState(false);

  const { addToCart } = useCart();

  useEffect(() => {
    fetch('/api/productos')
      .then(r => r.json())
      .then(setProductos)
      .catch(console.error);
  }, []);

  useEffect(() => {
    const cat = new URLSearchParams(location.search).get('category');
    if (cat) setActiveTab(cat);
  }, [location]);

  useEffect(() => {
    document.body.style.overflow = (productoSeleccionado || lightboxSrc) ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [productoSeleccionado, lightboxSrc]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        if (lightboxSrc) setLightboxSrc(null);
        else if (productoSeleccionado) cerrarModal();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxSrc, productoSeleccionado]);

  const marcasDisponibles = useMemo(() =>
    [...new Set(productos.map(p => p.marca).filter(Boolean))].sort()
  , [productos]);

  const categoryCounts = useMemo(() => {
    const c = { Todas: productos.length };
    productos.forEach(p => { c[p.categoria] = (c[p.categoria] || 0) + 1; });
    return c;
  }, [productos]);

  const rango = RANGOS_PRECIO[precioRango];

  const productosFiltrados = useMemo(() => {
    let list = productos.filter(p => {
      const matchCat       = activeTab === 'Todas' || p.categoria.localeCompare(activeTab, 'es', { sensitivity: 'base' }) === 0;
      const matchSearch    = !searchTerm || [p.nombre, p.sku, p.marca, p.modelo].some(v => (v || '').toLowerCase().includes(searchTerm.toLowerCase()));
      const matchStock     = stockFilter === 'Todos' ? true : stockFilter === 'Disponibles' ? p.stock > 0 : p.stock === 0;
      const matchMarca     = marcaFilter === 'Todas' || p.marca === marcaFilter;
      const precio         = Number(p.precio_oferta || p.precio_clp);
      const matchPrecio    = precio >= rango.min && precio <= rango.max;
      const matchDestacado = !destacadoFilter || p.destacado;
      const matchNuevo     = !nuevoFilter     || p.nuevo;
      return matchCat && matchSearch && matchStock && matchMarca && matchPrecio && matchDestacado && matchNuevo;
    });

    switch (sortBy) {
      case 'precio-asc':  return [...list].sort((a, b) => Number(a.precio_oferta || a.precio_clp) - Number(b.precio_oferta || b.precio_clp));
      case 'precio-desc': return [...list].sort((a, b) => Number(b.precio_oferta || b.precio_clp) - Number(a.precio_oferta || a.precio_clp));
      case 'nombre-asc':  return [...list].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
      case 'destacado':   return [...list].sort((a, b) => (b.destacado ? 1 : 0) - (a.destacado ? 1 : 0));
      case 'nuevo':       return [...list].sort((a, b) => (b.nuevo ? 1 : 0) - (a.nuevo ? 1 : 0));
      default:            return list;
    }
  }, [productos, activeTab, searchTerm, stockFilter, marcaFilter, precioRango, sortBy, rango, destacadoFilter, nuevoFilter]);

  const hasActiveFilters = stockFilter !== 'Todos' || marcaFilter !== 'Todas' || precioRango !== 0
    || searchTerm !== '' || sortBy !== 'default' || activeTab !== 'Todas'
    || destacadoFilter || nuevoFilter;

  const clearFilters = () => {
    setStockFilter('Todos'); setMarcaFilter('Todas'); setPrecioRango(0);
    setSearchTerm(''); setSortBy('default'); setActiveTab('Todas');
    setDestacadoFilter(false); setNuevoFilter(false);
  };

  const abrirModal = async (prod) => {
    setProductoSeleccionado(prod);
    setDetalleProducto(null);
    setCantidad(1);
    setLoadingDetalle(true);
    try {
      const data = await (await fetch(`/api/productos/${prod.id}`)).json();
      if (data.detalle) setDetalleProducto(data.detalle);
    } catch (e) { console.error(e); }
    finally { setLoadingDetalle(false); }
  };

  const cerrarModal = () => { setProductoSeleccionado(null); setDetalleProducto(null); };

  const handleAgregarCarrito = () => {
    addToCart(productoSeleccionado, cantidad);
    window.dispatchEvent(new Event('openCart'));
    cerrarModal();
  };

  const totalProductos  = productos.length;
  const totalDisponibles= productos.filter(p => p.stock > 0).length;

  return (
    <div className="catalogo-page-container">
      <div className="animacion-portal-entrada">

        <ClientNavbar />

        {/* ══════════════════════════════════════
            HERO — imagen de fondo + título
            (los filtros ya NO están aquí)
        ══════════════════════════════════════ */}
        <section className="cat-hero-section">
          <div className="cat-hero-overlay" />

          <div className="cat-hero-content container-lg">

            {/* izquierda: título + stats */}
            <div className="cat-hero-left">
              <span className="cat-tag-title">CATÁLOGO COMPLETO</span>
              <h1 className="cat-main-title">Tecnología para el campo</h1>
              <p className="cat-description">
                Monitoreo de humedad, temperatura y nutrientes en tiempo real.
                Conectividad directa a tu smartphone para tomar las mejores decisiones.
              </p>
              <div className="cat-stats-row">
                <div className="cat-stat"><span className="stat-num">📦 {totalProductos}</span><span className="stat-label">Productos</span></div>
                <div className="cat-stat"><span className="stat-num">✅ {totalDisponibles}</span><span className="stat-label">Disponibles</span></div>
                <div className="cat-stat"><span className="stat-num">🚚 48h</span><span className="stat-label">Despacho</span></div>
                <div className="cat-stat"><span className="stat-num">🛡️ 100%</span><span className="stat-label">Garantía</span></div>
              </div>
            </div>

            {/* derecha: tarjetas de categoría interactivas */}
            <div className="cat-hero-right">
              <div className="cat-category-cards">
                {CATEGORIAS.map(cat => (
                  <button
                    key={cat.name}
                    className={`cat-hero-cat-card ${activeTab === cat.name ? 'active-cat' : ''}`}
                    style={{ '--cat-color': cat.color }}
                    onClick={() => setActiveTab(activeTab === cat.name ? 'Todas' : cat.name)}
                  >
                    <span className="cat-card-icon">{cat.icon}</span>
                    <span className="cat-card-info">
                      <span className="cat-card-name">{cat.name}</span>
                      <span className="cat-card-count">{categoryCounts[cat.name] || 0} productos</span>
                    </span>
                    <span className="cat-card-arrow">›</span>
                  </button>
                ))}
              </div>
            </div>

          </div>
        </section>

        {/* ══════════════════════════════════════
            BODY: SIDEBAR + GRID
        ══════════════════════════════════════ */}
        <div className="cat-layout container-lg">

          {/* ─── SIDEBAR IZQUIERDO ─── */}
          <aside className="cat-sidebar">

            {/* Buscador */}
            <div className="sidebar-search-wrap">
              <svg className="sidebar-search-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Buscar productos..."
                className="sidebar-search-input"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button className="sidebar-search-clear" onClick={() => setSearchTerm('')}>✕</button>
              )}
            </div>

            {hasActiveFilters && (
              <button className="sidebar-clear-btn" onClick={clearFilters}>✕ Limpiar filtros</button>
            )}

            {/* Categoría */}
            <div className="cat-filter-section">
              <h4 className="filter-section-title">CATEGORÍA</h4>
              <button
                className={`sidebar-row ${activeTab === 'Todas' ? 'active' : ''}`}
                onClick={() => setActiveTab('Todas')}
              >
                <span className="row-check">{activeTab === 'Todas' ? '✓' : ''}</span>
                <span className="row-label">Todas</span>
                <span className="row-count">{categoryCounts['Todas'] || 0}</span>
              </button>
              {CATEGORIAS.map(cat => (
                <button
                  key={cat.name}
                  className={`sidebar-row ${activeTab === cat.name ? 'active' : ''}`}
                  style={activeTab === cat.name ? { '--row-color': cat.color } : {}}
                  onClick={() => setActiveTab(activeTab === cat.name ? 'Todas' : cat.name)}
                >
                  <span className="row-check">{activeTab === cat.name ? '✓' : ''}</span>
                  <span className="row-label">{cat.icon} {cat.name}</span>
                  <span className="row-count">{categoryCounts[cat.name] || 0}</span>
                </button>
              ))}
            </div>

            {/* Ver */}
            <div className="cat-filter-section">
              <h4 className="filter-section-title">VER</h4>
              <button
                className={`sidebar-row ${destacadoFilter ? 'active active-gold' : ''}`}
                onClick={() => setDestacadoFilter(!destacadoFilter)}
              >
                <span className="row-check">{destacadoFilter ? '✓' : ''}</span>
                <span className="row-label">⭐ Destacados</span>
              </button>
              <button
                className={`sidebar-row ${nuevoFilter ? 'active' : ''}`}
                onClick={() => setNuevoFilter(!nuevoFilter)}
              >
                <span className="row-check">{nuevoFilter ? '✓' : ''}</span>
                <span className="row-label">🆕 Nuevos</span>
              </button>
            </div>

            {/* Disponibilidad */}
            <div className="cat-filter-section">
              <h4 className="filter-section-title">DISPONIBILIDAD</h4>
              {['Todos', 'Disponibles', 'Agotados'].map(f => (
                <button
                  key={f}
                  className={`sidebar-row ${stockFilter === f ? 'active' : ''}`}
                  onClick={() => setStockFilter(f)}
                >
                  <span className="row-check">{stockFilter === f ? '✓' : ''}</span>
                  <span className="row-label">{f}</span>
                </button>
              ))}
            </div>

            {/* Marca */}
            {marcasDisponibles.length > 0 && (
              <div className="cat-filter-section">
                <h4 className="filter-section-title">MARCA</h4>
                <button
                  className={`sidebar-row ${marcaFilter === 'Todas' ? 'active' : ''}`}
                  onClick={() => setMarcaFilter('Todas')}
                >
                  <span className="row-check">{marcaFilter === 'Todas' ? '✓' : ''}</span>
                  <span className="row-label">Todas</span>
                </button>
                {marcasDisponibles.map(m => (
                  <button
                    key={m}
                    className={`sidebar-row ${marcaFilter === m ? 'active' : ''}`}
                    onClick={() => setMarcaFilter(marcaFilter === m ? 'Todas' : m)}
                  >
                    <span className="row-check">{marcaFilter === m ? '✓' : ''}</span>
                    <span className="row-label">{m}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Precio */}
            <div className="cat-filter-section">
              <h4 className="filter-section-title">PRECIO</h4>
              {RANGOS_PRECIO.map((r, i) => (
                <button
                  key={i}
                  className={`sidebar-row ${precioRango === i ? 'active' : ''}`}
                  onClick={() => setPrecioRango(i)}
                >
                  <span className="row-check">{precioRango === i ? '✓' : ''}</span>
                  <span className="row-label">{r.label}</span>
                </button>
              ))}
            </div>

          </aside>

          {/* ─── MAIN: barra de resultados + grid ─── */}
          <div className="cat-main">

            <div className="cat-results-bar">
              <span className="results-count">
                <strong>{productosFiltrados.length}</strong> resultado{productosFiltrados.length !== 1 ? 's' : ''}
              </span>
              <div className="results-sort">
                <span className="sort-label">Ordenar por</span>
                <select className="filter-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                  <option value="default">Relevancia</option>
                  <option value="precio-asc">Precio ↑</option>
                  <option value="precio-desc">Precio ↓</option>
                  <option value="nombre-asc">Nombre A–Z</option>
                  <option value="destacado">Destacados</option>
                  <option value="nuevo">Más nuevos</option>
                </select>
              </div>
            </div>

            <div className="productos-grid">
              {productosFiltrados.length === 0 ? (
                <div className="cat-empty-state">
                  <span className="empty-icon">🔍</span>
                  <p>No se encontraron productos con estos filtros.</p>
                  {hasActiveFilters && (
                    <button className="sidebar-clear-btn" onClick={clearFilters}>Limpiar filtros</button>
                  )}
                </div>
              ) : (
                productosFiltrados.map((prod) => {
                  const { precio_actual, precio_tachado, tiene_oferta } = getPrecios(prod);
                  const badge = getBadge(prod);
                  return (
                    <div
                      key={prod.id}
                      className={`producto-card${prod.stock === 0 ? ' agotado-card' : ''}${prod.destacado ? ' destacado-card' : ''}`}
                    >
                      <div className="card-img-container">
                        <span className="categoria-badge">{prod.categoria}</span>
                        {badge && <span className={`estado-badge ${badge.cls}`}>{badge.label}</span>}
                        <img
                          src={prod.imagen_url || 'https://images.unsplash.com/photo-1592417817098-8f3d6eb18865?w=500'}
                          alt={prod.nombre}
                          loading="lazy"
                        />
                      </div>
                      <div className="card-info">
                        <span className="sku-text">SKU: {prod.sku}{prod.marca ? ` · ${prod.marca}` : ''}</span>
                        <h3 className="producto-titulo">{prod.nombre}</h3>
                        {prod.descripcion_corta && (
                          <p className="prod-desc-corta">{prod.descripcion_corta}</p>
                        )}
                        <div className="precio-container">
                          {precio_tachado && (
                            <span className={`precio-tachado${tiene_oferta ? ' oferta-tachado' : ''}`}>
                              {clp(precio_tachado)}
                            </span>
                          )}
                          <div className="precio-row">
                            <span className={`precio${tiene_oferta ? ' precio-oferta-color' : ''}`}>
                              {clp(precio_actual)} <small>CLP</small>
                            </span>
                            {precio_tachado && (
                              <span className="descuento-pct">
                                -{Math.round((1 - precio_actual / precio_tachado) * 100)}%
                              </span>
                            )}
                          </div>
                        </div>
                        {prod.tiempo_entrega && (
                          <span className="tiempo-entrega">🚚 {prod.tiempo_entrega}</span>
                        )}
                        <button className="btn-ver-detalles" onClick={() => abrirModal(prod)}>
                          {prod.stock === 0 ? 'VER DETALLES (SIN STOCK)' : 'VER DETALLES'}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>
        </div>

      </div>

      {/* ══════════════════════════════════════
          MODAL DETALLE DE PRODUCTO
      ══════════════════════════════════════ */}
      {productoSeleccionado && (() => {
        const { precio_actual, precio_tachado, tiene_oferta } = getPrecios(productoSeleccionado);
        const labelsMap = LABELS_DETALLE[productoSeleccionado.categoria] || {};
        return (
          <div className="modal-overlay" onClick={cerrarModal}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>

              <div className="modal-left">
                <span className="categoria-badge modal-badge">{productoSeleccionado.categoria}</span>
                {productoSeleccionado.nuevo && <span className="modal-nuevo-tag">NUEVO</span>}
                <img
                  src={productoSeleccionado.imagen_url || 'https://images.unsplash.com/photo-1592417817098-8f3d6eb18865?w=500'}
                  alt={productoSeleccionado.nombre}
                  className="modal-img-clickable"
                  onClick={() => setLightboxSrc(productoSeleccionado.imagen_url || 'https://images.unsplash.com/photo-1592417817098-8f3d6eb18865?w=500')}
                  title="Clic para ampliar"
                />
                <div className="modal-img-zoom-hint">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35M11 8v6M8 11h6"/></svg>
                  Ampliar imagen
                </div>
              </div>

              <div className="modal-right">
                <div className="modal-top-bar">
                  <span className="modal-top-label">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                    </svg>
                    FICHA DE PRODUCTO
                  </span>
                  <button className="btn-close-modal" onClick={cerrarModal}>✕</button>
                </div>

                <h2 className="modal-titulo">{productoSeleccionado.nombre}</h2>
                <span className="sku-text modal-sku">SKU: {productoSeleccionado.sku}</span>

                <div className="modal-precio-row">
                  <div>
                    {precio_tachado && (
                      <span className={`modal-precio-tachado${tiene_oferta ? ' oferta-tachado' : ''}`}>
                        {clp(precio_tachado)} CLP
                      </span>
                    )}
                    <div className={`precio-gigante${tiene_oferta ? ' precio-oferta-color' : ''}`}>
                      {clp(precio_actual)} <small>CLP</small>
                    </div>
                  </div>
                  {productoSeleccionado.stock > 0
                    ? <span className="stock-pill pill-green">• {productoSeleccionado.stock} UDS.</span>
                    : <span className="stock-pill pill-red">• AGOTADO</span>
                  }
                </div>

                {/* Datos rápidos */}
                {(productoSeleccionado.marca || productoSeleccionado.modelo || productoSeleccionado.garantia || productoSeleccionado.peso || productoSeleccionado.tiempo_entrega || productoSeleccionado.pais_origen) && (
                  <div className="modal-info-grid">
                    {productoSeleccionado.marca && <div className="info-cell"><div className="info-cell-label">Marca</div><div className="info-cell-value">{productoSeleccionado.marca}</div></div>}
                    {productoSeleccionado.modelo && <div className="info-cell"><div className="info-cell-label">Modelo</div><div className="info-cell-value">{productoSeleccionado.modelo}</div></div>}
                    {productoSeleccionado.garantia && <div className="info-cell"><div className="info-cell-label">Garantía</div><div className="info-cell-value highlight-green">{productoSeleccionado.garantia}</div></div>}
                    {productoSeleccionado.peso && <div className="info-cell"><div className="info-cell-label">Peso</div><div className="info-cell-value">{productoSeleccionado.peso}</div></div>}
                    {productoSeleccionado.tiempo_entrega && <div className="info-cell"><div className="info-cell-label">Entrega</div><div className="info-cell-value">🚚 {productoSeleccionado.tiempo_entrega}</div></div>}
                    {productoSeleccionado.pais_origen && <div className="info-cell"><div className="info-cell-label">Origen</div><div className="info-cell-value">{productoSeleccionado.pais_origen}</div></div>}
                  </div>
                )}

                {(productoSeleccionado.descripcion_corta || productoSeleccionado.descripcion) && (
                  <div className="modal-descripcion">
                    <span className="desc-label">DESCRIPCIÓN</span>
                    <p>{productoSeleccionado.descripcion_corta || productoSeleccionado.descripcion}</p>
                  </div>
                )}

                {/* Ficha técnica completa */}
                {(loadingDetalle || detalleProducto) && (
                  <div className="modal-detalle-section">
                    <span className="desc-label">FICHA TÉCNICA COMPLETA</span>
                    {loadingDetalle ? (
                      <div className="detalle-loading">
                        <span className="detalle-loader" />
                        Cargando ficha técnica…
                      </div>
                    ) : (
                      <div className="detalle-grid">
                        {Object.entries(labelsMap)
                          .filter(([key]) => detalleProducto[key] != null && detalleProducto[key] !== '')
                          .map(([key, label]) => (
                            <div key={key} className="detalle-row">
                              <span className="detalle-label">{label}</span>
                              <span className="detalle-valor">
                                {typeof detalleProducto[key] === 'boolean'
                                  ? (detalleProducto[key] ? 'Sí' : 'No')
                                  : detalleProducto[key]}
                              </span>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                )}

                {productoSeleccionado.certificaciones && (
                  <div className="modal-descripcion">
                    <span className="desc-label">CERTIFICACIONES</span>
                    <p>{productoSeleccionado.certificaciones}</p>
                  </div>
                )}

                <div className="modal-actions">
                  <div className="selector-cantidad-modal">
                    <button onClick={() => setCantidad(Math.max(1, cantidad - 1))}>-</button>
                    <span>{cantidad}</span>
                    <button onClick={() => setCantidad(Math.min(productoSeleccionado.stock, cantidad + 1))}>+</button>
                  </div>
                  <button
                    className={`btn-agregar-carrito${productoSeleccionado.stock === 0 ? ' disabled' : ''}`}
                    onClick={handleAgregarCarrito}
                    disabled={productoSeleccionado.stock === 0}
                  >
                    {productoSeleccionado.stock === 0 ? 'SIN STOCK' : 'AGREGAR AL CARRITO'}
                  </button>
                </div>

                <button className="btn-solicitud" onClick={() => { cerrarModal(); navigate('/cliente/solicitud'); }}>
                  ¿Necesitas asesoría? → Solicitud en terreno
                </button>
              </div>

            </div>
          </div>
        );
      })()}

      {/* ══════════════════════════════════════
          LIGHTBOX — ver imagen ampliada
      ══════════════════════════════════════ */}
      {lightboxSrc && (
        <div className="lightbox-overlay" onClick={() => setLightboxSrc(null)}>
          <button className="lightbox-close" onClick={() => setLightboxSrc(null)}>✕</button>
          <img
            className="lightbox-img"
            src={lightboxSrc}
            alt="Imagen ampliada"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}

export default ClienteCatalogo;
