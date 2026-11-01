import React, { useRef, useState } from 'react';
import { Check, ImagePlus, Save } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AvatarPreset } from './Avatares';
import { AVATARES_PRESET, esAvatarImagen } from './avataresConfig';

const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
const TIPOS_IMAGEN = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];

export default function PerfilEstudiante() {
  const { user, actualizarAvatarEstudiante } = useAuth();
  const fileInputRef = useRef(null);

  const avatarActual = user?.avatar || 'mago';
  const [seleccion, setSeleccion] = useState(esAvatarImagen(avatarActual) ? null : avatarActual);
  const [preview, setPreview] = useState(esAvatarImagen(avatarActual) ? avatarActual : null);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState({ texto: '', error: false });

  const elegirPreset = (id) => {
    setSeleccion(id);
    setPreview(null);
    setMensaje({ texto: '', error: false });
  };

  const handleArchivo = (evento) => {
    const archivo = evento.target.files?.[0];
    if (!archivo) return;

    if (!TIPOS_IMAGEN.includes(archivo.type)) {
      setMensaje({ texto: 'Elige una imagen PNG, JPG, WEBP o GIF.', error: true });
      evento.target.value = '';
      return;
    }
    if (archivo.size > MAX_AVATAR_BYTES) {
      setMensaje({ texto: 'La imagen supera el máximo de 2 MB.', error: true });
      evento.target.value = '';
      return;
    }

    const lector = new FileReader();
    lector.onloadend = () => {
      setPreview(lector.result);
      setSeleccion(null);
      setMensaje({ texto: 'Vista previa lista. Pulsa "Guardar avatar" para confirmar.', error: false });
    };
    lector.onerror = () => {
      setMensaje({ texto: 'No se pudo leer la imagen seleccionada.', error: true });
    };
    lector.readAsDataURL(archivo);
  };

  const guardarAvatar = async () => {
    const avatar = preview || seleccion;
    if (!avatar) {
      setMensaje({ texto: 'Elige un avatar de la galería o sube una imagen.', error: true });
      return;
    }

    setGuardando(true);
    setMensaje({ texto: '', error: false });
    const resultado = await actualizarAvatarEstudiante?.(avatar) ?? { ok: false, error: 'Función de avatar no disponible.' };
    setGuardando(false);

    if (!resultado.ok) {
      setMensaje({ texto: resultado.error || 'No se pudo guardar el avatar.', error: true });
      return;
    }

    setMensaje({ texto: '¡Identidad del héroe actualizada y guardada en el Gremio!', error: false });
  };

  return (
    <div className="card-pro">
      <div className="profile-head">
        <div className="perfil-preview">
          {preview ? (
            <img src={preview} alt="Vista previa del avatar" />
          ) : (
            <AvatarPreset id={seleccion || 'mago'} />
          )}
        </div>
        <div className="profile-head__info">
          <h3 className="section-title section-title--gold profile-head__title">🛡️ PERFIL DEL HÉROE</h3>
          <p className="profile-head__copy">
            Elige un avatar de la galería del Gremio o sube una imagen propia de hasta 2 MB.
            Tu elección se guarda en la base de datos y se mantiene al volver a iniciar sesión.
          </p>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleArchivo}
          />
          <button
            type="button"
            className="btn-pro btn-pro-primary btn-sm"
            onClick={() => fileInputRef.current?.click()}
          >
            <ImagePlus size={15} /> Subir imagen propia
          </button>
        </div>
      </div>

      <h4 className="zone-column__title">🎨 GALERÍA DE AVATARES</h4>
      <div className="perfil-grid" role="group" aria-label="Galería de avatares">
        {AVATARES_PRESET.map((avatar) => {
          const activo = !preview && seleccion === avatar.id;
          return (
            <button
              key={avatar.id}
              type="button"
              className={`perfil-avatar-option ${activo ? 'is-selected' : ''}`}
              onClick={() => elegirPreset(avatar.id)}
              aria-pressed={activo}
            >
              <AvatarPreset id={avatar.id} />
              <span>{avatar.nombre}</span>
              {activo && <Check size={14} aria-hidden="true" />}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        className="btn-pro btn-pro-primary"
        onClick={guardarAvatar}
        disabled={guardando}
      >
        <Save size={16} /> {guardando ? 'Guardando...' : 'Guardar avatar'}
      </button>

      {mensaje.texto && (
        <p className={`perfil-mensaje ${mensaje.error ? 'is-error' : ''}`} role="status">
          {mensaje.texto}
        </p>
      )}
    </div>
  );
}
