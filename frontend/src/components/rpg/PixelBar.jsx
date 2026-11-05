import React from 'react';

/**
 * Barra de estado compacta con estética de RPG clásico.
 * El relleno es un degradado segmentado (bloques de 6px) y el porcentaje
 * vive dentro de la barra para no gastar altura.
 */
const TONOS = {
  xp: {
    tag: 'XP',
    color: '#8ef0b8',
    grad: 'repeating-linear-gradient(90deg, #3ddc84 0 6px, #1f9d55 6px 8px)',
  },
  stamina: {
    tag: 'EN',
    color: '#a8ecff',
    grad: 'repeating-linear-gradient(90deg, #4cc9f0 0 6px, #1c55a8 6px 8px)',
  },
  hp: {
    tag: 'HP',
    color: '#ffb3ab',
    grad: 'repeating-linear-gradient(90deg, #e8453c 0 6px, #8f1f2e 6px 8px)',
  },
};

export default function PixelBar({ value = 0, max = 100, tone = 'xp', label }) {
  const t = TONOS[tone] || TONOS.xp;
  const pct = Math.min(100, Math.max(0, Math.round((Number(value) / Number(max || 1)) * 100)));

  return (
    <div
      className="flex min-w-0 items-center gap-1.5"
      title={label ? `${label}: ${value} / ${max}` : `${value} / ${max}`}
    >
      <span
        className="ui-px w-[19px] shrink-0 text-[7px] leading-none"
        style={{ color: t.color }}
      >
        {t.tag}
      </span>

      <div
        role="progressbar"
        aria-label={label || t.tag}
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        className="relative h-[12px] min-w-0 flex-1 overflow-hidden border-2 border-solid border-[#0a0718] bg-[#0a0718] shadow-[inset_0_2px_0_0_#000]"
      >
        <div
          className="h-full"
          style={{ width: `${pct}%`, backgroundImage: t.grad }}
        />
        <span className="pointer-events-none absolute inset-y-0 right-1 flex items-center ui-px text-[6px] text-[#fdf9ff] [text-shadow:1px_1px_0_#000]">
          {pct}%
        </span>
      </div>
    </div>
  );
}
