import { AvatarHero16Bit, AlchemistWizard16Bit, GameMasterAvatar16Bit } from '../mapa/Sprites';
import { esAvatarImagen } from './avataresConfig';

export function AvatarPreset({ id = 'mago' }) {
  if (id === 'arquera') return <AvatarHero16Bit clase="Arquera Lógica" />;
  if (id === 'guerrero') return <AvatarHero16Bit clase="Guerrero" />;
  if (id === 'alquimista') return <AlchemistWizard16Bit />;
  if (id === 'game_master') return <GameMasterAvatar16Bit />;
  return <AvatarHero16Bit clase="Mago de Código" />;
}

export function AvatarEstudiante({ avatar, size = 34, className = '' }) {
  const estilo = { width: size, height: size };

  if (esAvatarImagen(avatar)) {
    return (
      <span className={`avatar-preset ${className}`.trim()} style={estilo}>
        <img src={avatar} alt="Avatar del héroe" className="avatar-img" />
      </span>
    );
  }

  return (
    <span className={`avatar-preset ${className}`.trim()} style={estilo}>
      <AvatarPreset id={avatar || 'mago'} />
    </span>
  );
}
