/**
 * generate-chiptune.mjs — Genera las pistas de música de fondo de Saga Académica.
 *
 * Sintetiza chiptune (8/16 bits) sin dependencias externas y escribe WAV PCM
 * mono de 16 bits en frontend/public/audio/. Los archivos resultantes se sirven
 * como estáticos y no dependen de ninguna CDN (las URLs externas caducan o
 * bloquean el hotlinking y la música deja de sonar).
 *
 * Uso:  npm run audio:generate           (desde la carpeta frontend)
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SR = 22050;
const STEPS_PER_BAR = 16;
const OUT_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'audio');

const SEMITONES = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const NOTE_RE = /^([A-G]#?)(-?\d)$/;

function midiOf(name) {
  const m = NOTE_RE.exec(name);
  if (!m) throw new Error(`Nota inválida: "${name}"`);
  return SEMITONES[m[1][0]] + (m[1][1] === '#' ? 1 : 0) + (Number(m[2]) + 1) * 12;
}

const hz = (midi) => 440 * Math.pow(2, (midi - 69) / 12);

/** "C5:2 E5:1 .:1" → [{ midi, steps }] (null = silencio) */
function parseSeq(text, label) {
  return text.trim().split(/\s+/).map((token) => {
    const [name, steps = '1'] = token.split(':');
    const n = Number(steps);
    if (!Number.isFinite(n) || n <= 0) throw new Error(`Duración inválida en ${label}: "${token}"`);
    return { midi: name === '.' ? null : midiOf(name), steps: n };
  });
}

/* ------------------------------- osciladores ------------------------------ */

const square = (duty) => (p) => (p < duty ? 1 : -1);
const triangle = (p) => 4 * Math.abs(p - 0.5) - 1;

/* ------------------------------ voces y ritmos ---------------------------- */

function renderVoice(buffer, seqText, opts) {
  const { stepSec, wave, gain, label, vibrato = 0, detuneCents = 0, decay = 2.4 } = opts;
  const ATTACK = 0.008;
  const RELEASE = 0.02;
  let cursor = 0;

  for (const { midi, steps } of parseSeq(seqText, label)) {
    const dur = steps * stepSec;
    if (midi !== null) {
      const freq = hz(midi) * Math.pow(2, detuneCents / 1200);
      const start = Math.round(cursor * SR);
      const length = Math.round(dur * SR);
      let phase = 0;

      for (let i = 0; i < length; i++) {
        const idx = start + i;
        if (idx >= buffer.length) break;
        const t = i / SR;
        const attack = Math.min(1, t / ATTACK);
        const release = Math.min(1, (dur - t) / RELEASE);
        const env = Math.max(0, Math.min(attack, release)) * Math.exp((-decay * t) / Math.max(dur, 0.05));
        const drift = vibrato ? 1 + vibrato * Math.sin(2 * Math.PI * 5.5 * t) : 1;
        phase += (freq * drift) / SR;
        buffer[idx] += wave(phase % 1) * env * gain;
      }
    }
    cursor += dur;
  }
}

/** Ruido reproducible (xorshift) para percusión determinista. */
function noiseSource(seed) {
  let s = seed | 0 || 0x9e3779b9;
  return () => {
    s ^= s << 13; s |= 0;
    s ^= s >>> 17;
    s ^= s << 5; s |= 0;
    return ((s >>> 0) / 0xffffffff) * 2 - 1;
  };
}

function renderDrums(buffer, pattern, stepSec, seed) {
  const noise = noiseSource(seed);
  const barSec = stepSec * STEPS_PER_BAR;
  const bars = Math.round(buffer.length / (barSec * SR));

  for (let bar = 0; bar < bars; bar++) {
    for (let step = 0; step < STEPS_PER_BAR; step++) {
      const hit = pattern[step];
      const startSec = bar * barSec + step * stepSec;
      if (!hit || hit === '.') continue;

      const length = Math.round((hit === 'h' ? 0.045 : 0.16) * SR);
      const start = Math.round(startSec * SR);

      for (let i = 0; i < length; i++) {
        const idx = start + i;
        if (idx >= buffer.length) break;
        const t = i / SR;

        if (hit === 'k') {
          const f = 130 * Math.exp(-22 * t) + 42;
          buffer[idx] += Math.sin(2 * Math.PI * f * t) * Math.exp(-16 * t) * 0.5;
        } else if (hit === 's') {
          const tone = Math.sin(2 * Math.PI * 185 * t) * 0.16;
          buffer[idx] += (noise() * 0.32 + tone) * Math.exp(-24 * t);
        } else {
          buffer[idx] += noise() * Math.exp(-95 * t) * 0.14;
        }
      }
    }
  }
}

