import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useInView } from 'react-intersection-observer';
import ClientNavbar from '../components/ClientNavbar';
import logo from '../assets/logo.png';
import './ClienteHome.css';

function ClienteHome() {
  const navigate = useNavigate();


  const options = { triggerOnce: true, threshold: 0.2 };
  const [ref1, inView1] = useInView(options);
  const [ref2, inView2] = useInView(options);
  const [ref3, inView3] = useInView(options);

  return (
    <div className="cliente-home-container animacion-portal-entrada">
      <ClientNavbar />


      <section className="hero-fullscreen">
        <div className="hero-content-left">
          <img src={logo} alt="AgroSmart Logo" className="hero-logo-left" />
          <h1 className="hero-title">
            CONECTA TU <span className="text-gradient">CAMPO.</span><br />
            OPTIMIZA TU <span className="text-gradient">FUTURO.</span>
          </h1>
          <p className="hero-subtitle">
            Distribuidora líder en tecnología agrícola. Sensores, drones, sistemas de riego y maquinaria de precisión con despacho directo a tu predio. Nacidos en Rancagua, VI Región.
          </p>
          <div className="hero-buttons">
            <button className="view-posts-btn btn-ag-primary" onClick={() => navigate('/cliente/catalogo')}>
              <span className="btn-text">Ver Catálogo</span>
              <span className="btn-icon">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </span>
            </button>
            <button className="view-posts-btn btn-ag-secondary" onClick={() => navigate('/cliente/solicitud')}>
              <span className="btn-text">Soporte Técnico</span>
              <span className="btn-icon">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </span>
            </button>
          </div>
        </div>
      </section>


      <section className="trust-section">
        <div className="container-lg">
          <div className="trust-grid">


            <div className="trust-card glow-green">
              <div className="trust-icon">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              </div>
              <div className="trust-info">
                <h3>30+</h3>
                <p>Años en el mercado</p>
              </div>
            </div>


            <div className="trust-card glow-cyan">
              <div className="trust-icon">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
              </div>
              <div className="trust-info">
                <h3>6</h3>
                <p>Sucursales en Chile</p>
              </div>
            </div>


            <div className="trust-card glow-green">
              <div className="trust-icon">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
              </div>
              <div className="trust-info">
                <h3>+1.200</h3>
                <p>Agricultores activos</p>
              </div>
            </div>


            <div className="trust-card glow-cyan">
              <div className="trust-icon">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
              </div>
              <div className="trust-info">
                <h3>48h</h3>
                <p>Despacho a predio</p>
              </div>
            </div>


            <div className="trust-card glow-green">
              <div className="trust-icon">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
              </div>
              <div className="trust-info">
                <h3>100%</h3>
                <p>Garantía de marca</p>
              </div>
            </div>

          </div>
        </div>
      </section>


      <section className="alternating-features-section">
        <div className="container-lg">

          <div className="section-header-centered">
            <span className="section-tag">• NUESTROS PILARES</span>
            <h2 className="section-title-large">
              Tecnología y experiencia<br />
              <span className="text-gradient">al servicio del campo</span>
            </h2>
            <p className="section-subtitle-centered">
              Combinamos nuestra trayectoria con innovación tecnológica para entregar soluciones que impulsan tu productividad.
            </p>
          </div>


          <div ref={ref1} className={`wide-feature-card border-green ${inView1 ? 'slide-in-left' : ''}`}>
            <div className="card-image-layer img-right" style={{ backgroundImage: "url('/src/assets/Fila 1.png')" }}></div>
            <div className="card-content-layer content-left">
              <div className="card-icon icon-green">🌱</div>
              <div className="card-text">
                <h3>Nuestras <span className="text-green">Raíces</span></h3>
                <p>Nacidos en Rancagua en la década de los 90, llevamos más de 30 años siendo el aliado estratégico del campo chileno, expandiéndonos a 6 sucursales a lo largo del país.</p>
              </div>
            </div>
          </div>


          <div ref={ref2} className={`wide-feature-card border-cyan ${inView2 ? 'slide-in-right' : ''}`}>
            <div className="card-image-layer img-left" style={{ backgroundImage: "url('/src/assets/Fila 2.png')" }}></div>
            <div className="card-content-layer content-right">
              <div className="card-icon icon-cyan">⚙️</div>
              <div className="card-text">
                <h3>Innovación <span className="text-cyan">Constante</span></h3>
                <p>Entendemos que el cambio climático exige nuevas soluciones. Por eso, integramos domótica, sensores y maquinaria de precisión para optimizar cada gota de agua y cada hectárea de tierra.</p>
              </div>
            </div>
          </div>


          <div ref={ref3} className={`wide-feature-card border-green ${inView3 ? 'slide-in-left' : ''}`}>
            <div className="card-image-layer img-right" style={{ backgroundImage: "url('/src/assets/Fila 3.png')" }}></div>
            <div className="card-content-layer content-left">
              <div className="card-icon icon-green">⚡</div>
              <div className="card-text">
                <h3>Tiempo es <span className="text-green">Dinero</span></h3>
                <p>Olvídate de los largos viajes a la sucursal. Nuestra plataforma te permite revisar el stock en tiempo real desde tu predio, asegurar tu compra y programar el despacho directo a tus manos.</p>
              </div>
            </div>
          </div>

        </div>
      </section>


      <section className="contact-section">
        <div className="contact-info">
          <span className="section-tag">📍 CASA MATRIZ</span>
          <h2>Estamos en Rancagua, cerca de tu campo</h2>
          <p>Nuestra casa matriz opera desde Rancagua, VI Región, con presencia en 6 sucursales distribuidas a lo largo del país para atenderte rápidamente.</p>
          <div className="contact-list">
            <div className="contact-item"><div className="icon">📍</div><div><h4>Dirección</h4><p>Av. Los Libertadores 1847, Oficina 301, Rancagua</p></div></div>
            <div className="contact-item"><div className="icon">📞</div><div><h4>Teléfono</h4><p>+56 72 2 334 800</p></div></div>
            <div className="contact-item"><div className="icon">💬</div><div><h4>WhatsApp</h4><p>+56 9 7823 4401</p></div></div>
          </div>
        </div>
        <div className="contact-map-container">

          <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d105260.67268846399!2d-70.82672522770222!3d-34.17029302196025!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x966343468b375b43%3A0xc6c4ceaf7f5f2425!2sRancagua%2C%20O'Higgins!5e0!3m2!1ses-419!2scl!4v1714954308527!5m2!1ses-419!2scl" allowFullScreen="" loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Mapa Casa Matriz AgroSmart"></iframe>
        </div>
      </section>


      <footer className="footer">
        <div className="footer-logo">AGROSMART</div>
        <div className="footer-links">
          <a href="/cliente/catalogo">Catálogo</a>
          <a href="/cliente/solicitud">Soporte Técnico</a>
          <a href="/cliente/capacitacion">Capacitación</a>
        </div>
        <div className="footer-copy">© 2026 AgroSmart S.A. Todos los derechos reservados.</div>
      </footer>
    </div>
  );
}

export default ClienteHome;