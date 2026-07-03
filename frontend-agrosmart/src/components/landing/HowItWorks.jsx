import React from 'react';
import { Smartphone, ShieldCheck, Truck } from 'lucide-react';
import Reveal from './Reveal';
import SectionHeading from './SectionHeading';

const steps = [
  { icon: Smartphone, n: '01', title: 'Explora el catálogo online', desc: 'Desde tu predio o tu celular, revisa stock en tiempo real y compara productos.' },
  { icon: ShieldCheck, n: '02', title: 'Asegura tu compra', desc: 'Pago 100% seguro con Transbank WebpayPlus. Datos encriptados de extremo a extremo.' },
  { icon: Truck, n: '03', title: 'Recibe en tu predio', desc: 'Despacho directo a tu campo en 48 horas, en cualquiera de nuestras 6 sucursales.' },
];

export default function HowItWorks() {
  return (
    <section className="relative py-24 border-y border-white/10" style={{ background: 'rgba(0,18,46,0.5)' }}>
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <SectionHeading kicker="Proceso" title="Cómo Funciona" subtitle="Tres pasos simples entre tú y la tecnología que tu campo necesita." />
        <div className="relative mt-16 grid md:grid-cols-3 gap-10">
          <div className="hidden md:block absolute top-9 left-[16%] right-[16%] h-px bg-gradient-to-r from-[#28C76F]/40 via-[#06b6d4]/60 to-[#22c55e]/40" />
          {steps.map((s, i) => (
            <Reveal key={s.n} delay={i * 150} className="relative flex flex-col items-center text-center">
              <span className="relative grid place-items-center w-[72px] h-[72px] rounded-2xl bg-[#060806] border border-white/10 text-[#28C76F] z-10">
                <s.icon className="w-8 h-8" />
                <span className="absolute -top-2 -right-2 grid place-items-center w-7 h-7 rounded-full bg-gradient-to-br from-[#28C76F] to-[#00ddeb] text-[#060806] text-xs font-bold font-grotesk">
                  {s.n}
                </span>
              </span>
              <h3 className="font-grotesk text-xl font-bold text-white mt-6">{s.title}</h3>
              <p className="text-sm text-slate-400 mt-3 max-w-xs leading-relaxed">{s.desc}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