/* --------------------------------- mezcla -------------------------------- */

function lowpass(buffer, cutoff = 7200) {
  const a = 1 - Math.exp((-2 * Math.PI * cutoff) / SR);
  let y = 0;
  for (let i = 0; i < buffer.length; i++) {
    y += a * (buffer[i] - y);
    buffer[i] = y;
  }
}

function normalize(buffer, peak = 0.88) {
  let max = 0;
  for (const s of buffer) max = Math.max(max, Math.abs(s));
  if (max > 0) {
    const k = peak / max;
    for (let i = 0; i < buffer.length; i++) buffer[i] *= k;
  }
}

function writeWav(path, samples) {
  const data = Buffer.alloc(samples.length * 2);
  for (let i = 0; i < samples.length; i++) {
    const clamped = Math.max(-1, Math.min(1, samples[i]));
    data.writeInt16LE(Math.round(clamped * 32767), i * 2);
  }
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + data.length, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(SR, 24);
  header.writeUInt32LE(SR * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write('data', 36);
  header.writeUInt32LE(data.length, 40);
  writeFileSync(path, Buffer.concat([header, data]));
}

/* --------------------------------- pistas -------------------------------- */

const TRACKS = [
  {
    file: 'aldea-del-gremio.wav',
    title: 'Aldea del Gremio',
    bpm: 116,
    bars: 8,
    songs: {
      lead: [
        'G4:2 C5:2 E5:2 G5:2 E5:2 D5:2 C5:2 D5:2',
        'F5:2 E5:2 D5:2 C5:2 D5:2 E5:2 G4:2 A4:2',
        'E5:2 G5:2 A5:2 G5:2 E5:2 D5:2 C5:2 D5:2',
        'A4:2 C5:2 F5:2 E5:2 D5:2 C5:2 A4:2 G4:2',
        'G4:2 C5:2 E5:2 G5:2 E5:2 D5:2 C5:2 D5:2',
        'F5:2 E5:2 D5:2 C5:2 D5:2 E5:2 G4:2 A4:2',
        'E5:2 G5:2 A5:2 G5:2 E5:2 D5:2 C5:2 D5:2',
        'D5:2 E5:2 D5:2 B4:2 C5:4 .:4',
      ],
      harmony: [
        'C4:2 E4:2 G4:2 E4:2 C4:2 E4:2 G4:2 E4:2',
        'F4:2 A3:2 C4:2 A3:2 F4:2 A3:2 C4:2 A3:2',
        'A3:2 C4:2 E4:2 C4:2 A3:2 C4:2 E4:2 C4:2',
        'F3:2 A3:2 C4:2 A3:2 G3:2 B3:2 D4:2 B3:2',
        'C4:2 E4:2 G4:2 E4:2 C4:2 E4:2 G4:2 E4:2',
        'F4:2 A3:2 C4:2 A3:2 F4:2 A3:2 C4:2 A3:2',
        'A3:2 C4:2 E4:2 C4:2 A3:2 C4:2 E4:2 C4:2',
        'G3:2 B3:2 D4:2 B3:2 C4:4 .:4',
      ],
      bass: [
        'C3:2 G3:2 C3:2 E3:2 C3:2 G3:2 F3:2 G3:2',
        'F3:2 C4:2 F3:2 A3:2 F3:2 C4:2 G3:2 B3:2',
        'A2:2 E3:2 A3:2 E3:2 A2:2 E3:2 C4:2 B3:2',
        'F3:2 C4:2 F3:2 A3:2 G3:2 D4:2 G3:2 B3:2',
        'C3:2 G3:2 C3:2 E3:2 C3:2 G3:2 F3:2 G3:2',
        'F3:2 C4:2 F3:2 A3:2 F3:2 C4:2 G3:2 B3:2',
        'A2:2 E3:2 A3:2 E3:2 A2:2 E3:2 C4:2 B3:2',
        'G3:2 D4:2 B3:2 D4:2 C3:8',
      ],
    },
    drums: 'k.h.s.h.k.h.s.h.',
  },
  {
    file: 'combate-contra-el-examen.wav',
    title: 'Combate contra el Examen',
    bpm: 152,
    bars: 8,
    songs: {
      lead: [
        'A4:2 C5:2 E5:2 A5:2 G5:2 E5:2 D5:2 C5:2',
        'B4:2 D5:2 F5:2 E5:2 D5:2 C5:2 B4:2 G4:2',
        'A4:2 C5:2 E5:2 A5:2 B5:2 A5:2 G5:2 E5:2',
        'F5:2 E5:2 D5:2 C5:2 D5:2 E5:2 A4:4',
        'A4:2 C5:2 E5:2 A5:2 G5:2 E5:2 D5:2 C5:2',
        'B4:2 D5:2 F5:2 E5:2 D5:2 C5:2 B4:2 G4:2',
        'E5:2 G5:2 B5:2 A5:2 G5:2 E5:2 D5:2 B4:2',
        'A4:1 B4:1 C5:1 D5:1 E5:2 D5:2 C5:2 B4:2 A4:4',
      ],
      harmony: [
        'A3:2 E4:2 A4:2 E4:2 A3:2 E4:2 A4:2 E4:2',
        'G3:2 D4:2 G4:2 D4:2 G3:2 D4:2 G4:2 D4:2',
        'A3:2 E4:2 A4:2 E4:2 F3:2 C4:2 F4:2 C4:2',
        'F3:2 C4:2 F4:2 C4:2 E3:2 B3:2 E4:2 B3:2',
        'A3:2 E4:2 A4:2 E4:2 A3:2 E4:2 A4:2 E4:2',
        'G3:2 D4:2 G4:2 D4:2 G3:2 D4:2 G4:2 D4:2',
        'A3:2 E4:2 A4:2 E4:2 G3:2 D4:2 G4:2 D4:2',
        'A3:2 E4:2 F3:2 C4:2 E3:2 B3:2 A3:4',
      ],
      bass: [
        'A2:2 A2:2 E3:2 A2:2 A2:2 C3:2 E3:2 A2:2',
        'G2:2 G2:2 D3:2 G2:2 G2:2 B2:2 D3:2 G2:2',
        'A2:2 A2:2 E3:2 A2:2 F2:2 F2:2 C3:2 F2:2',
        'F2:2 F2:2 C3:2 F2:2 E2:2 E2:2 B2:2 E2:2',
        'A2:2 A2:2 E3:2 A2:2 A2:2 C3:2 E3:2 A2:2',
        'G2:2 G2:2 D3:2 G2:2 G2:2 B2:2 D3:2 G2:2',
        'A2:2 A2:2 E3:2 A2:2 G2:2 G2:2 D3:2 G2:2',
        'A2:2 E3:2 F2:2 C3:2 E2:2 B2:2 A2:4',
      ],
    },
    drums: 'k.hks.h.k.hks.h.',
  },
  {
    file: 'mazmorra-de-datos.wav',
    title: 'Mazmorra de Datos',
    bpm: 84,
    bars: 8,
    songs: {
      lead: [
        'D4:4 A4:4 F5:4 E5:4',
        'D5:4 C5:4 A4:4 .:4',
        'A#4:4 A4:4 G4:4 F4:4',
        'E4:4 G4:4 A4:8',
        'D4:4 A4:4 F5:4 E5:4',
        'D5:4 C5:4 A4:4 .:4',
        'F4:4 G4:4 A4:4 C5:4',
        'D5:8 .:8',
      ],
      harmony: [
        'D3:2 F3:2 A3:2 F3:2 D3:2 F3:2 A3:2 F3:2',
        'D3:2 F3:2 A3:2 F3:2 C3:2 E3:2 A3:2 E3:2',
        'A#2:2 D3:2 F3:2 D3:2 A2:2 C3:2 F3:2 C3:2',
        'A2:2 C3:2 E3:2 C3:2 A2:2 C3:2 E3:2 G3:2',
        'D3:2 F3:2 A3:2 F3:2 D3:2 F3:2 A3:2 F3:2',
        'D3:2 F3:2 A3:2 F3:2 C3:2 E3:2 A3:2 E3:2',
        'A#2:2 D3:2 F3:2 D3:2 C3:2 E3:2 A3:2 E3:2',
        'D3:4 F3:4 A3:4 D4:4',
      ],
      bass: [
        'D2:8 A2:8',
        'D2:8 F2:8',
        'A#2:8 F2:8',
        'E2:8 A2:8',
        'D2:8 A2:8',
        'D2:8 F2:8',
        'A#2:8 C3:8',
        'D2:16',
      ],
    },
    drums: 'k.......k...h...',
  },
  {
    file: 'victoria-academica.wav',
    title: 'Victoria Académica',
    bpm: 138,
    bars: 4,
    songs: {
      lead: [
        'F5:2 F5:2 F5:2 A5:2 C6:4 A5:2 F5:2',
        'A#5:2 A5:2 G5:2 F5:2 G5:4 A5:4',
        'C6:2 A5:2 F5:2 A5:2 C6:4 D6:2 C6:2',
        'A#5:4 A5:4 G5:4 F5:4',
      ],
      harmony: [
        'F3:2 A3:2 C4:2 A3:2 F3:2 A3:2 C4:2 A3:2',
        'A#3:2 D4:2 F4:2 D4:2 C4:2 E4:2 G4:2 E4:2',
        'F4:2 A3:2 C4:2 A3:2 D4:2 F4:2 A4:2 F4:2',
        'A#3:2 D4:2 C4:2 E4:2 F3:4 A3:4',
      ],
      bass: [
        'F2:2 C3:2 F2:2 C3:2 F2:2 C3:2 A#2:2 C3:2',
        'A#2:2 F3:2 A#2:2 F3:2 C3:2 G3:2 C3:2 G3:2',
        'F2:2 C3:2 F2:2 C3:2 D3:2 A3:2 D3:2 A3:2',
        'A#2:2 F3:2 C3:2 G3:2 F2:4 C3:4',
      ],
    },
    drums: 'k..sk..sk..sk..s',
  },
];

/* --------------------------------- build --------------------------------- */

function buildTrack(track) {
  const stepSec = 60 / track.bpm / 4;
  const totalSec = track.bars * STEPS_PER_BAR * stepSec;
  const buffer = new Float32Array(Math.round(totalSec * SR) + Math.round(0.05 * SR));

  const seq = (voice) => track.songs[voice].join(' ');

  renderVoice(buffer, seq('harmony'), {
    stepSec, wave: square(0.25), gain: 0.1, label: `${track.file} harmony`, decay: 2.2,
  });
  renderVoice(buffer, seq('bass'), {
    stepSec, wave: triangle, gain: 0.42, label: `${track.file} bass`, decay: 1.6,
  });
  renderVoice(buffer, seq('lead'), {
    stepSec, wave: square(0.5), gain: 0.22, label: `${track.file} lead`, vibrato: 0.004, decay: 2.6,
  });
  renderDrums(buffer, track.drums, stepSec, track.bpm * 7919);

  lowpass(buffer);
  normalize(buffer);

  // Recorte del silencio de cola para que el bucle no tenga pausa audible.
  const out = buffer.subarray(0, Math.round(totalSec * SR));
  const path = resolve(OUT_DIR, track.file);
  writeWav(path, out);
  return { path, seconds: totalSec };
}

mkdirSync(OUT_DIR, { recursive: true });

for (const track of TRACKS) {
  const { path, seconds } = buildTrack(track);
  console.log(`♪ ${track.title.padEnd(28)} ${seconds.toFixed(1)}s  →  ${path}`);
}
console.log(`\nListo: ${TRACKS.length} pistas generadas en ${OUT_DIR}`);
