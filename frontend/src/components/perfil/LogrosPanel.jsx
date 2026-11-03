import React, { useEffect, useMemo, useState } from 'react';
import { Lock, Sparkles } from 'lucide-react';
import { API_URL } from '../../config';

const formatearFecha = (fecha) => {
  if (!fecha) return '';
  const normalizada = String(fecha).includes('T') ? String(fecha) : `${String(fecha).replace(' ', 'T')}Z`;
  const valor = new Date(normalizada);
  if (Number.isNaN(valor.getTime())) return '';
  return valor.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
};

const FILTROS = [
  { id: 'todos', nombre: 'Todas' },
  { id: 'desbloqueados', nombre: 'Ganadas' },
  { id: 'bloqueados', nombre: 'Pendientes' }
];

export default function LogrosPanel({ estudianteId, compacto = false }) {
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [filtro, setFiltro] = useState('todos');

  useEffect(() => {
    if (!estudianteId) return undefined;
    let cancelado = false;

    fetch(`${API_URL}/api/estudiantes/${estudianteId}/logros`)
      .then((res) => {
        if (!res.ok) throw new Error('No se pudieron cargar las medallas.');
        return res.json();
      })
      .then((data) => {
        if (!cancelado) setDatos(data);
      })
      .catch(() => {
        if (!cancelado) setError('No se pudo conectar con el salón de trofeos del Gremio.');
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });

    return () => {
      cancelado = true;
    };
  }, [estudianteId]);

  const logros = useMemo(() => datos?.logros || [], [datos]);

  const visibles = useMemo(() => {
    if (compacto) return logros.filter((logro) => logro.desbloqueado);
    if (filtro === 'desbloqueados') return logros.filter((logro) => logro.desbloqueado);
    if (filtro === 'bloqueados') return logros.filter((logro) => !logro.desbloqueado);
    return logros;
  }, [logros, filtro, compacto]);

  if (!estudianteId) return null;

  const progreso = datos?.total ? Math.round((datos.desbloqueados / datos.total) * 100) : 0;

  return (
    <section className={`card-pro logros-panel ${compacto ? 'logros-panel--compact' : ''}`}>
      <div className="logros-panel__head">
        <div>
          <h3 className="pixel-font section-title section-title--gold">🏆 SALÓN DE MEDALLAS</h3>
          <p className="section-sub logros-panel__sub">
            {compacto
              ? 'Cada hazaña académica desbloquea una medalla permanente en tu perfil.'
              : 'Tu progreso académico convertido en trofeos. Las medallas bloqueadas muestran cuánto te falta.'}
          </p>
        </div>
        <div className="logros-panel__marcador">
          <strong>{datos?.desbloqueados ?? 0}</strong>
          <span>de {datos?.total ?? 0}</span>
        </div>
      </div>

      <div
        className="logros-panel__barra"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progreso}
        aria-label="Progreso de medallas"
      >
        <div className="logros-panel__barra-fill" style={{ width: `${progreso}%` }} />
      </div>

      {datos?.xp_bonus_total > 0 && (
        <p className="logros-panel__xp">
          <Sparkles size={14} aria-hidden="true" /> Bonificación acumulada por medallas: <strong>+{datos.xp_bonus_total} XP</strong>
        </p>
      )}

      {!compacto && (
        <div className="logros-panel__filtros" role="group" aria-label="Filtrar medallas">
          {FILTROS.map((opcion) => (
            <button
              key={opcion.id}
              type="button"
              className={`logros-filtro ${filtro === opcion.id ? 'is-active' : ''}`}
              onClick={() => setFiltro(opcion.id)}
              aria-pressed={filtro === opcion.id}
            >
              {opcion.nombre}
            </button>
          ))}
        </div>
      )}

      {cargando && <p className="rpg-empty">Abriendo el cofre de trofeos...</p>}
      {!cargando && error && <p className="perfil-mensaje is-error">{error}</p>}
      {!cargando && !error && visibles.length === 0 && (
        <p className="rpg-empty">
          {compacto
            ? 'Aún no tienes medallas. ¡Derrota a tu primer Jefe Final!'
            : 'No hay medallas en este filtro. Sigue explorando el mapa.'}
        </p>
      )}

      {!cargando && !error && visibles.length > 0 && (
        <div className="logros-grid">
          {visibles.map((logro) => {
            const porcentaje = logro.progreso_meta
              ? Math.min(100, Math.round((logro.progreso_actual / logro.progreso_meta) * 100))
              : 0;
            return (
              <article
                key={logro.id}
                className={`logro-card ${logro.desbloqueado ? 'is-unlocked' : 'is-locked'}`}
              >
                <div className="logro-card__icono" aria-hidden="true">
                  {logro.desbloqueado ? logro.icono : <Lock size={22} />}
                </div>
                <div className="logro-card__cuerpo">
                  <h4 className="logro-card__nombre">{logro.nombre}</h4>
                  <p className="logro-card__desc">{logro.descripcion}</p>

                  {logro.desbloqueado ? (
                    <p className="logro-card__meta">
                      {logro.fecha_desbloqueo ? `Ganada el ${formatearFecha(logro.fecha_desbloqueo)}` : 'Medalla ganada'}
                      {Number(logro.xp_bonus) > 0 && <span className="logro-card__xp">+{logro.xp_bonus} XP</span>}
                    </p>
                  ) : (
                    <div className="logro-card__progreso">
                      <div className="logro-card__progreso-track">
                        <div className="logro-card__progreso-fill" style={{ width: `${porcentaje}%` }} />
                      </div>
                      <span>{logro.progreso_actual} / {logro.progreso_meta}</span>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
