import React from 'react';
import { ArrowRight } from 'lucide-react';
import Reveal from './Reveal';
import MagneticButton from './MagneticButton';

export default function FinalCTA() {
  return (
    <section className="relative py-24" style={{ background: 'rgba(0,29,61,0.3)' }}>
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <Reveal scan className="relative rounded-3xl overflow-hidden border border-white/10">
          <div className="absolute inset-0 bg-gradient-to-br from-[#28C76F] to-[#00ddeb]" />
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                'linear-gradient(rgba(0,0,0,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.4) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />
          <div className="relative px-6 sm:px-12 py-16 sm:py-20 text-center">
            <h2 className="font-grotesk font-bold text-[#060806] leading-tight" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>
              ¿Listo para modernizar tu campo?
            </h2>
            <p className="text-[#060806]/80 text-lg mt-4 max-w-xl mx-auto font-medium">
              Más de 200 productos disponibles con despacho en 48 horas.
            </p>
            <div className="mt-9 flex justify-center">
              <MagneticButton
                to="/cliente/catalogo"
                variant="secondary"
                className="!text-[#060806] !border-[#060806]/40 hover:!bg-[#060806] hover:!text-white"
              >
                Ver Catálogo Completo <ArrowRight className="w-5 h-5" />
              </MagneticButton>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
