import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import { adminFetch } from '../services/api';
import './Backoffice.css';

// Campos de ficha técnica por categoría
const DETALLE_FIELDS = {
  'Tecnología': [
    { key: 'conectividad',       label: 'Conectividad',         placeholder: 'WiFi 2.4GHz / LoRa / 4G' },
    { key: 'protocolo',          label: 'Protocolo',            placeholder: 'MQTT / HTTP / Zigbee' },
    { key: 'tipo_alimentacion',  label: 'Alimentación',         placeholder: 'Solar / Batería 3.7V / USB-C' },
    { key: 'autonomia',          label: 'Autonomía',            placeholder: 'Hasta 6 meses' },
    { key: 'variables_medidas',  label: 'Variables medidas',    placeholder: 'Temperatura, Humedad, pH' },
    { key: 'precision_medicion', label: 'Precisión',            placeholder: '±0.5°C / ±2%HR' },
    { key: 'rango_medicion',     label: 'Rango de medición',    placeholder: '-40°C a +85°C' },
    { key: 'ip_proteccion',      label: 'Protección IP',        placeholder: 'IP67' },
    { key: 'rango_temperatura',  label: 'Temp. operación',      placeholder: '-20°C a +70°C' },
    { key: 'dimensiones',        label: 'Dimensiones',          placeholder: '120 x 80 x 40 mm' },
    { key: 'plataforma_app',     label: 'App / Plataforma',     placeholder: 'iOS, Android, Web' },
    { key: 'integraciones',      label: 'Integraciones',        placeholder: 'Alexa, Google Home, API REST' },
    { key: 'almacenamiento',     label: 'Almacenamiento datos', placeholder: '1 año en nube' },
  ],
  'Maquinaria': [
    { key: 'motor_tipo',         label: 'Tipo de motor',        placeholder: 'Diesel / Eléctrico' },
    { key: 'potencia',           label: 'Potencia',             placeholder: '60 HP' },
    { key: 'combustible',        label: 'Combustible',          placeholder: 'Diésel' },
    { key: 'capacidad',          label: 'Capacidad',            placeholder: '800 L' },
    { key: 'rendimiento',        label: 'Rendimiento',          placeholder: '5 ha/hora' },
    { key: 'ancho_trabajo',      label: 'Ancho de trabajo',     placeholder: '3 m' },
    { key: 'requiere_tractor',   label: 'Requiere tractor',     type: 'boolean' },
    { key: 'hp_requerido',       label: 'HP requerido',         placeholder: '80 HP mín.' },
    { key: 'enganche',           label: 'Enganche',             placeholder: 'Categoría II' },
    { key: 'pto_rpm',            label: 'PTO / RPM',            placeholder: '540 RPM' },
    { key: 'dimensiones',        label: 'Dimensiones',          placeholder: '4.5 x 2.1 x 2.8 m' },
    { key: 'peso_operativo',     label: 'Peso operativo',       placeholder: '1.800 kg' },
    { key: 'material_estructura',label: 'Estructura',           placeholder: 'Acero galvanizado' },
  ],
  'Insumos': [
    { key: 'ingrediente_activo', label: 'Ingrediente activo',   placeholder: 'Glifosato 48%' },
    { key: 'tipo_formulacion',   label: 'Formulación',          placeholder: 'Concentrado soluble (CS)' },
    { key: 'modo_accion',        label: 'Modo de acción',       placeholder: 'Sistémico / Contacto' },
    { key: 'cultivos_objetivo',  label: 'Cultivos objetivo',    placeholder: 'Trigo, maíz, soya' },
    { key: 'plagas_objetivo',    label: 'Plagas / Malezas',     placeholder: 'Roya amarilla, áfidos' },
    { key: 'dosis_recomendada',  label: 'Dosis recomendada',    placeholder: '2 L/ha' },
    { key: 'momento_aplicacion', label: 'Momento aplicación',   placeholder: 'Pre-emergencia' },
    { key: 'numero_aplicaciones',label: 'N° aplicaciones',      placeholder: '2 por temporada' },
    { key: 'periodo_carencia',   label: 'Período carencia',     placeholder: '14 días' },
    { key: 'reingreso_campo',    label: 'Reingreso al campo',   placeholder: '24 horas' },
    { key: 'clase_toxicologica', label: 'Clase toxicológica',   placeholder: 'Banda verde (IV)' },
    { key: 'registro_sag',       label: 'Registro SAG',         placeholder: 'SAG N° 1234-A' },
    { key: 'epp_requerido',      label: 'EPP requerido',        placeholder: 'Guantes, mascarilla, traje' },
    { key: 'temperatura_almacen',label: 'Almacenamiento',       placeholder: '5°C a 30°C, lugar seco' },
    { key: 'vida_util',          label: 'Vida útil',            placeholder: '2 años' },
    { key: 'presentacion',       label: 'Presentación',         placeholder: 'Bidón 20 L' },
  ],
};

const FORM_EMPTY = {
  id: null,
  // Básicos
  nombre: '', sku: '', categoria: 'Insumos', marca: '', modelo: '',
  // Precios
  precio_clp: '', precio_anterior: '', precio_oferta: '',
  // Stock
  stock: '', stock_minimo: 5, unidad_medida: 'unidad',
  // Descripción
  descripcion: '', descripcion_corta: '',
  // Logística
  peso: '', garantia: '', tiempo_entrega: '', pais_origen: '', certificaciones: '',
  // Extras
  etiquetas: '', documento_url: '', ficha_tecnica: '',
  imagen_url: '', imagen_alt: '',
  // Indicadores
  destacado: false, nuevo: false, disponible: true,
  // Ficha técnica estructurada
  detalle: {},
};

