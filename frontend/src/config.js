// URL única del backend para nuevas funcionalidades (entregas, avatares y descargas).
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// Convierte una ruta pública del backend (/uploads/...) en una URL descargable.
export const urlArchivo = (ruta) => (ruta ? `${API_URL}${ruta}` : null);
