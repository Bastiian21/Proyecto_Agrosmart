import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import './AdminLogin.css';

function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Credenciales incorrectas.');
        return;
      }

      if (data.usuario?.rol !== 'admin') {
        setError('Acceso denegado. Esta área es exclusiva del personal autorizado.');
        return;
      }

      localStorage.setItem('adminAgrosmart', JSON.stringify(data.usuario));
      localStorage.setItem('adminTokenAgrosmart', data.token);

      navigate('/admin/dashboard');
    } catch (err) {
      console.error(err);
      setError('Error de conexión con el servidor.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="admin-login-container animacion-entrada">
      <div className="admin-login-card">
        <div className="admin-login-header">
          <img src={logo} alt="AgroSmart" className="admin-logo" />
          <h2>Acceso Restringido</h2>
          <p>Portal exclusivo para personal autorizado de AgroSmart.</p>
        </div>

        <form onSubmit={handleLogin} className="admin-login-form">
          <div className="form-group">
            <label>CORREO CORPORATIVO</label>
            <input
              type="email"
              placeholder="admin@agrosmart.cl"
              className={`custom-input ${error ? 'input-error' : ''}`}
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              required
            />
          </div>

          <div className="form-group">
            <label>CONTRASEÑA</label>
            <input
              type="password"
              placeholder="••••••••"
              className={`custom-input ${error ? 'input-error' : ''}`}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              required
            />
          </div>

          {error && <p className="error-message">{error}</p>}

          <button type="submit" className="btn-admin-primary mt-20" disabled={cargando}>
            {cargando ? 'Verificando...' : 'Ingresar al Backoffice'}
          </button>
        </form>

        <button className="btn-volver-inicio" onClick={() => navigate('/')}>
          ← Volver al Portal de Inicio
        </button>
      </div>
    </div>
  );
}

export default AdminLogin;
