import React, { useState } from 'react';
import { FileText, Send, UploadCloud, X } from 'lucide-react';
import { API_URL, urlArchivo } from '../../config';

const MAX_ARCHIVO_BYTES = 10 * 1024 * 1024;
const EXTENSIONES_PERMITIDAS = ['.pdf', '.doc', '.docx'];

const extensionDe = (nombre = '') => {
  const punto = nombre.lastIndexOf('.');
  return punto >= 0 ? nombre.slice(punto).toLowerCase() : '';
};

export default function ModalEntrega({ tarea, entrega, estudianteId, onClose, onEnviada }) {
  const [contenido, setContenido] = useState(entrega?.contenido || '');
  const [archivo, setArchivo] = useState(null);
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  if (!tarea) return null;

  const archivoActual = entrega?.archivo_ruta
    ? {
        nombre: entrega.archivo_nombre || 'Documento adjunto',
        url: urlArchivo(entrega.archivo_ruta)
      }
    : null;

  const handleArchivo = (evento) => {
    const seleccionado = evento.target.files?.[0];
    if (!seleccionado) return;

    if (!EXTENSIONES_PERMITIDAS.includes(extensionDe(seleccionado.name))) {
      setError('Solo se permiten archivos PDF, DOC o DOCX.');
      evento.target.value = '';
      return;
    }
    if (seleccionado.size > MAX_ARCHIVO_BYTES) {
      setError('El archivo supera el tamaño máximo permitido de 10 MB.');
      evento.target.value = '';
      return;
    }

    setArchivo(seleccionado);
    setError('');
  };

  const enviarEntrega = async (evento) => {
    evento.preventDefault();
    if (!contenido.trim() && !archivo) {
      setError('Adjunta un archivo o redacta el pergamino de tu entrega.');
      return;
    }

    setEnviando(true);
    setError('');
    try {
      const datos = new FormData();
      datos.append('tarea_id', tarea.id);
      datos.append('estudiante_id', estudianteId);
      datos.append('contenido', contenido.trim());
      if (archivo) datos.append('archivo', archivo);

      const res = await fetch(`${API_URL}/api/entregas`, {
        method: 'POST',
        body: datos
      });
      const respuesta = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(respuesta.error || 'No se pudo enviar la misión.');
      }

      onEnviada?.(respuesta.mensaje || '¡Misión entregada con éxito!');
    } catch (err) {
      setError(err.message || 'Error al enviar la misión.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="rpg-modal" role="dialog" aria-modal="true" aria-label={`Entregar misión: ${tarea.titulo}`}>
      <div className="rpg-modal__head">
        <div>
          <span className="hud-eyebrow hud-eyebrow--xp">MISIÓN DE LABORATORIO</span>
          <h3 className="rpg-modal__title">{tarea.titulo}</h3>
        </div>
        <button type="button" onClick={onClose} className="btn-danger btn-sm" aria-label="Cerrar">
          <X size={16} /> Cerrar
        </button>
      </div>

      <form className="rpg-modal__body rpg-modal__body--column" onSubmit={enviarEntrega}>
        <p className="section-sub">{tarea.descripcion}</p>

        {archivoActual && (
          <div className="entrega-modal__archivo">
            <FileText size={16} />
            <span>Archivo actual: </span>
            <a
              href={archivoActual.url}
              download={archivoActual.nombre}
              target="_blank"
              rel="noopener noreferrer"
              className="quest-file"
            >
              {archivoActual.nombre}
            </a>
          </div>
        )}

        <textarea
          className="input-pro"
          rows="5"
          placeholder="Escribe aquí tu código, comentario o respuesta de la misión..."
          value={contenido}
          onChange={(evento) => setContenido(evento.target.value)}
        />

        <label className="file-drop__label" htmlFor="archivo-entrega">
          📎 Adjuntar PDF, DOC o DOCX (máx. 10 MB)
        </label>
        <input
          id="archivo-entrega"
          type="file"
          className="input-pro"
          accept=".pdf,.doc,.docx"
          onChange={handleArchivo}
        />

        {archivo && (
          <div className="entrega-modal__archivo">
            <UploadCloud size={16} />
            <span>{archivo.name} · {(archivo.size / (1024 * 1024)).toFixed(2)} MB</span>
          </div>
        )}

        <p className="section-sub">
          Solo hay una entrega por misión. Si subes un archivo nuevo, reemplazará al anterior.
        </p>

        {error && <p className="perfil-mensaje is-error" role="alert">{error}</p>}

        <div className="entrega-modal__acciones">
          <button type="button" className="btn-pro" onClick={onClose} disabled={enviando}>
            Cancelar
          </button>
          <button type="submit" className="btn-pro btn-pro-primary" disabled={enviando}>
            <Send size={15} /> {enviando ? 'Enviando...' : entrega ? 'Actualizar entrega' : 'Enviar misión'}
          </button>
        </div>
      </form>
    </div>
  );
}
