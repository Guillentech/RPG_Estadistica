import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import db from '../db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rutaPorDefecto = path.resolve(__dirname, '../seed/silabo.json');

const args = process.argv.slice(2);
const rutaArchivo = args.find(a => !a.startsWith('--')) || rutaPorDefecto;
const dryRun = args.includes('--dry-run');
const reemplazar = args.includes('--reemplazar');

const NOTA_MAX = 100;

const leerSilabo = (ruta) => {
  if (!fs.existsSync(ruta)) {
    throw new Error(`No se encontró el archivo del sílabo: ${ruta}`);
  }
  try {
    return JSON.parse(fs.readFileSync(ruta, 'utf8'));
  } catch (error) {
    throw new Error(`El JSON del sílabo no es válido: ${error.message}`);
  }
};

const validarSilabo = (silabo) => {
  if (!Array.isArray(silabo.unidades) || silabo.unidades.length === 0) {
    throw new Error('El sílabo debe incluir al menos una Unidad en "unidades".');
  }
  if (!Array.isArray(silabo.temas) || silabo.temas.length === 0) {
    throw new Error('El sílabo debe incluir al menos un Tema en "temas".');
  }

  const numeros = new Set();
  for (const unidad of silabo.unidades) {
    const numero = Math.round(Number(unidad.numero));
    if (!Number.isFinite(numero) || numero < 1) {
      throw new Error(`La Unidad "${unidad.nombre || 'sin nombre'}" tiene un número inválido.`);
    }
    if (!unidad.nombre?.trim()) {
      throw new Error(`La Unidad ${numero} no tiene nombre.`);
    }
    if (numeros.has(numero)) {
      throw new Error(`La Unidad ${numero} está duplicada.`);
    }
    numeros.add(numero);
  }

  let puntosTareas = 0;
  let puntosJefes = 0;
  const ordenesPorUnidad = new Map();

  for (const tema of silabo.temas) {
    const unidadNumero = Math.round(Number(tema.unidad_numero));
    if (!numeros.has(unidadNumero)) {
      throw new Error(`El tema "${tema.titulo}" apunta a la Unidad ${tema.unidad_numero}, que no existe.`);
    }
    const orden = Math.round(Number(tema.orden));
    if (!Number.isFinite(orden) || orden < 1) {
      throw new Error(`El tema "${tema.titulo}" necesita un "orden" mayor o igual a 1.`);
    }
    const clave = `${unidadNumero}-${orden}`;
    if (ordenesPorUnidad.has(clave)) {
      throw new Error(`La Unidad ${unidadNumero} tiene dos temas en el orden ${orden}.`);
    }
    ordenesPorUnidad.set(clave, true);

    if (!tema.titulo?.trim()) {
      throw new Error(`El tema de la Unidad ${unidadNumero}, orden ${orden}, no tiene título.`);
    }

    if (tema.actividad) {
      const puntos = Math.round(Number(tema.actividad.puntos_max));
      if (!Number.isFinite(puntos) || puntos < 1) {
        throw new Error(`La actividad del tema "${tema.titulo}" debe valer al menos 1 punto.`);
      }
      puntosTareas += puntos;
    }

    if (tema.jefe) {
      const puntos = Math.round(Number(tema.jefe.puntos_max));
      if (!Number.isFinite(puntos) || puntos < 1) {
        throw new Error(`El jefe del tema "${tema.titulo}" debe valer al menos 1 punto.`);
      }
      puntosJefes += puntos;
    }
  }

  const total = puntosTareas + puntosJefes;
  if (total > NOTA_MAX) {
    throw new Error(
      `El sílabo asigna ${total} puntos (${puntosTareas} en actividades + ${puntosJefes} en jefes), ` +
      `pero la materia solo tiene ${NOTA_MAX}. Ajusta "puntos_max" antes de importar.`
    );
  }

  return { puntosTareas, puntosJefes, total };
};

