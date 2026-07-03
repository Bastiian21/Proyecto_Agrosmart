import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf } from 'lucide-react';

const quick = [
  { label: 'Catálogo', to: '/cliente/catalogo' },
  { label: 'Capacitación', to: '/cliente/capacitacion' },
  { label: 'Soporte Técnico', to: '/cliente/solicitud' },
  { label: 'Mi cuenta', to: '/cliente/login' },
];

const socials = [
  {
    label: 'Facebook',
    href: 'https://facebook.com',
    svg: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
    ),
  },
  {
    label: 'Instagram',
    href: 'https://instagram.com',
    svg: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
    ),
  },
  {
    label: 'LinkedIn',
    href: 'https://linkedin.com',
    svg: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg>
    ),
  },
  {
    label: 'YouTube',
    href: 'https://youtube.com',
    svg: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="#060806"/></svg>
    ),
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/10" style={{ background: 'rgba(0,10,25,0.85)' }}>
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-14 grid md:grid-cols-2 gap-10">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="grid place-items-center w-9 h-9 rounded-xl bg-gradient-to-br from-[#28C76F] to-[#00ddeb]">
              <Leaf className="w-5 h-5 text-[#060806]" strokeWidth={2.5} />
            </span>
            <span className="font-grotesk text-xl font-bold text-white">
              Agro<span className="text-gradient">Smart</span>
            </span>
          </div>
          <p className="font-grotesk text-sm tracking-wide text-slate-400 mt-4 max-w-sm uppercase">
            Conecta tu campo. Optimiza tu futuro.
          </p>
          <p className="text-sm text-slate-500 mt-3 max-w-sm">
            Distribuidora líder en tecnología agrícola desde Rancagua, VI Región. Despacho directo a tu predio en 48 horas.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8">
          <div>
            <h4 className="font-grotesk font-semibold text-white mb-4">Enlaces rápidos</h4>
            <ul className="space-y-3">
              {quick.map((q) => (
                <li key={q.label}>
                  <Link to={q.to} className="text-sm text-slate-400 hover:text-[#28C76F] transition-colors">
                    {q.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-grotesk font-semibold text-white mb-4">Síguenos</h4>
            <div className="flex gap-3 flex-wrap">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={s.label}
                  className="grid place-items-center w-10 h-10 rounded-lg border border-white/10 text-slate-400 hover:text-[#00ddeb] hover:border-cyan-400/40 transition-all"
                >
                  {s.svg}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-6 text-center text-sm text-slate-500">
          © 2026 AgroSmart S.A. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}
