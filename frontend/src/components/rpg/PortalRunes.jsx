import React from 'react';

/**
 * Anillo de runas pixeladas que rodea una tarjeta.
 * Es decorativo: no recibe foco ni intercepta el puntero.
 */
const RUNES = [
  [[1, 0, 1, 6], [2, 0, 3, 1], [4, 1, 1, 2]],
  [[1, 0, 1, 6], [5, 0, 1, 6], [1, 2, 5, 1]],
  [[1, 0, 1, 6], [4, 0, 1, 6], [1, 2, 4, 2]],
  [[1, 0, 4, 1], [3, 1, 1, 5]],
  [[1, 0, 1, 6], [1, 0, 4, 1], [3, 1, 1, 1]],
  [[1, 0, 1, 6], [4, 0, 1, 6], [1, 2, 4, 1]],
  [[1, 0, 1, 6], [4, 0, 1, 6], [1, 2, 4, 1], [1, 4, 4, 1]],
  [[1, 0, 1, 6], [4, 0, 1, 6], [2, 1, 2, 1], [2, 3, 2, 1]],
];

const CORNERS = [
  [10, 10],
  [106, 10],
  [10, 106],
  [106, 106],
];

export default function PortalRunes({ className = '' }) {
  return (
    <svg
      className={`portal-runes ${className}`.trim()}
      viewBox="0 0 120 120"
      preserveAspectRatio="none"
      shapeRendering="crispEdges"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M18 4H102V8H106V112H102V116H18V112H14V8H18Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        opacity="0.5"
      />

      {RUNES.map((rune, index) => (
        <g key={`rune-${index}`} transform={`rotate(${index * 45} 60 60)`}>
          <g transform="translate(56 3)">
            {rune.map(([x, y, w, h], shapeIndex) => (
              <rect
                key={`rune-${index}-${shapeIndex}`}
                x={x}
                y={y}
                width={w}
                height={h}
                fill="currentColor"
              />
            ))}
          </g>
        </g>
      ))}

      {CORNERS.map(([x, y], index) => (
        <g key={`corner-${index}`} fill="currentColor">
          <rect x={x - 2} y={y} width={12} height={2} />
          <rect x={x} y={y - 2} width={2} height={12} />
          <rect x={x - 4} y={y + 4} width={2} height={2} opacity="0.7" />
          <rect x={x + 10} y={y + 4} width={2} height={2} opacity="0.7" />
        </g>
      ))}
    </svg>
  );
}
