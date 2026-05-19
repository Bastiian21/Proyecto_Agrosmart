import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import ClientNavbar from '../components/ClientNavbar';
import { useCart } from '../context/CartContext';
import './ClienteCapacitacion.css';

function ClienteCapacitacion() {
  const [cursos, setCursos] = useState([]);
  const [activeTab, setActiveTab] = useState('Todas');
  const [searchTerm, setSearchTerm] = useState('');
  const [cursoSeleccionado, setCursoSeleccionado] = useState(null);
  const [feedback, setFeedback] = useState('');

  const { addToCart } = useCart();

  useEffect(() => {
    const fetchCursos = async () => {
      try {
        const res = await fetch('/api/cursos');
        const data = await res.json();
        setCursos(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error al cargar cursos:', error);
      }
    };
    fetchCursos();
  }, []);

  useEffect(() => {
    document.body.style.overflow = cursoSeleccionado ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [cursoSeleccionado]);

  const categorias = ['Todas', 'Tecnología', 'Maquinaria', 'Insumos', 'Asesorías'];

  const cursosFiltrados = cursos.filter(c => {
    const matchCat = activeTab === 'Todas' ? true :
      (c.categoria || '').localeCompare(activeTab, 'es', { sensitivity: 'base' }) === 0;
    const matchSearch = (c.nombre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (c.instructor || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchCat && matchSearch;
  });

  const abrirModal = (curso) => setCursoSeleccionado(curso);
  const cerrarModal = () => setCursoSeleccionado(null);

  const handleAgregarCarrito = () => {

    const cursoConTipo = { ...cursoSeleccionado, tipo: 'curso' };
    addToCart(cursoConTipo, 1);
    cerrarModal();
    setTimeout(() => {
      window.dispatchEvent(new Event('openCart'));
    }, 150);
  };

  const esGratuito = (c) => Number(c.precio_clp) === 0;

  return (
    <div className="capacitacion-page-container animacion-portal-entrada">
      <ClientNavbar />

      <section className="cap-hero-section">
        <div className="cap-hero-overlay"></div>
        <div className="cap-hero-content container-lg">
          <span className="cap-tag-title">CENTRO DE ESTUDIOS AGRÍCOLAS</span>
          <h1 className="cap-main-title">Potencia tu campo con <span className="text-gradient">capacitación</span></h1>
          <p className="cap-description">
            Formación especializada para agricultores y técnicos modernos. Drones, sensores IoT, maquinaria de precisión y técnicas de cultivo sostenible.
          </p>

          <div className="cap-stats-row glow-cyan">
            <div className="cap-stat"><span className="stat-icon">📚</span><span className="stat-num">{cursos.length}</span><span className="stat-label">Cursos</span></div>
            <div className="cap-stat"><span className="stat-icon">👨‍🏫</span><span className="stat-num">{new Set(cursos.map(c => c.instructor)).size}</span><span className="stat-label">Instructores</span></div>
            <div className="cap-stat"><span className="stat-icon">🎓</span><span className="stat-num">350</span><span className="stat-label">Graduados</span></div>
            <div className="cap-stat"><span className="stat-icon">⏱️</span><span className="stat-num">{cursos.reduce((acc, c) => acc + (c.horas || 0), 0)}+</span><span className="stat-label">Horas Contenido</span></div>
          </div>
        </div>
      </section>

      <section className="cap-controls-section container-lg">
        <div className="cap-search-wrapper">
          <div className="cap-search-container glow-cyan">
            <svg className="search-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input
              type="text"
              placeholder="Buscar cursos, temas o instructores..."
              className="cap-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="cap-filters-wrapper">
          <span className="filters-label">Módulos:</span>
          <div className="filters-pills">
            {categorias.map(cat => (
              <button
                key={cat}
                className={`filter-pill ${activeTab === cat ? 'active' : ''}`}
                onClick={() => setActiveTab(cat)}
              >
                {cat.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </section>

      {feedback && (
        <div className="container-lg" style={{ marginTop: '20px' }}>
          <div style={{
            background: 'rgba(40, 199, 111, 0.12)', border: '1px solid #28C76F',
            color: '#28C76F', padding: '12px 20px', borderRadius: '10px',
            textAlign: 'center', fontWeight: 600
          }}>
            {feedback}
          </div>
        </div>
      )}

      <section className="cap-grid-section container-lg">
        <div className="cap-product-grid">
          {cursosFiltrados.length === 0 ? (
            <h3 style={{color: '#94a3b8', textAlign: 'center', width: '100%', padding: '40px 0'}}>
              No hay cursos con estos filtros.
            </h3>
          ) : (
            cursosFiltrados.map((curso) => (
              <div className="cat-product-card" key={curso.id}>
                <div
                  className="cat-card-image"
                  style={{ backgroundImage: `url('${curso.imagen_url || 'https://images.unsplash.com/photo-1592417817098-8f3d6eb18865?w=500'}')` }}
                >
                  <span className={`status-badge ${curso.dificultad === 'Básico' ? 'status-insumo' : 'status-disponible'}`}>
                    {curso.dificultad || 'Básico'}
                  </span>
                </div>

                <div className="cat-card-content">
                  <span className={`cat-category ${curso.categoria === 'Tecnología' ? 'text-cyan' : 'text-verde'}`}>
                    {(curso.categoria || '').toUpperCase()}
                  </span>
                  <h3>{curso.nombre}</h3>

                  <div className="cap-course-metrics">
                    <span>⏱️ {curso.horas || 0}h</span>
                    <span>📦 {curso.modulos || 0} Móds</span>
                    <span>🎓 Certific.</span>
                  </div>

                  <p className="cap-instructor">Docente: {curso.instructor || 'Por asignar'}</p>

                  <div className="cat-card-bottom">
                    <span className="cat-price">
                      {esGratuito(curso) ? 'GRATIS' : `$${Number(curso.precio_clp).toLocaleString('es-CL')}`}
                    </span>
                    <button
                      className="cat-btn-comprar"
                      onClick={() => abrirModal(curso)}
                    >
                      {esGratuito(curso) ? 'INSCRIBIRME' : 'COMPRAR'}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {cursoSeleccionado && createPortal(
        <div className="modal-overlay-cap" onClick={cerrarModal}>
          <div className="modal-content-cap" onClick={(e) => e.stopPropagation()}>

            <div className="modal-left-cap">
              <span className="categoria-badge-cap">{cursoSeleccionado.categoria}</span>
              <img
                src={cursoSeleccionado.imagen_url || 'https://images.unsplash.com/photo-1592417817098-8f3d6eb18865?w=500'}
                alt={cursoSeleccionado.nombre}
              />
            </div>

            <div className="modal-right-cap">
              <div className="modal-top-bar-cap">
                <span className="modal-top-label-cap">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
                  </svg>
                  FICHA DEL CURSO
                </span>
                <button className="btn-close-modal-cap" onClick={cerrarModal}>✕</button>
              </div>

              <h2 className="modal-titulo-cap">{cursoSeleccionado.nombre}</h2>
              <span className="modal-sku-cap">SKU: {cursoSeleccionado.sku}</span>

              <div className="modal-precio-row-cap">
                <div className="precio-gigante-cap">
                  {esGratuito(cursoSeleccionado)
                    ? <>GRATIS</>
                    : <>${Number(cursoSeleccionado.precio_clp).toLocaleString('es-CL')} <small>CLP</small></>
                  }
                </div>
                <span className="stock-pill-cap">
                  • {cursoSeleccionado.horas}h • {cursoSeleccionado.modulos} módulos • {cursoSeleccionado.dificultad}
                </span>
              </div>

              <div className="modal-descripcion-cap">
                <span className="desc-label-cap">SOBRE EL CURSO</span>
                <p>{cursoSeleccionado.descripcion || 'Sin descripción disponible.'}</p>
                <p style={{ marginTop: '10px', color: '#94a3b8' }}>
                  <strong>Docente:</strong> {cursoSeleccionado.instructor}
                </p>
              </div>

              <button
                className="btn-agregar-carrito-cap"
                onClick={handleAgregarCarrito}
              >
                {esGratuito(cursoSeleccionado) ? 'INSCRIBIRME AHORA' : 'AGREGAR AL CARRITO'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

export default ClienteCapacitacion;
