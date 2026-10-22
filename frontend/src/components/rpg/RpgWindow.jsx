import React from 'react';

/**
 * Ventana RPG reutilizable (marco pixel-art de 4px).
 * Props:
 *  - title: texto de la barra de título (Press Start 2P)
 *  - icon: emoji o nodo decorativo
 *  - actions: nodo opcional a la derecha de la barra
 *  - className: modificadores de tono (role-card--student, etc.)
 *  - onClose: si se entrega, muestra el botón de cierre
 */
export default function RpgWindow({
  title,
  icon,
  actions,
  onClose,
  className = '',
  children,
  ...rest
}) {
  return (
    <section className={`rpg-window ${className}`.trim()} {...rest}>
      {(title || icon || actions || onClose) && (
        <header className="rpg-window__titlebar">
          <span className="rpg-window__title">
            {icon && <span aria-hidden="true">{icon}</span>}
            {title && <span>{title}</span>}
          </span>
          {(actions || onClose) && (
            <span className="rpg-window__actions">
              {actions}
              {onClose && (
                <button type="button" className="rpg-window__close" onClick={onClose} aria-label="Cerrar ventana">
                  ✕
                </button>
              )}
            </span>
          )}
        </header>
      )}
      <div className="rpg-window__body">{children}</div>
    </section>
  );
}
