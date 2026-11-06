// Sprites pixel art 16-bit reutilizados por el Mapa Continental y los interiores.
export const AvatarHero16Bit = ({ clase = '' }) => {
  const esArquera = clase.toLowerCase().includes('arquer');
  return (
    <svg width="46" height="46" viewBox="0 0 16 16" shapeRendering="crispEdges">
      <rect width="16" height="16" fill="#1e1b4b" />
      <rect x="4" y="2" width="8" height="3" fill={esArquera ? '#059669' : '#7e22ce'} />
      <rect x="3" y="4" width="10" height="2" fill={esArquera ? '#10b981' : '#9333ea'} />
      <rect x="4" y="4" width="8" height="1" fill="#fbbf24" />
      <rect x="4" y="6" width="8" height="5" fill="#fed7aa" />
      <rect x="5" y="7" width="2" height="2" fill="#0f172a" />
      <rect x="9" y="7" width="2" height="2" fill="#0f172a" />
      <rect x="5" y="7" width="1" height="1" fill="#ffffff" />
      <rect x="9" y="7" width="1" height="1" fill="#ffffff" />
      <rect x="7" y="9" width="2" height="1" fill="#f97316" />
      <rect x="3" y="11" width="10" height="5" fill={esArquera ? '#047857' : '#2563eb'} />
      <rect x="6" y="11" width="4" height="5" fill="#fbbf24" />
    </svg>
  );
};

export const GameMasterAvatar16Bit = () => (
  <svg width="52" height="52" viewBox="0 0 16 16" shapeRendering="crispEdges">
    <rect width="16" height="16" fill="#13092b" />
    <rect x="5" y="1" width="6" height="2" fill="#6b21a8" />
    <rect x="3" y="3" width="10" height="2" fill="#9333ea" />
    <rect x="5" y="3" width="6" height="1" fill="#fde047" />
    <rect x="4" y="5" width="8" height="4" fill="#fed7aa" />
    <rect x="5" y="6" width="2" height="2" fill="#38bdf8" />
    <rect x="9" y="6" width="2" height="2" fill="#38bdf8" />
    <rect x="4" y="9" width="8" height="3" fill="#f8fafc" />
    <rect x="5" y="12" width="6" height="1" fill="#cbd5e1" />
    <rect x="3" y="11" width="10" height="5" fill="#7e22ce" />
    <rect x="6" y="12" width="4" height="4" fill="#fbbf24" />
  </svg>
);

export const AlchemistWizard16Bit = () => (
  <svg width="64" height="68" viewBox="0 0 16 17" shapeRendering="crispEdges">
    <rect x="6" y="0" width="4" height="2" fill="#581c87" />
    <rect x="5" y="2" width="6" height="2" fill="#7e22ce" />
    <rect x="2" y="4" width="12" height="2" fill="#9333ea" />
    <rect x="7" y="3" width="2" height="1" fill="#fde047" />
    <rect x="5" y="6" width="6" height="3" fill="#fed7aa" />
    <rect x="6" y="7" width="1" height="1" fill="#0f172a" />
    <rect x="9" y="7" width="1" height="1" fill="#0f172a" />
    <rect x="4" y="9" width="8" height="4" fill="#f8fafc" />
    <rect x="5" y="13" width="6" height="1" fill="#e2e8f0" />
    <rect x="3" y="10" width="2" height="6" fill="#6b21a8" />
    <rect x="11" y="10" width="2" height="6" fill="#6b21a8" />
    <rect x="5" y="14" width="6" height="3" fill="#7e22ce" />
    <rect x="13" y="7" width="2" height="2" fill="#38bdf8" />
    <rect x="13" y="9" width="1" height="7" fill="#b45309" />
  </svg>
);

