import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ShoppingCart, Package } from 'lucide-react';
import SectionHeading from './SectionHeading';

const clp = (n) => '$' + Number(n).toLocaleString('es-CL');

function NavArrow({ onClick, direction, disabled }) {
  const Icon = direction === 'left' ? ChevronLeft : ChevronRight;
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={direction === 'left' ? 'Anterior' : 'Siguiente'}
      className="group relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
      style={{
        background: 'rgba(0,18,46,0.7)',
        border: '1.5px solid rgba(40,199,111,0.35)',
        backdropFilter: 'blur(12px)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(40,199,111,0.18)';
        e.currentTarget.style.border = '1.5px solid rgba(40,199,111,0.75)';
        e.currentTarget.style.boxShadow = '0 0 22px rgba(40,199,111,0.28), inset 0 0 12px rgba(40,199,111,0.06)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'rgba(0,18,46,0.7)';
        e.currentTarget.style.border = '1.5px solid rgba(40,199,111,0.35)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <Icon className="w-5 h-5 text-[#28C76F] group-disabled:text-white/30" strokeWidth={2.5} />
    </button>
  );
}

function ProductSkeleton() {
  return (
    <div className="h-full rounded-2xl glass overflow-hidden flex flex-col animate-pulse">
      <div className="aspect-[4/3] bg-white/5" />
      <div className="p-5 flex flex-col gap-3 flex-1">
        <div className="h-5 bg-white/5 rounded w-3/4" />
        <div className="h-7 bg-white/5 rounded w-1/2 mt-auto" />
        <div className="h-11 bg-white/5 rounded-full mt-2" />
      </div>
    </div>
  );
}

export default function FeaturedCarousel() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [perView, setPerView] = useState(3);
  const [paused, setPaused] = useState(false);
  const timer = useRef(null);

  useEffect(() => {
    fetch('/api/productos')
      .then((r) => r.json())
      .then((data) => {
        const visibles = data.filter((p) => p.disponible && p.stock > 0);
        setProducts(visibles.slice(0, 8));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const update = () => {
      if (window.innerWidth < 640) setPerView(1);
      else if (window.innerWidth < 1024) setPerView(2);
      else setPerView(3);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const maxIndex = Math.max(0, products.length - perView);
  const next = useCallback(() => setIndex((i) => (i >= maxIndex ? 0 : i + 1)), [maxIndex]);
  const prev = () => setIndex((i) => (i <= 0 ? maxIndex : i - 1));

  useEffect(() => {
    if (index > maxIndex) setIndex(0);
  }, [maxIndex, index]);

  useEffect(() => {
    if (paused || products.length === 0) return;
    timer.current = setInterval(next, 3500);
    return () => clearInterval(timer.current);
  }, [paused, next, products.length]);

  const showNav = !loading && products.length > perView;

  return (
    <section className="relative py-24" style={{ background: 'rgba(0,29,61,0.4)' }}>
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <SectionHeading
          kicker="Catálogo"
          title="Productos Destacados"
          subtitle="Equipos disponibles con despacho en 48 horas a tu predio."
        />

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            {[0, 1, 2].map((i) => <ProductSkeleton key={i} />)}
          </div>
        ) : products.length === 0 ? (
          <div className="mt-12 text-center py-16 glass rounded-2xl">
            <Package className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <p className="text-slate-400">No hay productos disponibles en este momento.</p>
            <Link to="/cliente/catalogo" className="inline-block mt-4 text-sm text-[#28C76F] hover:underline">
              Ver catálogo completo
            </Link>
          </div>
        ) : (
          <>
            <div
              className="overflow-hidden mt-12"
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
            >
              <div
                className="flex transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                style={{ transform: `translateX(-${index * (100 / perView)}%)` }}
              >
                {products.map((p) => (
                  <div key={p.id} className="shrink-0 px-3" style={{ width: `${100 / perView}%` }}>
                    <div className="group h-full rounded-2xl glass pulse-border overflow-hidden flex flex-col">
                      <div className="relative aspect-[4/3] overflow-hidden bg-white/5">
                        {p.imagen_url ? (
                          <img
                            src={p.imagen_url}
                            alt={p.imagen_alt || p.nombre}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-16 h-16 text-white/10" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#001229] to-transparent opacity-60" />
                        <span className="absolute top-3 left-3 text-xs font-bold px-3 py-1 rounded-full bg-[#28C76F] text-[#001229]">
                          DESTACADO
                        </span>
                      </div>
                      <div className="p-5 flex flex-col flex-1">
                        <span className="text-xs text-slate-500 uppercase tracking-wide">{p.categoria}</span>
                        <h3 className="font-grotesk font-bold text-white text-lg leading-snug mt-1">{p.nombre}</h3>
                        <div className="mt-3">
                          <span className="font-grotesk text-2xl font-bold text-[#28C76F]">{clp(p.precio_clp)}</span>
                        </div>
                        <Link
                          to="/cliente/catalogo"
                          className="mt-5 inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-[#001229] bg-gradient-to-r from-[#28C76F] to-[#00ddeb] hover:opacity-90 transition-opacity"
                        >
                          <ShoppingCart className="w-4 h-4" /> Ver en catálogo
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-center gap-4 mt-10">
              <NavArrow direction="left" onClick={prev} disabled={!showNav} />

              <div className="flex gap-2">
                {showNav && Array.from({ length: maxIndex + 1 }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setIndex(i)}
                    aria-label={`Ir al grupo ${i + 1}`}
                    className="h-2 rounded-full transition-all duration-300"
                    style={{
                      width: i === index ? '2rem' : '0.5rem',
                      background: i === index
                        ? 'linear-gradient(90deg, #28C76F, #00ddeb)'
                        : 'rgba(255,255,255,0.2)',
                    }}
                  />
                ))}
              </div>

              <NavArrow direction="right" onClick={next} disabled={!showNav} />
            </div>
          </>
        )}
      </div>
    </section>
  );
}
