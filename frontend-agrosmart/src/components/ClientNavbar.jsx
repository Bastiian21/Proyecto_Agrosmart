import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import logo from '../assets/Logo.png';
import CarroLateral from './CarroLateral';
import './ClientNavbar.css';


const NAV_ITEMS = [
  { label: "Home", to: "/cliente/home", disabled: false },
  { label: "Catálogo", to: "/cliente/catalogo", disabled: false, hasDropdown: true, subItems: [
    { label: "Tecnologías", category: "Tecnologías" },
    { label: "Maquinarias", category: "Maquinarias" },
    { label: "Insumos", category: "Insumos" },
  ]},
  { label: "Solicitud en terreno", to: "/cliente/solicitud", disabled: false },
  { label: "Capacitación", to: "/cliente/capacitacion", disabled: false },
  { label: "Mis Pedidos", to: "/cliente/mis-pedidos", disabled: false },
];

function ClientNavbar() {
  const navigate = useNavigate();
  const location = useLocation();


  const containerRef = useRef(null);
  const btnRefs = useRef([]);
  const [hoveredBtn, setHoveredBtn] = useState(null);
  const [dashArrays, setDashArrays] = useState([]);
  const [activeDropdown, setActiveDropdown] = useState(null);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileCatalogoOpen, setMobileCatalogoOpen] = useState(false);


  const [usuario, setUsuario] = useState(null);


  useEffect(() => {

    const handleAbrirCarro = () => setIsCartOpen(true);
    window.addEventListener('openCart', handleAbrirCarro);


    const userStr = localStorage.getItem('usuarioAgrosmart');
    if (userStr) {
      setUsuario(JSON.parse(userStr));
    }

    return () => window.removeEventListener('openCart', handleAbrirCarro);
  }, []);


  useEffect(() => {
    setIsCartOpen(false);
    setIsMobileMenuOpen(false);
  }, [location.pathname]);


  const handleCerrarSesion = () => {
    localStorage.removeItem('usuarioAgrosmart');
    localStorage.removeItem('tokenAgrosmart');
    setUsuario(null);
    navigate('/cliente/login');
  };


  const navegarConFiltro = (e, categoria) => {
    e.preventDefault();
    navigate(`/cliente/catalogo?category=${categoria}`);
    setActiveDropdown(null);
  };

  const handleMobileNav = (to) => {
    setIsMobileMenuOpen(false);
    navigate(to);
  };

  const handleMobileFilter = (e, categoria) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    navigate(`/cliente/catalogo?category=${categoria}`);
  };

  const handleMobileCerrarSesion = () => {
    setIsMobileMenuOpen(false);
    handleCerrarSesion();
  };


  const calculate = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const btns = btnRefs.current.filter(Boolean);
    if (btns.length === 0) return;

    const rx = 12;
    const rectW = 700;
    const rectH = 60;

    const topStraight = rectW - 2 * rx;
    const sideStraight = rectH - 2 * rx;
    const cornerArc = (Math.PI / 2) * rx;
    const totalP = 2 * topStraight + 2 * sideStraight + 4 * cornerArc;

    const topPct = (topStraight / totalP) * 100;
    const cornerPct = (cornerArc / totalP) * 100;
    const sidePct = (sideStraight / totalP) * 100;
    const brCornerEnd = topPct + cornerPct + sidePct + cornerPct;

    const containerRect = container.getBoundingClientRect();
    const rectLeftEdge = containerRect.left + 2;

    const arrays = btns.map((btn) => {
      const btnRect = btn.getBoundingClientRect();
      const btnLeftInRect = btnRect.left - rectLeftEdge;
      const btnWidth = btnRect.width;

      const btnLeftOnStraight = Math.max(0, btnLeftInRect - rx);
      const btnRightOnStraight = Math.min(topStraight, btnLeftInRect + btnWidth - rx);
      const btnWidthOnStraight = Math.max(0, btnRightOnStraight - btnLeftOnStraight);

      const leftFrac = btnLeftOnStraight / topStraight;
      const widthFrac = btnWidthOnStraight / topStraight;

      const topLineStart = leftFrac * topPct;
      const topLineWidth = widthFrac * topPct;
      const topLineEnd = topLineStart + topLineWidth;

      const bottomLineStart = brCornerEnd + (1 - leftFrac - widthFrac) * topPct;
      const bottomLineWidth = topLineWidth;
      const bottomLineEnd = bottomLineStart + bottomLineWidth;

      const gap1 = topLineStart;
      const dash1 = topLineWidth;
      const gap2 = bottomLineStart - topLineEnd;
      const dash2 = bottomLineWidth;
      const gap3 = 100 - bottomLineEnd;

      return `0 ${gap1.toFixed(2)} ${dash1.toFixed(2)} ${gap2.toFixed(2)} ${dash2.toFixed(2)} ${gap3.toFixed(2)}`;
    });

    setDashArrays(arrays);
  }, []);


  useEffect(() => {
    const timer = setTimeout(calculate, 150);
    window.addEventListener("resize", calculate);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", calculate);
    };
  }, [calculate]);


  const currentDashArray = hoveredBtn !== null && dashArrays[hoveredBtn]
    ? dashArrays[hoveredBtn]
    : "0 0 10 40 10 40";

  return (
    <nav className="navbar-custom-wrapper">


      <div className="nav-left-section">
        <img
          src={logo}
          alt="AgroSmart"
          className="logo-navbar"
          onClick={() => navigate('/cliente/home')}
        />


        <button
          className={`hamburger-btn ${isMobileMenuOpen ? 'open' : ''}`}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Menú"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <div
          ref={containerRef}
          className="nav-animated-container"
          onMouseLeave={() => {
            setHoveredBtn(null);
            setActiveDropdown(null);
          }}
        >
          {NAV_ITEMS.map((item, i) => (
            <div
              key={item.label}
              className={`nav-btn-wrapper ${item.hasDropdown ? 'dropdown-wrapper' : ''}`}
              onMouseEnter={() => {
                if(!item.disabled) {
                  setHoveredBtn(i);
                  if (item.hasDropdown) setActiveDropdown(i);
                  else setActiveDropdown(null);
                }
              }}
            >
              <div
                ref={(el) => (btnRefs.current[i] = el)}
                onClick={() => {
                  if (!item.disabled && !item.hasDropdown) navigate(item.to);
                  if (item.hasDropdown) navegarConFiltro({preventDefault:()=> {}}, 'Todas');
                }}
                className={`nav-btn ${item.disabled ? 'disabled-btn' : ''} ${hoveredBtn === i ? 'hovered' : ''}`}
              >
                {item.label}
                {item.hasDropdown && (
                  <svg
                    className="dropdown-icon"
                    viewBox="0 0 360 360"
                    xmlSpace="preserve"
                    style={{ transform: activeDropdown === i ? "rotate(-180deg)" : "rotate(0)" }}
                  >
                    <g><path d="M325.607,79.393c-5.857-5.857-15.355-5.858-21.213,0.001l-139.39,139.393L25.607,79.393 c-5.857-5.857-15.355-5.858-21.213,0.001c-5.858,5.858-5.858,15.355,0,21.213l150.004,150c2.813,2.813,6.628,4.393,10.606,4.393 s7.794-1.581,10.606-4.394l149.996-150C331.465,94.749,331.465,85.251,325.607,79.393z"></path></g>
                  </svg>
                )}
              </div>


              {item.hasDropdown && item.subItems && (
                <ul className={`submenu ${activeDropdown === i ? 'submenu-open' : ''}`}>
                  {item.subItems.map((sub) => (
                    <li key={sub.label} className="submenu-item">
                      <a href={`#${sub.label}`} onClick={(e) => navegarConFiltro(e, sub.category)} className="submenu-link">
                        {sub.label}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}


          <svg className="nav-outline" preserveAspectRatio="none">
            <rect
              className="nav-rect"
              x="2" y="2" width="696" height="56" rx="12" fill="none" pathLength="100"
              style={{
                strokeDasharray: currentDashArray,
                strokeDashoffset: hoveredBtn !== null ? 0 : 5,
                transition: hoveredBtn !== null
                  ? "stroke-dasharray 0.4s cubic-bezier(0.23, 1, 0.32, 1), stroke-dashoffset 0.4s ease"
                  : "stroke-dasharray 0.6s cubic-bezier(0.23, 1, 0.32, 1), stroke-dashoffset 99999s"
              }}
            />
          </svg>
        </div>
      </div>


      <div className="nav-actions-container">

        {usuario ? (

          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <span style={{ color: 'white', fontSize: '0.95rem' }}>
              👋 Bienvenido, <strong style={{ color: '#00ddeb' }}>{usuario.nombre.split(' ')[0]}</strong>
            </span>
            <button
              className="btn-login-outline"
              style={{ borderColor: 'rgba(239, 68, 68, 0.5)', color: '#ef4444' }}
              onClick={handleCerrarSesion}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              Cerrar Sesión
            </button>
          </div>
        ) : (

          <button className="btn-login-outline" onClick={() => navigate('/cliente/login')}>
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            Iniciar sesión / Registrarse
          </button>
        )}

        <button className="btn-carrito-icon" onClick={() => setIsCartOpen(true)}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
        </button>

        <button className="btn-volver-portal" onClick={() => navigate('/')}>Volver al Portal</button>
      </div>


      <div className={`mobile-menu ${isMobileMenuOpen ? 'mobile-menu-open' : ''}`}>
        <div className="mobile-menu-inner">

          {usuario && (
            <div className="mobile-user-greeting">
              👋 Bienvenido, <strong>{usuario.nombre.split(' ')[0]}</strong>
            </div>
          )}

          {NAV_ITEMS.map((item) => (
            <div key={item.label}>
              {item.hasDropdown ? (
                <>
                  <button
                    className="mobile-nav-item mobile-nav-dropdown-toggle"
                    onClick={() => setMobileCatalogoOpen(!mobileCatalogoOpen)}
                  >
                    {item.label}
                    <svg viewBox="0 0 360 360" style={{ transform: mobileCatalogoOpen ? 'rotate(-180deg)' : 'rotate(0)' }}>
                      <path d="M325.607,79.393c-5.857-5.857-15.355-5.858-21.213,0.001l-139.39,139.393L25.607,79.393 c-5.857-5.857-15.355-5.858-21.213,0.001c-5.858,5.858-5.858,15.355,0,21.213l150.004,150c2.813,2.813,6.628,4.393,10.606,4.393 s7.794-1.581,10.606-4.394l149.996-150C331.465,94.749,331.465,85.251,325.607,79.393z"/>
                    </svg>
                  </button>
                  {mobileCatalogoOpen && (
                    <div className="mobile-submenu">
                      {item.subItems.map((sub) => (
                        <a
                          key={sub.label}
                          href={`#${sub.label}`}
                          className="mobile-submenu-link"
                          onClick={(e) => handleMobileFilter(e, sub.category)}
                        >
                          {sub.label}
                        </a>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <button
                  className={`mobile-nav-item ${item.disabled ? 'mobile-nav-disabled' : ''}`}
                  onClick={() => !item.disabled && handleMobileNav(item.to)}
                >
                  {item.label}
                </button>
              )}
            </div>
          ))}

          <div className="mobile-menu-actions">
            <button className="btn-carrito-icon" onClick={() => { setIsMobileMenuOpen(false); setIsCartOpen(true); }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
              Carrito
            </button>

            {usuario ? (
              <button className="mobile-btn-danger" onClick={handleMobileCerrarSesion}>
                Cerrar Sesión
              </button>
            ) : (
              <button className="mobile-btn-login" onClick={() => handleMobileNav('/cliente/login')}>
                Iniciar sesión / Registrarse
              </button>
            )}

            <button className="mobile-btn-portal" onClick={() => handleMobileNav('/')}>
              Volver al Portal
            </button>
          </div>
        </div>
      </div>


      <CarroLateral isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

    </nav>
  );
}

export default ClientNavbar;