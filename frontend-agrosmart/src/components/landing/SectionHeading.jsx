import React from 'react';
import Reveal from './Reveal';

export default function SectionHeading({ kicker, title, subtitle, align = 'center' }) {
  const alignCls = align === 'center' ? 'text-center mx-auto items-center' : 'text-left items-start';
  return (
    <Reveal className={`flex flex-col ${alignCls} max-w-2xl`}>
      {kicker && (
        <span className="inline-flex items-center text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-4"
          style={{
            background: 'rgba(40,199,111,0.1)',
            border: '1px solid rgba(40,199,111,0.3)',
            color: '#28C76F',
          }}
        >
          {kicker}
        </span>
      )}
      <h2 className="font-grotesk font-bold text-white leading-tight" style={{ fontSize: 'clamp(2rem, 4.5vw, 3.25rem)' }}>
        {title}
      </h2>
      {subtitle && <p className="text-lg text-slate-400 mt-4 leading-relaxed">{subtitle}</p>}
    </Reveal>
  );
}
