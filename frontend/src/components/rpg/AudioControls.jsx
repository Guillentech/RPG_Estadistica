import React, { useState } from 'react';
import {
  Music, Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Repeat, Repeat1, X,
} from 'lucide-react';
import { useAudio } from '../../context/AudioContext';

/**
 * Reproductor de música de fondo estilo consola de 16 bits.
 * Colapsado muestra un botón; al abrirlo aparece la playlist completa.
 */
export default function AudioControls() {
  const {
    tracks, track, index, isPlaying, isMuted, volume, repeat, error,
    togglePlay, toggleMute, changeVolume, next, prev, selectTrack, toggleRepeat,
  } = useAudio();
  const [open, setOpen] = useState(false);

  return (
    <div className={`bgm-player${open ? ' is-open' : ''}`}>
      {open && (
        <section className="bgm-player__panel" aria-label="Reproductor de música de fondo">
          <header className="bgm-player__head">
            <span className="bgm-player__title">
              <Music size={12} /> BGM
            </span>
            <button
              type="button"
              className="bgm-icon-btn bgm-icon-btn--ghost"
              onClick={() => setOpen(false)}
              aria-label="Cerrar reproductor"
              title="Cerrar reproductor"
            >
              <X size={12} />
            </button>
          </header>

          <div className="bgm-player__now">
            <span className="bgm-player__track">{track.title}</span>
            <span className="bgm-player__mood">{track.mood} · {index + 1}/{tracks.length}</span>
          </div>

          <div className="bgm-player__tracks" role="group" aria-label="Elegir pista">
            {tracks.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`bgm-chip${item.id === track.id ? ' is-active' : ''}`}
                onClick={() => selectTrack(item.id)}
                aria-pressed={item.id === track.id}
                title={item.title}
              >
                {item.short}
              </button>
            ))}
          </div>

          <div className="bgm-player__row">
            <button type="button" className="bgm-icon-btn" onClick={prev} aria-label="Pista anterior" title="Pista anterior">
              <SkipBack size={12} />
            </button>
            <button
              type="button"
              className="bgm-icon-btn bgm-icon-btn--gold"
              onClick={togglePlay}
              aria-label={isPlaying ? 'Pausar música' : 'Reproducir música'}
              title={isPlaying ? 'Pausar música' : 'Reproducir música'}
            >
              {isPlaying ? <Pause size={14} /> : <Play size={14} />}
            </button>
            <button type="button" className="bgm-icon-btn" onClick={next} aria-label="Pista siguiente" title="Pista siguiente">
              <SkipForward size={12} />
            </button>
            <button
              type="button"
              className="bgm-icon-btn"
              onClick={toggleRepeat}
              aria-label={repeat === 'one' ? 'Repetir solo esta pista' : 'Reproducir toda la lista'}
              title={repeat === 'one' ? 'Repetir una pista' : 'Reproducir toda la lista'}
              aria-pressed={repeat === 'one'}
            >
              {repeat === 'one' ? <Repeat1 size={12} /> : <Repeat size={12} />}
            </button>
            <button
              type="button"
              className="bgm-icon-btn"
              onClick={toggleMute}
              aria-label={isMuted ? 'Activar sonido' : 'Silenciar'}
              title={isMuted ? 'Activar sonido' : 'Silenciar'}
              aria-pressed={isMuted}
            >
              {isMuted ? <VolumeX size={12} /> : <Volume2 size={12} />}
            </button>
          </div>

          <label className="bgm-player__volume">
            <span>Vol</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={(event) => changeVolume(event.target.value)}
              aria-label="Volumen de la música"
            />
          </label>

          {error && <p className="bgm-player__error" role="status">{error}</p>}
        </section>
      )}

      <button
        type="button"
        className={`bgm-fab${isPlaying && !isMuted ? ' is-playing' : ''}`}
        onClick={() => setOpen((value) => !value)}
        aria-label="Abrir reproductor de música"
        aria-expanded={open}
        title="Música de fondo"
      >
        <Music size={16} />
      </button>
    </div>
  );
}
