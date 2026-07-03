import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Clock, ArrowRight, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import Reveal from './Reveal';
import SectionHeading from './SectionHeading';
import fondoCap from '../../assets/Fondo-capacitacion.png';
import { obtenerCursos } from '../../services/cursoService';

const NIVEL_BARS = {
  principiante: 1,
  básico: 1,
  basico: 1,
  intermedio: 2,
  avanzado: 3,
};

function getBars(dificultad) {
  if (!dificultad) return 1;
  return NIVEL_BARS[dificultad.toLowerCase()] ?? 1;
}

function NavArrow({ onClick, direction, disabled }) {
  const Icon = direction === 'left' ? ChevronLeft : ChevronRight;
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={direction === 'left' ? 'Anterior' : 'Siguiente'}
      className="group w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
      style={{
        background: 'rgba(0,18,46,0.7)',
        border: '1.5px solid rgba(0,221,235,0.35)',
        backdropFilter: 'blur(12px)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(0,221,235,0.12)';
        e.currentTarget.style.border = '1.5px solid rgba(0,221,235,0.7)';
        e.currentTarget.style.boxShadow = '0 0 22px rgba(0,221,235,0.22), inset 0 0 12px rgba(0,221,235,0.05)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'rgba(0,18,46,0.7)';
        e.currentTarget.style.border = '1.5px solid rgba(0,221,235,0.35)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <Icon className="w-5 h-5 text-[#00ddeb] group-disabled:text-white/30" strokeWidth={2.5} />
    </button>
  );
}

function CourseSkeleton() {
  return (
    <div className="shrink-0 px-3" style={{ width: '100%' }}>
      <div className="rounded-2xl glass overflow-hidden animate-pulse">
        <div className="aspect-[16/10] bg-white/5" />
        <div className="p-6 flex flex-col gap-3">
          <div className="h-5 bg-white/5 rounded w-3/4" />
          <div className="h-4 bg-white/5 rounded w-1/3 mt-2" />
        </div>
      </div>
    </div>
  );
}

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [perView, setPerView] = useState(3);
  const [paused, setPaused] = useState(false);
  const timer = useRef(null);

  useEffect(() => {
    obtenerCursos()
      .then((data) => {
        const visibles = data.filter((c) => c.disponible !== false);
        setCourses(visibles);
      })
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

  const maxIndex = Math.max(0, courses.length - perView);
  const next = useCallback(() => setIndex((i) => (i >= maxIndex ? 0 : i + 1)), [maxIndex]);
  const prev = () => setIndex((i) => (i <= 0 ? maxIndex : i - 1));

  useEffect(() => {
    if (index > maxIndex) setIndex(0);
  }, [maxIndex, index]);

  useEffect(() => {
    if (paused || courses.length === 0) return;
    timer.current = setInterval(next, 4000);
    return () => clearInterval(timer.current);
  }, [paused, next, courses.length]);

  const showNav = !loading && courses.length > perView;

  return (
    <section className="relative py-24" style={{ background: 'rgba(0,29,61,0.35)' }}>
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <SectionHeading
          kicker="Capacitación"
          title="Aprende a usar tu tecnología"
          subtitle="Cursos prácticos dictados por agrónomos para que aproveches cada equipo al máximo."
        />

        {loading ? (
          <div className="flex mt-14 overflow-hidden">
            {[0, 1, 2].map((i) => (
              <CourseSkeleton key={i} />
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="mt-14 text-center py-16 glass rounded-2xl">
            <BookOpen className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <p className="text-slate-400">No hay cursos disponibles en este momento.</p>
            <Link to="/cliente/capacitacion" className="inline-block mt-4 text-sm text-[#28C76F] hover:underline">
              Ver toda la capacitación
            </Link>
          </div>
        ) : (
          <>
            <div
              className="overflow-hidden mt-14"
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
            >
              <div
                className="flex transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                style={{ transform: `translateX(-${index * (100 / perView)}%)` }}
              >
                {courses.map((c, i) => {
                  const bars = getBars(c.dificultad);
                  const imgSrc = c.imagen_url || fondoCap;
                  const nivel = c.dificultad
                    ? c.dificultad.charAt(0).toUpperCase() + c.dificultad.slice(1).toLowerCase()
                    : 'General';

                  return (
                    <div key={c.id} className="shrink-0 px-3" style={{ width: `${100 / perView}%` }}>
                      <Reveal delay={i * 80} scan>
                        <Link to="/cliente/capacitacion" className="group block h-full rounded-2xl glass pulse-border overflow-hidden">
                          <div className="relative aspect-[16/10] overflow-hidden bg-white/5">
                            <img
                              src={imgSrc}
                              alt={c.nombre}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                              onError={(e) => { e.currentTarget.src = fondoCap; }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#001229] via-[#001229]/20 to-transparent" />
                            <span className="absolute top-3 left-3 text-xs font-semibold px-3 py-1 rounded-full bg-[#001229]/80 border border-white/15 text-white">
                              {nivel}
                            </span>
                          </div>
                          <div className="p-6">
                            <h3 className="font-grotesk text-lg font-bold text-white leading-snug">{c.nombre}</h3>
                            {c.instructor && (
                              <p className="text-xs text-slate-500 mt-1">por {c.instructor}</p>
                            )}
                            <div className="flex items-center justify-between mt-4">
                              <span className="inline-flex items-center gap-1.5 text-sm text-slate-400">
                                <Clock className="w-4 h-4 text-[#00ddeb]" />
                                {c.horas ? `${c.horas} horas` : 'A tu ritmo'}
                              </span>
                              <span className="flex items-end gap-1 h-4">
                                {[1, 2, 3].map((b) => (
                                  <span
                                    key={b}
                                    className={`w-1.5 rounded-sm ${b <= bars ? 'bg-gradient-to-t from-[#28C76F] to-[#00ddeb]' : 'bg-white/15'}`}
                                    style={{ height: `${b * 5 + 2}px` }}
                                  />
                                ))}
                              </span>
                            </div>
                            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-white mt-5 group-hover:gap-3 transition-all">
                              Ver curso <ArrowRight className="w-4 h-4 text-[#28C76F]" />
                            </span>
                          </div>
                        </Link>
                      </Reveal>
                    </div>
                  );
                })}
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

        <div className="text-center mt-10">
          <Link
            to="/cliente/capacitacion"
            className="inline-flex items-center gap-2 rounded-full px-8 py-3 text-sm font-semibold border border-white/20 text-white hover:bg-white/5 hover:border-[#28C76F]/50 transition-all"
          >
            Ver todos los cursos <ArrowRight className="w-4 h-4 text-[#28C76F]" />
          </Link>
        </div>
      </div>
    </section>
  );
}
