import React, { useState, useEffect } from 'react';
import ClientNavbar from '../components/ClientNavbar';
import './ClienteSolicitud.css';

const regionesChilenas = {
  "Arica y Parinacota": ["Arica", "Camarones", "Putre", "General Lagos"],
  "Tarapacá": ["Iquique", "Alto Hospicio", "Pozo Almonte", "Camiña", "Colchane", "Huara", "Pica"],
  "Antofagasta": ["Antofagasta", "Mejillones", "Sierra Gorda", "Taltal", "Calama", "Ollagüe", "San Pedro de Atacama", "Tocopilla", "María Elena"],
  "Atacama": ["Copiapó", "Caldera", "Tierra Amarilla", "Chañaral", "Diego de Almagro", "Vallenar", "Alto del Carmen", "Freirina", "Huasco"],
  "Coquimbo": ["La Serena", "Coquimbo", "Andacollo", "La Higuera", "Paihuano", "Vicuña", "Illapel", "Canela", "Los Vilos", "Salamanca", "Ovalle", "Combarbalá", "Monte Patria", "Punitaqui", "Río Hurtado"],
  "Valparaíso": ["Valparaíso", "Casablanca", "Concón", "Juan Fernández", "Puchuncaví", "Quintero", "Viña del Mar", "Isla de Pascua", "Los Andes", "Calle Larga", "Rinconada", "San Esteban", "La Ligua", "Cabildo", "Papudo", "Petorca", "Zapallar", "Quillota", "Calera", "Hijuelas", "La Cruz", "Nogales", "San Antonio", "Algarrobo", "Cartagena", "El Quisco", "El Tabo", "Santo Domingo", "San Felipe", "Catemu", "Llaillay", "Panquehue", "Putaendo", "Santa María", "Quilpué", "Limache", "Olmué", "Villa Alemana"],
  "Metropolitana de Santiago": ["Cerrillos", "Cerro Navia", "Conchalí", "El Bosque", "Estación Central", "Huechuraba", "Independencia", "La Cisterna", "La Florida", "La Granja", "La Pintana", "La Reina", "Las Condes", "Lo Barnechea", "Lo Espejo", "Lo Prado", "Macul", "Maipú", "Ñuñoa", "Pedro Aguirre Cerda", "Peñalolén", "Providencia", "Pudahuel", "Quilicura", "Quinta Normal", "Recoleta", "Renca", "San Joaquín", "San Miguel", "San Ramón", "Santiago", "Vitacura", "Puente Alto", "Pirque", "San José de Maipo", "Colina", "Lampa", "Tiltil", "San Bernardo", "Buin", "Calera de Tango", "Paine", "Melipilla", "Alhué", "Curacaví", "María Pinto", "San Pedro", "Talagante", "El Monte", "Isla de Maipo", "Padre Hurtado", "Peñaflor"],
  "O'Higgins": ["Rancagua", "Codegua", "Coinco", "Coltauco", "Doñihue", "Graneros", "Las Cabras", "Machalí", "Malloa", "Mostazal", "Olivar", "Peumo", "Pichidegua", "Quinta de Tilcoco", "Rengo", "Requínoa", "San Vicente", "Pichilemu", "La Estrella", "Litueche", "Marchigüe", "Navidad", "Paredones", "San Fernando", "Chépica", "Chimbarongo", "Lolol", "Nancagua", "Palmilla", "Peralillo", "Placilla", "Pumanque", "Santa Cruz"],
  "Maule": ["Talca", "Constitución", "Curepto", "Empedrado", "Maule", "Pelarco", "Pencahue", "Río Claro", "San Clemente", "San Rafael", "Cauquenes", "Chanco", "Pelluhue", "Curicó", "Hualañé", "Licantén", "Molina", "Rauco", "Romeral", "Sagrada Familia", "Teno", "Vichuquén", "Linares", "Colbún", "Longaví", "Parral", "Retiro", "San Javier", "Villa Alegre", "Yerbas Buenas"],
  "Ñuble": ["Cobquecura", "Coelemu", "Ninhue", "Portezuelo", "Quirihue", "Ránquil", "Treguaco", "Bulnes", "Chillán Viejo", "Chillán", "El Carmen", "Pemuco", "Pinto", "Quillón", "San Ignacio", "Yungay", "Coihueco", "Ñiquén", "San Carlos", "San Fabián", "San Nicolás"],
  "Biobío": ["Concepción", "Coronel", "Chiguayante", "Florida", "Hualqui", "Lota", "Penco", "San Pedro de la Paz", "Santa Juana", "Talcahuano", "Tomé", "Hualpén", "Lebu", "Arauco", "Cañete", "Contulmo", "Curanilahue", "Los Álamos", "Tirúa", "Los Ángeles", "Antuco", "Cabrero", "Laja", "Mulchén", "Nacimiento", "Negrete", "Quilaco", "Quilleco", "San Rosendo", "Santa Bárbara", "Tucapel", "Alto Biobío"],
  "La Araucanía": ["Temuco", "Carahue", "Cunco", "Curarrehue", "Freire", "Galvarino", "Gorbea", "Lautaro", "Loncoche", "Melipeuco", "Nueva Imperial", "Padre Las Casas", "Perquenco", "Pitrufquén", "Pucón", "Saavedra", "Teodoro Schmidt", "Toltén", "Vilcún", "Villarrica", "Cholchol", "Angol", "Collipulli", "Curacautín", "Ercilla", "Lonquimay", "Los Sauces", "Lumaco", "Purén", "Renaico", "Traiguén", "Victoria"],
  "Los Ríos": ["Valdivia", "Corral", "Lanco", "Los Lagos", "Máfil", "Mariquina", "Paillaco", "Panguipulli", "La Unión", "Futrono", "Lago Ranco", "Río Bueno"],
  "Los Lagos": ["Puerto Montt", "Calbuco", "Cochamó", "Fresia", "Frutillar", "Los Muermos", "Llanquihue", "Puerto Varas", "Castro", "Ancud", "Chonchi", "Curaco de Vélez", "Dalcahue", "Puqueldón", "Queilén", "Quellón", "Quemchi", "Quinchao", "Osorno", "Puerto Octay", "Purranque", "Puyehue", "Río Negro", "San Juan de la Costa", "San Pablo", "Chaitén", "Futaleufú", "Hualaihué", "Palena"],
  "Aysén": ["Coyhaique", "Lago Verde", "Aysén", "Cisnes", "Guaitecas", "Cochrane", "O'Higgins", "Tortel", "Chile Chico", "Río Ibáñez"],
  "Magallanes": ["Punta Arenas", "Laguna Blanca", "Río Verde", "San Gregorio", "Cabo de Hornos", "Antártica", "Porvenir", "Primavera", "Timaukel", "Natales", "Torres del Paine"]
};

