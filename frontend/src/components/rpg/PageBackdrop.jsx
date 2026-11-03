import React from 'react';

/**
 * Fondo de página sutil por variante (profesor, estudiante, combate, acceso).
 * Decorativo: no intercepta el puntero ni recibe foco.
 */
const SILHOUETTES = {
  teacher: (
    <>
      {/* Torre / consola del Game Master */}
      <g fill="var(--backdrop-accent-2)" opacity="0.9">
        <rect x="150" y="60" width="100" height="140" />
        <rect x="130" y="40" width="140" height="24" />
        <rect x="140" y="24" width="120" height="16" />
        <rect x="170" y="8" width="60" height="16" />
      </g>
      <g fill="var(--backdrop-accent)" opacity="0.85">
        <rect x="170" y="80" width="20" height="20" />
        <rect x="210" y="80" width="20" height="20" />
        <rect x="170" y="120" width="20" height="20" />
        <rect x="210" y="120" width="20" height="20" />
        <rect x="190" y="160" width="20" height="40" />
      </g>
      <g fill="var(--backdrop-accent)" opacity="0.5">
        <rect x="40" y="150" width="60" height="8" />
        <rect x="300" y="150" width="60" height="8" />
        <rect x="30" y="166" width="80" height="6" />
        <rect x="290" y="166" width="80" height="6" />
      </g>
    </>
  ),
  student: (
    <>
      {/* Árboles + cristales */}
      <g fill="var(--backdrop-accent-2)" opacity="0.85">
        <path d="M60 200v-60h8v-20H56v-20h8V80h-6V60h10V40h12V20h14v20h10V60h10v20h-6v20h6v20h-8v20h8v60z" />
        <path d="M300 200v-70h8v-22h-6v-18h8V70h-4V50h14V30h12v20h12v20h12v22h-6v18h6v22h-8v70z" />
      </g>
      <g fill="var(--backdrop-accent)" opacity="0.9">
        <rect x="96" y="56" width="4" height="4" />
        <rect x="104" y="62" width="4" height="4" />
        <rect x="332" y="48" width="4" height="4" />
        <rect x="340" y="54" width="4" height="4" />
        <path d="M180 200V150h6V130h6V110h8v20h6v20h6v50z" />
        <path d="M210 200V160h5V144h5V128h6v16h5v16h5v40z" />
      </g>
    </>
  ),
  combat: (
    <>
      {/* Arena + llamas */}
      <g fill="var(--backdrop-accent-2)" opacity="0.85">
        <rect x="0" y="170" width="400" height="30" />
        <path d="M0 170h400v4H0z" />
      </g>
      <g fill="var(--backdrop-accent)" opacity="0.9">
        <path d="M80 170V120h4V100h4V80h6v20h4v20h4v50z" />
        <path d="M120 170V130h4V114h4V98h5v16h4v16h4v40z" />
        <path d="M260 170V120h4V100h4V80h6v20h4v20h4v50z" />
        <path d="M300 170V130h4V114h4V98h5v16h4v16h4v40z" />
      </g>
      <g fill="var(--backdrop-accent)" opacity="0.7">
        <path d="M190 170V130h4V110h4V90h8v20h4v20h4v50z" />
        <path d="M210 170V140h4V124h4V108h6v16h4v16h4v34z" />
      </g>
    </>
  ),
  'auth-student': (
    <>
      {/* Portal arqueado */}
      <g fill="var(--backdrop-accent-2)" opacity="0.85">
        <path d="M120 200V90h8V60h8V30h80v30h8v30h8v110z" />
      </g>
      <g fill="var(--backdrop-accent)" opacity="0.9">
        <rect x="150" y="60" width="100" height="4" />
        <rect x="150" y="100" width="100" height="4" />
        <rect x="150" y="140" width="100" height="4" />
        <rect x="170" y="70" width="8" height="8" />
        <rect x="222" y="70" width="8" height="8" />
        <rect x="170" y="110" width="8" height="8" />
        <rect x="222" y="110" width="8" height="8" />
      </g>
      <g fill="var(--backdrop-accent)" opacity="0.7">
        <path d="M60 200V150h6V130h6V110h8v20h6v20h6v50z" />
        <path d="M300 200V150h6V130h6V110h8v20h6v20h6v50z" />
      </g>
    </>
  ),
  'auth-teacher': (
    <>
      {/* Consola / altar */}
      <g fill="var(--backdrop-accent-2)" opacity="0.85">
        <rect x="140" y="70" width="120" height="130" />
        <rect x="120" y="50" width="160" height="24" />
        <rect x="130" y="30" width="140" height="20" />
      </g>
      <g fill="var(--backdrop-accent)" opacity="0.9">
        <rect x="160" y="90" width="20" height="20" />
        <rect x="220" y="90" width="20" height="20" />
        <rect x="160" y="130" width="20" height="20" />
        <rect x="220" y="130" width="20" height="20" />
        <rect x="190" y="170" width="20" height="30" />
      </g>
      <g fill="var(--backdrop-accent)" opacity="0.5">
        <rect x="40" y="160" width="70" height="6" />
        <rect x="290" y="160" width="70" height="6" />
      </g>
    </>
  ),
  neutral: null,
};

export default function PageBackdrop({ variant = 'neutral', intensity = 'subtle' }) {
  const silhouette = SILHOUETTES[variant] || null;
  return (
    <div
      className={`page-backdrop page-backdrop--${variant} page-backdrop--${intensity}`}
      aria-hidden="true"
    >
      <div className="page-backdrop__sky" />
      <div className="page-backdrop__grid" />
      <div className="page-backdrop__glow page-backdrop__glow--a" />
      <div className="page-backdrop__glow page-backdrop__glow--b" />
      {silhouette && (
        <svg
          className="page-backdrop__silhouette"
          viewBox="0 0 400 200"
          preserveAspectRatio="xMidYMax slice"
          shapeRendering="crispEdges"
          aria-hidden="true"
          focusable="false"
        >
          {silhouette}
        </svg>
      )}
    </div>
  );
}
