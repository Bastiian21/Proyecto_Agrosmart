import React from 'react';
import { Link } from 'react-router-dom';
import { Wifi, Wind, Droplets, Tractor, ArrowRight } from 'lucide-react';
import Reveal from './Reveal';
import SectionHeading from './SectionHeading';

const categories = [
  {
    icon: Wifi,
    title: 'Sensores IoT',
    desc: 'Monitorea humedad, temperatura y nutrientes del suelo en tiempo real desde tu celular.',
    color: 'text-[#28C76F]',
    bg: 'bg-[#28C76F]/10',
    border: 'border-[#28C76F]/20',
  },
  {
    icon: Wind,
    title: 'Drones Agrícolas',
    desc: 'Fumigación de precisión, mapeo de cultivos y análisis aéreo con drones profesionales.',
    color: 'text-[#00ddeb]',
    bg: 'bg-[#00ddeb]/10',
    border: 'border-[#00ddeb]/20',
  },
  {
    icon: Droplets,
    title: 'Riego de Precisión',
    desc: 'Sistemas de goteo inteligente y aspersión automatizada que optimizan cada gota de agua.',
    color: 'text-[#28C76F]',
    bg: 'bg-[#28C76F]/10',
    border: 'border-[#28C76F]/20',
  },
  {
    icon: Tractor,
    title: 'Maquinaria Pesada',
    desc: 'Tractores compactos, cosechadoras y equipos de labranza para todo tipo de predio.',
    color: 'text-[#00ddeb]',
    bg: 'bg-[#00ddeb]/10',
    border: 'border-[#00ddeb]/20',
  },
];

export default function Categories() {
  return (
    <section className="relative py-24" style={{ background: 'rgba(0,18,46,0.3)' }}>
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <SectionHeading
          kicker="Productos"
          title="Nuestras categorías"
          subtitle="Todo lo que tu campo necesita para producir más con menos, en un solo lugar."
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-14">
          {categories.map((c, i) => (
            <Reveal key={c.title} delay={i * 100}>
              <Link
                to="/cliente/catalogo"
                className={`group block rounded-2xl glass pulse-border p-7 border ${c.border} hover:-translate-y-1 transition-transform duration-300`}
              >
                <span className={`grid place-items-center w-14 h-14 rounded-xl ${c.bg} ${c.color} mb-5`}>
                  <c.icon className="w-7 h-7" />
                </span>
                <h3 className="font-grotesk text-xl font-bold text-white">{c.title}</h3>
                <p className="text-sm text-slate-400 mt-2 leading-relaxed">{c.desc}</p>
                <span className={`inline-flex items-center gap-1.5 text-sm font-semibold mt-5 ${c.color} group-hover:gap-3 transition-all`}>
                  Ver productos <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