function ClienteSolicitud() {
  const [usuarioLogueado, setUsuarioLogueado] = useState(null);

  const [soporte, setSoporte] = useState('reparacion');
  const [urgencia, setUrgencia] = useState('normal');
  const [productosCatalogo, setProductosCatalogo] = useState([]);
  const [equipoAfectado, setEquipoAfectado] = useState('');
  const [fecha, setFecha] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [region, setRegion] = useState('');
  const [comuna, setComuna] = useState('');
  const [direccion, setDireccion] = useState('');

  const [errorAuth, setErrorAuth] = useState('');
  const [exitoMsg, setExitoMsg] = useState('');

  useEffect(() => {

    const userStorage = localStorage.getItem('usuario') || localStorage.getItem('user') || localStorage.getItem('usuarioAgrosmart');
    if (userStorage) {
      setUsuarioLogueado(JSON.parse(userStorage));
    }

    const fetchProductos = async () => {
      try {
        const res = await fetch('/api/productos');
        const data = await res.json();
        const lista = Array.isArray(data) ? data : [];

        lista.sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''));

        setProductosCatalogo(lista);

        if (lista.length > 0) {
          setEquipoAfectado(lista[0].nombre);
        }
      } catch (error) {
        console.error("Error al cargar equipos:", error);
      }
    };
    fetchProductos();
  }, []);

  const handleRegionChange = (e) => {
    setRegion(e.target.value);
    setComuna('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!usuarioLogueado) {
      setErrorAuth("⚠️ Debes iniciar sesión arriba a la derecha para agendar una visita técnica.");
      setTimeout(() => setErrorAuth(''), 5000);
      return;
    }

    if (!fecha || !region || !comuna || !direccion || !descripcion || !equipoAfectado) {
      setErrorAuth("⚠️ Por favor, completa todos los campos.");
      setTimeout(() => setErrorAuth(''), 4000);
      return;
    }

    const ubicacionFinal = `${direccion}, ${comuna}, ${region}`;

    const payload = {
      usuario_id: usuarioLogueado.id,
      tipo_soporte: soporte,
      urgencia,
      equipos: equipoAfectado,
      fecha_preferida: fecha,
      ubicacion: ubicacionFinal,
      descripcion
    };

    try {
      const response = await fetch('/api/solicitudes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setExitoMsg("✅ ¡Solicitud enviada con éxito! Un técnico de AgroSmart te contactará pronto.");
        setTimeout(() => setExitoMsg(''), 7000);

        setDescripcion('');
        setDireccion('');
        setComuna('');
        setRegion('');
        setFecha('');
      } else {
        setErrorAuth("⚠️ Hubo un error al enviar tu solicitud. Intenta más tarde.");
        setTimeout(() => setErrorAuth(''), 4000);
      }
    } catch (error) {
      console.error("Error:", error);
      setErrorAuth("⚠️ Error de conexión con el servidor.");
      setTimeout(() => setErrorAuth(''), 4000);
    }
  };

  return (
    <div className="solicitud-page-container animacion-portal-entrada">
      <ClientNavbar />

      <div className="solicitud-split-container container-lg">

        <div className="solicitud-left-col">
          <span className="sol-tag-title">— SOPORTE TÉCNICO</span>
          <h1 className="sol-main-title">Visita de especialista en tu <span className="text-green">predio.</span></h1>
          <p className="sol-description">
            Agenda una visita técnica directamente desde aquí. Evaluación, reparación y calibración de equipos agrícolas — sin llamadas, sin esperas.
          </p>

          <div className="sol-features-list">
            <div className="sol-feature-item">
              <div className="feature-icon icon-green"><svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
              <div className="feature-text"><h3>Respuesta en menos de 24 hrs</h3><p>Un técnico te confirma disponibilidad el mismo día hábil.</p></div>
            </div>
            <div className="sol-feature-item">
              <div className="feature-icon icon-cyan"><svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg></div>
              <div className="feature-text"><h3>Cobertura en 8 regiones</h3><p>Red de técnicos certificados desde Atacama hasta La Araucanía.</p></div>
            </div>
            <div className="sol-feature-item">
              <div className="feature-icon icon-green"><svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg></div>
              <div className="feature-text"><h3>Diagnóstico incluido</h3><p>Presupuesto de reparación sin costo antes de iniciar el trabajo.</p></div>
            </div>
          </div>
        </div>

        <div className="solicitud-right-col">
          <div className="glass-form-card">

            <div className="form-header">
              <h2>Detalla tu requerimiento</h2>
              <p>
                {usuarioLogueado
                  ? `Hola, ${(usuarioLogueado.nombre_completo || usuarioLogueado.nombre || usuarioLogueado.email || 'Cliente').split(' ')[0]}. Completa el formulario y te contactamos.`
                  : 'Inicia sesión para completar el formulario y agendar la visita.'}
              </p>
            </div>

            <form className="sol-complex-form" onSubmit={handleSubmit}>

              <div className="form-section">
                <label className="section-label">¿Qué tipo de soporte necesitas? <span className="req">*</span></label>
                <div className="grid-cards-2x2">
                  <div className={`radio-card ${soporte === 'reparacion' ? 'active-green' : ''}`} onClick={() => setSoporte('reparacion')}><span className="card-icon">🔧</span><div className="card-text"><strong>Reparación</strong><span>Equipo dañado</span></div></div>
                  <div className={`radio-card ${soporte === 'calibracion' ? 'active-cyan' : ''}`} onClick={() => setSoporte('calibracion')}><span className="card-icon">⚙️</span><div className="card-text"><strong>Calibración</strong><span>Ajuste técnico</span></div></div>
                  <div className={`radio-card ${soporte === 'diagnostico' ? 'active-cyan' : ''}`} onClick={() => setSoporte('diagnostico')}><span className="card-icon">🔍</span><div className="card-text"><strong>Diagnóstico</strong><span>Evaluar estado</span></div></div>
                  <div className={`radio-card ${soporte === 'capacitacion' ? 'active-cyan' : ''}`} onClick={() => setSoporte('capacitacion')}><span className="card-icon">📖</span><div className="card-text"><strong>Capacitación</strong><span>Uso correcto</span></div></div>
                </div>
              </div>

              <div className="form-section">
                <label className="section-label">Nivel de urgencia <span className="req">*</span></label>
                <div className="grid-cards-3">
                  <div className={`radio-card-sm ${urgencia === 'normal' ? 'active-green' : ''}`} onClick={() => setUrgencia('normal')}><strong>Normal</strong><span>1-3 días</span></div>
                  <div className={`radio-card-sm ${urgencia === 'urgente' ? 'active-warning' : ''}`} onClick={() => setUrgencia('urgente')}><strong>Urgente</strong><span>Hoy o mañana</span></div>
                  <div className={`radio-card-sm ${urgencia === 'critico' ? 'active-danger' : ''}`} onClick={() => setUrgencia('critico')}><strong>Crítico</strong><span>Cosecha en riesgo</span></div>
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-section">
                  <label className="section-label">Equipo AgroSmart afectado <span className="req">*</span></label>
                  <select className="custom-input" value={equipoAfectado} onChange={(e) => setEquipoAfectado(e.target.value)} required>
                    {productosCatalogo.length === 0 ? (
                      <option value="">Cargando equipos...</option>
                    ) : (
                      productosCatalogo.map(prod => (
                        <option key={prod.id} value={prod.nombre}>
                          {prod.nombre}{prod.categoria ? ` — ${prod.categoria}` : ''}
                        </option>
                      ))
                    )}
                    <option value="Otro equipo (No AgroSmart)">Otro equipo (No AgroSmart)</option>
                  </select>
                </div>

                <div className="form-section">
                  <label className="section-label">Fecha sugerida <span className="req">*</span></label>
                  <input type="date" className="custom-input date-input" required value={fecha} onChange={(e) => setFecha(e.target.value)} />
                </div>
              </div>

              <div className="form-section">
                <label className="section-label">Ubicación del predio <span className="req">*</span></label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>

                  <select className="custom-input" required value={region} onChange={handleRegionChange}>
                    <option value="">Selecciona la Región</option>
                    {Object.keys(regionesChilenas).map(reg => (
                      <option key={reg} value={reg}>{reg}</option>
                    ))}
                  </select>

                  <select className="custom-input" required value={comuna} onChange={(e) => setComuna(e.target.value)} disabled={!region}>
                    <option value="">Selecciona la Comuna</option>
                    {region && regionesChilenas[region].map(com => (
                      <option key={com} value={com}>{com}</option>
                    ))}
                  </select>

                  <input type="text" className="custom-input" required placeholder="Dirección exacta. Ej: Fundo Las Acacias, Ruta 68..." value={direccion} onChange={(e) => setDireccion(e.target.value)} />
                </div>
              </div>

              <div className="form-section">
                <label className="section-label">Describe el problema <span className="req">*</span></label>
                <textarea className="custom-input textarea-res" required rows="3" placeholder="Detalla la falla del equipo..." value={descripcion} onChange={(e) => setDescripcion(e.target.value)}></textarea>
              </div>

              <div className="submit-container" style={{ marginTop: '20px' }}>

                {errorAuth && (
                  <div style={{ color: '#ff6b6b', backgroundColor: 'rgba(255, 107, 107, 0.1)', padding: '12px', borderRadius: '8px', marginBottom: '15px', textAlign: 'center', border: '1px solid rgba(255, 107, 107, 0.3)', fontWeight: '500' }}>
                    {errorAuth}
                  </div>
                )}

                {exitoMsg && (
                  <div style={{ color: '#00e676', backgroundColor: 'rgba(0, 230, 118, 0.1)', padding: '12px', borderRadius: '8px', marginBottom: '15px', textAlign: 'center', border: '1px solid rgba(0, 230, 118, 0.3)', fontWeight: '500' }}>
                    {exitoMsg}
                  </div>
                )}

                <button type="submit" className="view-posts-btn btn-ag-primary full-width">
                  <span className="btn-icon"><svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg></span>
                  <span className="btn-text">Enviar solicitud de visita</span>
                </button>
              </div>

            </form>
          </div>
        </div>

      </div>
    </div>
  );
}

export default ClienteSolicitud;
