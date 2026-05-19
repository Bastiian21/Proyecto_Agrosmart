import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ClientNavbar from '../components/ClientNavbar';
import { useCart } from '../context/CartContext';
import './ClienteCatalogo.css';

function ClienteCatalogo() {
  const navigate = useNavigate();
  const location = useLocation();


  const [productos, setProductos] = useState([]);
  const [activeTab, setActiveTab] = useState('Todas');
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [cantidad, setCantidad] = useState(1);

  const [searchTerm, setSearchTerm] = useState('');
  const [stockFilter, setStockFilter] = useState('Todos');

  const { addToCart } = useCart();


  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const response = await fetch('/api/productos');
        const data = await response.json();
        setProductos(data);
      } catch (error) {
        console.error("Error al cargar el catálogo:", error);
      }
    };
    fetchProductos();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const categoryQuery = params.get('category');
    if (categoryQuery) setActiveTab(categoryQuery);
  }, [location]);

  useEffect(() => {
    if (productoSeleccionado) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [productoSeleccionado]);


  const productosFiltrados = productos.filter(p => {
    const matchCategoria = activeTab === 'Todas' ? true :
      p.categoria.localeCompare(activeTab, 'es', { sensitivity: 'base' }) === 0;

    const matchSearch = p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        p.sku.toLowerCase().includes(searchTerm.toLowerCase());

    let matchStock = true;
    if (stockFilter === 'Disponibles') matchStock = p.stock > 0;
    if (stockFilter === 'Agotados') matchStock = p.stock === 0;

    return matchCategoria && matchSearch && matchStock;
  });

  const totalProductos = productos.length;
  const totalDisponibles = productos.filter(p => p.stock > 0).length;

  const abrirModal = (producto) => {
    setProductoSeleccionado(producto);
    setCantidad(1);
  };
  const cerrarModal = () => setProductoSeleccionado(null);

  const handleAgregarCarrito = () => {
    addToCart(productoSeleccionado, cantidad);
    window.dispatchEvent(new Event('openCart'));
    cerrarModal();
  };

  const handleSolicitarAsesoria = () => {
    cerrarModal();
    navigate('/cliente/solicitud');
  };

  return (
    <div className="catalogo-page-container">
      <div className="animacion-portal-entrada">

        <ClientNavbar />

        <section className="cat-hero-section">
          <div className="cat-hero-overlay"></div>
          <div className="cat-hero-content container-lg">
            <div className="cat-hero-left">
              <span className="cat-tag-title">CATÁLOGO COMPLETO</span>
              <h1 className="cat-main-title">Tecnología para el campo</h1>
              <p className="cat-description">
                Monitoreo de humedad, temperatura y nutrientes en tiempo real. Conectividad directa a tu smartphone para tomar las mejores decisiones.
              </p>
              <div className="cat-stats-row">
                <div className="cat-stat"><span className="stat-num">📦 {totalProductos}</span><span className="stat-label">Productos</span></div>
                <div className="cat-stat"><span className="stat-num">✅ {totalDisponibles}</span><span className="stat-label">Disponibles</span></div>
                <div className="cat-stat"><span className="stat-num">🚚 48h</span><span className="stat-label">Despacho</span></div>
                <div className="cat-stat"><span className="stat-num">🛡️ 100%</span><span className="stat-label">Garantía</span></div>
              </div>
            </div>

            <div className="cat-hero-right">
              <div className="cat-tabs-container">

                <button
                  className={`view-posts-btn ${activeTab === 'Tecnología' ? 'btn-ag-primary' : 'btn-ag-secondary'}`}
                  onClick={() => setActiveTab(activeTab === 'Tecnología' ? 'Todas' : 'Tecnología')}
                >
                  <span className="btn-text">Tecnología</span>
                </button>
                <button
                  className={`view-posts-btn ${activeTab === 'Maquinaria' ? 'btn-ag-primary' : 'btn-ag-secondary'}`}
                  onClick={() => setActiveTab(activeTab === 'Maquinaria' ? 'Todas' : 'Maquinaria')}
                >
                  <span className="btn-text">Maquinaria</span>
                </button>
                <button
                  className={`view-posts-btn ${activeTab === 'Insumos' ? 'btn-ag-primary' : 'btn-ag-secondary'}`}
                  onClick={() => setActiveTab(activeTab === 'Insumos' ? 'Todas' : 'Insumos')}
                >
                  <span className="btn-text">Insumos</span>
                </button>
              </div>
            </div>
          </div>

          <div className="cat-controls-section container-lg">
            <div className="cat-search-wrapper">
              <div className="cat-search-container glow-cyan">
                <svg className="search-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <input
                  type="text"
                  placeholder="Buscar en catálogo..."
                  className="cat-search-input"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="cat-filters-wrapper">
              <span className="filters-label">Filtros:</span>
              <div className="filters-pills">
                <button className={`filter-pill ${stockFilter === 'Todos' ? 'active' : ''}`} onClick={() => setStockFilter('Todos')}>Todos</button>
                <button className={`filter-pill ${stockFilter === 'Disponibles' ? 'active' : ''}`} onClick={() => setStockFilter('Disponibles')}>Disponibles</button>
                <button className={`filter-pill ${stockFilter === 'Agotados' ? 'active' : ''}`} onClick={() => setStockFilter('Agotados')}>Agotados</button>
              </div>
            </div>
          </div>
        </section>

        <section className="cat-grid-section container-lg">
          <div className="productos-grid">
            {productosFiltrados.length === 0 ? (
              <h3 style={{color: '#94a3b8', textAlign: 'center', width: '100%', padding: '40px 0'}}>No se encontraron productos con estos filtros.</h3>
            ) : (
              productosFiltrados.map((prod) => (
                <div className={`producto-card ${prod.stock === 0 ? 'agotado-card' : ''}`} key={prod.id}>
                  <div className="card-img-container">


                    <span className="categoria-badge">{prod.categoria}</span>


                    {prod.stock > 0 ? (
                      <span className="estado-badge disponible">Disponible</span>
                    ) : (
                      <span className="estado-badge agotado">Agotado</span>
                    )}

                    <img src={prod.imagen_url || 'https://images.unsplash.com/photo-1592417817098-8f3d6eb18865?w=500'} alt={prod.nombre} />
                  </div>
                  <div className="card-info">
                    <span className="sku-text">SKU: {prod.sku}</span>
                    <h3 className="producto-titulo">{prod.nombre}</h3>
                    <div className="precio-container">
                      <span className="precio">${Number(prod.precio_clp).toLocaleString('es-CL')} <small>CLP</small></span>
                    </div>
                    <button
                      className="btn-ver-detalles"
                      onClick={() => abrirModal(prod)}
                    >
                      {prod.stock === 0 ? 'VER DETALLES (SIN STOCK)' : 'VER DETALLES'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

      </div>


      {productoSeleccionado && (
        <div className="modal-overlay" onClick={cerrarModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>

            <div className="modal-left">
              <span className="categoria-badge modal-badge">{productoSeleccionado.categoria}</span>
              <img src={productoSeleccionado.imagen_url || 'https://images.unsplash.com/photo-1592417817098-8f3d6eb18865?w=500'} alt={productoSeleccionado.nombre} />
            </div>

            <div className="modal-right">
              <div className="modal-top-bar">
                <span className="modal-top-label">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                  FICHA DE PRODUCTO
                </span>
                <button className="btn-close-modal" onClick={cerrarModal}>✕</button>
              </div>

              <h2 className="modal-titulo">{productoSeleccionado.nombre}</h2>
              <span className="sku-text modal-sku">SKU: {productoSeleccionado.sku}</span>

              <div className="modal-precio-row">
                <div className="precio-gigante">${Number(productoSeleccionado.precio_clp).toLocaleString('es-CL')} <small>CLP</small></div>
                {productoSeleccionado.stock > 0 ? (
                  <span className="stock-pill pill-green">• {productoSeleccionado.stock} UDS. DISPONIBLES</span>
                ) : (
                  <span className="stock-pill pill-red">• AGOTADO</span>
                )}
              </div>

              <div className="modal-descripcion">
                <span className="desc-label">DESCRIPCIÓN TÉCNICA</span>
                <p>{productoSeleccionado.descripcion || 'Sin descripción disponible.'}</p>
              </div>

              <div className="modal-actions">
                <div className="selector-cantidad-modal">
                  <button onClick={() => setCantidad(Math.max(1, cantidad - 1))}>-</button>
                  <span>{cantidad}</span>
                  <button onClick={() => setCantidad(Math.min(productoSeleccionado.stock, cantidad + 1))}>+</button>
                </div>
                <button
                  className={`btn-agregar-carrito ${productoSeleccionado.stock === 0 ? 'disabled' : ''}`}
                  onClick={handleAgregarCarrito}
                  disabled={productoSeleccionado.stock === 0}
                >
                  {productoSeleccionado.stock === 0 ? 'SIN STOCK' : 'AGREGAR AL CARRITO'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default ClienteCatalogo;