export const CastleDungeonSprite = ({ derrotado }) => (
  <svg width="88" height="84" viewBox="0 0 22 21" shapeRendering="crispEdges">
    {!derrotado && (
      <g>
        <rect x="6" y="1" width="2" height="2" fill="#fde047" />
        <rect x="14" y="1" width="2" height="2" fill="#fde047" />
        <rect x="7" y="2" width="8" height="5" fill="#dc2626" />
        <rect x="8" y="4" width="2" height="1" fill="#fef08a" />
        <rect x="12" y="4" width="2" height="1" fill="#fef08a" />
      </g>
    )}
    <rect x="2" y="6" width="2" height="2" fill="#cbd5e1" />
    <rect x="5" y="6" width="2" height="2" fill="#cbd5e1" />
    <rect x="15" y="6" width="2" height="2" fill="#cbd5e1" />
    <rect x="18" y="6" width="2" height="2" fill="#cbd5e1" />
    <rect x="2" y="8" width="5" height="11" fill="#64748b" />
    <rect x="15" y="8" width="5" height="11" fill="#64748b" />
    <rect x="7" y="9" width="8" height="10" fill="#475569" />
    <rect x="8" y="8" width="2" height="1" fill="#94a3b8" />
    <rect x="12" y="8" width="2" height="1" fill="#94a3b8" />
    <rect x="9" y="13" width="4" height="6" fill="#0f172a" />
    <rect x="10" y="12" width="2" height="1" fill="#0f172a" />
    <rect x="10" y="13" width="2" height="6" fill="#78350f" />
    <rect x="4" y="4" width="1" height="2" fill="#f8fafc" />
    <rect x="5" y="4" width="2" height="1" fill={derrotado ? '#10b981' : '#ef4444'} />
    <rect x="17" y="4" width="1" height="2" fill="#f8fafc" />
    <rect x="18" y="4" width="2" height="1" fill={derrotado ? '#10b981' : '#ef4444'} />
  </svg>
);

export const BiomeStructureSprite = ({ tipo }) => {
  if (tipo === 'ruinas') {
    return (
      <svg width="76" height="68" viewBox="0 0 18 16" shapeRendering="crispEdges">
        <rect x="2" y="13" width="14" height="2" fill="#64748b" />
        <rect x="3" y="4" width="3" height="9" fill="#cbd5e1" />
        <rect x="8" y="5" width="2" height="8" fill="#94a3b8" />
        <rect x="13" y="7" width="2" height="6" fill="#64748b" />
        <rect x="2" y="3" width="9" height="2" fill="#e2e8f0" />
        <rect x="3" y="5" width="2" height="3" fill="#10b981" />
        <rect x="8" y="6" width="2" height="2" fill="#059669" />
      </svg>
    );
  }
  if (tipo === 'laboratorio') {
    return (
      <svg width="76" height="76" viewBox="0 0 18 18" shapeRendering="crispEdges">
        <rect x="8" y="1" width="2" height="3" fill="#38bdf8" />
        <rect x="5" y="4" width="8" height="3" fill="#7e22ce" />
        <rect x="4" y="7" width="10" height="9" fill="#475569" />
        <rect x="7" y="9" width="4" height="3" fill="#38bdf8" />
        <rect x="8" y="13" width="2" height="3" fill="#0f172a" />
        <rect x="3" y="16" width="12" height="1" fill="#94a3b8" />
      </svg>
    );
  }
  return (
    <svg width="78" height="70" viewBox="0 0 18 16" shapeRendering="crispEdges">
      <rect x="3" y="10" width="2" height="4" fill="#78350f" />
      <rect x="13" y="10" width="2" height="4" fill="#78350f" />
      <rect x="1" y="4" width="6" height="6" fill="#047857" />
      <rect x="2" y="2" width="4" height="3" fill="#10b981" />
      <rect x="11" y="4" width="6" height="6" fill="#065f46" />
      <rect x="12" y="2" width="4" height="3" fill="#34d399" />
      <rect x="7" y="10" width="4" height="4" fill="#d97706" />
      <rect x="7" y="10" width="4" height="1" fill="#fde047" />
      <rect x="8" y="11" width="2" height="1" fill="#fef08a" />
    </svg>
  );
};

// ---------------------------------------------------------------------------
// Variantes de clase del héroe para el mapa de canvas (pixel-art 16×16).
// Cada una imita el estilo de AvatarHero16Bit con detalles distintivos.
// ---------------------------------------------------------------------------

export const AvatarHeroArquera = () => (
  <svg width="46" height="46" viewBox="0 0 16 16" shapeRendering="crispEdges">
    <rect width="16" height="16" fill="#0f172a" />
    {/* Capucha arquera */}
    <rect x="3" y="1" width="10" height="3" fill="#059669" />
    <rect x="4" y="3" width="8" height="1" fill="#047857" />
    {/* Cara */}
    <rect x="5" y="4" width="6" height="4" fill="#fed7aa" />
    <rect x="6" y="5" width="1" height="1" fill="#0f172a" />
    <rect x="9" y="5" width="1" height="1" fill="#0f172a" />
    <rect x="7" y="6" width="1" height="1" fill="#ffffff" />
    {/* Torso con cinturón */}
    <rect x="3" y="8" width="10" height="4" fill="#065f46" />
    <rect x="3" y="11" width="10" height="1" fill="#fbbf24" />
    {/* Piernas */}
    <rect x="3" y="12" width="10" height="4" fill="#047857" />
    <rect x="6" y="12" width="4" height="1" fill="#fbbf24" />
  </svg>
);