const insertarOActualizarUnidad = (unidad) => {
  const existente = db.prepare('SELECT * FROM unidades WHERE numero = ?').get(unidad.numero);
  if (existente) {
    db.prepare(`
      UPDATE unidades
      SET nombre = ?, descripcion = ?, bioma = ?, pos_col = ?, pos_fila = ?, orden = ?, activa = 1
      WHERE id = ?
    `).run(
      unidad.nombre,
      unidad.descripcion || '',
      unidad.bioma || existente.bioma || 'pradera',
      Number.isInteger(unidad.pos_col) ? unidad.pos_col : existente.pos_col,
      Number.isInteger(unidad.pos_fila) ? unidad.pos_fila : existente.pos_fila,
      Number.isInteger(unidad.orden) ? unidad.orden : unidad.numero,
      existente.id
    );
    return existente.id;
  }

  const info = db.prepare(`
    INSERT INTO unidades (numero, nombre, descripcion, bioma, pos_col, pos_fila, orden)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    unidad.numero,
    unidad.nombre,
    unidad.descripcion || '',
    unidad.bioma || 'pradera',
    Number.isInteger(unidad.pos_col) ? unidad.pos_col : null,
    Number.isInteger(unidad.pos_fila) ? unidad.pos_fila : null,
    Number.isInteger(unidad.orden) ? unidad.orden : unidad.numero
  );
  return info.lastInsertRowid;
};

const insertarOActualizarTema = (tema, unidadId) => {
  const existente = db.prepare('SELECT * FROM temas WHERE unidad_id = ? AND orden = ?').get(unidadId, tema.orden);
  if (existente) {
    db.prepare(`
      UPDATE temas
      SET titulo = ?, descripcion = ?, bioma = ?, pos_col = ?, pos_fila = ?
      WHERE id = ?
    `).run(
      tema.titulo,
      tema.descripcion || '',
      tema.bioma || existente.bioma || 'pradera',
      Number.isInteger(tema.pos_col) ? tema.pos_col : existente.pos_col,
      Number.isInteger(tema.pos_fila) ? tema.pos_fila : existente.pos_fila,
      existente.id
    );
    return existente.id;
  }

  const info = db.prepare(`
    INSERT INTO temas (titulo, descripcion, bioma, unidad_id, orden, pos_col, pos_fila)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    tema.titulo,
    tema.descripcion || '',
    tema.bioma || 'pradera',
    unidadId,
    tema.orden,
    Number.isInteger(tema.pos_col) ? tema.pos_col : null,
    Number.isInteger(tema.pos_fila) ? tema.pos_fila : null
  );
  return info.lastInsertRowid;
};

const normalizarSubtema = (subtema, index) => {
  if (typeof subtema === 'string') {
    const texto = subtema.trim();
    return { titulo: texto, contenido: texto, orden: index + 1 };
  }
  const titulo = String(subtema?.titulo ?? '').trim();
  const contenido = String(subtema?.contenido ?? '').trim();
  return {
    titulo: titulo || contenido,
    contenido: contenido || titulo,
    orden: Number.isInteger(subtema?.orden) ? subtema.orden : index + 1
  };
};

const sincronizarSubtemas = (temaId, subtemas = []) => {
  const existentes = db.prepare('SELECT * FROM ejemplos WHERE tema_id = ? ORDER BY orden, id').all(temaId);
  subtemas.map(normalizarSubtema).forEach((subtema) => {
    if (!subtema.titulo) {
      throw new Error(`El tema ${temaId} tiene un subtema vacío (posición ${subtema.orden}).`);
    }
    const actual = existentes.find(e => e.titulo === subtema.titulo);
    if (actual) {
      db.prepare('UPDATE ejemplos SET contenido = ?, orden = ? WHERE id = ?').run(subtema.contenido, subtema.orden, actual.id);
    } else {
      db.prepare('INSERT INTO ejemplos (tema_id, titulo, contenido, orden) VALUES (?, ?, ?, ?)')
        .run(temaId, subtema.titulo, subtema.contenido, subtema.orden);
    }
  });
};

