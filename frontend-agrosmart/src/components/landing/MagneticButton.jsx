import React, { useRef } from 'react';
import { Link } from 'react-router-dom';

export default function MagneticButton({ to, href, children, variant = 'primary', className = '', onClick }) {
  const ref = useRef(null);

  const handleMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - (rect.left + rect.width / 2);
    const y = e.clientY - (rect.top + rect.height / 2);
    el.style.transform = `translate(${x * 0.25}px, ${y * 0.35}px)`;
  };
  const handleLeave = () => {
    if (ref.current) ref.current.style.transform = 'translate(0,0)';
  };

  const base =
    'inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-base font-semibold transition-[transform,box-shadow,background] duration-300 will-change-transform';
  const styles =
    variant === 'primary'
      ? 'text-[#060806] bg-gradient-to-r from-[#22c55e] to-[#06b6d4] shadow-[0_8px_30px_-8px_rgba(34,197,94,0.6)] hover:shadow-[0_12px_40px_-6px_rgba(6,182,212,0.7)]'
      : 'text-white border border-white/20 bg-white/5 hover:bg-white/10 hover:border-cyan-400/50';

  const inner = (
    <span
      ref={ref}
      className="inline-flex items-center gap-2 will-change-transform transition-transform duration-300"
    >
      {children}
    </span>
  );

  const cls = `${base} ${styles} ${className}`;

  if (href) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={cls} onMouseMove={handleMove} onMouseLeave={handleLeave} onClick={onClick}>
        {inner}
      </a>
    );
  }
  return (
    <Link to={to} className={cls} onMouseMove={handleMove} onMouseLeave={handleLeave} onClick={onClick}>
      {inner}
    </Link>
  );
}
