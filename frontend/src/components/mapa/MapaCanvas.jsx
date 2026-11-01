import { useEffect, useRef } from 'react';
import {
  ALTO_LOGICO,
  ANCHO_LOGICO,
  COLS_MAPA,
  FILAS_MAPA,
  TILE_SIZE
} from '../../game/terreno';

const dibujarTile16x16 = (ctx, ch, col, fila, tick) => {
  const x = col * TILE_SIZE;
  const y = fila * TILE_SIZE;
  const esLadoEste = col >= 16;

  if (ch === '~') {
    ctx.fillStyle = (col >= 13 && col <= 16) ? '#0284c7' : '#082f49';
    ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

    const offsetOla = (tick + fila * 3 + col * 2) % 16;
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(x + 2, y + offsetOla, 5, 2);
    ctx.fillRect(x + 9, y + ((offsetOla + 8) % 16), 4, 1);
    return;
  }

  ctx.fillStyle = esLadoEste ? '#059669' : '#22c55e';
  ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

  ctx.fillStyle = esLadoEste ? '#047857' : '#16a34a';
  ctx.fillRect(x + 2, y + 3, 3, 2);
  ctx.fillRect(x + 11, y + 12, 2, 2);

  if (ch === '^') {
    ctx.fillStyle = '#334155';
    ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
    ctx.fillStyle = '#475569';
    ctx.fillRect(x + 1, y + 1, 14, 12);
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(x + 2, y + 2, 5, 3);
    ctx.fillRect(x + 9, y + 6, 4, 3);
  } else if (ch === ',') {
    ctx.fillStyle = '#15803d';
    ctx.fillRect(x + 5, y + 7, 4, 4);
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(x + 6, y + 6, 2, 2);
    ctx.fillRect(x + 11, y + 10, 2, 2);
  } else if (ch === '*') {
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(x + 6, y + 5, 4, 6);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(x + 7, y + 4, 2, 6);
    ctx.fillStyle = '#e0f2fe';
    ctx.fillRect(x + 7, y + 5, 1, 2);
  } else if (ch === '=') {
    ctx.fillStyle = '#57534e';
    ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
    ctx.fillStyle = '#a8a29e';
    ctx.fillRect(x + 1, y + 1, 14, 14);
    ctx.fillStyle = '#d6d3d1';
    ctx.fillRect(x + 2, y + 2, 5, 4);
    ctx.fillRect(x + 9, y + 3, 4, 4);
    ctx.fillRect(x + 3, y + 9, 6, 4);
    ctx.fillStyle = '#78716c';
    ctx.fillRect(x + 8, y + 2, 1, 5);
    ctx.fillRect(x + 2, y + 7, 12, 1);
    ctx.fillRect(x + 10, y + 9, 3, 4);
  } else if (ch === 'B') {
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
    ctx.fillStyle = '#451a03';
    ctx.fillRect(x, y + 1, TILE_SIZE, 14);
    ctx.fillStyle = '#b45309';
    ctx.fillRect(x, y + 1, TILE_SIZE, 2);
    ctx.fillRect(x, y + 13, TILE_SIZE, 2);
    for (let px = 1; px < TILE_SIZE; px += 4) {
      ctx.fillStyle = px % 8 === 1 ? '#92400e' : '#78350f';
      ctx.fillRect(x + px, y + 3, 3, 10);
    }
  } else if (ch === '#' || ch === 'T') {
    const esArcano = ch === 'T';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.fillRect(x + 2, y + 13, 12, 3);
    ctx.fillStyle = '#78350f';
    ctx.fillRect(x + 6, y + 10, 4, 5);
    ctx.fillStyle = esArcano ? '#064e3b' : '#14532d';
    ctx.fillRect(x + 2, y + 4, 12, 7);
    ctx.fillStyle = esArcano ? '#059669' : '#16a34a';
    ctx.fillRect(x + 3, y + 2, 10, 6);
    ctx.fillStyle = esArcano ? '#34d399' : '#4ade80';
    ctx.fillRect(x + 5, y + 1, 6, 3);
  }
};

export default function MapaCanvas({ terreno, onTileClick, activo = true, className = '' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!activo) return undefined;
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    let frame = 0;
    let animId;

    const renderLoop = () => {
      frame++;
      const tickAgua = Math.floor(frame / 8);

      for (let fila = 0; fila < FILAS_MAPA; fila++) {
        for (let col = 0; col < COLS_MAPA; col++) {
          const ch = terreno?.[fila]?.[col] || '.';
          dibujarTile16x16(ctx, ch, col, fila, tickAgua);
        }
      }

      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      for (let c = 0; c <= COLS_MAPA; c++) {
        ctx.fillRect(c * TILE_SIZE, 0, 1, ALTO_LOGICO);
      }
      for (let f = 0; f <= FILAS_MAPA; f++) {
        ctx.fillRect(0, f * TILE_SIZE, ANCHO_LOGICO, 1);
      }

      animId = requestAnimationFrame(renderLoop);
    };

    renderLoop();
    return () => cancelAnimationFrame(animId);
  }, [terreno, activo]);

  const manejarClick = (event) => {
    if (!onTileClick || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const col = Math.floor(((event.clientX - rect.left) / rect.width) * COLS_MAPA);
    const fila = Math.floor(((event.clientY - rect.top) / rect.height) * FILAS_MAPA);
    onTileClick(col, fila);
  };

  return (
    <canvas
      ref={canvasRef}
      width={ANCHO_LOGICO}
      height={ALTO_LOGICO}
      onClick={manejarClick}
      className={`pixel-canvas ${className}`.trim()}
      style={{ cursor: onTileClick ? 'pointer' : 'default' }}
    />
  );
}
