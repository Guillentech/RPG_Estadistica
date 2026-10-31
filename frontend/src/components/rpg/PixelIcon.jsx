import React from 'react';

/**
 * Iconos pixel-art de 16×16 construidos con rectángulos enteros.
 * Props:
 *  - name: clave del sprite (map, scroll, potion, swords, sword, portal, shield, trophy, spark, crystal)
 *  - size: tamaño en px; usar múltiplos de 16 para conservar la cuadrícula
 *  - className: clases extra para color/tono
 *
 * El color principal usa `currentColor`; los detalles usan:
 *  --icon-accent (por defecto currentColor)
 *  --icon-deep   (por defecto --ink)
 *  --icon-alert  (por defecto --red)
 */
const TONE = {
  main: 'currentColor',
  accent: 'var(--icon-accent, currentColor)',
  deep: 'var(--icon-deep, var(--ink))',
  alert: 'var(--icon-alert, var(--red))',
};

const ICONS = {
  map: [
    [2, 3, 12, 11, 'main'],
    [2, 3, 4, 11, 'accent', 0.55],
    [10, 3, 4, 11, 'accent', 0.55],
    [5, 3, 1, 11, 'deep'],
    [10, 3, 1, 11, 'deep'],
    [2, 6, 12, 1, 'deep'],
    [2, 10, 12, 1, 'deep'],
    [3, 8, 2, 1, 'deep'],
    [6, 6, 2, 1, 'deep'],
    [9, 8, 2, 1, 'deep'],
    [11, 11, 2, 1, 'deep'],
    [11, 5, 2, 2, 'alert'],
  ],
  scroll: [
    [2, 2, 12, 2, 'accent'],
    [2, 12, 12, 2, 'accent'],
    [4, 4, 8, 8, 'main'],
    [4, 4, 1, 8, 'accent', 0.7],
    [11, 4, 1, 8, 'accent', 0.7],
    [6, 6, 4, 1, 'deep'],
    [6, 8, 4, 1, 'deep'],
    [6, 10, 3, 1, 'deep'],
    [11, 9, 2, 2, 'accent'],
    [2, 2, 2, 2, 'deep'],
    [12, 2, 2, 2, 'deep'],
    [2, 12, 2, 2, 'deep'],
    [12, 12, 2, 2, 'deep'],
  ],
  potion: [
    [6, 1, 4, 2, 'accent'],
    [6, 3, 4, 2, 'main'],
    [5, 5, 6, 4, 'accent', 0.18],
    [4, 5, 2, 4, 'main'],
    [10, 5, 2, 4, 'main'],
    [3, 9, 10, 4, 'main'],
    [4, 13, 8, 2, 'main'],
    [5, 15, 6, 1, 'main'],
    [4, 9, 8, 4, 'accent'],
    [5, 13, 6, 2, 'accent'],
    [6, 10, 1, 1, 'deep'],
    [9, 11, 1, 1, 'deep'],
    [7, 12, 1, 1, 'deep'],
    [4, 6, 1, 2, 'main'],
  ],
  swords: [
    [3, 11, 2, 2, 'main'],
    [5, 9, 2, 2, 'main'],
    [7, 7, 2, 2, 'main'],
    [9, 5, 2, 2, 'main'],
    [11, 3, 2, 2, 'main'],
    [4, 4, 2, 2, 'main'],
    [6, 6, 2, 2, 'main'],
    [8, 8, 2, 2, 'main'],
    [10, 10, 2, 2, 'main'],
    [12, 12, 2, 2, 'main'],
    [2, 12, 4, 2, 'accent'],
    [11, 2, 4, 2, 'accent'],
    [1, 14, 2, 2, 'accent'],
    [13, 0, 2, 2, 'accent'],
    [7, 7, 2, 2, 'deep'],
  ],
  sword: [
    [4, 12, 2, 2, 'main'],
    [6, 10, 2, 2, 'main'],
    [8, 8, 2, 2, 'main'],
    [10, 6, 2, 2, 'main'],
    [12, 4, 2, 2, 'main'],
    [13, 2, 2, 2, 'main'],
    [4, 14, 2, 1, 'accent'],
    [6, 12, 2, 1, 'accent'],
    [8, 10, 2, 1, 'accent'],
    [10, 8, 2, 1, 'accent'],
    [12, 6, 2, 1, 'accent'],
    [14, 3, 1, 3, 'accent'],
    [2, 12, 6, 2, 'accent'],
    [2, 14, 2, 2, 'main'],
    [1, 15, 2, 1, 'accent'],
  ],
  portal: [
    [4, 2, 8, 2, 'main'],
    [3, 4, 2, 10, 'main'],
    [11, 4, 2, 10, 'main'],
    [4, 14, 8, 2, 'main'],
    [5, 5, 6, 9, 'accent', 0.25],
    [7, 7, 2, 2, 'accent'],
    [6, 9, 4, 2, 'accent'],
    [7, 11, 2, 2, 'accent'],
    [7, 0, 2, 2, 'accent'],
    [2, 14, 12, 2, 'accent', 0.8],
    [3, 4, 1, 10, 'accent', 0.6],
    [12, 4, 1, 10, 'accent', 0.6],
  ],
  shield: [
    [3, 2, 10, 2, 'main'],
    [2, 4, 2, 5, 'main'],
    [12, 4, 2, 5, 'main'],
    [3, 9, 2, 3, 'main'],
    [5, 12, 2, 2, 'main'],
    [7, 14, 2, 2, 'main'],
    [9, 12, 2, 2, 'main'],
    [11, 9, 2, 3, 'main'],
    [4, 4, 8, 6, 'accent', 0.2],
    [5, 10, 6, 2, 'accent', 0.2],
    [6, 12, 4, 2, 'accent', 0.2],
    [7, 5, 2, 7, 'accent'],
    [5, 7, 6, 2, 'accent'],
    [7, 0, 2, 2, 'accent'],
  ],
  trophy: [
    [3, 2, 10, 2, 'accent'],
    [4, 4, 8, 5, 'main'],
    [2, 4, 2, 3, 'main'],
    [12, 4, 2, 3, 'main'],
    [5, 4, 6, 3, 'accent', 0.35],
    [7, 4, 2, 2, 'accent'],
    [7, 9, 2, 3, 'main'],
    [5, 12, 6, 2, 'accent'],
    [4, 14, 8, 1, 'main'],
  ],
  spark: [
    [7, 1, 2, 3, 'accent'],
    [7, 12, 2, 3, 'accent'],
    [1, 7, 3, 2, 'accent'],
    [12, 7, 3, 2, 'accent'],
    [6, 6, 4, 4, 'main'],
    [7, 7, 2, 2, 'accent'],
  ],
  crystal: [
    [7, 1, 2, 2, 'main'],
    [6, 3, 4, 2, 'main'],
    [5, 5, 6, 2, 'main'],
    [4, 7, 8, 2, 'main'],
    [5, 9, 6, 2, 'main'],
    [6, 11, 4, 2, 'main'],
    [7, 13, 2, 2, 'main'],
    [7, 3, 2, 2, 'accent'],
    [6, 5, 2, 2, 'accent', 0.8],
    [8, 5, 2, 2, 'accent', 0.8],
    [5, 8, 3, 2, 'accent'],
    [8, 8, 3, 2, 'accent'],
    [7, 10, 2, 2, 'accent', 0.8],
    [7, 5, 1, 7, 'deep', 0.35],
  ],
};

export default function PixelIcon({ name, size = 16, className = '' }) {
  const shapes = ICONS[name] || ICONS.spark;

  return (
    <svg
      className={`pixel-icon ${className}`.trim()}
      viewBox="0 0 16 16"
      width={size}
      height={size}
      shapeRendering="crispEdges"
      aria-hidden="true"
      focusable="false"
    >
      {shapes.map(([x, y, w, h, tone = 'main', opacity = 1], index) => (
        <rect
          key={`${name}-${index}`}
          x={x}
          y={y}
          width={w}
          height={h}
          fill={TONE[tone] || TONE.main}
          opacity={opacity}
        />
      ))}
    </svg>
  );
}
