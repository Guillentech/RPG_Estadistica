import React from 'react';

const COLOR_CLASS = {
  hp: 'stat-bar__fill--hp',
  mp: 'stat-bar__fill--mp',
  xp: 'stat-bar__fill--xp',
  stamina: 'stat-bar__fill--stamina',
};

/**
 * Barra de estado estilo RPG (HP / MP / XP / Stamina).
 * Muestra etiqueta pixelada y valor numérico.
 */
export default function StatBar({
  label,
  value,
  max = 100,
  color = 'xp',
  suffix = '',
  showPercent = true,
}) {
  const pct = Math.min(100, Math.max(0, Math.round((value / max) * 100)));
  return (
    <div>
      <div className="stat-bar__label">
        <span>{label}</span>
        <span className="stat-bar__value">
          {value}
          {suffix} {showPercent && `(${pct}%)`}
        </span>
      </div>
      <div className="stat-bar" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max}>
        <div className={`stat-bar__fill ${COLOR_CLASS[color] || ''}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}