import React from 'react';
import { Star } from 'lucide-react';
import Reveal from './Reveal';
import SectionHeading from './SectionHeading';

const testimonials = [
  {
    name: 'Carlos Muñoz',
    role: 'Agricultor, Región de O\'Higgins',
    avatar: 'CM',
    text: 'Con los sensores IoT de AgroSmart reduje el consumo de agua en un 40%. Ahora monitoreo mi predio desde el celular y reacciono en tiempo real a cualquier cambio en el suelo.',
  },
  {
    name: 'María González',
    role: 'Productora Frutícola, Maule',
    avatar: 'MG',
    text: 'El dron de fumigación cambió completamente nuestra operación. En 2 horas cubro lo que antes me tomaba 2 días con equipos tradicionales. La atención técnica es excelente.',
  },
  {
    name: 'Rodrigo Sepúlveda',
    role: 'Viticultor, Valle de Colchagua',
    avatar: 'RS',
    text: 'Llevan más de 30 años en el mercado y se nota. Siempre tienen stock, el despacho llega en 48 horas como dicen, y el soporte técnico resuelve cualquier duda rápidamente.',
  },
];

export default function Testimonials() {
  return (
    <section className="relative py-24 border-t border-white/10" style={{ background: 'rgba(0,18,46,0.5)' }}>
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <SectionHeading kicker="Testimonios" title="Lo que dicen nuestros agricultores" subtitle="Más de 1.200 predios en Chile confían en AgroSmart para su tecnología agrícola." />
        <div className="grid md:grid-cols-3 gap-6 mt-14">
          {testimonials.map((t, i) => (
            <Reveal key={t.name} delay={i * 100}>
              <div className="h-full rounded-2xl glass pulse-border p-7 flex flex-col">
                <div className="flex gap-1 mb-5">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-[#28C76F] text-[#28C76F]" />
                  ))}
                </div>
                <p className="text-slate-300 leading-relaxed flex-1">"{t.text}"</p>
                <div className="flex items-center gap-3 mt-6 pt-5 border-t border-white/10">
                  <span className="grid place-items-center w-11 h-11 rounded-full bg-gradient-to-br from-[#28C76F] to-[#00ddeb] font-grotesk font-bold text-[#060806] text-sm shrink-0">
                    {t.avatar}
                  </span>
                  <div>
                    <div className="font-grotesk font-semibold text-white text-sm">{t.name}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{t.role}</div>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
