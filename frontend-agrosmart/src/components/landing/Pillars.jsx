import React from 'react';
import Reveal from './Reveal';
import SectionHeading from './SectionHeading';
import fila1 from '../../assets/Fila 1.png';
import fila2 from '../../assets/Fila 2.png';
import fila3 from '../../assets/Fila 3.png';

const pillars = [
  {
    emoji: '🌱',
    title: 'Nuestras Raíces',
    text: 'Nacidos en Rancagua en los años 90, llevamos más de 30 años siendo el aliado de confianza del campo chileno. Hoy estamos presentes en 6 sucursales a lo largo del país.',
    img: fila1,
  },
  {
    emoji: '⚙️',
    title: 'Innovación Constante',
    text: 'Integramos domótica, sensores de precisión y maquinaria inteligente para que tu predio enfrente el cambio climático con datos, no con suposiciones.',
    img: fila2,
  },
  {
    emoji: '⚡',
    title: 'Tiempo es Dinero',
    text: 'Compra online, revisa stock en tiempo real y recibe directamente en tu predio. Menos trámites, más cosecha. Despacho garantizado en 48 horas.',
    img: fila3,
  },
];

export default function Pillars() {
  return (
    <section className="relative py-24 border-y border-white/10" style={{ background: 'rgba(0,18,46,0.4)' }}>
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <SectionHeading kicker="Nosotros" title="Por qué AgroSmart" subtitle="Tres pilares que sostienen tres décadas de confianza con el agricultor chileno." />
        <div className="mt-16 space-y-10">
          {pillars.map((p, i) => (
            <Reveal key={p.title} scan>
              <div className={`grid lg:grid-cols-2 gap-8 items-center rounded-3xl glass pulse-border overflow-hidden ${i % 2 === 1 ? 'lg:[direction:rtl]' : ''}`}>
                <div className="relative aspect-[16/10] lg:aspect-auto lg:h-full min-h-[280px] [direction:ltr]">
                  <img src={p.img} alt={p.title} className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#060806]/70 to-transparent" />
                </div>
                <div className="p-8 lg:p-12 [direction:ltr]">
                  <span className="text-4xl">{p.emoji}</span>
                  <h3 className="font-grotesk text-2xl sm:text-3xl font-bold text-white mt-4">{p.title}</h3>
                  <p className="text-slate-400 mt-4 text-lg leading-relaxed">{p.text}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
