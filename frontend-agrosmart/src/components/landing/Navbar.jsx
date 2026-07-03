import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Menu, X, User } from 'lucide-react';

const links = [
  { label: 'Inicio', href: '#inicio' },
  { label: 'Catálogo', href: '/cliente/catalogo' },
  { label: 'Capacitación', href: '/cliente/capacitacion' },
  { label: 'Soporte', href: '/cliente/solicitud' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const renderLink = (l, cls) =>
    l.href.startsWith('#') ? (
      <a key={l.label} href={l.href} className={cls} onClick={() => setOpen(false)}>
        {l.label}
      </a>
    ) : (
      <Link key={l.label} to={l.href} className={cls} onClick={() => setOpen(false)}>
        {l.label}
      </Link>
    );

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
        scrolled ? 'bg-[#060806]/80 backdrop-blur-xl border-b border-white/10' : 'bg-transparent'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-5 sm:px-8 h-[72px] flex items-center justify-between">
        <a href="#inicio" className="flex items-center gap-2.5 group">
          <span className="relative grid place-items-center w-9 h-9 rounded-xl bg-gradient-to-br from-[#22c55e] to-[#06b6d4]">
            <Leaf className="w-5 h-5 text-[#060806]" strokeWidth={2.5} />
          </span>
          <span className="font-grotesk text-xl font-bold tracking-tight text-white">
            Agro<span className="text-gradient">Smart</span>
          </span>
        </a>

        <div className="hidden md:flex items-center gap-8">
          {links.map((l) =>
            renderLink(l, 'text-sm font-medium text-slate-300 hover:text-white transition-colors')
          )}
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/cliente/login"
            className="hidden sm:inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white border border-white/15 bg-white/5 hover:border-cyan-400/50 hover:bg-white/10 transition-all"
          >
            <User className="w-4 h-4" /> Mi cuenta
          </Link>
          <button
            className="md:hidden text-white p-2"
            onClick={() => setOpen((v) => !v)}
            aria-label="Abrir menú"
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="md:hidden bg-[#060806]/95 backdrop-blur-xl border-t border-white/10 px-5 py-4 flex flex-col gap-1">
          {links.map((l) =>
            renderLink(l, 'py-3 text-base font-medium text-slate-200 hover:text-white border-b border-white/5')
          )}
          <Link
            to="/cliente/login"
            className="mt-3 inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-[#060806] bg-gradient-to-r from-[#22c55e] to-[#06b6d4]"
            onClick={() => setOpen(false)}
          >
            <User className="w-4 h-4" /> Mi cuenta
          </Link>
        </div>
      )}
    </header>
  );
}
