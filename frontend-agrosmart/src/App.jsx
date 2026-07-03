import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import logo from "./assets/logo.png";


import { CartProvider } from './context/CartContext';


import ClienteHome from "./pages/ClienteHome";
import ClienteCatalogo from './pages/ClienteCatalogo';
import ClienteCarrito from './pages/ClienteCarrito';
import ClienteCheckout from './pages/ClienteCheckout';
import ClienteSolicitud from './pages/ClienteSolicitud';
import ClienteCapacitacion from './pages/ClienteCapacitacion';
import ClienteLogin from './pages/ClienteLogin';
import ClienteVerificarPago from './pages/ClienteVerificarPago';
import ClienteMisPedidos from './pages/ClienteMisPedidos';


import AdminLogin from './pages/AdminLogin';
import Backoffice from "./pages/Backoffice";

import "./App.css";

function PortalSelector() {
  const navigate = useNavigate();
  const [saliendo, setSaliendo] = useState(false);

  const irAPagina = (ruta) => {
    setSaliendo(true);
    setTimeout(() => {
      navigate(ruta);
    }, 400);
  };

  return (
    <div className={`background-agro ${saliendo ? 'animacion-salida' : 'animacion-entrada'}`}>
      <div className="tarjeta-login">
        <img src={logo} alt="AgroSmart Logo" className="logo-img-central" />
        <div className="botones-container">
          <button className="btn-uiverse btn-cliente" onClick={() => irAPagina('/cliente/home')}>
            <span>🌱 Portal Cliente</span>
          </button>
          <button className="btn-uiverse btn-backoffice" onClick={() => irAPagina('/admin')}>
            <span>⚙️ Acceso Backoffice</span>
          </button>
        </div>
      </div>
    </div>
  );
}


function AppContent() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PortalSelector />} />


        <Route path="/cliente/home" element={<ClienteHome />} />
        <Route path="/cliente/catalogo" element={<ClienteCatalogo />} />
        <Route path="/cliente/carrito" element={<ClienteCarrito />} />
        <Route path="/cliente/checkout" element={<ClienteCheckout />} />
        <Route path="/cliente/solicitud" element={<ClienteSolicitud />} />
        <Route path="/cliente/capacitacion" element={<ClienteCapacitacion />} />
        <Route path="/cliente/login" element={<ClienteLogin />} />
        <Route path="/cliente/verificar-pago" element={<ClienteVerificarPago />} />
        <Route path="/cliente/mis-pedidos" element={<ClienteMisPedidos />} />


        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<Backoffice />} />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <CartProvider>
      <AppContent />
    </CartProvider>
  );
}

export default App;