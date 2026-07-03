import React from 'react';
import useReveal from './useReveal';

export default function Reveal({ children, className = '', delay = 0, scan = false, as: Tag = 'div' }) {
  const ref = useReveal();
  return (
    <Tag
      ref={ref}
      className={`reveal ${scan ? 'scan-on-view relative overflow-hidden' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {scan && (
        <span className="scan-bar pointer-events-none absolute top-0 left-0 h-full w-1/3 bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent z-10" />
      )}
      {children}
    </Tag>
  );
}
