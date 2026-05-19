import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import './Backoffice.css';

const mockInventario = [
  { id: 1, prod: "Sensor de Humedad SmartSoil Pro", sku: "P-001", cat: "Tecnología", actual: 12, min: 5, precio: "$189.000", estado: "OK", retiro: "Disponible para retiro" },
  { id: 2, prod: "Tractor Compact 60HP", sku: "P-002", cat: "Maquinaria", actual: 1, min: 2, precio: "$12.500.000", estado: "Crítico", retiro: "Disponible para retiro" },
];

const mockCobranzas = [
  { id: "COB-001", cliente: "Agrícola El Volcán SpA", monto: "$3.750.000", vencimiento: "20 May 2026", estado: "Pendiente" },
];

function Backoffice() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    const adminStr = localStorage.getItem('adminAgrosmart');
    if (!adminStr) {
      navigate('/admin');
      return;
    }
    try {
      const admin = JSON.parse(adminStr);
      if (admin.rol !== 'admin') navigate('/admin');
    } catch {
      navigate('/admin');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('adminAgrosmart');
    localStorage.removeItem('adminTokenAgrosmart');
    navigate('/admin');
  };

  const [productos, setProductos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('Todos');

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [formData, setFormData] = useState({
    id: null, nombre: '', sku: '', categoria: 'Insumos', precio_clp: '', stock: '', descripcion: '', imagen_url: ''
  });

  const [solicitudes, setSolicitudes] = useState([]);
  const [loadingSol, setLoadingSol] = useState(false);
  const [modalSol, setModalSol] = useState(null);
  const [formSol, setFormSol] = useState({ estado: '', fecha_visita_programada: '', tecnico_asignado: '', notas_admin: '' });
  const [guardando, setGuardando] = useState(false);

  const [dashboardStats, setDashboardStats] = useState(null);
  const [loadingDash, setLoadingDash] = useState(false);

  const [cursos, setCursos] = useState([]);
  const [searchCurso, setSearchCurso] = useState('');
  const [filterCurso, setFilterCurso] = useState('Todos');
  const [showCursoModal, setShowCursoModal] = useState(false);
  const [cursoMode, setCursoMode] = useState('add');
  const [formCurso, setFormCurso] = useState({
    id: null, nombre: '', sku: '', categoria: 'Tecnología', precio_clp: '', stock: 99,
    descripcion: '', imagen_url: '', horas: 0, modulos: 0, dificultad: 'Básico', instructor: ''
  });

  const [ventasProductosList, setVentasProductosList] = useState([]);
  const [ventasCursosList, setVentasCursosList] = useState([]);
  const [filtroVentaCat, setFiltroVentaCat] = useState('Todas');
  const [searchVentaProd, setSearchVentaProd] = useState('');
  const [filtroVentaCur, setFiltroVentaCur] = useState('Todas');
  const [searchVentaCur, setSearchVentaCur] = useState('');
  const [loadingVentas, setLoadingVentas] = useState(false);

  const fetchProductos = async () => {
    try {
      const res = await fetch('/api/productos');
      const data = await res.json();
      setProductos(data);
    } catch (error) {
      console.error("Error al cargar productos:", error);
    }
  };

  useEffect(() => {
    if (activeTab === 'catalogo') fetchProductos();
    if (activeTab === 'solicitudes') fetchSolicitudes();
    if (activeTab === 'cursos') fetchCursos();
    if (activeTab === 'dashboard') fetchDashboard();
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'finanzas') fetchListadoVentas();
  }, [activeTab, filtroVentaCat, searchVentaProd, filtroVentaCur, searchVentaCur]);

  const fetchDashboard = async () => {
    setLoadingDash(true);
    try {
      const res = await fetch('/api/ventas/stats');
      const data = await res.json();
      setDashboardStats(data);
    } catch (e) {
      console.error('Error cargando stats:', e);
      setDashboardStats(null);
    } finally {
      setLoadingDash(false);
    }
  };

  const fetchListadoVentas = async () => {
    setLoadingVentas(true);
    try {
      const urlP = new URL('/api/ventas/productos');
      if (filtroVentaCat !== 'Todas') urlP.searchParams.append('categoria', filtroVentaCat);
      if (searchVentaProd) urlP.searchParams.append('q', searchVentaProd);

      const urlC = new URL('/api/ventas/cursos');
      if (filtroVentaCur !== 'Todas') urlC.searchParams.append('categoria', filtroVentaCur);
      if (searchVentaCur) urlC.searchParams.append('q', searchVentaCur);

      const [resP, resC] = await Promise.all([fetch(urlP), fetch(urlC)]);
      if (resP.ok) setVentasProductosList(await resP.json());
      if (resC.ok) setVentasCursosList(await resC.json());
    } catch (error) {
      console.error("Error al cargar listado de ventas:", error);
    } finally {
      setLoadingVentas(false);
    }
  };

  const fmtCLP = (n) => '$' + Number(n || 0).toLocaleString('es-CL');
  const nombreMes = (ym) => {
    if (!ym) return '';
    const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    const [y, m] = ym.split('-');
    return `${meses[parseInt(m, 10) - 1]} ${y.slice(2)}`;
  };

  const productosFiltrados = productos.filter(p => {
    const matchesSearch = p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeFilter === 'Todos' || p.categoria === activeFilter;
    return matchesSearch && matchesCategory;
  });

  const stats = {
    total: productos.length,
    disponibles: productos.filter(p => p.stock > 5).length,
    stockBajo: productos.filter(p => p.stock > 0 && p.stock <= 5).length,
    agotados: productos.filter(p => p.stock === 0).length
  };

  const openAddModal = () => {
    setModalMode('add');
    setFormData({ id: null, nombre: '', sku: '', categoria: 'Insumos', precio_clp: '', stock: '', descripcion: '', imagen_url: '' });
    setShowModal(true);
  };

  const openEditModal = (producto) => {
    setModalMode('edit');
    setFormData(producto);
    setShowModal(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    const method = modalMode === 'add' ? 'POST' : 'PUT';
    const url = modalMode === 'add' ? '/api/productos' : `/api/productos/${formData.id}`;
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowModal(false);
        fetchProductos();
      } else {
        alert("Error al guardar el producto");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar este producto del catálogo?")) {
      try {
        const res = await fetch(`/api/productos/${id}`, { method: 'DELETE' });
        if (res.ok) {
          alert("🗑️ Producto eliminado exitosamente.");
          fetchProductos();
        } else {
          const errorData = await res.json();
          alert("⚠️ Atención:\n\n" + errorData.error);
        }
      } catch (error) {
        console.error(error);
        alert("Error de conexión con el servidor al intentar eliminar.");
      }
    }
  };

  const getEstadoBadge = (stock) => {
    if (stock === 0) return <span className="pill pill-orange">Agotado</span>;
    if (stock <= 5) return <span className="pill pill-warning">Stock Bajo</span>;
    return <span className="pill pill-green">Disponible</span>;
  };

  const fetchSolicitudes = async () => {
    setLoadingSol(true);
    try {
      const res = await fetch('/api/solicitudes');
      const data = await res.json();
      setSolicitudes(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Error cargando solicitudes:', e);
      setSolicitudes([]);
    } finally {
      setLoadingSol(false);
    }
  };

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
      const res = await fetch(`/api/solicitudes/${modalSol.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formSol),
      });
      if (res.ok) {
        setModalSol(null);
        fetchSolicitudes();
      }
    } catch (e) {
      console.error('Error al guardar:', e);
    } finally {
      setGuardando(false);
    }
  };

  const fetchCursos = async () => {
    try {
      const res = await fetch('/api/cursos');
      const data = await res.json();
      setCursos(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Error cargando cursos:', e);
      setCursos([]);
    }
  };

  const cursosFiltrados = cursos.filter(c => {
    const matchSearch = (c.nombre || '').toLowerCase().includes(searchCurso.toLowerCase()) ||
                        (c.sku || '').toLowerCase().includes(searchCurso.toLowerCase());
    const matchCat = filterCurso === 'Todos' || c.categoria === filterCurso;
    return matchSearch && matchCat;
  });

  const openAddCursoModal = () => {
    setCursoMode('add');
    setFormCurso({
      id: null, nombre: '', sku: '', categoria: 'Tecnología', precio_clp: '', stock: 99,
      descripcion: '', imagen_url: '', horas: 0, modulos: 0, dificultad: 'Básico', instructor: ''
    });
    setShowCursoModal(true);
  };

  const openEditCursoModal = (curso) => {
    setCursoMode('edit');
    setFormCurso({ ...curso });
    setShowCursoModal(true);
  };

  const handleSaveCurso = async (e) => {
    e.preventDefault();
    const method = cursoMode === 'add' ? 'POST' : 'PUT';
    const url = cursoMode === 'add'
      ? '/api/cursos'
      : `/api/cursos/${formCurso.id}`;
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formCurso)
      });
      if (res.ok) {
        setShowCursoModal(false);
        fetchCursos();
      } else {
        const err = await res.json();
        alert('Error: ' + (err.error || 'No se pudo guardar el curso'));
      }
    } catch (error) {
      console.error(error);
      alert('Error de conexión con el servidor.');
    }
  };

  const handleDeleteCurso = async (id) => {
    if (!window.confirm('¿Eliminar este curso del catálogo?')) return;
    try {
      const res = await fetch(`/api/cursos/${id}`, { method: 'DELETE' });
      if (res.ok) {
        alert('🗑️ Curso eliminado correctamente.');
        fetchCursos();
      } else {
        const err = await res.json();
        alert('⚠️ ' + err.error);
      }
    } catch (error) {
      console.error(error);
      alert('Error de conexión.');
    }
  };

  return (
    <div className="backoffice-layout">

      <aside className="backoffice-sidebar">
        <div className="sidebar-brand">
          <img src={logo} alt="AgroSmart" className="sidebar-logo" />
          <div><h3>AgroSmart</h3><span>BACKOFFICE</span></div>
        </div>

        <nav className="sidebar-nav">
          <button className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
            <span className="icon">㗊</span> Panel de Control
          </button>
          <button className={`nav-item ${activeTab === 'catalogo' ? 'active' : ''}`} onClick={() => setActiveTab('catalogo')}>
            <span className="icon">📦</span> Gestión de Catálogo
          </button>
          <button className={`nav-item ${activeTab === 'inventario' ? 'active' : ''}`} onClick={() => setActiveTab('inventario')}>
            <span className="icon">🏭</span> Inventario y Almacén
          </button>
          <button className={`nav-item ${activeTab === 'despachos' ? 'active' : ''}`} onClick={() => setActiveTab('despachos')}>
            <span className="icon">🚚</span> Despachos
          </button>
          <button className={`nav-item ${activeTab === 'finanzas' ? 'active' : ''}`} onClick={() => setActiveTab('finanzas')}>
            <span className="icon">💲</span> Finanzas y Ventas
          </button>
          <button className={`nav-item ${activeTab === 'solicitudes' ? 'active' : ''}`} onClick={() => setActiveTab('solicitudes')}>
            <span className="icon">🛠️</span> Solicitudes en Terreno
          </button>
          <button className={`nav-item ${activeTab === 'cursos' ? 'active' : ''}`} onClick={() => setActiveTab('cursos')}>
            <span className="icon">🎓</span> Gestión de Cursos
          </button>
        </nav>

        <div className="sidebar-footer">
          <button className="nav-item btn-logout" onClick={handleLogout}><span className="icon">🚪</span> Cerrar Sesión</button>
        </div>
      </aside>

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

          {activeTab === 'catalogo' && (
            <div className="catalogo-view fade-in">
              <div className="view-header">
                <div><h2>Gestión de Catálogo</h2><p>Control total de productos visibles en la tienda del cliente.</p></div>
                <button className="btn-primary-action" onClick={openAddModal}>+ Agregar Producto</button>
              </div>

              <div className="metrics-grid mb-20">
                <div className="metric-card-small"><span className="icon-box bg-cyan-light text-cyan">📦</span><div><h3>{stats.total}</h3><p>Total Productos</p></div></div>
                <div className="metric-card-small"><span className="icon-box bg-green-light text-green">✓</span><div><h3>{stats.disponibles}</h3><p>Disponibles</p></div></div>
                <div className="metric-card-small"><span className="icon-box bg-warning-light text-warning">⚠️</span><div><h3>{stats.stockBajo}</h3><p>Stock Bajo</p></div></div>
                <div className="metric-card-small"><span className="icon-box bg-orange-light text-orange">✕</span><div><h3>{stats.agotados}</h3><p>Agotados</p></div></div>
              </div>

              <div className="glass-panel">
                <div className="table-toolbar">
                  <div className="search-bar-admin">
                    <span className="icon">🔍</span>
                    <input type="text" placeholder="Buscar por nombre o SKU..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                  </div>
                  <div className="filter-pills">
                    {['Todos', 'Tecnología', 'Maquinaria', 'Insumos'].map(cat => (
                      <button key={cat} className={activeFilter === cat ? 'active' : ''} onClick={() => setActiveFilter(cat)}>{cat}</button>
                    ))}
                  </div>
                </div>

                <table className="admin-table">
                  <thead>
                    <tr><th>PRODUCTO</th><th>SKU</th><th>CATEGORÍA</th><th>PRECIO</th><th>STOCK</th><th>ESTADO</th><th>ACCIONES</th></tr>
                  </thead>
                  <tbody>
                    {productosFiltrados.length === 0 ? (
                      <tr><td colSpan="7" style={{textAlign: 'center', padding: '2rem', color: '#94a3b8'}}>No se encontraron productos.</td></tr>
                    ) : (
                      productosFiltrados.map(item => (
                        <tr key={item.id}>
                          <td><strong>{item.nombre}</strong></td>
                          <td className="text-cyan">{item.sku}</td>
                          <td>{item.categoria}</td>
                          <td><strong>${Number(item.precio_clp).toLocaleString('es-CL')}</strong></td>
                          <td><strong className={item.stock === 0 ? 'text-orange' : 'text-green'}>{item.stock}</strong> uds.</td>
                          <td>{getEstadoBadge(item.stock)}</td>
                          <td>
                            <div style={{display: 'flex', gap: '10px'}}>
                              <button onClick={() => openEditModal(item)} style={{background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem'}} title="Editar">✏️</button>
                              <button onClick={() => handleDelete(item.id)} style={{background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem'}} title="Eliminar">🗑️</button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'solicitudes' && (
            <div className="solicitudes-view fade-in">
              <div className="view-header">
                <div>
                  <h2>Solicitudes en Terreno</h2>
                  <p>Visitas técnicas solicitadas por agricultores — programa y gestiona cada visita.</p>
                </div>
                <button className="btn-primary-action" onClick={fetchSolicitudes}>↻ Actualizar</button>
              </div>

              <div className="metrics-grid mb-20">
                <div className="metric-card-small">
                  <span className="icon-box bg-warning-light text-warning">⏳</span>
                  <div><h3>{solicitudes.filter(s => s.estado === 'Pendiente').length}</h3><p>Pendientes</p></div>
                </div>
                <div className="metric-card-small">
                  <span className="icon-box bg-cyan-light text-cyan">📅</span>
                  <div><h3>{solicitudes.filter(s => s.estado === 'Confirmada').length}</h3><p>Confirmadas</p></div>
                </div>
                <div className="metric-card-small">
                  <span className="icon-box bg-green-light text-green">✓</span>
                  <div><h3>{solicitudes.filter(s => s.estado === 'Completada').length}</h3><p>Completadas</p></div>
                </div>
                <div className="metric-card-small">
                  <span className="icon-box bg-orange-light text-orange">🚨</span>
                  <div><h3>{solicitudes.filter(s => s.urgencia === 'critico').length}</h3><p>Críticas</p></div>
                </div>
              </div>

              <div className="glass-panel">
                {loadingSol ? (
                  <p style={{ color: '#94a3b8', padding: '30px', textAlign: 'center' }}>Cargando solicitudes...</p>
                ) : solicitudes.length === 0 ? (
                  <p style={{ color: '#94a3b8', padding: '30px', textAlign: 'center' }}>No hay solicitudes aún.</p>
                ) : (
                  <table className="admin-table">
                    <thead>
                      <tr><th>ID</th><th>CLIENTE</th><th>TIPO</th><th>URGENCIA</th><th>EQUIPOS</th><th>FECHA SOLICITADA</th><th>ESTADO</th><th>ACCIÓN</th></tr>
                    </thead>
                    <tbody>
                      {solicitudes.map(sol => (
                        <tr key={sol.id}>
                          <td className="text-cyan">#{sol.id}</td>
                          <td>
                            <div><strong>{sol.nombre_completo || 'Cliente sin cuenta'}</strong><br/>
                            <span style={{color:'#94a3b8', fontSize:'0.8rem'}}>{sol.email || '—'}</span></div>
                          </td>
                          <td style={{ textTransform: 'capitalize' }}>{sol.tipo_soporte}</td>
                          <td>
                            <span className={`pill ${sol.urgencia === 'normal' ? 'pill-green' : sol.urgencia === 'urgente' ? 'pill-warning' : 'pill-orange'}`}>
                              {sol.urgencia}
                            </span>
                          </td>
                          <td style={{ fontSize: '0.85rem', maxWidth: '160px' }}>{sol.equipos}</td>
                          <td>{sol.fecha_preferida ? new Date(sol.fecha_preferida).toLocaleDateString('es-CL') : '—'}</td>
                          <td>
                            <span className={`pill ${sol.estado === 'Completada' ? 'pill-green' : sol.estado === 'Confirmada' ? 'pill-cyan-badge' : sol.estado === 'En Camino' ? 'pill-warning' : 'pill-orange'}`}>
                              {sol.estado}
                            </span>
                          </td>
                          <td>
                            <button className="btn-text-cyan" onClick={() => abrirModalSol(sol)}>Gestionar</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {activeTab === 'cursos' && (
            <div className="cursos-view fade-in">
              <div className="view-header">
                <div>
                  <h2>Gestión de Cursos</h2>
                  <p>Administra los cursos disponibles en la plataforma de capacitación.</p>
                </div>
                <button className="btn-primary-action" onClick={openAddCursoModal}>+ Agregar Curso</button>
              </div>

              <div className="metrics-grid mb-20">
                <div className="metric-card-small">
                  <span className="icon-box bg-cyan-light text-cyan">🎓</span>
                  <div><h3>{cursos.length}</h3><p>Total Cursos</p></div>
                </div>
                <div className="metric-card-small">
                  <span className="icon-box bg-green-light text-green">🆓</span>
                  <div><h3>{cursos.filter(c => Number(c.precio_clp) === 0).length}</h3><p>Gratuitos</p></div>
                </div>
                <div className="metric-card-small">
                  <span className="icon-box bg-warning-light text-warning">💰</span>
                  <div><h3>{cursos.filter(c => Number(c.precio_clp) > 0).length}</h3><p>De Pago</p></div>
                </div>
                <div className="metric-card-small">
                  <span className="icon-box bg-orange-light text-orange">⏱️</span>
                  <div><h3>{cursos.reduce((acc, c) => acc + (c.horas || 0), 0)}h</h3><p>Total Horas</p></div>
                </div>
              </div>

              <div className="glass-panel">
                <div className="table-toolbar">
                  <div className="search-bar-admin">
                    <span className="icon">🔍</span>
                    <input type="text" placeholder="Buscar curso por nombre o SKU..." value={searchCurso} onChange={(e) => setSearchCurso(e.target.value)} />
                  </div>
                  <div className="filter-pills">
                    {['Todos', 'Tecnología', 'Maquinaria', 'Insumos', 'Asesorías'].map(cat => (
                      <button key={cat} className={filterCurso === cat ? 'active' : ''} onClick={() => setFilterCurso(cat)}>{cat}</button>
                    ))}
                  </div>
                </div>

                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>CURSO</th><th>SKU</th><th>CATEGORÍA</th><th>INSTRUCTOR</th>
                      <th>HRS</th><th>DIFICULTAD</th><th>PRECIO</th><th>ACCIONES</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cursosFiltrados.length === 0 ? (
                      <tr><td colSpan="8" style={{textAlign:'center', padding:'2rem', color:'#94a3b8'}}>No hay cursos para mostrar.</td></tr>
                    ) : (
                      cursosFiltrados.map(c => (
                        <tr key={c.id}>
                          <td><strong>{c.nombre}</strong></td>
                          <td className="text-cyan">{c.sku}</td>
                          <td>{c.categoria}</td>
                          <td style={{ fontSize: '0.85rem' }}>{c.instructor || '—'}</td>
                          <td><strong className="text-cyan">{c.horas}h</strong></td>
                          <td>
                            <span className={`pill ${c.dificultad === 'Básico' ? 'pill-green' : c.dificultad === 'Intermedio' ? 'pill-warning' : 'pill-orange'}`}>
                              {c.dificultad}
                            </span>
                          </td>
                          <td>
                            <strong>
                              {Number(c.precio_clp) === 0 ? 'GRATIS' : `$${Number(c.precio_clp).toLocaleString('es-CL')}`}
                            </strong>
                          </td>
                          <td>
                            <div style={{display:'flex', gap:'10px'}}>
                              <button onClick={() => openEditCursoModal(c)} style={{background:'none', border:'none', cursor:'pointer', fontSize:'1.2rem'}} title="Editar">✏️</button>
                              <button onClick={() => handleDeleteCurso(c.id)} style={{background:'none', border:'none', cursor:'pointer', fontSize:'1.2rem'}} title="Eliminar">🗑️</button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'dashboard' && (
            <div className="dashboard-view fade-in">
              <div className="view-header">
                <div>
                  <h2>Panel de Control</h2>
                  <p>Visión integral de las ventas y operación del sistema AgroSmart.</p>
                </div>
                <button className="btn-primary-action" onClick={fetchDashboard}>↻ Actualizar</button>
              </div>

              {loadingDash || !dashboardStats ? (
                <p style={{ color: '#94a3b8', padding: '40px', textAlign: 'center' }}>Cargando estadísticas...</p>
              ) : (
                <>

                  <div className="metrics-grid mb-20">
                    <div className="metric-card-small">
                      <span className="icon-box bg-green-light text-green">💰</span>
                      <div>
                        <h3>{fmtCLP(dashboardStats.kpis.ingresos_totales)}</h3>
                        <p>Ingresos Totales</p>
                      </div>
                    </div>
                    <div className="metric-card-small">
                      <span className="icon-box bg-cyan-light text-cyan">🧾</span>
                      <div>
                        <h3>{dashboardStats.kpis.total_ventas}</h3>
                        <p>Ventas Realizadas</p>
                      </div>
                    </div>
                    <div className="metric-card-small">
                      <span className="icon-box bg-warning-light text-warning">📊</span>
                      <div>
                        <h3>{fmtCLP(dashboardStats.kpis.ticket_promedio)}</h3>
                        <p>Ticket Promedio</p>
                      </div>
                    </div>
                    <div className="metric-card-small">
                      <span className="icon-box bg-orange-light text-orange">📦</span>
                      <div>
                        <h3>{dashboardStats.kpis.pendientes}</h3>
                        <p>Pendientes de Retiro</p>
                      </div>
                    </div>
                  </div>

                  <div className="charts-row mb-20" style={{ gridTemplateColumns: '1.5fr 1fr' }}>

                    <div className="glass-panel">
                      <div className="panel-header">
                        <div>
                          <h3>Ingresos por mes</h3>
                          <p>Últimos 6 meses</p>
                        </div>
                      </div>
                      {dashboardStats.ventasPorMes.length === 0 ? (
                        <p style={{ color: '#94a3b8', textAlign: 'center', padding: '40px' }}>Sin ventas registradas aún.</p>
                      ) : (
                        <div className="bar-chart">
                          {(() => {
                            const max = Math.max(...dashboardStats.ventasPorMes.map(v => Number(v.ingresos)), 1);
                            return dashboardStats.ventasPorMes.map((v) => {
                              const h = (Number(v.ingresos) / max) * 100;
                              return (
                                <div className="bar-col" key={v.mes}>
                                  <div className="bar-value">{fmtCLP(v.ingresos)}</div>
                                  <div className="bar-wrap">
                                    <div className="bar-fill" style={{ height: `${h}%` }}></div>
                                  </div>
                                  <div className="bar-label">{nombreMes(v.mes)}</div>
                                </div>
                              );
                            });
                          })()}
                        </div>
                      )}
                    </div>

                    <div className="glass-panel">
                      <div className="panel-header">
                        <div>
                          <h3>Distribución por categoría</h3>
                          <p>Ingresos según categoría de producto</p>
                        </div>
                      </div>
                      {dashboardStats.porCategoria.length === 0 ? (
                        <p style={{ color: '#94a3b8', textAlign: 'center', padding: '40px' }}>Sin datos.</p>
                      ) : (
                        (() => {
                          const total = dashboardStats.porCategoria.reduce((a, c) => a + Number(c.ingresos), 0) || 1;
                          const colors = ['#00ddeb', '#28C76F', '#ff9f43', '#ea5455', '#a855f7'];
                          let offset = 0;
                          const radius = 70;
                          const circumference = 2 * Math.PI * radius;
                          return (
                            <div className="donut-wrap">
                              <svg viewBox="0 0 180 180" className="donut-svg">
                                <circle cx="90" cy="90" r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="22" />
                                {dashboardStats.porCategoria.map((c, i) => {
                                  const pct = Number(c.ingresos) / total;
                                  const len = pct * circumference;
                                  const segment = (
                                    <circle
                                      key={c.categoria}
                                      cx="90" cy="90" r={radius}
                                      fill="none"
                                      stroke={colors[i % colors.length]}
                                      strokeWidth="22"
                                      strokeDasharray={`${len} ${circumference - len}`}
                                      strokeDashoffset={-offset}
                                      transform="rotate(-90 90 90)"
                                      strokeLinecap="butt"
                                    />
                                  );
                                  offset += len;
                                  return segment;
                                })}
                              </svg>
                              <div className="donut-legend">
                                {dashboardStats.porCategoria.map((c, i) => (
                                  <div className="legend-item" key={c.categoria}>
                                    <span className="legend-dot" style={{ background: colors[i % colors.length] }}></span>
                                    <div>
                                      <strong>{c.categoria}</strong>
                                      <small>{fmtCLP(c.ingresos)} ({((Number(c.ingresos)/total)*100).toFixed(0)}%)</small>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })()
                      )}
                    </div>
                  </div>

                  <div className="charts-row" style={{ gridTemplateColumns: '1fr 1fr' }}>

                    <div className="glass-panel">
                      <div className="panel-header">
                        <div>
                          <h3>Top 5 productos más vendidos</h3>
                          <p>Por unidades</p>
                        </div>
                      </div>
                      {dashboardStats.topProductos.length === 0 ? (
                        <p style={{ color: '#94a3b8', textAlign: 'center', padding: '40px' }}>Sin ventas registradas.</p>
                      ) : (
                        <div className="hbar-list">
                          {(() => {
                            const max = Math.max(...dashboardStats.topProductos.map(p => p.unidades_vendidas), 1);
                            return dashboardStats.topProductos.map((p) => {
                              const w = (p.unidades_vendidas / max) * 100;
                              return (
                                <div className="hbar-item" key={p.id}>
                                  <div className="hbar-info">
                                    <strong>{p.nombre}</strong>
                                    <span>{p.unidades_vendidas} uds · {fmtCLP(p.ingresos)}</span>
                                  </div>
                                  <div className="hbar-track">
                                    <div className="hbar-fill" style={{ width: `${w}%` }}></div>
                                  </div>
                                </div>
                              );
                            });
                          })()}
                        </div>
                      )}
                    </div>

                    <div className="glass-panel">
                      <div className="panel-header">
                        <div>
                          <h3>Últimas ventas</h3>
                          <p>10 transacciones más recientes</p>
                        </div>
                      </div>
                      {(!dashboardStats.recientes || dashboardStats.recientes.length === 0) ? (
                        <p style={{ color: '#94a3b8', textAlign: 'center', padding: '40px' }}>Sin ventas recientes para mostrar.</p>
                      ) : (
                        <table className="admin-table">
                          <thead>
                            <tr><th>ID</th><th>CLIENTE</th><th>TOTAL</th><th>ESTADO</th></tr>
                          </thead>
                          <tbody>
                            {(dashboardStats.recientes || []).map(v => (
                              <tr key={v.id}>
                                <td className="text-cyan">#{v.id}</td>
                                <td>{v.cliente || '—'}</td>
                                <td><strong>{fmtCLP(v.total)}</strong></td>
                                <td>
                                  <span className={`pill ${v.estado === 'Completada' ? 'pill-green' : 'pill-warning'}`}>
                                    {v.estado}
                                  </span>
                                </td>
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

          {activeTab === 'finanzas' && (
            <div className="finanzas-view fade-in">
              <div className="view-header">
                <div>
                  <h2>Finanzas y Listado de Ventas</h2>
                  <p>Registro histórico detallado de todas las transacciones del sistema.</p>
                </div>
                <button className="btn-primary-action" onClick={fetchListadoVentas}>↻ Actualizar</button>
              </div>

              <div className="glass-panel mb-20">
                <div className="panel-header">
                  <h3>🛒 Ventas de Catálogo (Productos)</h3>
                </div>
                <div className="table-toolbar">
                  <div className="search-bar-admin">
                    <span className="icon">🔍</span>
                    <input type="text" placeholder="Buscar cliente o producto..." value={searchVentaProd} onChange={(e) => setSearchVentaProd(e.target.value)} />
                  </div>
                  <div className="filter-pills">
                    {['Todas', 'Tecnología', 'Maquinaria', 'Insumos'].map(cat => (
                      <button key={cat} className={filtroVentaCat === cat ? 'active' : ''} onClick={() => setFiltroVentaCat(cat)}>{cat}</button>
                    ))}
                  </div>
                </div>
                <table className="admin-table">
                  <thead>
                    <tr><th>FECHA</th><th>CLIENTE</th><th>PRODUCTO</th><th>CAT</th><th>CANT</th><th>PRECIO U.</th><th>SUBTOTAL</th></tr>
                  </thead>
                  <tbody>
                    {loadingVentas ? <tr><td colSpan="7" style={{textAlign:'center'}}>Cargando...</td></tr> : ventasProductosList.length === 0 ? <tr><td colSpan="7" style={{textAlign:'center', color:'#94a3b8'}}>No hay ventas con esos filtros.</td></tr> : ventasProductosList.map(v => (
                      <tr key={v.id}>
                        <td>{v.fecha ? new Date(v.fecha).toLocaleDateString('es-CL') : '—'}</td>
                        <td>{v.cliente}</td>
                        <td><strong>{v.producto}</strong> <br/><small className="text-cyan">{v.sku}</small></td>
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
                <div className="panel-header">
                  <h3>🎓 Ventas de Cursos (Inscripciones)</h3>
                </div>
                <div className="table-toolbar">
                  <div className="search-bar-admin">
                    <span className="icon">🔍</span>
                    <input type="text" placeholder="Buscar cliente o curso..." value={searchVentaCur} onChange={(e) => setSearchVentaCur(e.target.value)} />
                  </div>
                  <div className="filter-pills">
                    {['Todas', 'Tecnología', 'Maquinaria', 'Insumos', 'Asesorías'].map(cat => (
                      <button key={cat} className={filtroVentaCur === cat ? 'active' : ''} onClick={() => setFiltroVentaCur(cat)}>{cat}</button>
                    ))}
                  </div>
                </div>
                <table className="admin-table">
                  <thead>
                    <tr><th>FECHA</th><th>CLIENTE</th><th>CURSO</th><th>CAT</th><th>DIFICULTAD</th><th>TOTAL PAGADO</th></tr>
                  </thead>
                  <tbody>
                    {loadingVentas ? <tr><td colSpan="6" style={{textAlign:'center'}}>Cargando...</td></tr> : ventasCursosList.length === 0 ? <tr><td colSpan="6" style={{textAlign:'center', color:'#94a3b8'}}>No hay inscripciones con esos filtros.</td></tr> : ventasCursosList.map(v => (
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

          {activeTab !== 'catalogo' && activeTab !== 'solicitudes' && activeTab !== 'cursos' && activeTab !== 'dashboard' && activeTab !== 'finanzas' && (
            <div className="building-view fade-in"><h2>Pantalla de {activeTab} en desarrollo</h2></div>
          )}

        </div>
      </main>

      {showModal && (
        <div className="modal-overlay-glass">
          <div className="modal-content-glass fade-in">
            <div className="modal-header">
              <h2>{modalMode === 'add' ? '✨ Nuevo Producto' : '✏️ Editar Producto'}</h2>
              <button className="close-modal-btn" onClick={() => setShowModal(false)}>✕</button>
            </div>

            <form onSubmit={handleSaveProduct} className="admin-form">
              <div className="form-group">
                <label>NOMBRE DEL PRODUCTO</label>
                <input type="text" className="custom-input" required value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} />
              </div>
              <div className="form-grid-2">
                <div className="form-group">
                  <label>SKU (Código único)</label>
                  <input type="text" className="custom-input" required value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>CATEGORÍA</label>
                  <select className="custom-input" value={formData.categoria} onChange={e => setFormData({...formData, categoria: e.target.value})}>
                    <option>Insumos</option>
                    <option>Maquinaria</option>
                    <option>Tecnología</option>
                  </select>
                </div>
              </div>
              <div className="form-grid-2">
                <div className="form-group">
                  <label>PRECIO (CLP)</label>
                  <input type="number" className="custom-input" required value={formData.precio_clp} onChange={e => setFormData({...formData, precio_clp: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>STOCK INICIAL</label>
                  <input type="number" className="custom-input" required value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} />
                </div>
              </div>
              <div className="form-group">
                <label>DESCRIPCIÓN</label>
                <textarea className="custom-input" rows="3" value={formData.descripcion} onChange={e => setFormData({...formData, descripcion: e.target.value})}></textarea>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-ag-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn-ag-primary">
                  <span className="btn-text">{modalMode === 'add' ? 'Guardar Producto' : 'Actualizar Producto'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
              <div className="sol-info-item"><span>Tipo</span><strong style={{ textTransform: 'capitalize' }}>{modalSol.tipo_soporte}</strong></div>
              <div className="sol-info-item"><span>Urgencia</span>
                <span className={`pill ${modalSol.urgencia === 'normal' ? 'pill-green' : modalSol.urgencia === 'urgente' ? 'pill-warning' : 'pill-orange'}`}>
                  {modalSol.urgencia}
                </span>
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
                    <option>Pendiente</option>
                    <option>Confirmada</option>
                    <option>En Camino</option>
                    <option>Completada</option>
                    <option>Cancelada</option>
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

      {showCursoModal && (
        <div className="modal-overlay-glass" onClick={() => setShowCursoModal(false)}>
          <div className="modal-content-glass fade-in" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{cursoMode === 'add' ? '🎓 Nuevo Curso' : '✏️ Editar Curso'}</h2>
              <button className="close-modal-btn" onClick={() => setShowCursoModal(false)}>✕</button>
            </div>

            <form onSubmit={handleSaveCurso} className="admin-form">
              <div className="form-group">
                <label>NOMBRE DEL CURSO</label>
                <input type="text" className="custom-input" required value={formCurso.nombre} onChange={e => setFormCurso({...formCurso, nombre: e.target.value})} />
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label>SKU (Código único)</label>
                  <input type="text" className="custom-input" required placeholder="CURSO-011" value={formCurso.sku} onChange={e => setFormCurso({...formCurso, sku: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>CATEGORÍA</label>
                  <select className="custom-input" value={formCurso.categoria} onChange={e => setFormCurso({...formCurso, categoria: e.target.value})}>
                    <option>Tecnología</option>
                    <option>Maquinaria</option>
                    <option>Insumos</option>
                    <option>Asesorías</option>
                  </select>
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label>PRECIO (CLP) — 0 si es gratis</label>
                  <input type="number" min="0" className="custom-input" required value={formCurso.precio_clp} onChange={e => setFormCurso({...formCurso, precio_clp: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>CUPOS DISPONIBLES</label>
                  <input type="number" min="1" className="custom-input" required value={formCurso.stock} onChange={e => setFormCurso({...formCurso, stock: e.target.value})} />
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label>HORAS DE CONTENIDO</label>
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
                    <option>Básico</option>
                    <option>Intermedio</option>
                    <option>Avanzado</option>
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
                <textarea className="custom-input" rows="3" value={formCurso.descripcion || ''} onChange={e => setFormCurso({...formCurso, descripcion: e.target.value})}></textarea>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-ag-secondary" onClick={() => setShowCursoModal(false)}>Cancelar</button>
                <button type="submit" className="btn-ag-primary">
                  <span className="btn-text">{cursoMode === 'add' ? 'Crear Curso' : 'Guardar Cambios'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default Backoffice;