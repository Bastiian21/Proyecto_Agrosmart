import React from 'react';
import { CalendarClock, Building2, Users, Truck, BadgeCheck } from 'lucide-react';
import Reveal from './Reveal';

const metrics = [
  { icon: CalendarClock, value: '30+', label: 'Años en el mercado' },
  { icon: Building2, value: '6', label: 'Sucursales en Chile' },
  { icon: Users, value: '+1.200', label: 'Agricultores activos' },
  { icon: Truck, value: '48h', label: 'Despacho a predio' },
  { icon: BadgeCheck, value: '100%', label: 'Garantía de marca' },
];

export default function TrustBar() {
  return (
    <section className="relative border-y border-white/10" style={{ background: 'rgba(0,18,46,0.5)' }}>
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-10 grid grid-cols-2 md:grid-cols-5 gap-6">
        {metrics.map((m, i) => (
          <Reveal key={m.label} delay={i * 80} className="flex flex-col items-center text-center gap-2">
            <m.icon className="w-7 h-7 text-[#00ddeb]" />
            <div className="font-grotesk text-3xl font-bold leading-none text-gradient">{m.value}</div>
            <div className="text-xs sm:text-sm text-slate-400">{m.label}</div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
