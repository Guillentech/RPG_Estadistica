import { X, Swords } from 'lucide-react';

export default function ModalTema({
  zona,
  calificaciones = [],
  onClose,
  onIniciarEvaluacion,
  eyebrow = 'BIOMA ACADÉMICO DESBLOQUEADO'
}) {
  if (!zona) return null;
  const ejemplos = zona.ejemplos || [];
  const evaluaciones = zona.evaluaciones || [];

  return (
    <div className="rpg-modal" role="dialog" aria-modal="true" aria-label={zona.titulo}>
      <div className="rpg-modal__head">
        <div>
          <span className="hud-eyebrow hud-eyebrow--xp">{eyebrow}</span>
          <h3 className="rpg-modal__title">{zona.titulo}</h3>
        </div>
        <button onClick={onClose} className="btn-danger btn-sm" aria-label="Cerrar">
          <X size={16} /> Cerrar
        </button>
      </div>
      <div className="rpg-modal__body">
        <p className="section-sub">{zona.descripcion}</p>

        <div className="grid-2">
          <div className="zone-column">
            <h4 className="zone-column__title">📜 PERGAMINOS DE ESTUDIO</h4>
            {ejemplos.length > 0 ? (
              ejemplos.map(ej => (
                <div key={ej.id} className="pergamino-card">
                  <strong className="pergamino-card__title">{ej.titulo}</strong>
                  <pre className="rpg-code rpg-code--tight">{ej.contenido}</pre>
                </div>
              ))
            ) : (
              <p className="rpg-empty">Sin pergaminos publicados en esta zona.</p>
            )}
          </div>

          <div className="zone-column zone-column--boss">
            <h4 className="zone-column__title">⚔️ JEFE DE MAZMORRA</h4>
            {evaluaciones.length > 0 ? evaluaciones.map(ev => {
              const intento = calificaciones.find(c => c.evaluacion_id === ev.id);
              return (
                <div key={ev.id} className="boss-row">
                  <div>
                    <strong className="boss-row__title">{ev.titulo}</strong>
                    <span className="boss-row__meta">
                      📚 {ev.puntos_max ?? 30} de 100 pts • +{ev.xp_recompensa || 300} XP • {ev.total_preguntas ?? 0} preguntas
                    </span>
                  </div>
                  {intento ? (
                    <span className="badge badge-success">Completado ({intento.puntaje}% = {intento.puntos_ganados ?? '—'} pts)</span>
                  ) : (
                    <button onClick={() => onIniciarEvaluacion?.(ev)} className="btn-pro btn-pro-ai btn-sm">
                      <Swords size={15} /> Iniciar Combate
                    </button>
                  )}
                </div>
              );
            }) : (
              <p className="rpg-empty">Esta zona aún no tiene un jefe invocado.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
