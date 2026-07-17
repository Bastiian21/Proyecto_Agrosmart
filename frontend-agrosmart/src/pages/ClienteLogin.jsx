import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/Logo.png';
import './ClienteLogin.css';

function ClienteLogin() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [registroExitoso, setRegistroExitoso] = useState(false);


  const [nombre, setNombre] = useState('');
  const [rut, setRut] = useState('');
  const [emailReg, setEmailReg] = useState('');
  const [telefono, setTelefono] = useState('');
  const [passwordReg, setPasswordReg] = useState('');
  const [confirmPasswordReg, setConfirmPasswordReg] = useState('');
  const [rol, setRol] = useState('Agricultor');


  const [showRegPwd, setShowRegPwd] = useState(false);
  const [showConfirmRegPwd, setShowConfirmRegPwd] = useState(false);


  const [emailLogin, setEmailLogin] = useState('');
  const [passwordLogin, setPasswordLogin] = useState('');


  const [showLoginPwd, setShowLoginPwd] = useState(false);


  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');



  const formatRut = (value) => {
    const clean = value.replace(/[^0-9kK]/g, '');
    if (clean.length === 0) return '';
    if (clean.length <= 1) return clean;
    const body = clean.slice(0, -1);
    const dv = clean.slice(-1).toUpperCase();
    const formattedBody = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `${formattedBody}-${dv}`;
  };

  const isValidRut = (rutCompleto) => {
    if (!/^[0-9]{1,2}\.[0-9]{3}\.[0-9]{3}-[0-9Kk]{1}$/.test(rutCompleto)) return false;
    const clean = rutCompleto.replace(/[^0-9kK]/g, '');
    const body = clean.slice(0, -1);
    const dv = clean.slice(-1).toUpperCase();
    let sum = 0;
    let multiplier = 2;
    for (let i = body.length - 1; i >= 0; i--) {
      sum += body[i] * multiplier;
      multiplier = multiplier < 7 ? multiplier + 1 : 2;
    }
    const expectedDv = 11 - (sum % 11);
    const finalDv = expectedDv === 11 ? '0' : expectedDv === 10 ? 'K' : expectedDv.toString();
    return dv === finalDv;
  };

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const isValidPhone = (phone) => {
    return /^\+569\d{8}$/.test(phone);
  };

  const isSecurePassword = (password) => {
    const regex = /^(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/;
    return regex.test(password);
  };



  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailLogin, password: passwordLogin })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Error al iniciar sesión');

      localStorage.setItem('tokenAgrosmart', data.token);
      localStorage.setItem('usuarioAgrosmart', JSON.stringify(data.usuario));
      navigate('/cliente/home');
    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  };


  const handleRegistro = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!isValidRut(rut)) return setErrorMsg('❌ El RUT ingresado no es válido.');
    if (!isValidEmail(emailReg)) return setErrorMsg('❌ El correo no tiene un formato válido (ej: nombre@correo.cl).');
    if (!isValidPhone(telefono)) return setErrorMsg('❌ El teléfono debe tener el formato +569XXXXXXXX.');
    if (!isSecurePassword(passwordReg)) return setErrorMsg('❌ La contraseña debe tener al menos 8 caracteres, una mayúscula y un símbolo especial.');
    if (passwordReg !== confirmPasswordReg) return setErrorMsg('❌ Las contraseñas no coinciden.');

    setLoading(true);
    try {
      const response = await fetch('/api/auth/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre_completo: nombre,
          rut: rut,
          email: emailReg,
          telefono: telefono,
          password: passwordReg,
          rol: rol
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Error al registrarse');

      setNombre(''); setRut(''); setEmailReg(''); setTelefono('+569'); setPasswordReg(''); setConfirmPasswordReg('');
      setRegistroExitoso(true);

    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container animacion-portal-entrada">
      <button className="btn-back-floating" onClick={() => navigate('/cliente/home')}>
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        Volver al Portal
      </button>

      <div className="auth-glass-card">

        <div className="auth-left-panel">
          <div className="auth-logo-container">
            <img src={logo} alt="AgroSmart" className="auth-logo" />
            <span className="auth-brand-name">AgroSmart</span>
          </div>
          <div className="auth-value-prop">
            <h1>{isLogin ? "Bienvenido de vuelta al campo." : "Únete al campo inteligente."}</h1>
            <p>
              {isLogin
                ? "Accede a tu cuenta y gestiona tus insumos agrícolas desde cualquier lugar."
                : "Crea tu cuenta segura y accede a la mejor red del agro digital de Chile."}
            </p>
          </div>
          {isLogin ? (
            <div className="auth-stats">
              <div className="stat-box"><strong>+2.400</strong><span>Agricultores</span></div>
              <div className="stat-box"><strong>340+</strong><span>Predios</span></div>
              <div className="stat-box"><strong>12</strong><span>Regiones</span></div>
            </div>
          ) : (
            <div className="auth-bullets">
              <div className="bullet-item"><span className="bullet-icon">🛡️</span> Datos 100% encriptados y seguros</div>
              <div className="bullet-item"><span className="bullet-icon">🚜</span> Catálogo completo de insumos</div>
              <div className="bullet-item"><span className="bullet-icon">✅</span> Asesoría técnica personalizada</div>
            </div>
          )}
        </div>


        <div className="auth-right-panel">
          {errorMsg && (
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '10px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #ef4444', textAlign: 'center', fontSize: '0.9rem', fontWeight: '500' }}>
              {errorMsg}
            </div>
          )}


          {registroExitoso ? (
            <div className="auth-form-wrapper form-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center' }}>
              <div style={{ fontSize: '5rem', marginBottom: '10px' }}>✅</div>
              <h2 style={{ color: '#28C76F', marginBottom: '10px' }}>¡Cuenta Creada!</h2>
              <p style={{ color: '#94a3b8', marginBottom: '30px' }}>Tu cuenta ha sido validada y registrada correctamente.</p>
              <button onClick={() => { setRegistroExitoso(false); setIsLogin(true); setErrorMsg(''); }} className="btn-ag-primary full-width">
                <span className="btn-text">Ir a Iniciar Sesión →</span>
              </button>
            </div>
          ) : isLogin ? (


            <div className="auth-form-wrapper form-fade-in">
              <div className="auth-header-right">
                <h2>Iniciar sesión</h2>
                <p>Ingresa tus credenciales para acceder a tu cuenta.</p>
              </div>
              <form onSubmit={handleLogin} className="auth-form">
                <div className="form-group">
                  <label>CORREO ELECTRÓNICO</label>
                  <input type="email" placeholder="tu@correo.cl" className="custom-input" value={emailLogin} onChange={(e) => setEmailLogin(e.target.value)} required />
                </div>

                <div className="form-group">
                  <label>CONTRASEÑA</label>
                  <div className="input-with-eye">
                    <input
                      type={showLoginPwd ? "text" : "password"}
                      placeholder="••••••••"
                      className="custom-input"
                      value={passwordLogin}
                      onChange={(e) => setPasswordLogin(e.target.value)}
                      required
                    />
                    <button type="button" className="eye-btn" onClick={() => setShowLoginPwd(!showLoginPwd)}>
                      {showLoginPwd ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>

                <div className="auth-options">
                  <label className="checkbox-container">
                    <input type="checkbox" /><span className="checkmark"></span>Recordarme
                  </label>
                  <a href="#recuperar" className="forgot-password">¿Olvidaste tu contraseña?</a>
                </div>
                <button type="submit" className="btn-ag-primary full-width" disabled={loading}>
                  <span className="btn-text">{loading ? 'Ingresando...' : 'Iniciar Sesión →'}</span>
                </button>
                <div className="divider"><span>O CONTINÚA CON</span></div>
                <div className="sso-buttons">
                  <button type="button" className="btn-sso">
                    <svg width="20" height="20" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.7 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
                    Google
                  </button>
                  <button type="button" className="btn-sso">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{color: '#fff'}}><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
                    GitHub
                  </button>
                </div>
                <p className="auth-footer-text">¿No tienes cuenta? <button type="button" className="text-link" onClick={() => { setIsLogin(false); setErrorMsg(''); }}>Crear cuenta →</button></p>
              </form>
            </div>

          ) : (


            <div className="auth-form-wrapper form-fade-in">
              <div className="auth-header-right">
                <div className="stepper-mini"><span className="step-active">1</span> Seguridad de cuenta</div>
                <h2>Crea tu cuenta</h2>
              </div>
              <form onSubmit={handleRegistro} className="auth-form">

                <div className="form-row">
                  <div className="form-group">
                    <label>NOMBRE COMPLETO</label>
                    <input type="text" placeholder="Ej: Juan Pérez" className="custom-input" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label>RUT</label>
                    <input type="text" placeholder="12.345.678-9" maxLength={12} className="custom-input" value={rut} onChange={(e) => setRut(formatRut(e.target.value))} required />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>CORREO ELECTRÓNICO</label>
                    <input type="email" placeholder="tu@correo.cl" className="custom-input" value={emailReg} onChange={(e) => setEmailReg(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label>TELÉFONO</label>
                    <input type="tel" placeholder="+56912345678" maxLength={12} className="custom-input" value={telefono} onChange={(e) => setTelefono(e.target.value)} onFocus={() => !telefono && setTelefono('+569')} required />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>CONTRASEÑA</label>
                    <div className="input-with-eye">
                      <input
                        type={showRegPwd ? "text" : "password"}
                        placeholder="Ingresa tu contraseña"
                        className="custom-input"
                        value={passwordReg}
                        onChange={(e) => setPasswordReg(e.target.value)}
                        required
                      />
                      <button type="button" className="eye-btn" onClick={() => setShowRegPwd(!showRegPwd)}>
                        {showRegPwd ? '🙈' : '👁️'}
                      </button>
                    </div>

                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '6px', display: 'block', lineHeight: '1.2' }}>
                      Debe contener al menos 8 caracteres, 1 mayúscula y 1 símbolo especial (ej: . - @)
                    </span>
                  </div>

                  <div className="form-group">
                    <label>CONFIRMAR CONTRASEÑA</label>
                    <div className="input-with-eye">
                      <input
                        type={showConfirmRegPwd ? "text" : "password"}
                        placeholder="Repite tu contraseña"
                        className="custom-input"
                        value={confirmPasswordReg}
                        onChange={(e) => setConfirmPasswordReg(e.target.value)}
                        required
                      />
                      <button type="button" className="eye-btn" onClick={() => setShowConfirmRegPwd(!showConfirmRegPwd)}>
                        {showConfirmRegPwd ? '🙈' : '👁️'}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label>ROL EN LA PLATAFORMA</label>
                  <div className="role-selector">
                    <div className={`role-card ${rol === 'Agricultor' ? 'active' : ''}`} onClick={() => setRol('Agricultor')}>
                      <span className="role-icon">🌾</span>
                      <div className="role-text"><strong>Agricultor</strong></div>
                    </div>
                    <div className={`role-card ${rol === 'Asesor Técnico' ? 'active' : ''}`} onClick={() => setRol('Asesor Técnico')}>
                      <span className="role-icon">🔬</span>
                      <div className="role-text"><strong>Asesor Técnico</strong></div>
                    </div>
                  </div>
                </div>

                <button type="submit" className="btn-ag-primary full-width mt-10" disabled={loading}>
                  <span className="btn-text">{loading ? 'Validando...' : 'Registrarse →'}</span>
                </button>

                <p className="auth-footer-text text-center mt-20">
                  ¿Ya tienes cuenta? <button type="button" className="text-link" onClick={() => { setIsLogin(true); setErrorMsg(''); }}>Inicia sesión</button>
                </p>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default ClienteLogin;