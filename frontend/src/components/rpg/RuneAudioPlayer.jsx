import React, { useEffect, useRef, useState } from 'react';
import {
  Music, Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Repeat, Repeat1, X,
} from 'lucide-react';
import { useAudio } from '../../context/AudioContext';

/**
 * Reproductor de música en miniatura, integrado en el HUD como una runa.
 * Se despliega hacia abajo con controles finos para no tapar el mapa.
 */
export default function RuneAudioPlayer() {
  const {
    tracks, track, index, isPlaying, isMuted, volume, repeat, error,
    togglePlay, toggleMute, changeVolume, next, prev, selectTrack, toggleRepeat,
  } = useAudio();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const cerrarSiFuera = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) setOpen(false);
    };
    const cerrarConEscape = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('pointerdown', cerrarSiFuera);
    document.addEventListener('keydown', cerrarConEscape);
    return () => {
      document.removeEventListener('pointerdown', cerrarSiFuera);
      document.removeEventListener('keydown', cerrarConEscape);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative z-40">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={open ? 'Cerrar reproductor de música' : 'Abrir reproductor de música'}
        aria-expanded={open}
        title="Runa musical"
        className={`group relative grid h-11 w-11 place-items-center border-2 border-solid bg-[#170f3d] shadow-[inset_0_2px_0_0_#4b2fa3,inset_0_-3px_0_0_#0a0718,0_3px_0_0_#0a0718] hover:-translate-y-[1px] hover:border-[#ffd23f] active:translate-y-[2px] ${
          isPlaying && !isMuted ? 'border-[#ffd23f]' : 'border-[#8a5cf6]'
        }`}
      >
        <span
          aria-hidden="true"
          className="absolute inset-[5px] rotate-45 border border-solid border-[#8a5cf6]/50 group-hover:border-[#ffd23f]/70"
        />
        <Music size={17} className={isPlaying && !isMuted ? 'text-[#ffd23f]' : 'text-[#c4a7ff]'} />
        {isPlaying && !isMuted && (
          <span
            aria-hidden="true"
            className="absolute -right-1 -top-1 h-2 w-2 bg-[#3ddc84] shadow-[0_0_0_2px_#0a0718]"
          />
        )}
      </button>

      {open && (
        <section
          aria-label="Reproductor de música de fondo"
          className="absolute right-0 top-[calc(100%+8px)] w-[250px] max-w-[calc(100vw-2rem)] border-4 border-solid border-[#ffd23f] bg-[#1b1440] p-2 shadow-[inset_0_3px_0_0_#3b2d86,inset_0_-3px_0_0_#0a0718,0_4px_0_0_#0a0718]"
        >
          <header className="mb-1.5 flex items-center justify-between gap-2 border-b-2 border-solid border-[#3b2d86] pb-1">
            <span className="ui-px text-[7px] leading-none text-[#ffd23f]">RUNA MUSICAL</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="grid h-5 w-5 place-items-center bg-[#271d5c] text-[#b4aedb] hover:bg-[#8a5cf6] hover:text-[#fdf9ff]"
              aria-label="Cerrar reproductor"
              title="Cerrar reproductor"
            >
              <X size={11} />
            </button>
          </header>

          <div className="mb-1.5 min-w-0">
            <p className="truncate text-[16px] leading-tight text-[#f6efe0]">{track.title}</p>
            <p className="ui-px text-[6px] leading-relaxed text-[#b4aedb]">
              {track.mood} · {index + 1}/{tracks.length}
            </p>
          </div>

          <div className="mb-1.5 grid grid-cols-4 gap-1" role="group" aria-label="Elegir pista">
            {tracks.map((item) => {
              const activa = item.id === track.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => selectTrack(item.id)}
                  aria-pressed={activa}
                  title={item.title}
                  className={`h-6 border-2 border-solid font-[family-name:var(--font-px)] text-[6px] leading-none ${
                    activa
                      ? 'border-[#ffe08a] bg-[#ffd23f] text-[#120c2b]'
                      : 'border-[#0a0718] bg-[#170f3d] text-[#b4aedb] hover:border-[#8a5cf6] hover:text-[#ffd23f]'
                  }`}
                >
                  {item.short}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between gap-1">
            <button type="button" onClick={prev} aria-label="Pista anterior" title="Pista anterior" className="grid h-6 w-6 place-items-center bg-[#271d5c] text-[#f6efe0] hover:bg-[#8a5cf6]">
              <SkipBack size={11} />
            </button>
            <button
              type="button"
              onClick={togglePlay}
              aria-label={isPlaying ? 'Pausar música' : 'Reproducir música'}
              title={isPlaying ? 'Pausar música' : 'Reproducir música'}
              className="grid h-7 w-8 place-items-center border-2 border-solid border-[#ffe08a] bg-[#ffd23f] text-[#120c2b] hover:brightness-110"
            >
              {isPlaying ? <Pause size={13} /> : <Play size={13} />}
            </button>
            <button type="button" onClick={next} aria-label="Pista siguiente" title="Pista siguiente" className="grid h-6 w-6 place-items-center bg-[#271d5c] text-[#f6efe0] hover:bg-[#8a5cf6]">
              <SkipForward size={11} />
            </button>
            <button
              type="button"
              onClick={toggleRepeat}
              aria-label={repeat === 'one' ? 'Repetir solo esta pista' : 'Reproducir toda la lista'}
              title={repeat === 'one' ? 'Repetir una pista' : 'Reproducir toda la lista'}
              aria-pressed={repeat === 'one'}
              className={`grid h-6 w-6 place-items-center ${repeat === 'one' ? 'bg-[#4b2fa3] text-[#ffd23f]' : 'bg-[#271d5c] text-[#f6efe0] hover:bg-[#8a5cf6]'}`}
            >
              {repeat === 'one' ? <Repeat1 size={11} /> : <Repeat size={11} />}
            </button>
            <button
              type="button"
              onClick={toggleMute}
              aria-label={isMuted ? 'Activar sonido' : 'Silenciar'}
              title={isMuted ? 'Activar sonido' : 'Silenciar'}
              aria-pressed={isMuted}
              className={`grid h-6 w-6 place-items-center ${isMuted ? 'bg-[#4b2fa3] text-[#ff7a6b]' : 'bg-[#271d5c] text-[#f6efe0] hover:bg-[#8a5cf6]'}`}
            >
              {isMuted ? <VolumeX size={11} /> : <Volume2 size={11} />}
            </button>
          </div>

          <label className="mt-2 flex items-center gap-1.5">
            <span className="ui-px text-[6px] leading-none text-[#b4aedb]">VOL</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={(event) => changeVolume(event.target.value)}
              aria-label="Volumen de la música"
              className="h-[8px] min-w-0 flex-1 cursor-pointer appearance-none bg-[#0a0718] shadow-[inset_0_0_0_1px_#8a5cf6]"
            />
          </label>

          {error && <p role="status" className="mt-1 text-[13px] leading-tight text-[#ff7a6b]">{error}</p>}
        </section>
      )}
    </div>
  );
}