function Backoffice() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    const adminStr = localStorage.getItem('adminAgrosmart');
    if (!adminStr) { navigate('/admin'); return; }
    try {
      const admin = JSON.parse(adminStr);
      if (admin.rol !== 'admin') navigate('/admin');
    } catch { navigate('/admin'); }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('adminAgrosmart');
    localStorage.removeItem('adminTokenAgrosmart');
    navigate('/admin');
  };

  // ── Catálogo ────────────────────────────────────────────────
  const [productos,       setProductos]      = useState([]);
  const [searchTerm,      setSearchTerm]     = useState('');
  const [activeFilter,    setActiveFilter]   = useState('Todos');
  const [showModal,       setShowModal]      = useState(false);
  const [modalMode,       setModalMode]      = useState('add');
  const [formData,        setFormData]       = useState(FORM_EMPTY);
  const [formTab,         setFormTab]        = useState('general');
  const [productoFile,    setProductoFile]   = useState(null);
  const [eliminandoImg,   setEliminandoImg]  = useState(false);
  const [loadingDetalle,  setLoadingDetalle] = useState(false);

  // ── Solicitudes ─────────────────────────────────────────────
  const [solicitudes, setSolicitudes] = useState([]);
  const [loadingSol,  setLoadingSol]  = useState(false);
  const [modalSol,    setModalSol]    = useState(null);
  const [formSol,     setFormSol]     = useState({ estado: '', fecha_visita_programada: '', tecnico_asignado: '', notas_admin: '' });
  const [guardando,   setGuardando]   = useState(false);

  // ── Dashboard ────────────────────────────────────────────────
  const [dashboardStats, setDashboardStats] = useState(null);
  const [loadingDash,    setLoadingDash]    = useState(false);

  // ── Cursos ───────────────────────────────────────────────────
  const [cursos,        setCursos]       = useState([]);
  const [searchCurso,   setSearchCurso]  = useState('');
  const [filterCurso,   setFilterCurso]  = useState('Todos');
  const [showCursoModal,setShowCursoModal]= useState(false);
  const [cursoMode,     setCursoMode]    = useState('add');
  const [formCurso,     setFormCurso]    = useState({
    id: null, nombre: '', sku: '', categoria: 'Tecnología', precio_clp: '', stock: 99,
    descripcion: '', imagen_url: '', horas: 0, modulos: 0, dificultad: 'Básico', instructor: ''
  });

  // ── Finanzas ─────────────────────────────────────────────────
  const [ventasProductosList, setVentasProductosList] = useState([]);
  const [ventasCursosList,    setVentasCursosList]    = useState([]);
  const [filtroVentaCat,      setFiltroVentaCat]      = useState('Todas');
  const [searchVentaProd,     setSearchVentaProd]     = useState('');
  const [filtroVentaCur,      setFiltroVentaCur]      = useState('Todas');
  const [searchVentaCur,      setSearchVentaCur]      = useState('');
  const [loadingVentas,       setLoadingVentas]       = useState(false);

  // ── Fetchers ─────────────────────────────────────────────────
  const fetchProductos = async () => {
    try {
      const data = await (await adminFetch('/api/productos')).json();
      setProductos(data);
    } catch (e) { console.error(e); }
  };

  const fetchDashboard = async () => {
    setLoadingDash(true);
    try {
      const data = await (await adminFetch('/api/ventas/stats')).json();
      setDashboardStats(data);
    } catch (e) { console.error(e); setDashboardStats(null); }
    finally { setLoadingDash(false); }
  };

  const fetchListadoVentas = async () => {
    setLoadingVentas(true);
    try {
      const pp = new URLSearchParams();
      if (filtroVentaCat !== 'Todas') pp.append('categoria', filtroVentaCat);
      if (searchVentaProd) pp.append('q', searchVentaProd);
      const pc = new URLSearchParams();
      if (filtroVentaCur !== 'Todas') pc.append('categoria', filtroVentaCur);
      if (searchVentaCur) pc.append('q', searchVentaCur);
      const [rP, rC] = await Promise.all([adminFetch(`/api/ventas/productos?${pp}`), adminFetch(`/api/ventas/cursos?${pc}`)]);
      if (rP.ok) setVentasProductosList(await rP.json());
      if (rC.ok) setVentasCursosList(await rC.json());
    } catch (e) { console.error(e); }
    finally { setLoadingVentas(false); }
  };

  const fetchSolicitudes = async () => {
    setLoadingSol(true);
    try {
      const data = await (await adminFetch('/api/solicitudes')).json();
      setSolicitudes(Array.isArray(data) ? data : []);
    } catch (e) { setSolicitudes([]); }
    finally { setLoadingSol(false); }
  };

  const fetchCursos = async () => {
    try {
      const data = await (await adminFetch('/api/cursos')).json();
      setCursos(Array.isArray(data) ? data : []);
    } catch (e) { setCursos([]); }
  };

  useEffect(() => {
    if (activeTab === 'catalogo')    fetchProductos();
    if (activeTab === 'solicitudes') fetchSolicitudes();
    if (activeTab === 'cursos')      fetchCursos();
    if (activeTab === 'dashboard')   fetchDashboard();
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'finanzas') fetchListadoVentas();
  }, [activeTab, filtroVentaCat, searchVentaProd, filtroVentaCur, searchVentaCur]);

  // ── Helpers ──────────────────────────────────────────────────
  const fmtCLP = (n) => '$' + Number(n || 0).toLocaleString('es-CL');
  const nombreMes = (ym) => {
    if (!ym) return '';
    const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    const [y, m] = ym.split('-');
    return `${meses[parseInt(m, 10) - 1]} ${y.slice(2)}`;
  };

  const getEstadoBadge = (stock) => {
    if (stock === 0)  return <span className="pill pill-orange">Agotado</span>;
    if (stock <= 5)   return <span className="pill pill-warning">Stock Bajo</span>;
    return <span className="pill pill-green">Disponible</span>;
  };

  const productosFiltrados = productos.filter(p => {
    const matchSearch = (p.nombre + p.sku).toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat    = activeFilter === 'Todos' || p.categoria === activeFilter;
    return matchSearch && matchCat;
  });

  const stats = {
    total:       productos.length,
    disponibles: productos.filter(p => p.stock > 5).length,
    stockBajo:   productos.filter(p => p.stock > 0 && p.stock <= 5).length,
    agotados:    productos.filter(p => p.stock === 0).length,
  };

  // ── Modal producto ────────────────────────────────────────────
  const setField  = (key, val) => setFormData(prev => ({ ...prev, [key]: val }));
  const setDetalle = (key, val) => setFormData(prev => ({ ...prev, detalle: { ...prev.detalle, [key]: val } }));

  const openAddModal = () => {
    setModalMode('add');
    setFormData(FORM_EMPTY);
    setProductoFile(null);
    setFormTab('general');
    setShowModal(true);
  };

  const openEditModal = async (prod) => {
    setModalMode('edit');
    setFormData({ ...FORM_EMPTY, ...prod, detalle: {} });
    setProductoFile(null);
    setFormTab('general');
    setShowModal(true);
    setLoadingDetalle(true);
    try {
      const full = await (await adminFetch(`/api/productos/${prod.id}`)).json();
      setFormData(prev => ({ ...prev, ...full, detalle: full.detalle || {} }));
    } catch (e) { console.error(e); }
    finally { setLoadingDetalle(false); }
  };

  const handleEliminarImagen = async () => {
    if (!formData.id || !window.confirm('¿Eliminar la imagen actual?')) return;
    setEliminandoImg(true);
    try {
      const res = await adminFetch(`/api/productos/${formData.id}/imagen`, { method: 'DELETE' });
      if (res.ok) { setField('imagen_url', ''); fetchProductos(); }
    } catch (e) { console.error(e); }
    finally { setEliminandoImg(false); }
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    const method = modalMode === 'add' ? 'POST' : 'PUT';
    const url    = modalMode === 'add' ? '/api/productos' : `/api/productos/${formData.id}`;
    try {
      const res = await adminFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        const saved = await res.json();
        const pid = saved.producto?.id || formData.id;
        if (productoFile && pid) {
          const fd = new FormData();
          fd.append('imagen', productoFile);
          await adminFetch(`/api/productos/${pid}/imagen`, { method: 'POST', body: fd });
        }
        setShowModal(false);
        setProductoFile(null);
        fetchProductos();
      } else {
        alert('Error al guardar el producto');
      }
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este producto del catálogo?')) return;
    try {
      const res = await adminFetch(`/api/productos/${id}`, { method: 'DELETE' });
      if (res.ok) { alert('Producto eliminado.'); fetchProductos(); }
      else { const d = await res.json(); alert('⚠️ ' + d.error); }
    } catch (e) { console.error(e); }
  };

  // ── Solicitudes ───────────────────────────────────────────────
  const abrirModalSol = (sol) => {
    setModalSol(sol);
    setFormSol({
      estado: sol.estado || 'Pendiente',
      fecha_visita_programada: sol.fecha_visita_programada?.split('T')[0] || '',
      tecnico_asignado: sol.tecnico_asignado || '',
      notas_admin: sol.notas_admin || '',
    });
  };

  const guardarSolicitud = async () => {
    setGuardando(true);
    try {
      const res = await adminFetch(`/api/solicitudes/${modalSol.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formSol),
      });
      if (res.ok) { setModalSol(null); fetchSolicitudes(); }
    } catch (e) { console.error(e); }
    finally { setGuardando(false); }
  };

  // ── Cursos ────────────────────────────────────────────────────
  const cursosFiltrados = cursos.filter(c => {
    const matchSearch = (c.nombre + (c.sku || '')).toLowerCase().includes(searchCurso.toLowerCase());
    const matchCat    = filterCurso === 'Todos' || c.categoria === filterCurso;
    return matchSearch && matchCat;
  });

  const openAddCursoModal = () => {
    setCursoMode('add');
    setFormCurso({ id: null, nombre: '', sku: '', categoria: 'Tecnología', precio_clp: '', stock: 99, descripcion: '', imagen_url: '', horas: 0, modulos: 0, dificultad: 'Básico', instructor: '' });
    setShowCursoModal(true);
  };

  const openEditCursoModal = (c) => { setCursoMode('edit'); setFormCurso({ ...c }); setShowCursoModal(true); };

  const handleSaveCurso = async (e) => {
    e.preventDefault();
    const method = cursoMode === 'add' ? 'POST' : 'PUT';
    const url    = cursoMode === 'add' ? '/api/cursos' : `/api/cursos/${formCurso.id}`;
    try {
      const res = await adminFetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formCurso) });
      if (res.ok) { setShowCursoModal(false); fetchCursos(); }
      else { const err = await res.json(); alert('Error: ' + (err.error || 'No se pudo guardar')); }
    } catch (e) { console.error(e); }
  };

  const handleDeleteCurso = async (id) => {
    if (!window.confirm('¿Eliminar este curso?')) return;
    try {
      const res = await adminFetch(`/api/cursos/${id}`, { method: 'DELETE' });
      if (res.ok) { alert('Curso eliminado.'); fetchCursos(); }
      else { const err = await res.json(); alert('⚠️ ' + err.error); }
    } catch (e) { console.error(e); }
  };

  // ── Ficha técnica dinámica ────────────────────────────────────
  const detalleFields = DETALLE_FIELDS[formData.categoria] || [];

  // ═══════════════════════════════════════════════════════════════
  //  RENDER
  // ═══════════════════════════════════════════════════════════════
  return (
    <div className="backoffice-layout">

      {/* ── Sidebar ── */}
      <aside className="backoffice-sidebar">
        <div className="sidebar-brand">
          <img src={logo} alt="AgroSmart" className="sidebar-logo" />
          <div><h3>AgroSmart</h3><span>BACKOFFICE</span></div>
        </div>
        <nav className="sidebar-nav">
          {[
            { id: 'dashboard',   icon: '㗊',  label: 'Panel de Control' },
            { id: 'catalogo',    icon: '📦',  label: 'Gestión de Catálogo' },
            { id: 'inventario',  icon: '🏭',  label: 'Inventario y Almacén' },
            { id: 'despachos',   icon: '🚚',  label: 'Despachos' },
            { id: 'finanzas',    icon: '💲',  label: 'Finanzas y Ventas' },
            { id: 'solicitudes', icon: '🛠️', label: 'Solicitudes en Terreno' },
            { id: 'cursos',      icon: '🎓',  label: 'Gestión de Cursos' },
          ].map(t => (
            <button key={t.id} className={`nav-item ${activeTab === t.id ? 'active' : ''}`} onClick={() => setActiveTab(t.id)}>
              <span className="icon">{t.icon}</span> {t.label}
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button className="nav-item btn-logout" onClick={handleLogout}><span className="icon">🚪</span> Cerrar Sesión</button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="backoffice-main">
        <header className="backoffice-header">
          <div className="search-bar-admin">
            <span className="icon">🔍</span>
            <input type="text" placeholder="Búsqueda global..." />
          </div>
          <div className="header-actions">
            <div className="date-display"><span className="date">Hoy</span></div>
            <button className="notification-btn"><span className="icon">🔔</span></button>
            <div className="admin-profile"><div className="avatar">AS</div><div className="info"><strong>Admin</strong></div></div>
          </div>
        </header>

        <div className="backoffice-content animacion-entrada">

          {/* ══ CATÁLOGO ══ */}
          {activeTab === 'catalogo' && (
            <div className="catalogo-view fade-in">
              <div className="view-header">
                <div><h2>Gestión de Catálogo</h2><p>Control total de productos visibles en la tienda del cliente.</p></div>
                <button className="btn-primary-action" onClick={openAddModal}>+ Agregar Producto</button>
              </div>

              <div className="metrics-grid mb-20">
                <div className="metric-card-small"><span className="icon-box bg-cyan-light text-cyan">📦</span><div><h3>{stats.total}</h3><p>Total</p></div></div>
                <div className="metric-card-small"><span className="icon-box bg-green-light text-green">✓</span><div><h3>{stats.disponibles}</h3><p>Disponibles</p></div></div>
                <div className="metric-card-small"><span className="icon-box bg-warning-light text-warning">⚠️</span><div><h3>{stats.stockBajo}</h3><p>Stock Bajo</p></div></div>
                <div className="metric-card-small"><span className="icon-box bg-orange-light text-orange">✕</span><div><h3>{stats.agotados}</h3><p>Agotados</p></div></div>
              </div>

              <div className="glass-panel">
                <div className="table-toolbar">
                  <div className="search-bar-admin">
                    <span className="icon">🔍</span>
                    <input type="text" placeholder="Buscar por nombre o SKU..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                  </div>
                  <div className="filter-pills">
                    {['Todos','Tecnología','Maquinaria','Insumos'].map(cat => (
                      <button key={cat} className={activeFilter === cat ? 'active' : ''} onClick={() => setActiveFilter(cat)}>{cat}</button>
                    ))}
                  </div>
                </div>

                <div className="table-scroll-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>PRODUCTO</th><th>SKU</th><th>CATEGORÍA</th>
                        <th>PRECIO</th><th>OFERTA</th><th>STOCK</th>
                        <th>BADGES</th><th>ESTADO</th><th>ACCIONES</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productosFiltrados.length === 0 ? (
                        <tr><td colSpan="9" style={{textAlign:'center', padding:'2rem', color:'#94a3b8'}}>No se encontraron productos.</td></tr>
                      ) : productosFiltrados.map(item => (
                        <tr key={item.id}>
                          <td>
                            <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                              {item.imagen_url && <img src={item.imagen_url} alt="" style={{width:36, height:36, borderRadius:6, objectFit:'cover', border:'1px solid rgba(255,255,255,0.1)'}} />}
                              <div>
                                <strong>{item.nombre}</strong>
                                {item.descripcion_corta && <div style={{fontSize:'0.72rem', color:'#64748b', marginTop:2, maxWidth:220, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{item.descripcion_corta}</div>}
                              </div>
                            </div>
                          </td>
                          <td className="text-cyan">{item.sku}</td>
                          <td>{item.categoria}</td>
                          <td><strong>{fmtCLP(item.precio_clp)}</strong></td>
                          <td>{item.precio_oferta ? <span className="text-green">{fmtCLP(item.precio_oferta)}</span> : <span style={{color:'#4a5568'}}>—</span>}</td>
                          <td><strong className={item.stock === 0 ? 'text-orange' : 'text-green'}>{item.stock}</strong> uds.</td>
                          <td>
                            <div style={{display:'flex', gap:4, flexWrap:'wrap'}}>
                              {item.destacado && <span className="pill" style={{background:'rgba(245,197,66,0.15)', color:'#f5c542', border:'1px solid rgba(245,197,66,0.3)', fontSize:'0.65rem'}}>★ TOP</span>}
                              {item.nuevo     && <span className="pill" style={{background:'rgba(0,221,235,0.12)', color:'#00ddeb', border:'1px solid rgba(0,221,235,0.3)', fontSize:'0.65rem'}}>NUEVO</span>}
                            </div>
                          </td>
                          <td>{getEstadoBadge(item.stock)}</td>
                          <td>
                            <div style={{display:'flex', gap:'8px'}}>
                              <button onClick={() => openEditModal(item)} style={{background:'none', border:'none', cursor:'pointer', fontSize:'1.1rem'}} title="Editar">✏️</button>
                              <button onClick={() => handleDelete(item.id)}  style={{background:'none', border:'none', cursor:'pointer', fontSize:'1.1rem'}} title="Eliminar">🗑️</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ══ SOLICITUDES ══ */}
          {activeTab === 'solicitudes' && (
            <div className="solicitudes-view fade-in">
              <div className="view-header">
                <div><h2>Solicitudes en Terreno</h2><p>Visitas técnicas solicitadas por agricultores — programa y gestiona cada visita.</p></div>
                <button className="btn-primary-action" onClick={fetchSolicitudes}>↻ Actualizar</button>
              </div>
              <div className="metrics-grid mb-20">
                <div className="metric-card-small"><span className="icon-box bg-warning-light text-warning">⏳</span><div><h3>{solicitudes.filter(s => s.estado === 'Pendiente').length}</h3><p>Pendientes</p></div></div>
                <div className="metric-card-small"><span className="icon-box bg-cyan-light text-cyan">📅</span><div><h3>{solicitudes.filter(s => s.estado === 'Confirmada').length}</h3><p>Confirmadas</p></div></div>
                <div className="metric-card-small"><span className="icon-box bg-green-light text-green">✓</span><div><h3>{solicitudes.filter(s => s.estado === 'Completada').length}</h3><p>Completadas</p></div></div>
                <div className="metric-card-small"><span className="icon-box bg-orange-light text-orange">🚨</span><div><h3>{solicitudes.filter(s => s.urgencia === 'critico').length}</h3><p>Críticas</p></div></div>
              </div>
              <div className="glass-panel">
                {loadingSol ? (
                  <p style={{color:'#94a3b8', padding:'30px', textAlign:'center'}}>Cargando solicitudes...</p>
                ) : solicitudes.length === 0 ? (
                  <p style={{color:'#94a3b8', padding:'30px', textAlign:'center'}}>No hay solicitudes aún.</p>
                ) : (
                  <table className="admin-table">
                    <thead><tr><th>ID</th><th>CLIENTE</th><th>TIPO</th><th>URGENCIA</th><th>EQUIPOS</th><th>FECHA</th><th>ESTADO</th><th>ACCIÓN</th></tr></thead>
                    <tbody>
                      {solicitudes.map(sol => (
                        <tr key={sol.id}>
                          <td className="text-cyan">#{sol.id}</td>
                          <td><strong>{sol.nombre_completo || 'Sin cuenta'}</strong><br/><span style={{color:'#94a3b8', fontSize:'0.8rem'}}>{sol.email || '—'}</span></td>
                          <td style={{textTransform:'capitalize'}}>{sol.tipo_soporte}</td>
                          <td><span className={`pill ${sol.urgencia === 'normal' ? 'pill-green' : sol.urgencia === 'urgente' ? 'pill-warning' : 'pill-orange'}`}>{sol.urgencia}</span></td>
                          <td style={{fontSize:'0.85rem', maxWidth:160}}>{sol.equipos}</td>
                          <td>{sol.fecha_preferida ? new Date(sol.fecha_preferida).toLocaleDateString('es-CL') : '—'}</td>
                          <td><span className={`pill ${sol.estado === 'Completada' ? 'pill-green' : sol.estado === 'Confirmada' ? 'pill-cyan-badge' : sol.estado === 'En Camino' ? 'pill-warning' : 'pill-orange'}`}>{sol.estado}</span></td>
                          <td><button className="btn-text-cyan" onClick={() => abrirModalSol(sol)}>Gestionar</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* ══ CURSOS ══ */}
          {activeTab === 'cursos' && (
            <div className="cursos-view fade-in">
              <div className="view-header">
                <div><h2>Gestión de Cursos</h2><p>Administra los cursos disponibles en la plataforma de capacitación.</p></div>
                <button className="btn-primary-action" onClick={openAddCursoModal}>+ Agregar Curso</button>
              </div>
              <div className="metrics-grid mb-20">
                <div className="metric-card-small"><span className="icon-box bg-cyan-light text-cyan">🎓</span><div><h3>{cursos.length}</h3><p>Total Cursos</p></div></div>
                <div className="metric-card-small"><span className="icon-box bg-green-light text-green">🆓</span><div><h3>{cursos.filter(c => Number(c.precio_clp) === 0).length}</h3><p>Gratuitos</p></div></div>
                <div className="metric-card-small"><span className="icon-box bg-warning-light text-warning">💰</span><div><h3>{cursos.filter(c => Number(c.precio_clp) > 0).length}</h3><p>De Pago</p></div></div>
                <div className="metric-card-small"><span className="icon-box bg-orange-light text-orange">⏱️</span><div><h3>{cursos.reduce((a, c) => a + (c.horas || 0), 0)}h</h3><p>Total Horas</p></div></div>
              </div>
              <div className="glass-panel">
                <div className="table-toolbar">
                  <div className="search-bar-admin"><span className="icon">🔍</span><input type="text" placeholder="Buscar por nombre o SKU..." value={searchCurso} onChange={e => setSearchCurso(e.target.value)} /></div>
                  <div className="filter-pills">
                    {['Todos','Tecnología','Maquinaria','Insumos','Asesorías'].map(cat => (
                      <button key={cat} className={filterCurso === cat ? 'active' : ''} onClick={() => setFilterCurso(cat)}>{cat}</button>
                    ))}
                  </div>
                </div>
                <table className="admin-table">
                  <thead><tr><th>CURSO</th><th>SKU</th><th>CATEGORÍA</th><th>INSTRUCTOR</th><th>HRS</th><th>DIFICULTAD</th><th>PRECIO</th><th>ACCIONES</th></tr></thead>
                  <tbody>
                    {cursosFiltrados.length === 0 ? (
                      <tr><td colSpan="8" style={{textAlign:'center', padding:'2rem', color:'#94a3b8'}}>No hay cursos.</td></tr>
                    ) : cursosFiltrados.map(c => (
                      <tr key={c.id}>
                        <td><strong>{c.nombre}</strong></td>
                        <td className="text-cyan">{c.sku}</td>
                        <td>{c.categoria}</td>
                        <td style={{fontSize:'0.85rem'}}>{c.instructor || '—'}</td>
                        <td><strong className="text-cyan">{c.horas}h</strong></td>
                        <td><span className={`pill ${c.dificultad === 'Básico' ? 'pill-green' : c.dificultad === 'Intermedio' ? 'pill-warning' : 'pill-orange'}`}>{c.dificultad}</span></td>
                        <td><strong>{Number(c.precio_clp) === 0 ? 'GRATIS' : fmtCLP(c.precio_clp)}</strong></td>
                        <td>
                          <div style={{display:'flex', gap:8}}>
                            <button onClick={() => openEditCursoModal(c)} style={{background:'none', border:'none', cursor:'pointer', fontSize:'1.1rem'}}>✏️</button>
                            <button onClick={() => handleDeleteCurso(c.id)} style={{background:'none', border:'none', cursor:'pointer', fontSize:'1.1rem'}}>🗑️</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ══ DASHBOARD ══ */}
          {activeTab === 'dashboard' && (
            <div className="dashboard-view fade-in">
              <div className="view-header">
                <div><h2>Panel de Control</h2><p>Visión integral de las ventas y operación del sistema AgroSmart.</p></div>
                <button className="btn-primary-action" onClick={fetchDashboard}>↻ Actualizar</button>
              </div>
              {loadingDash || !dashboardStats ? (
                <p style={{color:'#94a3b8', padding:'40px', textAlign:'center'}}>Cargando estadísticas...</p>
              ) : (
                <>
                  <div className="metrics-grid mb-20">
                    <div className="metric-card-small"><span className="icon-box bg-green-light text-green">💰</span><div><h3>{fmtCLP(dashboardStats.kpis.ingresos_totales)}</h3><p>Ingresos Totales</p></div></div>
                    <div className="metric-card-small"><span className="icon-box bg-cyan-light text-cyan">🧾</span><div><h3>{dashboardStats.kpis.total_ventas}</h3><p>Ventas Realizadas</p></div></div>
                    <div className="metric-card-small"><span className="icon-box bg-warning-light text-warning">📊</span><div><h3>{fmtCLP(dashboardStats.kpis.ticket_promedio)}</h3><p>Ticket Promedio</p></div></div>
                    <div className="metric-card-small"><span className="icon-box bg-orange-light text-orange">📦</span><div><h3>{dashboardStats.kpis.pendientes}</h3><p>Pendientes de Retiro</p></div></div>
                  </div>
                  <div className="charts-row mb-20" style={{gridTemplateColumns:'1.5fr 1fr'}}>
                    <div className="glass-panel">
                      <div className="panel-header"><div><h3>Ingresos por mes</h3><p>Últimos 6 meses</p></div></div>
                      {dashboardStats.ventasPorMes.length === 0 ? (
                        <p style={{color:'#94a3b8', textAlign:'center', padding:'40px'}}>Sin ventas registradas aún.</p>
                      ) : (
                        <div className="bar-chart">
                          {(() => {
                            const max = Math.max(...dashboardStats.ventasPorMes.map(v => Number(v.ingresos)), 1);
                            return dashboardStats.ventasPorMes.map(v => {
                              const h = (Number(v.ingresos) / max) * 100;
                              return (
                                <div className="bar-col" key={v.mes}>
                                  <div className="bar-value">{fmtCLP(v.ingresos)}</div>
                                  <div className="bar-wrap"><div className="bar-fill" style={{height:`${h}%`}} /></div>
                                  <div className="bar-label">{nombreMes(v.mes)}</div>
                                </div>
                              );
                            });
                          })()}
                        </div>
                      )}
                    </div>
                    <div className="glass-panel">
                      <div className="panel-header"><div><h3>Distribución por categoría</h3><p>Ingresos según categoría</p></div></div>
                      {dashboardStats.porCategoria.length === 0 ? (
                        <p style={{color:'#94a3b8', textAlign:'center', padding:'40px'}}>Sin datos.</p>
                      ) : (() => {
                        const total = dashboardStats.porCategoria.reduce((a, c) => a + Number(c.ingresos), 0) || 1;
                        const colors = ['#00ddeb','#28C76F','#ff9f43','#ea5455','#a855f7'];
                        let offset = 0;
                        const radius = 70, circ = 2 * Math.PI * radius;
                        return (
                          <div className="donut-wrap">
                            <svg viewBox="0 0 180 180" className="donut-svg">
                              <circle cx="90" cy="90" r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="22" />
                              {dashboardStats.porCategoria.map((c, i) => {
                                const len = (Number(c.ingresos) / total) * circ;
                                const el = <circle key={c.categoria} cx="90" cy="90" r={radius} fill="none" stroke={colors[i % colors.length]} strokeWidth="22" strokeDasharray={`${len} ${circ - len}`} strokeDashoffset={-offset} transform="rotate(-90 90 90)" strokeLinecap="butt" />;
                                offset += len;
                                return el;
                              })}
                            </svg>
                            <div className="donut-legend">
                              {dashboardStats.porCategoria.map((c, i) => (
                                <div className="legend-item" key={c.categoria}>
                                  <span className="legend-dot" style={{background:colors[i % colors.length]}} />
                                  <div><strong>{c.categoria}</strong><small>{fmtCLP(c.ingresos)} ({((Number(c.ingresos)/total)*100).toFixed(0)}%)</small></div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                  <div className="charts-row" style={{gridTemplateColumns:'1fr 1fr'}}>
                    <div className="glass-panel">
                      <div className="panel-header"><div><h3>Top 5 productos más vendidos</h3><p>Por unidades</p></div></div>
                      {dashboardStats.topProductos.length === 0 ? (
                        <p style={{color:'#94a3b8', textAlign:'center', padding:'40px'}}>Sin ventas registradas.</p>
                      ) : (
                        <div className="hbar-list">
                          {(() => {
                            const max = Math.max(...dashboardStats.topProductos.map(p => p.unidades_vendidas), 1);
                            return dashboardStats.topProductos.map(p => (
                              <div className="hbar-item" key={p.id}>
                                <div className="hbar-info"><strong>{p.nombre}</strong><span>{p.unidades_vendidas} uds · {fmtCLP(p.ingresos)}</span></div>
                                <div className="hbar-track"><div className="hbar-fill" style={{width:`${(p.unidades_vendidas / max) * 100}%`}} /></div>
                              </div>
                            ));
                          })()}
                        </div>
                      )}
                    </div>
                    <div className="glass-panel">
                      <div className="panel-header"><div><h3>Últimas ventas</h3><p>10 transacciones más recientes</p></div></div>
                      {(!dashboardStats.recientes || dashboardStats.recientes.length === 0) ? (
                        <p style={{color:'#94a3b8', textAlign:'center', padding:'40px'}}>Sin ventas recientes.</p>
                      ) : (
                        <table className="admin-table">
                          <thead><tr><th>ID</th><th>CLIENTE</th><th>TOTAL</th><th>ESTADO</th></tr></thead>
                          <tbody>
                            {dashboardStats.recientes.map(v => (
                              <tr key={v.id}>
                                <td className="text-cyan">#{v.id}</td>
                                <td>{v.cliente || '—'}</td>
                                <td><strong>{fmtCLP(v.total)}</strong></td>
                                <td><span className={`pill ${v.estado === 'Completada' ? 'pill-green' : 'pill-warning'}`}>{v.estado}</span></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ══ FINANZAS ══ */}
          {activeTab === 'finanzas' && (
            <div className="finanzas-view fade-in">
              <div className="view-header">
                <div><h2>Finanzas y Listado de Ventas</h2><p>Registro histórico detallado de todas las transacciones.</p></div>
                <button className="btn-primary-action" onClick={fetchListadoVentas}>↻ Actualizar</button>
              </div>
              <div className="glass-panel mb-20">
                <div className="panel-header"><h3>🛒 Ventas de Catálogo (Productos)</h3></div>
                <div className="table-toolbar">
                  <div className="search-bar-admin"><span className="icon">🔍</span><input type="text" placeholder="Buscar cliente o producto..." value={searchVentaProd} onChange={e => setSearchVentaProd(e.target.value)} /></div>
                  <div className="filter-pills">{['Todas','Tecnología','Maquinaria','Insumos'].map(c => <button key={c} className={filtroVentaCat === c ? 'active' : ''} onClick={() => setFiltroVentaCat(c)}>{c}</button>)}</div>
                </div>
                <table className="admin-table">
                  <thead><tr><th>FECHA</th><th>CLIENTE</th><th>PRODUCTO</th><th>CAT</th><th>CANT</th><th>PRECIO U.</th><th>SUBTOTAL</th></tr></thead>
                  <tbody>
                    {loadingVentas ? <tr><td colSpan="7" style={{textAlign:'center'}}>Cargando...</td></tr>
                     : ventasProductosList.length === 0 ? <tr><td colSpan="7" style={{textAlign:'center', color:'#94a3b8'}}>No hay ventas con esos filtros.</td></tr>
                     : ventasProductosList.map(v => (
                      <tr key={v.id}>
                        <td>{v.fecha ? new Date(v.fecha).toLocaleDateString('es-CL') : '—'}</td>
                        <td>{v.cliente}</td>
                        <td><strong>{v.producto}</strong><br/><small className="text-cyan">{v.sku}</small></td>
                        <td>{v.categoria}</td>
                        <td>{v.cantidad}</td>
                        <td>{fmtCLP(v.precio_unitario)}</td>
                        <td><strong className="text-green">{fmtCLP(v.subtotal)}</strong></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="glass-panel">
                <div className="panel-header"><h3>🎓 Ventas de Cursos (Inscripciones)</h3></div>
                <div className="table-toolbar">
                  <div className="search-bar-admin"><span className="icon">🔍</span><input type="text" placeholder="Buscar cliente o curso..." value={searchVentaCur} onChange={e => setSearchVentaCur(e.target.value)} /></div>
                  <div className="filter-pills">{['Todas','Tecnología','Maquinaria','Insumos','Asesorías'].map(c => <button key={c} className={filtroVentaCur === c ? 'active' : ''} onClick={() => setFiltroVentaCur(c)}>{c}</button>)}</div>
                </div>
                <table className="admin-table">
                  <thead><tr><th>FECHA</th><th>CLIENTE</th><th>CURSO</th><th>CAT</th><th>DIFICULTAD</th><th>TOTAL</th></tr></thead>
                  <tbody>
                    {loadingVentas ? <tr><td colSpan="6" style={{textAlign:'center'}}>Cargando...</td></tr>
                     : ventasCursosList.length === 0 ? <tr><td colSpan="6" style={{textAlign:'center', color:'#94a3b8'}}>No hay inscripciones.</td></tr>
                     : ventasCursosList.map(v => (
                      <tr key={v.id}>
                        <td>{new Date(v.fecha_inscripcion).toLocaleDateString('es-CL')}</td>
                        <td>{v.cliente}</td>
                        <td><strong>{v.curso}</strong></td>
                        <td>{v.categoria}</td>
                        <td><span className={`pill ${v.dificultad === 'Básico' ? 'pill-green' : v.dificultad === 'Intermedio' ? 'pill-warning' : 'pill-orange'}`}>{v.dificultad}</span></td>
                        <td><strong className="text-green">{v.precio_pagado == 0 ? 'GRATIS' : fmtCLP(v.precio_pagado)}</strong></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {!['catalogo','solicitudes','cursos','dashboard','finanzas'].includes(activeTab) && (
            <div className="building-view fade-in"><h2>Pantalla de {activeTab} en desarrollo</h2></div>
          )}

        </div>
      </main>

      {/* ═══════════════════════════════════════════
          MODAL PRODUCTO — todas las secciones
      ═══════════════════════════════════════════ */}
      {showModal && (
        <div className="modal-overlay-glass" onClick={() => setShowModal(false)}>
          <div className="modal-content-glass modal-xl fade-in" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{modalMode === 'add' ? '✨ Nuevo Producto' : '✏️ Editar Producto'}</h2>
              <button className="close-modal-btn" onClick={() => setShowModal(false)}>✕</button>
            </div>

            {/* Tabs del formulario */}
            <div className="form-tabs">
              {[
                { id: 'general',   label: '📋 General' },
                { id: 'precios',   label: '💰 Precios' },
                { id: 'descripcion', label: '📝 Descripción' },
                { id: 'logistica', label: '🚚 Logística' },
                { id: 'ficha',     label: `🔬 Ficha Técnica (${formData.categoria})` },
                { id: 'imagen',    label: '🖼️ Imagen' },
              ].map(t => (
                <button
                  key={t.id}
                  className={`form-tab-btn ${formTab === t.id ? 'active' : ''}`}
                  type="button"
                  onClick={() => setFormTab(t.id)}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {loadingDetalle && (
              <div style={{textAlign:'center', padding:'12px 0', color:'#64748b', fontSize:'0.82rem'}}>
                <span style={{display:'inline-block', width:14, height:14, border:'2px solid rgba(0,221,235,0.3)', borderTopColor:'#00ddeb', borderRadius:'50%', animation:'spin 0.7s linear infinite', marginRight:8, verticalAlign:'middle'}} />
                Cargando ficha técnica del producto...
              </div>
            )}

            <form onSubmit={handleSaveProduct} className="admin-form">

              {/* ── TAB: GENERAL ── */}
              {formTab === 'general' && (
                <>
                  <div className="form-group">
                    <label>NOMBRE DEL PRODUCTO *</label>
                    <input type="text" className="custom-input" required value={formData.nombre} onChange={e => setField('nombre', e.target.value)} placeholder="Ej: Sensor de Humedad SmartSoil Pro" />
                  </div>
                  <div className="form-grid-2">
                    <div className="form-group">
                      <label>SKU (Código único) *</label>
                      <input type="text" className="custom-input" required value={formData.sku} onChange={e => setField('sku', e.target.value)} placeholder="Ej: TECH-001" />
                    </div>
                    <div className="form-group">
                      <label>CATEGORÍA *</label>
                      <select className="custom-input" value={formData.categoria} onChange={e => setField('categoria', e.target.value)}>
                        <option>Tecnología</option>
                        <option>Maquinaria</option>
                        <option>Insumos</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-grid-2">
                    <div className="form-group">
                      <label>MARCA</label>
                      <input type="text" className="custom-input" placeholder="Ej: John Deere" value={formData.marca || ''} onChange={e => setField('marca', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label>MODELO</label>
                      <input type="text" className="custom-input" placeholder="Ej: X-Pro 2000" value={formData.modelo || ''} onChange={e => setField('modelo', e.target.value)} />
                    </div>
                  </div>
                  <div className="form-grid-2">
                    <div className="form-group">
                      <label>ETIQUETAS</label>
                      <input type="text" className="custom-input" placeholder="Separadas por coma: sensor, WiFi, riego" value={formData.etiquetas || ''} onChange={e => setField('etiquetas', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label>PAÍS DE ORIGEN</label>
                      <input type="text" className="custom-input" placeholder="Ej: Chile, Alemania, EE.UU." value={formData.pais_origen || ''} onChange={e => setField('pais_origen', e.target.value)} />
                    </div>
                  </div>

                  {/* Indicadores */}
                  <div className="form-section-header">Indicadores de vitrina</div>
                  <div className="form-grid-2">
                    <div className="form-group-check">
                      <input type="checkbox" id="chk-destacado" checked={!!formData.destacado} onChange={e => setField('destacado', e.target.checked)} />
                      <label htmlFor="chk-destacado" className="check-label">
                        <span className="check-icon">⭐</span>
                        <span>
                          <strong>Producto Destacado</strong>
                          <small>Aparece con borde dorado y badge "★ TOP" en el catálogo</small>
                        </span>
                      </label>
                    </div>
                    <div className="form-group-check">
                      <input type="checkbox" id="chk-nuevo" checked={!!formData.nuevo} onChange={e => setField('nuevo', e.target.checked)} />
                      <label htmlFor="chk-nuevo" className="check-label">
                        <span className="check-icon">🆕</span>
                        <span>
                          <strong>Producto Nuevo</strong>
                          <small>Muestra badge "NUEVO" en la tarjeta del catálogo</small>
                        </span>
                      </label>
                    </div>
                  </div>
                </>
              )}

              {/* ── TAB: PRECIOS ── */}
              {formTab === 'precios' && (
                <>
                  <div className="form-section-header">Precios</div>
                  <div className="form-grid-3">
                    <div className="form-group">
                      <label>PRECIO NORMAL (CLP) *</label>
                      <input type="number" className="custom-input" required placeholder="189000" value={formData.precio_clp} onChange={e => setField('precio_clp', e.target.value)} />
                      <small style={{color:'#4a5568'}}>Precio base del producto</small>
                    </div>
                    <div className="form-group">
                      <label>PRECIO ANTERIOR (CLP)</label>
                      <input type="number" className="custom-input" placeholder="Vacío = sin tachado" value={formData.precio_anterior || ''} onChange={e => setField('precio_anterior', e.target.value)} />
                      <small style={{color:'#4a5568'}}>Se muestra tachado en la tarjeta</small>
                    </div>
                    <div className="form-group">
                      <label>PRECIO OFERTA (CLP)</label>
                      <input type="number" className="custom-input" placeholder="Vacío = sin oferta" value={formData.precio_oferta || ''} onChange={e => setField('precio_oferta', e.target.value)} />
                      <small style={{color:'#28C76F'}}>Activa badge OFERTA verde</small>
                    </div>
                  </div>

                  {formData.precio_clp && formData.precio_oferta && Number(formData.precio_oferta) < Number(formData.precio_clp) && (
                    <div style={{padding:'10px 14px', background:'rgba(40,199,111,0.08)', border:'1px solid rgba(40,199,111,0.2)', borderRadius:8, fontSize:'0.82rem', color:'#28C76F', marginBottom:16}}>
                      Descuento: {Math.round((1 - Number(formData.precio_oferta) / Number(formData.precio_clp)) * 100)}% OFF
                    </div>
                  )}

                  <div className="form-section-header">Stock</div>
                  <div className="form-grid-3">
                    <div className="form-group">
                      <label>STOCK ACTUAL *</label>
                      <input type="number" className="custom-input" required placeholder="0" value={formData.stock} onChange={e => setField('stock', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label>STOCK MÍNIMO</label>
                      <input type="number" className="custom-input" placeholder="5" value={formData.stock_minimo || 5} onChange={e => setField('stock_minimo', e.target.value)} />
                      <small style={{color:'#4a5568'}}>Alerta de reposición</small>
                    </div>
                    <div className="form-group">
                      <label>UNIDAD DE MEDIDA</label>
                      <select className="custom-input" value={formData.unidad_medida || 'unidad'} onChange={e => setField('unidad_medida', e.target.value)}>
                        <option value="unidad">Unidad</option>
                        <option value="kg">Kilogramo (kg)</option>
                        <option value="litro">Litro</option>
                        <option value="saco">Saco</option>
                        <option value="caja">Caja</option>
                        <option value="metro">Metro</option>
                        <option value="par">Par</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              {/* ── TAB: DESCRIPCIÓN ── */}
              {formTab === 'descripcion' && (
                <>
                  <div className="form-group">
                    <label>DESCRIPCIÓN CORTA <span style={{color:'#94a3b8', fontWeight:'normal'}}>(máx. 300 caracteres)</span></label>
                    <input
                      type="text"
                      className="custom-input"
                      maxLength={300}
                      placeholder="Resumen atractivo que se muestra en la tarjeta del catálogo"
                      value={formData.descripcion_corta || ''}
                      onChange={e => setField('descripcion_corta', e.target.value)}
                    />
                    <small style={{color: (formData.descripcion_corta?.length || 0) > 260 ? '#f5c542' : '#4a5568'}}>
                      {formData.descripcion_corta?.length || 0}/300 caracteres
                    </small>
                  </div>
                  <div className="form-group">
                    <label>DESCRIPCIÓN COMPLETA</label>
                    <textarea className="custom-input" rows="5" placeholder="Descripción detallada del producto, sus usos y beneficios..." value={formData.descripcion || ''} onChange={e => setField('descripcion', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>CERTIFICACIONES</label>
                    <input type="text" className="custom-input" placeholder="Ej: CE, ISO 9001, SAG Registro N° 1234" value={formData.certificaciones || ''} onChange={e => setField('certificaciones', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>URL DOCUMENTO (Ficha PDF, manual)</label>
                    <input type="text" className="custom-input" placeholder="https://..." value={formData.documento_url || ''} onChange={e => setField('documento_url', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>FICHA TÉCNICA (texto libre / legado)</label>
                    <textarea className="custom-input" rows="3" placeholder="Especificaciones en texto plano — usa la pestaña 'Ficha Técnica' para la versión estructurada" value={formData.ficha_tecnica || ''} onChange={e => setField('ficha_tecnica', e.target.value)} />
                  </div>
                </>
              )}

              {/* ── TAB: LOGÍSTICA ── */}
              {formTab === 'logistica' && (
                <>
                  <div className="form-grid-2">
                    <div className="form-group">
                      <label>PESO</label>
                      <input type="text" className="custom-input" placeholder="Ej: 2.5 kg" value={formData.peso || ''} onChange={e => setField('peso', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label>GARANTÍA</label>
                      <input type="text" className="custom-input" placeholder="Ej: 1 año de fábrica" value={formData.garantia || ''} onChange={e => setField('garantia', e.target.value)} />
                    </div>
                  </div>
                  <div className="form-grid-2">
                    <div className="form-group">
                      <label>TIEMPO DE ENTREGA</label>
                      <input type="text" className="custom-input" placeholder="Ej: 3–5 días hábiles" value={formData.tiempo_entrega || ''} onChange={e => setField('tiempo_entrega', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label>PAÍS DE ORIGEN</label>
                      <input type="text" className="custom-input" placeholder="Ej: Chile" value={formData.pais_origen || ''} onChange={e => setField('pais_origen', e.target.value)} />
                    </div>
                  </div>
                </>
              )}

              {/* ── TAB: FICHA TÉCNICA ── */}
              {formTab === 'ficha' && (
                <>
                  {detalleFields.length === 0 ? (
                    <p style={{color:'#64748b', padding:'20px 0'}}>Selecciona primero una categoría en la pestaña "General" para ver los campos correspondientes.</p>
                  ) : (
                    <>
                      <p style={{color:'#64748b', fontSize:'0.82rem', marginBottom:16}}>
                        Campos específicos para la categoría <strong style={{color:'#00ddeb'}}>{formData.categoria}</strong>. Se guardan en la tabla de detalle correspondiente y aparecen en el modal del catálogo como "Ficha Técnica Completa".
                      </p>
                      <div className="form-grid-2">
                        {detalleFields.map(f => (
                          <div className="form-group" key={f.key}>
                            <label>{f.label.toUpperCase()}</label>
                            {f.type === 'boolean' ? (
                              <div className="form-group-check" style={{marginTop:4}}>
                                <input
                                  type="checkbox"
                                  id={`det-${f.key}`}
                                  checked={!!formData.detalle[f.key]}
                                  onChange={e => setDetalle(f.key, e.target.checked)}
                                />
                                <label htmlFor={`det-${f.key}`} className="check-label" style={{padding:'6px 0'}}>
                                  <span><strong>{f.label}</strong></span>
                                </label>
                              </div>
                            ) : (
                              <input
                                type="text"
                                className="custom-input"
                                placeholder={f.placeholder}
                                value={formData.detalle[f.key] || ''}
                                onChange={e => setDetalle(f.key, e.target.value)}
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </>
              )}

              {/* ── TAB: IMAGEN ── */}
              {formTab === 'imagen' && (
                <>
                  {formData.imagen_url && !productoFile && (
                    <div style={{display:'flex', alignItems:'center', gap:12, marginBottom:16, padding:12, background:'rgba(255,255,255,0.03)', borderRadius:10, border:'1px solid rgba(255,255,255,0.08)'}}>
                      <img src={formData.imagen_url} alt="actual" style={{width:90, height:90, objectFit:'cover', borderRadius:8, border:'1px solid rgba(255,255,255,0.1)'}} />
                      <div>
                        <div style={{fontSize:'0.75rem', color:'#64748b', marginBottom:6}}>Imagen actual del producto</div>
                        <button type="button" onClick={handleEliminarImagen} disabled={eliminandoImg}
                          style={{fontSize:'0.75rem', color:'#fc8181', background:'rgba(229,62,62,0.1)', border:'1px solid rgba(229,62,62,0.3)', borderRadius:6, padding:'5px 12px', cursor:'pointer'}}>
                          {eliminandoImg ? 'Eliminando...' : '🗑️ Eliminar imagen'}
                        </button>
                      </div>
                    </div>
                  )}
                  {productoFile && (
                    <div style={{display:'flex', alignItems:'center', gap:12, marginBottom:16}}>
                      <img src={URL.createObjectURL(productoFile)} alt="preview" style={{width:90, height:90, objectFit:'cover', borderRadius:8, border:'1px solid #28C76F'}} />
                      <div>
                        <div style={{fontSize:'0.75rem', color:'#28C76F', marginBottom:4}}>✓ Nueva imagen lista para subir</div>
                        <button type="button" onClick={() => setProductoFile(null)} style={{fontSize:'0.75rem', color:'#94a3b8', background:'none', border:'none', cursor:'pointer'}}>Cancelar</button>
                      </div>
                    </div>
                  )}
                  <div className="form-group">
                    <label>SUBIR NUEVA IMAGEN</label>
                    <input type="file" accept="image/*" className="custom-input" onChange={e => setProductoFile(e.target.files[0] || null)} />
                    <small style={{color:'#64748b', fontSize:'0.7rem'}}>Formatos: JPG, PNG, WebP · Máx. 5 MB</small>
                  </div>
                  <div className="form-group">
                    <label>O INGRESAR URL DE IMAGEN</label>
                    <input type="text" className="custom-input" placeholder="https://..." value={formData.imagen_url || ''} onChange={e => setField('imagen_url', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>TEXTO ALT (accesibilidad)</label>
                    <input type="text" className="custom-input" placeholder="Descripción breve de la imagen" value={formData.imagen_alt || ''} onChange={e => setField('imagen_alt', e.target.value)} />
                  </div>
                </>
              )}

              <div className="modal-actions">
                <button type="button" className="btn-ag-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn-ag-primary">
                  {modalMode === 'add' ? '✓ Crear Producto' : '✓ Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════
          MODAL SOLICITUD
      ═══════════════════════════════════════════ */}
      {modalSol && (
        <div className="modal-overlay-glass" onClick={() => setModalSol(null)}>
          <div className="modal-content-glass fade-in" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🛠️ Gestionar Solicitud #{modalSol.id}</h2>
              <button className="close-modal-btn" onClick={() => setModalSol(null)}>✕</button>
            </div>
            <div className="sol-info-grid">
              <div className="sol-info-item"><span>Cliente</span><strong>{modalSol.nombre_completo || 'Sin cuenta'}</strong></div>
              <div className="sol-info-item"><span>Contacto</span><strong>{modalSol.email || '—'}</strong></div>
              <div className="sol-info-item"><span>Tipo</span><strong style={{textTransform:'capitalize'}}>{modalSol.tipo_soporte}</strong></div>
              <div className="sol-info-item"><span>Urgencia</span>
                <span className={`pill ${modalSol.urgencia === 'normal' ? 'pill-green' : modalSol.urgencia === 'urgente' ? 'pill-warning' : 'pill-orange'}`}>{modalSol.urgencia}</span>
              </div>
              <div className="sol-info-item full"><span>Ubicación</span><strong>{modalSol.ubicacion}</strong></div>
              <div className="sol-info-item full"><span>Equipos</span><strong>{modalSol.equipos}</strong></div>
              <div className="sol-info-item full"><span>Descripción</span><p>{modalSol.descripcion}</p></div>
            </div>
            <form className="admin-form" onSubmit={e => e.preventDefault()}>
              <div className="form-grid-2">
                <div className="form-group">
                  <label>ESTADO</label>
                  <select className="custom-input" value={formSol.estado} onChange={e => setFormSol({...formSol, estado: e.target.value})}>
                    <option>Pendiente</option><option>Confirmada</option><option>En Camino</option><option>Completada</option><option>Cancelada</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>FECHA VISITA PROGRAMADA</label>
                  <input type="date" className="custom-input" value={formSol.fecha_visita_programada} onChange={e => setFormSol({...formSol, fecha_visita_programada: e.target.value})} />
                </div>
              </div>
              <div className="form-group">
                <label>TÉCNICO ASIGNADO</label>
                <input type="text" className="custom-input" placeholder="Nombre del técnico..." value={formSol.tecnico_asignado} onChange={e => setFormSol({...formSol, tecnico_asignado: e.target.value})} />
              </div>
              <div className="form-group">
                <label>NOTAS INTERNAS</label>
                <textarea className="custom-input" rows="3" placeholder="Observaciones, materiales necesarios..." value={formSol.notas_admin} onChange={e => setFormSol({...formSol, notas_admin: e.target.value})} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-ag-secondary" onClick={() => setModalSol(null)}>Cancelar</button>
                <button type="button" className="btn-ag-primary" onClick={guardarSolicitud} disabled={guardando}>
                  {guardando ? 'Guardando...' : '✓ Guardar cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════
          MODAL CURSO
      ═══════════════════════════════════════════ */}
      {showCursoModal && (
        <div className="modal-overlay-glass" onClick={() => setShowCursoModal(false)}>
          <div className="modal-content-glass fade-in" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{cursoMode === 'add' ? '🎓 Nuevo Curso' : '✏️ Editar Curso'}</h2>
              <button className="close-modal-btn" onClick={() => setShowCursoModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSaveCurso} className="admin-form">
              <div className="form-group">
                <label>NOMBRE DEL CURSO *</label>
                <input type="text" className="custom-input" required value={formCurso.nombre} onChange={e => setFormCurso({...formCurso, nombre: e.target.value})} />
              </div>
              <div className="form-grid-2">
                <div className="form-group">
                  <label>SKU *</label>
                  <input type="text" className="custom-input" required placeholder="CURSO-011" value={formCurso.sku} onChange={e => setFormCurso({...formCurso, sku: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>CATEGORÍA</label>
                  <select className="custom-input" value={formCurso.categoria} onChange={e => setFormCurso({...formCurso, categoria: e.target.value})}>
                    <option>Tecnología</option><option>Maquinaria</option><option>Insumos</option><option>Asesorías</option>
                  </select>
                </div>
              </div>
              <div className="form-grid-2">
                <div className="form-group">
                  <label>PRECIO (CLP) — 0 si es gratis</label>
                  <input type="number" min="0" className="custom-input" required value={formCurso.precio_clp} onChange={e => setFormCurso({...formCurso, precio_clp: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>CUPOS</label>
                  <input type="number" min="1" className="custom-input" required value={formCurso.stock} onChange={e => setFormCurso({...formCurso, stock: e.target.value})} />
                </div>
              </div>
              <div className="form-grid-2">
                <div className="form-group">
                  <label>HORAS</label>
                  <input type="number" min="0" className="custom-input" value={formCurso.horas} onChange={e => setFormCurso({...formCurso, horas: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>MÓDULOS</label>
                  <input type="number" min="0" className="custom-input" value={formCurso.modulos} onChange={e => setFormCurso({...formCurso, modulos: e.target.value})} />
                </div>
              </div>
              <div className="form-grid-2">
                <div className="form-group">
                  <label>DIFICULTAD</label>
                  <select className="custom-input" value={formCurso.dificultad} onChange={e => setFormCurso({...formCurso, dificultad: e.target.value})}>
                    <option>Básico</option><option>Intermedio</option><option>Avanzado</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>INSTRUCTOR</label>
                  <input type="text" className="custom-input" placeholder="Dra. María Elena González" value={formCurso.instructor || ''} onChange={e => setFormCurso({...formCurso, instructor: e.target.value})} />
                </div>
              </div>
              <div className="form-group">
                <label>URL IMAGEN</label>
                <input type="text" className="custom-input" placeholder="https://..." value={formCurso.imagen_url || ''} onChange={e => setFormCurso({...formCurso, imagen_url: e.target.value})} />
              </div>
              <div className="form-group">
                <label>DESCRIPCIÓN</label>
                <textarea className="custom-input" rows="3" value={formCurso.descripcion || ''} onChange={e => setFormCurso({...formCurso, descripcion: e.target.value})} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-ag-secondary" onClick={() => setShowCursoModal(false)}>Cancelar</button>
                <button type="submit" className="btn-ag-primary">{cursoMode === 'add' ? 'Crear Curso' : 'Guardar Cambios'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default Backoffice;
