// Catálogo y utilidades de avatares. Separado de los componentes para Fast Refresh.
export const AVATARES_PRESET = [
  { id: 'mago', nombre: 'Mago de Código' },
  { id: 'arquera', nombre: 'Arquera Lógica' },
  { id: 'guerrero', nombre: 'Paladín de Datos' },
  { id: 'alquimista', nombre: 'Alquimista SQL' },
  { id: 'game_master', nombre: 'Game Master' }
];

export const esAvatarImagen = (avatar) =>
  typeof avatar === 'string' && /^(data:image\/|blob:|\/uploads\/|https?:\/\/)/.test(avatar);
