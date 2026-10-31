import React from 'react';

/**
 * Escena decorativa de la portada: cielo, auroras, estrellas, ruinas,
 * árboles y cristales construidos con CSS + SVG pixelado.
 * No recibe foco ni intercepta eventos del puntero.
 */
const STARS = [
  [4, 12, 2, 0.2], [8, 6, 3, 1.1], [13, 18, 2, 0.7], [17, 9, 2, 1.6],
  [22, 15, 3, 0.4], [27, 4, 2, 2.1], [31, 21, 2, 0.9], [36, 11, 2, 1.4],
  [41, 5, 3, 0.1], [46, 19, 2, 1.9], [51, 8, 2, 0.6], [55, 14, 3, 2.4],
  [60, 3, 2, 1.2], [64, 17, 2, 0.3], [69, 10, 2, 1.7], [73, 22, 3, 0.8],
  [78, 6, 2, 2.2], [83, 16, 2, 1.5], [88, 9, 3, 0.5], [92, 20, 2, 1.0],
  [96, 4, 2, 2.5], [99, 13, 2, 0.2], [7, 31, 2, 1.3], [15, 39, 2, 2.0],
  [24, 28, 3, 0.6], [33, 35, 2, 1.8], [42, 30, 2, 0.9], [50, 41, 2, 2.3],
  [58, 29, 3, 0.4], [67, 36, 2, 1.1], [75, 27, 2, 1.6], [84, 38, 3, 0.7],
  [91, 30, 2, 2.1], [97, 42, 2, 1.4], [11, 52, 2, 0.3], [20, 60, 2, 1.9],
  [29, 48, 3, 0.8], [38, 56, 2, 2.2], [47, 45, 2, 1.2], [56, 58, 2, 0.5],
  [65, 47, 3, 1.7], [74, 55, 2, 2.4], [82, 44, 2, 0.6], [90, 61, 2, 1.0],
  [98, 50, 3, 1.5], [5, 69, 2, 2.0], [35, 72, 2, 0.4], [70, 68, 2, 1.3],
];

