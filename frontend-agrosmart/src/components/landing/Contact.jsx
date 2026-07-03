import React from 'react';
import { MapPin, Phone, MessageCircle } from 'lucide-react';
import Reveal from './Reveal';
import SectionHeading from './SectionHeading';

export default function Contact() {
  return (
    <section className="relative py-24 border-t border-white/10" style={{ background: 'rgba(0,18,46,0.5)' }}>
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <SectionHeading align="left" kicker="Contacto" title="Conversemos de tu predio" subtitle="Estamos en Rancagua, VI Región, listos para asesorarte." />
        <div className="grid lg:grid-cols-2 gap-8 mt-12 items-stretch">
          <Reveal className="flex flex-col gap-5">
            <a
              href="https://maps.google.com/?q=Av.+Los+Libertadores+1847+Rancagua"
              target="_blank"
              rel="noreferrer"
              className="flex items-start gap-4 rounded-2xl glass pulse-border p-6 hover:-translate-y-0.5 transition-transform"
            >
              <span className="grid place-items-center w-12 h-12 rounded-xl bg-[#28C76F]/15 text-[#28C76F] shrink-0">
                <MapPin className="w-6 h-6" />
              </span>
              <div>
                <div className="font-grotesk font-semibold text-white">Dirección</div>
                <div className="text-slate-400 mt-1">Av. Los Libertadores 1847, Of. 301, Rancagua</div>
              </div>
            </a>
            <a
              href="tel:+56722334800"
              className="flex items-start gap-4 rounded-2xl glass pulse-border p-6 hover:-translate-y-0.5 transition-transform"
            >
              <span className="grid place-items-center w-12 h-12 rounded-xl bg-[#00ddeb]/15 text-[#00ddeb] shrink-0">
                <Phone className="w-6 h-6" />
              </span>
              <div>
                <div className="font-grotesk font-semibold text-white">Teléfono</div>
                <div className="text-slate-400 mt-1">+56 72 2 334 800</div>
              </div>
            </a>
            <a
              href="https://wa.me/56978234401"
              target="_blank"
              rel="noreferrer"
              className="flex items-start gap-4 rounded-2xl glass pulse-border p-6 hover:-translate-y-0.5 transition-transform"
            >
              <span className="grid place-items-center w-12 h-12 rounded-xl bg-[#28C76F]/15 text-[#28C76F] shrink-0">
                <MessageCircle className="w-6 h-6" />
              </span>
              <div>
                <div className="font-grotesk font-semibold text-white">WhatsApp</div>
                <div className="text-slate-400 mt-1">+56 9 7823 4401</div>
              </div>
            </a>
          </Reveal>

          <Reveal delay={120} className="rounded-2xl overflow-hidden glass pulse-border min-h-[360px]">
            <iframe
              title="Mapa AgroSmart Rancagua"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d105260.67268846399!2d-70.82672522770222!3d-34.17029302196025!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x966343468b375b43%3A0xc6c4ceaf7f5f2425!2sRancagua%2C%20O'Higgins!5e0!3m2!1ses-419!2scl!4v1714954308527!5m2!1ses-419!2scl"
              className="w-full h-full min-h-[360px] border-0"
              style={{ filter: 'invert(90%) hue-rotate(170deg) brightness(0.9) contrast(0.9)' }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
