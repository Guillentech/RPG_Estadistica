import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

const BASE = import.meta.env.BASE_URL || '/';

/**
 * Playlist de música de fondo de Saga Académica.
 * Las pistas se generan con `npm run audio:generate` y viven en public/audio,
 * así que la música funciona sin CDN ni conexión a internet.
 */
export const MUSIC_TRACKS = [
  { id: 'aldea', title: 'Aldea del Gremio', short: 'Aldea', mood: 'Exploración', src: `${BASE}audio/aldea-del-gremio.mp3` },
  { id: 'combate', title: 'Combate contra el Examen', short: 'Combate', mood: 'Evaluación', src: `${BASE}audio/combate-contra-el-examen.mp3` },
  { id: 'mazmorra', title: 'Mazmorra de Datos', short: 'Mazmorra', mood: 'Tensión', src: `${BASE}audio/mazmorra-de-datos.mp3` },
  { id: 'victoria', title: 'Victoria Académica', short: 'Victoria', mood: 'Logro', src: `${BASE}audio/victoria-academica.mp3` },
];

const STORAGE = {
  volume: 'lms_bgm_volume',
  mute: 'lms_bgm_mute',
  track: 'lms_bgm_track',
  repeat: 'lms_bgm_repeat',
};

const DEFAULT_VOLUME = 0.35;

function readStored(key, fallback) {
  try {
    const value = window.localStorage.getItem(key);
    return value === null ? fallback : value;
  } catch {
    return fallback;
  }
}

function writeStored(key, value) {
  try {
    window.localStorage.setItem(key, String(value));
  } catch {
    /* modo privado: se ignora, la música sigue funcionando */
  }
}

const clamp = (n) => Math.min(1, Math.max(0, n));

const AudioContext = createContext(null);

export const AudioProvider = ({ children }) => {
  const [index, setIndex] = useState(() => {
    const stored = Number(readStored(STORAGE.track, 0));
    return Number.isInteger(stored) && stored >= 0 && stored < MUSIC_TRACKS.length ? stored : 0;
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(() => readStored(STORAGE.mute, '0') === '1');
  const [volume, setVolume] = useState(() => {
    const stored = Number(readStored(STORAGE.volume, DEFAULT_VOLUME));
    return Number.isFinite(stored) ? clamp(stored) : DEFAULT_VOLUME;
  });
  const [repeat, setRepeat] = useState(() => (readStored(STORAGE.repeat, 'all') === 'one' ? 'one' : 'all'));
  const [error, setError] = useState(null);

  const audioRef = useRef(null);
  const track = MUSIC_TRACKS[index];

  // Sincroniza la intención de reproducción con el elemento <audio>.
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return undefined;

    if (!isPlaying) {
      el.pause();
      return undefined;
    }

    let cancelled = false;
    const promise = el.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch((err) => {
        if (cancelled || err?.name === 'AbortError') return;
        setIsPlaying(false);
        setError('El navegador bloqueó la reproducción. Pulsa ▶ para iniciar la música.');
      });
    }
    return () => {
      cancelled = true;
    };
  }, [isPlaying, index]);

  useEffect(() => {
    const el = audioRef.current;
    if (el) el.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  useEffect(() => writeStored(STORAGE.volume, volume), [volume]);
  useEffect(() => writeStored(STORAGE.mute, isMuted ? '1' : '0'), [isMuted]);
  useEffect(() => writeStored(STORAGE.track, index), [index]);
  useEffect(() => writeStored(STORAGE.repeat, repeat), [repeat]);

  const togglePlay = useCallback(() => {
    setError(null);
    setIsPlaying((playing) => !playing);
  }, []);

  const toggleMute = useCallback(() => setIsMuted((muted) => !muted), []);

  const changeVolume = useCallback((value) => {
    const next = clamp(Number(value));
    setVolume(next);
    if (next > 0) setIsMuted(false);
  }, []);

  const goTo = useCallback((nextIndex) => {
    setError(null);
    setIndex(((nextIndex % MUSIC_TRACKS.length) + MUSIC_TRACKS.length) % MUSIC_TRACKS.length);
  }, []);

  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  const prev = useCallback(() => goTo(index - 1), [goTo, index]);
  const selectTrack = useCallback((id) => {
    const target = MUSIC_TRACKS.findIndex((t) => t.id === id);
    if (target >= 0) goTo(target);
  }, [goTo]);

  const toggleRepeat = useCallback(() => setRepeat((mode) => (mode === 'one' ? 'all' : 'one')), []);

  const handleEnded = useCallback(() => {
    if (repeat === 'one') return; // el atributo loop ya reinicia la pista
    setIndex((current) => (current + 1) % MUSIC_TRACKS.length);
  }, [repeat]);

  const value = useMemo(() => ({
    tracks: MUSIC_TRACKS,
    track,
    index,
    isPlaying,
    isMuted,
    volume,
    repeat,
    error,
    togglePlay,
    toggleMute,
    changeVolume,
    next,
    prev,
    selectTrack,
    toggleRepeat,
  }), [track, index, isPlaying, isMuted, volume, repeat, error, togglePlay, toggleMute, changeVolume, next, prev, selectTrack, toggleRepeat]);

  return (
    <AudioContext.Provider value={value}>
      <audio
        ref={audioRef}
        src={track.src}
        loop={repeat === 'one'}
        preload="metadata"
        onEnded={handleEnded}
        onError={() => {
          setError(`No se pudo cargar "${track.title}". Ejecuta npm run audio:generate.`);
          setIsPlaying(false);
        }}
        hidden
      />
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio debe usarse dentro de un AudioProvider');
  }
  return context;
};
