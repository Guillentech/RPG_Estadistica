import React, { useEffect, useRef } from 'react';

export default function ToastLogros({ logros = [], onClose, duracion = 6500 }) {
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (logros.length === 0) return undefined;
    const temporizador = setTimeout(() => onCloseRef.current?.(), duracion);
    return () => clearTimeout(temporizador);
  }, [logros, duracion]);

  if (logros.length === 0) return null;

  return (
    <div className="toast-logros" role="status" aria-live="polite">
      <div className="toast-logros__titulo">🏆 ¡LOGRO DESBLOQUEADO!</div>
      {logros.map((logro) => (
        <div key={logro.id ?? logro.codigo} className="toast-logro">
          <span className="toast-logro__icono" aria-hidden="true">{logro.icono}</span>
          <div className="toast-logro__texto">
            <strong>{logro.nombre}</strong>
            <span>{logro.descripcion}</span>
            {Number(logro.xp_bonus) > 0 && <em>+{logro.xp_bonus} XP de bonificación</em>}
          </div>
        </div>
      ))}
    </div>
  );
}
