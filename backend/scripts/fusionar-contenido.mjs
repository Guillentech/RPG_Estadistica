import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Fusiona los archivos _contenido-uN.json (generados por Unidad) dentro de
// backend/seed/silabo.json sin perder actividades, jefes ni posiciones del mapa.
// Uso: node backend/scripts/fusionar-contenido.mjs

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const seedDir = path.resolve(__dirname, '../seed');
const rutaSilabo = path.join(seedDir, 'silabo.json');

const leerJson = (ruta) => JSON.parse(fs.readFileSync(ruta, 'utf8'));
const texto = (valor) => String(valor ?? '').trim();

const silabo = leerJson(rutaSilabo);
const unidades = Array.isArray(silabo.unidades) ? silabo.unidades : [];
const temas = Array.isArray(silabo.temas) ? silabo.temas : [];
const errores = [];

const archivos = fs.readdirSync(seedDir)
  .filter((nombre) => /^_contenido-u\d+\.json$/i.test(nombre))
  .sort((a, b) => Number(a.match(/\d+/)[0]) - Number(b.match(/\d+/)[0]));

if (archivos.length === 0) {
  console.error('❌ No se encontraron archivos _contenido-uN.json en backend/seed.');
  process.exit(1);
}

let totalSubtemas = 0;
let totalPreguntas = 0;

for (const archivo of archivos) {
  const contenido = leerJson(path.join(seedDir, archivo));
  const numero = Math.round(Number(contenido.unidad_numero));
  const unidad = unidades.find((u) => Math.round(Number(u.numero)) === numero);
  if (!unidad) {
    errores.push(`${archivo}: la Unidad ${numero} no existe en silabo.json.`);
    continue;
  }

  if (texto(contenido.objetivo)) {
    unidad.objetivo = texto(contenido.objetivo);
  }

  const temasUnidad = temas
    .filter((t) => Math.round(Number(t.unidad_numero)) === numero)
    .sort((a, b) => Number(a.orden) - Number(b.orden));

  if (!Array.isArray(contenido.temas) || contenido.temas.length !== temasUnidad.length) {
    errores.push(`${archivo}: se esperaban ${temasUnidad.length} temas y llegaron ${contenido.temas?.length ?? 0}.`);
    continue;
  }

  for (const temaContenido of contenido.temas) {
    const orden = Math.round(Number(temaContenido.orden));
    const tema = temasUnidad.find((t) => Math.round(Number(t.orden)) === orden);
    if (!tema) {
      errores.push(`${archivo}: no existe el Tema ${numero}.${orden} en silabo.json.`);
      continue;
    }

    const subtemas = Array.isArray(temaContenido.subtemas) ? temaContenido.subtemas : [];
    if (subtemas.length === 0) {
      errores.push(`${archivo}: el Tema ${numero}.${orden} llegó sin subtemas.`);
      continue;
    }

    tema.subtemas = subtemas.map((subtema, indice) => {
      const titulo = texto(subtema?.titulo);
      const cuerpo = texto(subtema?.contenido);
      if (!titulo || !cuerpo) {
        errores.push(`${archivo}: subtema ${indice + 1} del Tema ${numero}.${orden} está incompleto.`);
      }
      return { titulo, contenido: cuerpo };
    });

    if (texto(temaContenido.nota)) {
      tema.nota = texto(temaContenido.nota);
    } else {
      delete tema.nota;
    }

    totalSubtemas += tema.subtemas.length;
  }

  if (Array.isArray(contenido.preguntas_jefe)) {
    const jefe = temasUnidad.find((t) => t.jefe)?.jefe;
    if (!jefe) {
      errores.push(`${archivo}: la Unidad ${numero} no tiene jefe declarado en silabo.json.`);
    } else {
      jefe.preguntas = contenido.preguntas_jefe.map((pregunta, indice) => {
        const datos = {
          enunciado: texto(pregunta.enunciado),
          opcion_a: texto(pregunta.opcion_a),
          opcion_b: texto(pregunta.opcion_b),
          opcion_c: texto(pregunta.opcion_c),
          opcion_d: texto(pregunta.opcion_d),
          opcion_correcta: texto(pregunta.opcion_correcta).toUpperCase(),
          explicacion: texto(pregunta.explicacion)
        };
        if (!datos.enunciado || !datos.opcion_a || !datos.opcion_b || !datos.opcion_c || !datos.opcion_d) {
          errores.push(`${archivo}: la pregunta ${indice + 1} del jefe de la Unidad ${numero} está incompleta.`);
        }
        if (!['A', 'B', 'C', 'D'].includes(datos.opcion_correcta)) {
          errores.push(`${archivo}: la pregunta ${indice + 1} del jefe de la Unidad ${numero} tiene una respuesta correcta inválida.`);
        }
        return datos;
      });
      totalPreguntas += jefe.preguntas.length;
    }
  } else {
    errores.push(`${archivo}: falta "preguntas_jefe".`);
  }
}

if (errores.length > 0) {
  console.error('❌ No se fusionó nada. Corrige estos problemas:');
  for (const error of errores) console.error(`  · ${error}`);
  process.exit(1);
}

const respaldo = path.join(seedDir, `silabo.backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
fs.copyFileSync(rutaSilabo, respaldo);
fs.writeFileSync(rutaSilabo, `${JSON.stringify(silabo, null, 2)}\n`, 'utf8');

console.log(`✅ silabo.json actualizado.`);
console.log(`📚 Unidades: ${unidades.length} · Temas: ${temas.length} · Subtemas: ${totalSubtemas}`);
console.log(`❓ Preguntas de jefe: ${totalPreguntas}`);
console.log(`🗂️  Respaldo: ${path.basename(respaldo)}`);
