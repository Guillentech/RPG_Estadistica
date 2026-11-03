// 🏆 Utilidades de logros: recuerda qué medallas ya vio el héroe para no repetir toasts.
const claveVistos = (estudianteId) => `logros_vistos_${estudianteId}`;

export const leerLogrosVistos = (estudianteId) => {
  if (!estudianteId) return null;
  try {
    const guardado = localStorage.getItem(claveVistos(estudianteId));
    if (guardado === null) return null;
    const lista = JSON.parse(guardado);
    return Array.isArray(lista) ? lista : [];
  } catch {
    return [];
  }
};

export const guardarLogrosVistos = (estudianteId, ids = []) => {
  if (!estudianteId) return;
  try {
    localStorage.setItem(claveVistos(estudianteId), JSON.stringify([...new Set(ids)]));
  } catch {
    // Si el almacenamiento está lleno, la app sigue funcionando sin persistir la marca.
  }
};

export const marcarLogrosVistos = (estudianteId, logros = []) => {
  const previos = leerLogrosVistos(estudianteId) || [];
  const ids = logros.map((logro) => logro.id).filter(Boolean);
  guardarLogrosVistos(estudianteId, [...previos, ...ids]);
};

/**
 * Compara las medallas desbloqueadas con las ya vistas.
 * La primera visita solo guarda la línea base (sin toast) para no inundar al héroe.
 */
export const detectarLogrosNuevos = (estudianteId, logros = []) => {
  const desbloqueados = logros.filter((logro) => logro.desbloqueado);
  const vistos = leerLogrosVistos(estudianteId);

  if (vistos === null) {
    guardarLogrosVistos(estudianteId, desbloqueados.map((logro) => logro.id));
    return [];
  }

  const conjunto = new Set(vistos);
  const nuevos = desbloqueados.filter((logro) => !conjunto.has(logro.id));
  if (nuevos.length > 0) marcarLogrosVistos(estudianteId, logros);
  return nuevos;
};
