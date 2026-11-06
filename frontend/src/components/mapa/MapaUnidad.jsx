import { useState, useEffect } from 'react';
import MapaCanvas from './MapaCanvas';
import { AvatarHeroAnimado, BiomeStructureSprite, CastleDungeonSprite } from './Sprites';
import { ANCHO_LOGICO, ALTO_LOGICO } from '../../game/terreno';
import { calcularPosicionJefe, posicionesDeTemas, tileAPorcentaje } from '../../game/mapa';

const estadoTema = (tema, { evaluaciones = [], tareas = [], calificaciones = [], entregas = [] }) => {
  const evals = evaluaciones.filter(ev => ev.tema_id === tema.id);
  const tars = tareas.filter(tar => tar.tema_id === tema.id);
  const total = evals.length + tars.length;
  const hechas =
    evals.filter(ev => calificaciones.some(c => c.evaluacion_id === ev.id)).length +
    tars.filter(tar => entregas.some(e => e.tarea_id === tar.id)).length;
  return {
    total,
    hechas,
    completado: total > 0 && hechas === total,
    evaluaciones: evals
  };
};

export default function MapaUnidad({
  unidad,
  temas = [],
  terreno,
  heroPos,
  escala = 2,
  caminando = false,
  claseHeroe = '',
  estadoHeroe = 'normal',
  evaluaciones = [],
  tareas = [],
  calificaciones = [],
  entregas = [],
  esMovil = false,
  onVolver,
  onMoverHeroe,
  onTemaClick,
  onJefeClick
}) {
  const posiciones = posicionesDeTemas(temas, terreno);
  const jefePos = calcularPosicionJefe(terreno, posiciones.map(p => ({ col: p.col, fila: p.fila })));
  const evalsUnidad = evaluaciones.filter(ev => temas.some(t => t.id === ev.tema_id));
  const jefeDerrotado = evalsUnidad.length > 0 && evalsUnidad.every(ev => calificaciones.some(c => c.evaluacion_id === ev.id));
  const tituloUnidad = unidad.esCampamento
    ? unidad.nombre
    : `UNIDAD ${unidad.numero} · ${unidad.nombre}`;

  const [frameHero, setFrameHero] = useState(0);
  useEffect(() => {
    if (!caminando) return undefined;
    const id = setInterval(() => setFrameHero((f) => (f === 0 ? 1 : 0)), 200);
    return () => clearInterval(id);
  }, [caminando]);

  if (esMovil) {
    return (
      <section className="mapa-movil" aria-label={tituloUnidad}>
        <div className="mapa-movil__banner mapa-movil__banner--unidad">
          <span>{tituloUnidad}</span>
          <button type="button" className="btn-pro btn-sm" onClick={onVolver}>← Continental</button>
        </div>
        <p className="section-sub">{unidad.descripcion}</p>
        {unidad.objetivo && (
          <p className="unidad-objetivo"><strong>🎯 Objetivo:</strong> {unidad.objetivo}</p>
        )}
        <div className="sendero-movil">
          {posiciones.map(({ tema }, indice) => {
            const estado = estadoTema(tema, { evaluaciones, tareas, calificaciones, entregas });
            return (
              <button
                key={tema.id}
                type="button"
                className="px-nodo px-nodo--lista"
                data-estado={estado.completado ? 'completado' : 'actual'}
                onClick={() => onTemaClick?.(tema)}
              >
                <span className="px-nodo__chapa">{indice + 1}</span>
                <span className="px-nodo__lista-texto">
                  <strong>{tema.titulo}</strong>
                  <small>{estado.hechas}/{estado.total} actividades</small>
                </span>
              </button>
            );
          })}

          {evalsUnidad.length > 0 && (
            <button
              type="button"
              className="px-nodo px-nodo--lista px-nodo--jefe"
              data-estado={jefeDerrotado ? 'completado' : 'actual'}
              onClick={() => onJefeClick?.(evalsUnidad)}
            >
              <span className="px-nodo__chapa">⚔</span>
              <span className="px-nodo__lista-texto">
                <strong>Jefe de la {unidad.esCampamento ? 'zona' : `Unidad ${unidad.numero}`}</strong>
                <small>{jefeDerrotado ? 'Derrotado' : 'Pendiente de combate'}</small>
              </span>
            </button>
          )}
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
        <span>{tituloUnidad}</span>
      </div>
      {unidad.objetivo && (
        <div className="unidad-objetivo unidad-objetivo--mapa" title={unidad.objetivo}>
          🎯 {unidad.objetivo}
        </div>
      )}
      <button type="button" className="mapa-volver" onClick={onVolver}>
        ← MAPA CONTINENTAL
      </button>

      {posiciones.map(({ tema, col, fila }, indice) => {
        const estado = estadoTema(tema, { evaluaciones, tareas, calificaciones, entregas });
        return (
          <button
            key={tema.id}
            type="button"
            onClick={() => onTemaClick?.(tema, { x: col, y: fila })}
            className={`map-node map-node--tema ${estado.completado ? 'is-complete' : ''}`}
            style={tileAPorcentaje(col, fila)}
            title={`${tema.titulo} (Col ${col}, Fila ${fila})`}
          >
            <span className="mapa-tema__indice">{indice + 1}</span>
            <span className="map-node__art">
              <BiomeStructureSprite tipo={tema.bioma === 'valle' ? 'laboratorio' : tema.bioma} />
            </span>
            <span className="map-nameplate">{tema.titulo}</span>
          </button>
        );
      })}

      {evalsUnidad.length > 0 && (
        <button
          type="button"
          onClick={() => onJefeClick?.(evalsUnidad)}
          className="map-node map-node--jefe"
          style={tileAPorcentaje(jefePos.col, jefePos.fila)}
          title="Jefe de la Unidad"
        >
          <span className="mapa-tema__indice mapa-tema__indice--jefe" title={jefeDerrotado ? 'Jefe derrotado' : 'Jefe pendiente'}>
            {jefeDerrotado ? '✓' : '⚔'}
          </span>
          <span className="map-node__art">
            <CastleDungeonSprite derrotado={jefeDerrotado} />
          </span>
          <span className="map-nameplate">CASTILLO DEL JEFE</span>
        </button>
      )}

      <div
        className={`map-hero ${caminando ? 'is-walking' : ''} estado-${estadoHeroe}`}
        style={tileAPorcentaje(heroPos.x, heroPos.y)}
      >
        <span className="map-hero__alert">!</span>
        <span className="map-hero__shadow" />
        <span className="map-hero__ring" />
        <span className="map-hero__frame">
          <AvatarHeroAnimado clase={claseHeroe} frame={caminando ? frameHero : 0} />
        </span>
      </div>

      <div className="map-legend">
        WASD / CLIC · COL {heroPos.x} · FILA {heroPos.y}
      </div>
    </div>
  );
}
