// URL única del backend para todas las llamadas de la app.
// En desarrollo apunta al backend local; en producción usa el mismo origen
// (el build se sirve desde Express) salvo que VITE_API_URL defina otra URL.
export const API_URL =
  import.meta.env.VITE_API_URL ??
  (import.meta.env.DEV ? 'http://localhost:4000' : '');

// Convierte una ruta pública del backend (/uploads/...) en una URL descargable.
export const urlArchivo = (ruta) => (ruta ? `${API_URL}${ruta}` : null);
