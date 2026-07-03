import React, { useEffect, useState } from 'react';
import { ArrowRight, ShieldCheck, Activity, Package, Users, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';
import fondoHome from '../../assets/Fondo-home.png';

function useCountUp(target, run, duration = 1800) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!run) return;
    let start = null;
    let raf;
    const step = (t) => {
      if (!start) start = t;
      const p = Math.min((t - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.floor(eased * target));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, run, duration]);
  return val;
}

function Stat({ icon: Icon, value, suffix = '', label, run }) {
  const n = useCountUp(value, run);
  return (
    <div className="flex items-center gap-3 py-3">
      <span className="grid place-items-center w-10 h-10 rounded-lg border border-white/10 text-[#28C76F]"
        style={{ background: 'rgba(255,255,255,0.04)' }}>
        <Icon className="w-5 h-5" />
      </span>
      <div>
        <div className="font-grotesk text-2xl font-bold text-white leading-none">
          {n.toLocaleString('es-CL')}{suffix}
        </div>
        <div className="text-xs mt-1" style={{ color: '#94a3b8' }}>{label}</div>
      </div>
    </div>
  );
}

export default function Hero() {
  const [run, setRun] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setRun(true), 400);
    return () => clearTimeout(t);
  }, []);

  return (
    <section
      id="inicio"
      style={{
        minHeight: '85vh',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        backgroundImage: `url(${fondoHome})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        WebkitMaskImage: 'linear-gradient(to bottom, black 90%, transparent 100%)',
        maskImage: 'linear-gradient(to bottom, black 90%, transparent 100%)',
      }}
    >
      {/* Overlay izquierdo con blur como el original */}
      <div style={{
        position: 'absolute', top: 0, left: 0, bottom: 0, width: '65%',
        background: 'linear-gradient(to right, rgba(0,15,35,0.98) 0%, rgba(0,15,35,0.82) 60%, transparent 100%)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        WebkitMaskImage: 'linear-gradient(to right, black 60%, transparent 100%)',
        maskImage: 'linear-gradient(to right, black 60%, transparent 100%)',
        zIndex: 1,
      }} />
      {/* Overlay superior para la navbar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '120px',
        background: 'linear-gradient(to bottom, rgba(0,15,35,0.85) 0%, transparent 100%)',
        zIndex: 1,
      }} />

      <div className="relative max-w-7xl mx-auto px-5 w-full grid lg:grid-cols-2 gap-12 items-center"
        style={{ zIndex: 2, paddingTop: '130px', paddingBottom: '60px' }}>

        {/* Columna izquierda */}
        <div>
          <span className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium"
            style={{ color: '#28C76F', background: 'rgba(40,199,111,0.1)', border: '1px solid rgba(40,199,111,0.25)' }}>
            🌿 Tecnología Agrícola de Precisión
          </span>

          <h1 className="font-grotesk font-bold text-white mt-6"
            style={{ fontSize: 'clamp(2.4rem, 6vw, 4.5rem)', lineHeight: 1.05, textTransform: 'uppercase' }}>
            CONECTA TU CAMPO.
            <br />
            <span className="text-gradient">OPTIMIZA TU FUTURO.</span>
          </h1>

          <p className="mt-6 text-lg leading-relaxed max-w-xl" style={{ color: '#cbd5e1' }}>
            Distribuidora líder en Chile. Sensores, drones, riego inteligente y maquinaria con despacho
            directo a tu predio en <span className="text-white font-semibold">48 horas</span>.
          </p>

          <div className="mt-9 flex flex-col sm:flex-row gap-4">
            <Link to="/cliente/catalogo" className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl font-bold text-sm uppercase tracking-wider transition-all duration-300"
              style={{ border: '2px solid #28C76F', background: 'rgba(40,199,111,0.15)', color: 'white', boxShadow: '0 4px 20px rgba(40,199,111,0.25)' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#28C76F'; e.currentTarget.style.color = '#00122e'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(40,199,111,0.15)'; e.currentTarget.style.color = 'white'; e.currentTarget.style.transform = 'translateY(0)'; }}>
              Ver Catálogo <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/cliente/solicitud" className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl font-bold text-sm uppercase tracking-wider transition-all duration-300"
              style={{ border: '2px solid #00ddeb', background: 'rgba(0,221,235,0.15)', color: 'white', boxShadow: '0 4px 20px rgba(0,221,235,0.25)' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#00ddeb'; e.currentTarget.style.color = '#00122e'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,221,235,0.15)'; e.currentTarget.style.color = 'white'; e.currentTarget.style.transform = 'translateY(0)'; }}>
              Soporte Técnico <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="mt-6 flex items-center gap-2 text-sm" style={{ color: '#94a3b8' }}>
            <ShieldCheck className="w-4 h-4" style={{ color: '#00ddeb' }} />
            Pago seguro con Transbank WebpayPlus
          </div>
        </div>

        {/* Columna derecha — Panel flotante */}
        <div className="relative lg:justify-self-end w-full max-w-md floaty hidden lg:block">
          <div className="glass pulse-border rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="grid place-items-center w-9 h-9 rounded-lg"
                  style={{ background: 'linear-gradient(135deg, #28C76F, #00ddeb)' }}>
                  <Activity className="w-5 h-5" style={{ color: '#00122e' }} />
                </span>
                <span className="font-grotesk font-semibold text-white">Panel AgroSmart</span>
              </div>
              <span className="flex items-center gap-1.5 text-xs" style={{ color: '#28C76F' }}>
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#28C76F' }} /> En vivo
              </span>
            </div>
            <div className="divide-y divide-white/5">
              <Stat icon={Package} value={214} suffix="+" label="Productos disponibles" run={run} />
              <Stat icon={Users} value={1243} label="Clientes activos" run={run} />
              <Stat icon={Truck} value={8760} label="Despachos completados" run={run} />
            </div>
            <div className="mt-4 rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div className="flex items-center justify-between text-xs mb-2" style={{ color: '#94a3b8' }}>
                <span>Cobertura nacional</span>
                <span style={{ color: '#00ddeb' }}>6 sucursales</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
                <div className="h-full w-[88%] rounded-full"
                  style={{ background: 'linear-gradient(to right, #28C76F, #00ddeb)' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
