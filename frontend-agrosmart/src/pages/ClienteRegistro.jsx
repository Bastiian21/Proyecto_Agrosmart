import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import logo from '../assets/Logo.png';
import './ClienteRegistro.css';

function ClienteRegistro() {
  const navigate = useNavigate();


  const [nombreCompleto, setNombreCompleto] = useState('');
  const [rut, setRut] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState('Agricultor');


  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegistro = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {

      const response = await fetch('/api/auth/registro', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre_completo: nombreCompleto,
          rut: rut,
          email: email,
          telefono: telefono,
          password: password,
          rol: rol
        }),
      });

      const data = await response.json();

      if (!response.ok) {

        throw new Error(data.error || 'Error al registrar el usuario');
      }


      alert('¡Cuenta creada con éxito! Ahora puedes iniciar sesión.');
      navigate('/cliente/login');

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="registro-page-container">
      <div className="registro-glass-card animacion-portal-entrada">


        <div className="registro-info-side">
          <img src={logo} alt="AgroSmart Logo" className="registro-logo" />
          <h2>Únete al campo<br /><span className="text-gradient">inteligente.</span></h2>
          <p>Crea tu cuenta en 3 pasos y accede a la mejor red del agro digital de Chile.</p>

          <ul className="registro-benefits">
            <li><span className="icon">🚜</span> Catálogo completo de insumos</li>
            <li><span className="icon">📊</span> Cotizaciones en tiempo real</li>
            <li><span className="icon">✅</span> Asesoría técnica personalizada</li>
            <li><span className="icon">🚚</span> Despacho directo al predio</li>
          </ul>
        </div>


        <div className="registro-form-side">
          <span className="step-badge">1 Datos personales y acceso</span>
          <h3>Datos de tu cuenta</h3>
          <p className="subtitle">Cuéntanos quién eres para personalizar tu experiencia.</p>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleRegistro} className="form-grid">

            <div className="input-group full-width">
              <label>NOMBRE COMPLETO</label>
              <input type="text" placeholder="Ej. Juan Pérez" value={nombreCompleto} onChange={(e) => setNombreCompleto(e.target.value)} required />
            </div>

            <div className="input-group">
              <label>RUT</label>
              <input type="text" placeholder="12.345.678-9" value={rut} onChange={(e) => setRut(e.target.value)} required />
            </div>

            <div className="input-group">
              <label>TELÉFONO</label>
              <input type="tel" placeholder="+56 9 1234 5678" value={telefono} onChange={(e) => setTelefono(e.target.value)} required />
            </div>

            <div className="input-group full-width">
              <label>CORREO ELECTRÓNICO</label>
              <input type="email" placeholder="tu@correo.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>

            <div className="input-group full-width">
              <label>CONTRASEÑA</label>
              <input type="password" placeholder="Mínimo 6 caracteres" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>

            <div className="input-group full-width">
              <label>ROL EN LA PLATAFORMA</label>
              <div className="rol-selection">
                <div className={`rol-card ${rol === 'Agricultor' ? 'active' : ''}`} onClick={() => setRol('Agricultor')}>
                  <span className="rol-icon">👨‍🌾</span>
                  <div className="rol-text">
                    <strong>Agricultor</strong>
                    <span>Productor agrícola</span>
                  </div>
                </div>
                <div className={`rol-card ${rol === 'Asesor Técnico' ? 'active' : ''}`} onClick={() => setRol('Asesor Técnico')}>
                  <span className="rol-icon">🔬</span>
                  <div className="rol-text">
                    <strong>Asesor Técnico</strong>
                    <span>Consultor / Ingeniero</span>
                  </div>
                </div>
              </div>
            </div>

            <button type="submit" className="btn-registro-submit full-width" disabled={loading}>
              {loading ? 'Creando cuenta...' : 'CREAR CUENTA →'}
            </button>
          </form>

          <div className="registro-footer">
            <p>¿Ya tienes cuenta? <Link to="/cliente/login">Inicia sesión</Link></p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default ClienteRegistro;