const sincronizarActividad = (temaId, actividad) => {
  if (!actividad) return;
  const existente = db.prepare('SELECT * FROM tareas WHERE tema_id = ? AND titulo = ?').get(temaId, actividad.titulo);
  if (existente) {
    db.prepare('UPDATE tareas SET descripcion = ?, fecha_limite = ?, puntos_max = ? WHERE id = ?')
      .run(actividad.descripcion || '', actividad.fecha_limite || existente.fecha_limite, actividad.puntos_max, existente.id);
    return;
  }
  db.prepare('INSERT INTO tareas (tema_id, titulo, descripcion, fecha_limite, puntos_max) VALUES (?, ?, ?, ?, ?)')
    .run(temaId, actividad.titulo, actividad.descripcion || '', actividad.fecha_limite || 'Viernes 23:59 hrs', actividad.puntos_max);
};

const sincronizarJefe = (temaId, jefe) => {
  if (!jefe) return;
  const existente = db.prepare('SELECT * FROM evaluaciones WHERE tema_id = ? AND titulo = ?').get(temaId, jefe.titulo);
  if (existente) {
    db.prepare('UPDATE evaluaciones SET nombre_jefe = ?, puntos_max = ?, xp_recompensa = ? WHERE id = ?')
      .run(jefe.nombre_jefe || existente.nombre_jefe, jefe.puntos_max, jefe.xp_recompensa || existente.xp_recompensa, existente.id);
    return;
  }
  db.prepare(`
    INSERT INTO evaluaciones (tema_id, titulo, nombre_jefe, puntos_max, xp_recompensa, es_jefe_final, fecha_limite)
    VALUES (?, ?, ?, ?, ?, 1, '24h')
  `).run(temaId, jefe.titulo, jefe.nombre_jefe || jefe.titulo, jefe.puntos_max, jefe.xp_recompensa || 300);
};

const ejecutarImportacion = (silabo, resumen) => {
  const transaccion = db.transaction(() => {
    if (reemplazar) {
      // El borrado de temas arrastra ejemplos, evaluaciones, tareas y su progreso por FK.
      db.prepare('DELETE FROM temas').run();
      db.prepare('DELETE FROM unidades').run();
    }

    const idsPorNumero = new Map();
    for (const unidad of silabo.unidades) {
      idsPorNumero.set(Math.round(Number(unidad.numero)), insertarOActualizarUnidad(unidad));
    }

    for (const tema of silabo.temas) {
      const unidadId = idsPorNumero.get(Math.round(Number(tema.unidad_numero)));
      const temaId = insertarOActualizarTema(tema, unidadId);
      sincronizarSubtemas(temaId, tema.subtemas);
      sincronizarActividad(temaId, tema.actividad);
      sincronizarJefe(temaId, tema.jefe);
    }
  });

  transaccion();

  console.log(`✅ Sílabo importado: ${silabo.unidades.length} Unidades, ${silabo.temas.length} Temas.`);
  console.log(`📚 Puntos: ${resumen.puntosTareas} en actividades + ${resumen.puntosJefes} en jefes = ${resumen.total}/${NOTA_MAX}.`);
  if (reemplazar) console.log('♻️  Se reemplazaron los temas y Unidades anteriores.');
};

try {
  const silabo = leerSilabo(rutaArchivo);
  const resumen = validarSilabo(silabo);
  console.log(`📄 Archivo: ${rutaArchivo}`);
  console.log(`🗺️  Unidades: ${silabo.unidades.length} · Temas: ${silabo.temas.length}`);
  console.log(`📜 Subtemas: ${silabo.temas.reduce((total, t) => total + (t.subtemas?.length || 0), 0)}`);
  console.log(`🎒 Actividades: ${silabo.temas.filter(t => t.actividad).length} · ⚔️ Jefes: ${silabo.temas.filter(t => t.jefe).length}`);
  console.log(`📚 Presupuesto: ${resumen.puntosTareas} + ${resumen.puntosJefes} = ${resumen.total}/${NOTA_MAX} puntos.`);

  if (dryRun) {
    console.log('🔎 Modo --dry-run: no se escribió nada en la base de datos.');
    process.exit(0);
  }

  ejecutarImportacion(silabo, resumen);
} catch (error) {
  console.error(`❌ ${error.message}`);
  process.exit(1);
}
