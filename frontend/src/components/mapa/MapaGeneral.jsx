import MapaCanvas from './MapaCanvas';
import { AvatarHero16Bit, CastleDungeonSprite } from './Sprites';
import { ANCHO_LOGICO, ALTO_LOGICO } from '../../game/terreno';
import { posicionesDeUnidades, tileAPorcentaje } from '../../game/mapa';

const progresoDe = (progresoPorUnidad, unidad) =>
  progresoPorUnidad?.[unidad.id] || { completadas: 0, total: 0, porcentaje: 0 };

export default function MapaGeneral({
  unidades = [],
  terreno,
  heroPos,
  escala = 2,
  caminando = false,
  progresoPorUnidad = {},
  claseHeroe = '',
  esMovil = false,
  onMoverHeroe,
  onEntrarUnidad
}) {
  const posiciones = posicionesDeUnidades(unidades, terreno);

  if (esMovil) {
    return (
      <section className="mapa-movil" aria-label="Mapa Continental de Ciudadelas">
        <div className="mapa-movil__banner">
          <span>MAPA CONTINENTAL</span>
          <span>{unidades.length} CIUDADELAS</span>
        </div>
        <div className="ciudadela-grid">
          {posiciones.map(({ unidad }) => {
            const progreso = progresoDe(progresoPorUnidad, unidad);
            const completada = progreso.total > 0 && progreso.completadas === progreso.total;
            return (
              <button
                key={unidad.id}
                type="button"
                className={`ciudadela-card ${completada ? 'is-complete' : ''}`}
                onClick={() => onEntrarUnidad?.(unidad)}
              >
                <span className="ciudadela-card__num">
                  {unidad.esCampamento ? '★' : `UNIDAD ${unidad.numero}`}
                </span>
                <span className="ciudadela-card__art">
                  <CastleDungeonSprite derrotado={completada} />
                </span>
                <span className="ciudadela-card__name">{unidad.nombre}</span>
                <span className="ciudadela-card__meta">
                  {progreso.completadas}/{progreso.total} actividades
                </span>
              </button>
            );
          })}
        </div>
      </section>
    );
  }

  return (
    <div
      className="map-viewport"
      style={{
        width: `${ANCHO_LOGICO * escala}px`,
        height: `${ALTO_LOGICO * escala}px`,
        minHeight: 'unset',
        maxHeight: 'unset',
        aspectRatio: 'auto',
        margin: '4px auto'
      }}
    >
      <MapaCanvas terreno={terreno} onTileClick={(col, fila) => onMoverHeroe?.(col, fila)} />

      <div className="map-banner">
        <span>MAPA CONTINENTAL ({escala}x • TILES 16×16)</span>
      </div>

      <div className="map-legend">
        WASD / CLIC · COL {heroPos.x} · FILA {heroPos.y}
      </div>

      {posiciones.map(({ unidad, col, fila }) => {
        const progreso = progresoDe(progresoPorUnidad, unidad);
        const completada = progreso.total > 0 && progreso.completadas === progreso.total;
        return (
          <button
            key={unidad.id}
            type="button"
            onClick={() => onEntrarUnidad?.(unidad, { x: col, y: fila })}
            className="map-node map-node--ciudadela"
            style={tileAPorcentaje(col, fila)}
            title={`${unidad.nombre} (Col ${col}, Fila ${fila})`}
            aria-label={`Entrar a ${unidad.nombre}`}
          >
            <span className="mapa-ciudadela__progreso">
              {progreso.completadas}/{progreso.total}
            </span>
            <span className="map-node__art">
              <CastleDungeonSprite derrotado={completada} />
            </span>
            <span className="map-nameplate">
              {unidad.esCampamento ? (
                <span className="map-nameplate__name">★ {unidad.nombre}</span>
              ) : (
                <>
                  <span className="map-nameplate__tag">UNIDAD {unidad.numero}</span>
                  <span className="map-nameplate__name">{unidad.nombre}</span>
                </>
              )}
            </span>
          </button>
        );
      })}

      <div
        className={`map-hero ${caminando ? 'is-walking' : ''}`}
        style={tileAPorcentaje(heroPos.x, heroPos.y)}
      >
        <span className="map-hero__alert">!</span>
        <span className="map-hero__frame">
          <AvatarHero16Bit clase={claseHeroe} />
        </span>
      </div>
    </div>
  );
}