export const AvatarHeroGuerrero = () => (
  <svg width="46" height="46" viewBox="0 0 16 16" shapeRendering="crispEdges">
    <rect width="16" height="16" fill="#1e1b4b" />
    {/* Casco guerrero */}
    <rect x="3" y="1" width="10" height="3" fill="#78350f" />
    <rect x="4" y="3" width="8" height="1" fill="#92400e" />
    <rect x="7" y="2" width="2" height="1" fill="#fbbf24" />
    {/* Cara */}
    <rect x="5" y="4" width="6" height="4" fill="#fed7aa" />
    <rect x="6" y="5" width="1" height="1" fill="#0f172a" />
    <rect x="9" y="5" width="1" height="1" fill="#0f172a" />
    {/* Armadura */}
    <rect x="3" y="8" width="10" height="4" fill="#dc2626" />
    <rect x="4" y="8" width="8" height="3" fill="#ef4444" />
    <rect x="4" y="11" width="8" height="1" fill="#fbbf24" />
    {/* Piernas */}
    <rect x="3" y="12" width="10" height="4" fill="#b91c1c" />
    <rect x="6" y="12" width="4" height="1" fill="#fbbf24" />
  </svg>
);

export const AvatarHeroAlquimista = () => (
  <svg width="46" height="46" viewBox="0 0 16 16" shapeRendering="crispEdges">
    <rect width="16" height="16" fill="#1e1b4b" />
    {/* Sombrero alquimista */}
    <rect x="2" y="0" width="12" height="3" fill="#7e22ce" />
    <rect x="3" y="2" width="10" height="1" fill="#9333ea" />
    <rect x="7" y="1" width="2" height="1" fill="#fde047" />
    {/* Cara */}
    <rect x="5" y="4" width="6" height="4" fill="#fed7aa" />
    <rect x="6" y="5" width="1" height="1" fill="#0f172a" />
    <rect x="9" y="5" width="1" height="1" fill="#0f172a" />
    {/* Túnica */}
    <rect x="3" y="8" width="10" height="4" fill="#581c87" />
    <rect x="4" y="11" width="8" height="1" fill="#fde047" />
    {/* Piernas */}
    <rect x="3" y="12" width="10" height="4" fill="#4c1d95" />
    <rect x="6" y="12" width="4" height="1" fill="#fde047" />
    {/* Frasco alquímico */}
    <rect x="7" y="9" width="2" height="3" fill="#38bdf8" />
  </svg>
);

export const AvatarHeroGameMaster = () => (
  <svg width="52" height="52" viewBox="0 0 16 16" shapeRendering="crispEdges">
    <rect width="16" height="16" fill="#13092b" />
    {/* Corona / capucha dorada */}
    <rect x="4" y="0" width="8" height="2" fill="#fbbf24" />
    <rect x="3" y="1" width="10" height="3" fill="#7e22ce" />
    <rect x="5" y="2" width="6" height="1" fill="#fde047" />
    {/* Cara */}
    <rect x="5" y="4" width="6" height="4" fill="#fed7aa" />
    <rect x="6" y="5" width="1" height="1" fill="#0f172a" />
    <rect x="9" y="5" width="1" height="1" fill="#0f172a" />
    {/* Capa dorada */}
    <rect x="2" y="8" width="12" height="4" fill="#fbbf24" />
    <rect x="4" y="11" width="8" height="1" fill="#fde047" />
    {/* Piernas */}
    <rect x="3" y="12" width="10" height="4" fill="#7e22ce" />
    <rect x="6" y="12" width="4" height="1" fill="#fde047" />
  </svg>
);

/**
 * Avatar del héroe animado para el mapa de canvas.
 * - `clase`: define el sprite visual (mago/arquera/guerrero/alquimista/game_master).
 * - `frame`: 0 o 1, usado por CSS para alternar dos poses de caminata.
 * Renderiza un <span data-frame> para que el CSS controle el parpadeo y el paso.
 */
export const AvatarHeroAnimado = ({ clase = '', frame = 0 }) => {
  const clave = (clase || '').toLowerCase();
  const Sprite =
    clave.includes('arquer') ? AvatarHeroArquera :
    clave.includes('guerr') ? AvatarHeroGuerrero :
    clave.includes('alquim') ? AvatarHeroAlquimista :
    clave.includes('master') || clave.includes('game') ? AvatarHeroGameMaster :
    AvatarHero16Bit;

  return (
    <span className="avatar-animado" data-frame={frame} aria-label={`Héroe ${clase || 'mago'}`}>
      <Sprite />
    </span>
  );
};