export default function NeonScene() {
  return (
    <div className="neon-scene" aria-hidden="true">
      <div className="neon-scene__sky" />
      <div className="neon-scene__aurora neon-scene__aurora--cyan" />
      <div className="neon-scene__aurora neon-scene__aurora--magenta" />
      <div className="neon-scene__stars">
        {STARS.map(([x, y, size, delay], index) => (
          <span
            key={`star-${index}`}
            className={`neon-star${size >= 3 ? ' neon-star--big' : ''}`}
            style={{
              left: `${x}%`,
              top: `${y}%`,
              width: size,
              height: size,
              animationDelay: `${delay}s`,
            }}
          />
        ))}
      </div>
      <span className="neon-scene__planet" />
      <span className="neon-scene__planet neon-scene__planet--small" />

      <svg
        className="neon-scene__ruins pixel-sprite"
        viewBox="0 0 240 180"
        preserveAspectRatio="xMinYMax meet"
        shapeRendering="crispEdges"
        aria-hidden="true"
      >
        <path d="M0 180V112h16V96h16V72h16v24h16v16h16v68z" fill="var(--scene-ruin)" />
        <path d="M0 180V120h12v-16h12V88h12v16h12v16h12v60z" fill="var(--scene-ruin-hi)" opacity="0.55" />
        <g fill="var(--scene-ruin)">
          <rect x="20" y="72" width="16" height="108" />
          <rect x="56" y="52" width="14" height="128" />
          <rect x="92" y="82" width="14" height="98" />
          <rect x="152" y="64" width="16" height="116" />
          <rect x="188" y="92" width="14" height="88" />
        </g>
        <g fill="var(--scene-ruin-hi)">
          <rect x="20" y="72" width="4" height="108" />
          <rect x="56" y="52" width="4" height="128" />
          <rect x="92" y="82" width="4" height="98" />
          <rect x="152" y="64" width="4" height="116" />
          <rect x="188" y="92" width="4" height="88" />
          <rect x="16" y="66" width="24" height="8" />
          <rect x="52" y="46" width="22" height="8" />
          <rect x="88" y="76" width="22" height="8" />
          <rect x="148" y="58" width="24" height="8" />
          <rect x="184" y="86" width="22" height="8" />
        </g>
        <path d="M116 180v-52h12v-12h12v-12h12v12h12v12h12v52z" fill="var(--scene-sky-1)" />
        <path d="M120 180v-48h8v-10h8v-10h8v10h8v10h8v48z" fill="var(--scene-sky-2)" opacity="0.9" />
        <g fill="var(--scene-crystal)">
          <rect x="128" y="128" width="4" height="4" />
          <rect x="136" y="122" width="4" height="4" />
          <rect x="144" y="128" width="4" height="4" />
          <rect x="136" y="136" width="4" height="4" />
        </g>
        <g fill="var(--scene-ruin-hi)">
          <rect x="0" y="152" width="240" height="8" />
          <rect x="8" y="160" width="224" height="8" opacity="0.7" />
          <rect x="32" y="140" width="18" height="12" />
          <rect x="198" y="144" width="22" height="8" />
        </g>
        <g fill="var(--scene-aurora-cyan)" opacity="0.7">
          <rect x="24" y="94" width="4" height="4" />
          <rect x="28" y="98" width="4" height="4" />
          <rect x="24" y="102" width="4" height="4" />
          <rect x="156" y="78" width="4" height="4" />
          <rect x="160" y="82" width="4" height="4" />
          <rect x="156" y="86" width="4" height="4" />
        </g>
      </svg>

      <svg
        className="neon-scene__trees pixel-sprite"
        viewBox="0 0 300 220"
        preserveAspectRatio="xMaxYMax meet"
        shapeRendering="crispEdges"
        aria-hidden="true"
      >
        <path
          d="M70 220v-46h10v-18H68v-18h10v-20h-8V98h12V78h10V58h14v20h10v20h10v18h-8v18h8v26h-12v60z"
          fill="var(--scene-tree)"
          opacity="0.75"
        />
        <path
          d="M206 220v-58h10v-22h-8v-16h10V98h-6V78h16V58h12v20h12v20h12v24h-8v18h8v22h-12v58z"
          fill="var(--scene-tree)"
        />
        <path
          d="M206 220v-58h4v-58h8V82h10V64h8v18h8v18h8v22h-4v26h-8v72z"
          fill="var(--scene-tree-hi)"
          opacity="0.8"
        />
        <path
          d="M122 112V92h10V72h10V52h12V32h16V22h20v10h20v10h16v20h14v20h12v20h-10v12h-20v10h-40v-10h-40v-12z"
          fill="var(--scene-tree-hi)"
        />
        <path
          d="M142 102V84h10V66h12V50h14V40h18v10h16v16h14v16h10v14h-12v10h-28v-8h-32v-12z"
          fill="var(--scene-tree)"
          opacity="0.85"
        />
        <path
          d="M164 92V78h10V64h14V54h16v10h14v12h10v12h-10v8h-22v-6h-20v-8z"
          fill="var(--scene-aurora-cyan)"
          opacity="0.55"
        />
        <g fill="var(--scene-aurora-cyan)" opacity="0.8">
          <rect x="130" y="118" width="4" height="6" />
          <rect x="150" y="124" width="4" height="6" />
          <rect x="184" y="120" width="4" height="6" />
          <rect x="222" y="112" width="4" height="6" />
          <rect x="252" y="120" width="4" height="6" />
        </g>
        <g fill="var(--scene-crystal)">
          <rect x="132" y="72" width="3" height="3" />
          <rect x="176" y="62" width="3" height="3" />
          <rect x="216" y="78" width="3" height="3" />
          <rect x="248" y="98" width="3" height="3" />
          <rect x="118" y="132" width="3" height="3" />
        </g>
        <g fill="var(--scene-tree-hi)" opacity="0.7">
          <rect x="190" y="200" width="40" height="8" />
          <rect x="180" y="208" width="60" height="6" />
          <rect x="172" y="214" width="76" height="6" />
        </g>
      </svg>

      <div className="neon-scene__ground" />

      <svg
        className="neon-scene__crystals pixel-sprite"
        viewBox="0 0 360 100"
        preserveAspectRatio="xMidYMax meet"
        shapeRendering="crispEdges"
        aria-hidden="true"
      >
        <g fill="var(--scene-crystal)" opacity="0.9">
          <path d="M46 100V64h6V44h6V24h8v20h6v20h6v36z" />
          <path d="M78 100V74h5V58h5V42h6v16h5v16h5v26z" />
          <path d="M292 100V62h6V40h8V18h8v22h6v22h6v38z" />
          <path d="M324 100V76h5V60h5V44h6v16h5v16h5v24z" />
        </g>
        <g fill="var(--scene-aurora-cyan)" opacity="0.75">
          <path d="M112 100V82h4V68h4V54h5v14h4v14h4v18z" />
          <path d="M268 100V80h4V66h4V52h5v14h4v14h4v20z" />
        </g>
        <g fill="var(--scene-star)" opacity="0.8">
          <rect x="54" y="40" width="3" height="6" />
          <rect x="300" y="34" width="3" height="6" />
        </g>
      </svg>
    </div>
  );
}
