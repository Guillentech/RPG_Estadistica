import { COLS_MAPA, FILAS_MAPA, TERRENOS } from './terreno.js';

export { COLS_MAPA, FILAS_MAPA };

export const esTileTransitable = (terreno, col, fila) => {
  if (!Number.isInteger(col) || !Number.isInteger(fila)) return false;
  if (col < 0 || col >= COLS_MAPA || fila < 0 || fila >= FILAS_MAPA) return false;
  const tile = terreno?.[fila]?.[col];
  return Boolean(tile && tile !== '~' && tile !== '^');
};

export const tileAPorcentaje = (col, fila) => ({
  left: `${((col + 0.5) / COLS_MAPA) * 100}%`,
  top: `${((fila + 0.5) / FILAS_MAPA) * 100}%`
});

const clave = (col, fila) => `${col},${fila}`;

const buscarTileLibre = (terreno, col, fila, ocupadas) => {
  const inicioCol = Math.max(2, Math.min(COLS_MAPA - 3, Math.round(col)));
  const inicioFila = Math.max(2, Math.min(FILAS_MAPA - 3, Math.round(fila)));

  for (let radio = 0; radio <= 12; radio++) {
    for (let dy = -radio; dy <= radio; dy++) {
      for (let dx = -radio; dx <= radio; dx++) {
        const c = inicioCol + dx;
        const f = inicioFila + dy;
        if (esTileTransitable(terreno, c, f) && !ocupadas.has(clave(c, f))) {
          return { col: c, fila: f };
        }
      }
    }
  }

  return { col: inicioCol, fila: inicioFila };
};

const distribuirColumnas = (cantidad) => {
  if (cantidad <= 1) return [15];
  const inicio = 4;
  const fin = 26;
  const paso = (fin - inicio) / (cantidad - 1);
  return Array.from({ length: cantidad }, (_, i) => Math.round(inicio + paso * i));
};

const filasDeSendero = (filas) => {
  if (filas === 2) return [5, 11];
  if (filas === 3) return [4, 8, 12];
  return [3, 7, 11, 14];
};

// Genera un sendero serpenteante determinista para 1..32 nodos.
export const calcularSendero = (total, terreno = TERRENOS.pradera) => {
  const cantidad = Math.max(0, Math.round(total));
  if (cantidad === 0) return [];

  const filas = cantidad <= 12 ? 2 : cantidad <= 18 ? 3 : 4;
  const porFila = Math.ceil(cantidad / filas);
  const columnas = distribuirColumnas(porFila);
  const yPorFila = filasDeSendero(filas);
  const ocupadas = new Set();
  const posiciones = [];

  for (let i = 0; i < cantidad; i++) {
    const indiceFila = Math.floor(i / porFila);
    const indiceColumna = i % porFila;
    const columnaEnFila = indiceFila % 2 === 0
      ? indiceColumna
      : porFila - 1 - indiceColumna;
    const col = columnas[columnaEnFila] ?? 15;
    const fila = yPorFila[indiceFila] ?? 8;
    const libre = buscarTileLibre(terreno, col, fila, ocupadas);
    ocupadas.add(clave(libre.col, libre.fila));
    posiciones.push(libre);
  }

  return posiciones;
};

// Genera la cuadrícula de Ciudadelas del Mapa Continental.
export const calcularCuadricula = (total, terreno = TERRENOS.continental) => {
  const cantidad = Math.max(0, Math.round(total));
  if (cantidad === 0) return [];

  const fijas = [
    { col: 7, fila: 4 },
    { col: 22, fila: 4 },
    { col: 7, fila: 12 },
    { col: 22, fila: 12 }
  ];

  if (cantidad <= 4) {
    const ocupadas = new Set();
    return fijas.slice(0, cantidad).map(p => {
      const libre = buscarTileLibre(terreno, p.col, p.fila, ocupadas);
      ocupadas.add(clave(libre.col, libre.fila));
      return libre;
    });
  }

  const columnas = [7, 15, 23];
  const filas = Math.ceil(cantidad / columnas.length);
  const yInicio = 4;
  const yFin = 12;
  const pasoY = filas > 1 ? (yFin - yInicio) / (filas - 1) : 0;
  const ocupadas = new Set();
  const posiciones = [];

  for (let i = 0; i < cantidad; i++) {
    const col = columnas[i % columnas.length];
    const fila = Math.round(yInicio + Math.floor(i / columnas.length) * pasoY);
    const libre = buscarTileLibre(terreno, col, fila, ocupadas);
    ocupadas.add(clave(libre.col, libre.fila));
    posiciones.push(libre);
  }

  return posiciones;
};

export const calcularPosicionJefe = (terreno = TERRENOS.pradera, nodos = []) => {
  const ocupadas = new Set(nodos.map(n => clave(n.col, n.fila)));
  const hayConflicto = (col, fila) => nodos.some(n =>
    Math.abs(n.col - col) <= 4 && Math.abs(n.fila - fila) <= 3
  );

  const columnas = [15, 20, 10, 24, 6];
  const filas = [14, 13, 12];

  for (const fila of filas) {
    for (const col of columnas) {
      if (!esTileTransitable(terreno, col, fila) || ocupadas.has(clave(col, fila))) continue;
      if (!hayConflicto(col, fila)) return { col, fila };
    }
  }

  return buscarTileLibre(terreno, 15, 14, ocupadas);
};

export const puntoInicio = (terreno = TERRENOS.continental) => {
  const candidatos = [
    { col: 15, fila: 8 },
    { col: 8, fila: 8 },
    { col: 15, fila: 14 },
    { col: 5, fila: 5 }
  ];
  const ocupadas = new Set();
  for (const candidato of candidatos) {
    if (esTileTransitable(terreno, candidato.col, candidato.fila)) return candidato;
  }
  return buscarTileLibre(terreno, 15, 8, ocupadas);
};

export const posicionesDeTemas = (temas = [], terreno = TERRENOS.pradera) => {
  const calculadas = calcularSendero(temas.length, terreno);
  return temas.map((tema, indice) => {
    const tienePosicion = Number.isInteger(tema.pos_col) && Number.isInteger(tema.pos_fila)
      && esTileTransitable(terreno, tema.pos_col, tema.pos_fila);
    return {
      tema,
      col: tienePosicion ? tema.pos_col : calculadas[indice]?.col ?? 15,
      fila: tienePosicion ? tema.pos_fila : calculadas[indice]?.fila ?? 8
    };
  });
};

export const posicionesDeUnidades = (unidades = [], terreno = TERRENOS.continental) => {
  const calculadas = calcularCuadricula(unidades.length, terreno);
  return unidades.map((unidad, indice) => {
    const tienePosicion = Number.isInteger(unidad.pos_col) && Number.isInteger(unidad.pos_fila)
      && esTileTransitable(terreno, unidad.pos_col, unidad.pos_fila);
    return {
      unidad,
      col: tienePosicion ? unidad.pos_col : calculadas[indice]?.col ?? 7,
      fila: tienePosicion ? unidad.pos_fila : calculadas[indice]?.fila ?? 4
    };
  });
};
