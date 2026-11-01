import test from 'node:test';
import assert from 'node:assert/strict';
import { TERRENOS, COLS_MAPA, FILAS_MAPA } from './terreno.js';
import {
  calcularSendero,
  calcularCuadricula,
  calcularPosicionJefe,
  esTileTransitable,
  puntoInicio,
  posicionesDeTemas
} from './mapa.js';

test('todos los terrenos miden 30×17 y usan 30 columnas', () => {
  for (const [nombre, terreno] of Object.entries(TERRENOS)) {
    assert.equal(terreno.length, FILAS_MAPA, `${nombre} debe tener ${FILAS_MAPA} filas`);
    for (const fila of terreno) {
      assert.equal(fila.length, COLS_MAPA, `${nombre} debe tener ${COLS_MAPA} columnas`);
    }
  }
});

test('el sendero genera posiciones únicas y transitables para 1..20 nodos', () => {
  for (const total of [1, 4, 6, 7, 8, 12, 18, 20]) {
    const posiciones = calcularSendero(total, TERRENOS.pradera);
    assert.equal(posiciones.length, total, `debe generar ${total} posiciones`);
    const claves = new Set(posiciones.map(p => `${p.col},${p.fila}`));
    assert.equal(claves.size, total, `las posiciones de ${total} nodos no deben repetirse`);
    for (const p of posiciones) {
      assert.ok(esTileTransitable(TERRENOS.pradera, p.col, p.fila), `posición inválida ${p.col},${p.fila}`);
    }
  }
});

test('la cuadrícula continental soporta 4, 5 y 9 Ciudadelas', () => {
  for (const total of [4, 5, 9]) {
    const posiciones = calcularCuadricula(total, TERRENOS.continental);
    assert.equal(posiciones.length, total);
    const claves = new Set(posiciones.map(p => `${p.col},${p.fila}`));
    assert.equal(claves.size, total);
    for (const p of posiciones) {
      assert.ok(esTileTransitable(TERRENOS.continental, p.col, p.fila), `Ciudadela inválida ${p.col},${p.fila}`);
    }
  }
});

test('el jefe y el punto de inicio siempre caen en tiles transitables', () => {
  const nodos = calcularSendero(8, TERRENOS.pradera);
  const jefe = calcularPosicionJefe(TERRENOS.pradera, nodos);
  assert.ok(esTileTransitable(TERRENOS.pradera, jefe.col, jefe.fila));
  for (const terreno of Object.values(TERRENOS)) {
    const inicio = puntoInicio(terreno);
    assert.ok(esTileTransitable(terreno, inicio.col, inicio.fila));
  }
});

test('las posiciones guardadas en la base de datos tienen prioridad si son válidas', () => {
  const temas = [
    { id: 1, pos_col: 9, pos_fila: 5 },
    { id: 2, pos_col: 200, pos_fila: 5 }
  ];
  const posiciones = posicionesDeTemas(temas, TERRENOS.pradera);
  assert.deepEqual({ col: posiciones[0].col, fila: posiciones[0].fila }, { col: 9, fila: 5 });
  assert.ok(esTileTransitable(TERRENOS.pradera, posiciones[1].col, posiciones[1].fila));
});
