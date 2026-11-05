import Database from 'better-sqlite3';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Abre siempre backend/database.sqlite sin depender del directorio de ejecución.
// En Docker/producción se puede apuntar a un volumen persistente con DB_PATH.
const rutaBaseDatos = process.env.DB_PATH
  ? path.resolve(process.env.DB_PATH)
  : fileURLToPath(new URL('./database.sqlite', import.meta.url));
const db = new Database(rutaBaseDatos);
db.pragma('foreign_keys = ON');

// 1. Estructura base compatible con la versión actual
db.exec(`
  -- Profesores (Game Masters - Req. 2 y 4)
  CREATE TABLE IF NOT EXISTS profesores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    correo TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  );

  -- Estudiantes (Héroes del Gremio - Req. 3, 6, 7 y 14)
  CREATE TABLE IF NOT EXISTS estudiantes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    codigo_unico TEXT UNIQUE NOT NULL,
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Unidades / Ciudadelas del Mapa Continental
  CREATE TABLE IF NOT EXISTS unidades (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    numero INTEGER UNIQUE NOT NULL,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    bioma TEXT DEFAULT 'pradera',
    pos_col INTEGER DEFAULT NULL,
    pos_fila INTEGER DEFAULT NULL,
    orden INTEGER DEFAULT 0,
    activa INTEGER DEFAULT 1
  );

  -- Temas Académicos / Biomas del Mapa (Req. 8)
  CREATE TABLE IF NOT EXISTS temas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo TEXT NOT NULL,
    descripcion TEXT NOT NULL
  );

  -- Ejemplos / Pergaminos de Estudio (Req. 9)
  CREATE TABLE IF NOT EXISTS ejemplos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tema_id INTEGER NOT NULL,
    titulo TEXT NOT NULL,
    contenido TEXT NOT NULL,
    FOREIGN KEY (tema_id) REFERENCES temas(id) ON DELETE CASCADE
  );

  -- Evaluaciones Objetivas / Jefes Finales (Req. 10)
  CREATE TABLE IF NOT EXISTS evaluaciones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tema_id INTEGER NOT NULL,
    titulo TEXT NOT NULL,
    FOREIGN KEY (tema_id) REFERENCES temas(id) ON DELETE CASCADE
  );

  -- Preguntas Objetivas / Conjuros de Ataque (Req. 11)
  CREATE TABLE IF NOT EXISTS preguntas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    evaluacion_id INTEGER NOT NULL,
    enunciado TEXT NOT NULL,
    opcion_a TEXT NOT NULL,
    opcion_b TEXT NOT NULL,
    opcion_c TEXT NOT NULL,
    opcion_d TEXT NOT NULL,
    opcion_correcta TEXT NOT NULL,
    FOREIGN KEY (evaluacion_id) REFERENCES evaluaciones(id) ON DELETE CASCADE
  );

  -- Calificaciones de Exámenes (Req. 12, 13, 14 y 15)
  CREATE TABLE IF NOT EXISTS calificaciones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    estudiante_id INTEGER NOT NULL,
    evaluacion_id INTEGER NOT NULL,
    puntaje REAL NOT NULL,
    total_preguntas INTEGER NOT NULL,
    aciertos INTEGER NOT NULL,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id) ON DELETE CASCADE,
    FOREIGN KEY (evaluacion_id) REFERENCES evaluaciones(id) ON DELETE CASCADE
  );

  -- Trabajos Prácticos / Misiones de Laboratorio
  CREATE TABLE IF NOT EXISTS tareas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tema_id INTEGER NOT NULL,
    titulo TEXT NOT NULL,
    descripcion TEXT NOT NULL,
    fecha_limite TEXT,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tema_id) REFERENCES temas(id) ON DELETE CASCADE
  );

  -- Entregas de Tareas por Estudiantes
  CREATE TABLE IF NOT EXISTS entregas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tarea_id INTEGER NOT NULL,
    estudiante_id INTEGER NOT NULL,
    contenido TEXT NOT NULL,
    calificacion REAL DEFAULT NULL,
    retroalimentacion TEXT DEFAULT NULL,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tarea_id) REFERENCES tareas(id) ON DELETE CASCADE,
    FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id) ON DELETE CASCADE
  );

  -- Sesiones Activas para Manejo Seguro (Req. 19 y 20)
  CREATE TABLE IF NOT EXISTS sesiones (
    token TEXT PRIMARY KEY,
    usuario_id INTEGER NOT NULL,
    rol TEXT NOT NULL,
    creado_en DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- 🏆 Catálogo de logros y medallas del Gremio
  CREATE TABLE IF NOT EXISTS logros (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo TEXT UNIQUE NOT NULL,
    nombre TEXT NOT NULL,
    descripcion TEXT NOT NULL,
    icono TEXT DEFAULT '🏅',
    xp_bonus INTEGER DEFAULT 0,
    orden INTEGER DEFAULT 0
  );

  -- 🏆 Medallas desbloqueadas por cada héroe
  CREATE TABLE IF NOT EXISTS estudiante_logros (
    estudiante_id INTEGER NOT NULL,
    logro_id INTEGER NOT NULL,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (estudiante_id, logro_id),
    FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id) ON DELETE CASCADE,
    FOREIGN KEY (logro_id) REFERENCES logros(id) ON DELETE CASCADE
  );
`);

// 2. Migraciones automáticas seguras para agregar columnas RPG sin perder datos existentes
const asegurarColumna = (tabla, columna, definicion) => {
  const columnas = db.prepare(`PRAGMA table_info(${tabla})`).all();
  const existe = columnas.some(c => c.name === columna);
  if (!existe) {
    db.exec(`ALTER TABLE ${tabla} ADD COLUMN ${columna} ${definicion}`);
  }
};

// Columnas RPG para estudiantes (Nivel, XP, HP, Clase y Avatar)
asegurarColumna('estudiantes', 'xp', 'INTEGER DEFAULT 150');
asegurarColumna('estudiantes', 'nivel', 'INTEGER DEFAULT 1');
asegurarColumna('estudiantes', 'hp', 'INTEGER DEFAULT 100');
asegurarColumna('estudiantes', 'clase_rpg', "TEXT DEFAULT 'Mago de Código'");
asegurarColumna('estudiantes', 'avatar', "TEXT DEFAULT 'mago'");

// Columnas de Mapa 2D para temas (Bioma y coordenadas)
asegurarColumna('temas', 'bioma', "TEXT DEFAULT 'mazmorra'");
asegurarColumna('temas', 'coord_x', 'INTEGER DEFAULT 50');
asegurarColumna('temas', 'coord_y', 'INTEGER DEFAULT 50');

// 🎯 Objetivo de aprendizaje de cada Unidad (tomado del sílabo oficial)
asegurarColumna('unidades', 'objetivo', "TEXT DEFAULT ''");

// 🗺️ Agrupación dinámica por Unidad y posiciones en tiles (0..29 × 0..16)
asegurarColumna('temas', 'unidad_id', 'INTEGER REFERENCES unidades(id) ON DELETE SET NULL');
asegurarColumna('temas', 'orden', 'INTEGER DEFAULT 0');
asegurarColumna('temas', 'pos_col', 'INTEGER DEFAULT NULL');
asegurarColumna('temas', 'pos_fila', 'INTEGER DEFAULT NULL');
asegurarColumna('ejemplos', 'orden', 'INTEGER DEFAULT 0');

// Columnas de Jefes para evaluaciones
asegurarColumna('evaluaciones', 'nombre_jefe', "TEXT DEFAULT 'Guardián del Algoritmo'");
asegurarColumna('evaluaciones', 'es_jefe_final', 'INTEGER DEFAULT 1');
asegurarColumna('evaluaciones', 'xp_recompensa', 'INTEGER DEFAULT 300');
asegurarColumna('evaluaciones', 'fecha_limite', "TEXT DEFAULT '24h'");

// Columnas de Retroalimentación y Registro de Respuestas (Req. 12 y 15)
asegurarColumna('preguntas', 'explicacion', "TEXT DEFAULT 'Revisa los pergaminos del tema para dominar este conjuro.'");
asegurarColumna('calificaciones', 'xp_ganada', 'INTEGER DEFAULT 0');
asegurarColumna('calificaciones', 'detalle_respuestas', "TEXT DEFAULT '{}'");
asegurarColumna('calificaciones', 'retroalimentacion', "TEXT DEFAULT ''");

// Columnas de Puntos Académicos: cada actividad vale una parte de los 100 puntos de la materia
asegurarColumna('evaluaciones', 'puntos_max', 'INTEGER DEFAULT 30');
asegurarColumna('tareas', 'puntos_max', 'INTEGER DEFAULT 10');

// 📎 Adjuntos de las entregas: migración aditiva, no altera temas ni sus datos
asegurarColumna('entregas', 'archivo_nombre', 'TEXT DEFAULT NULL');
asegurarColumna('entregas', 'archivo_ruta', 'TEXT DEFAULT NULL');
asegurarColumna('entregas', 'archivo_tipo', 'TEXT DEFAULT NULL');
asegurarColumna('entregas', 'archivo_tamano', 'INTEGER DEFAULT NULL');

// 3. Semilla inicial de Profesor Game Master
const existeProfesor = db.prepare('SELECT COUNT(*) as total FROM profesores').get();
if (existeProfesor.total === 0) {
  db.prepare(`
    INSERT INTO profesores (nombre, correo, password) 
    VALUES ('Profesor Game Master', 'admin@universidad.com', 'admin123')
  `).run();
}

// 4. Semilla de las 4 Ciudadelas / Unidades del sílabo (solo si aún no existen)
const totalUnidades = db.prepare('SELECT COUNT(*) as total FROM unidades').get().total;
if (totalUnidades === 0) {
  const insertarUnidad = db.prepare(`
    INSERT INTO unidades (numero, nombre, descripcion, bioma, pos_col, pos_fila, orden)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  insertarUnidad.run(1, 'Pradera de las Variables', 'Unidad I: tipos de variables y primeros pasos de la estadística.', 'pradera', 7, 4, 1);
  insertarUnidad.run(2, 'Valle de las Frecuencias', 'Unidad II: tablas de frecuencia y análisis de datos agrupados.', 'valle', 22, 4, 2);
  insertarUnidad.run(3, 'Bosque Bidimensional', 'Unidad III: correlación, regresión y análisis bivariado.', 'bosque', 7, 12, 3);
  insertarUnidad.run(4, 'Ciudadela de los Índices', 'Unidad IV: números índice, Gini y Lorenz.', 'ciudadela', 22, 12, 4);
}

// 5. Asegurar compañeros de Gremio de ejemplo para que el HUD del Mapa luzca como el mockup
const totalEstudiantes = db.prepare('SELECT COUNT(*) as total FROM estudiantes').get().total;
if (totalEstudiantes < 3) {
  const insertarCompanero = db.prepare(`
    INSERT OR IGNORE INTO estudiantes (nombre, codigo_unico, xp, nivel, hp, clase_rpg, avatar)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  insertarCompanero.run('Leo', 'EST-LEO1', 1450, 8, 92, 'Paladín de Datos', 'guerrero');
  insertarCompanero.run('Sofía', 'EST-SOF2', 2100, 11, 98, 'Arquera Lógica', 'arquera');
  insertarCompanero.run('Ana', 'EST-ANA3', 1820, 10, 88, 'Alquimista SQL', 'mago');
}

// 6. Catálogo de logros del Gremio (idempotente: actualiza textos y recompensas)
const LOGROS_SEMILLA = [
  ['primer_jefe', 'Primer Sangre', 'Enfréntate a tu primer Jefe Final.', '🗡️', 50, 1],
  ['jefe_aprobado', 'Jefe Derrotado', 'Aprueba una evaluación con 60% o más.', '⚔️', 75, 2],
  ['nota_perfecta', 'Conjuro Perfecto', 'Obtén un 100% en una evaluación.', '💯', 150, 3],
  ['veterano_jefes', 'Veterano de Mazmorras', 'Aprueba 3 Jefes Finales.', '🛡️', 100, 4],
  ['primera_mision', 'Aprendiz de Laboratorio', 'Entrega tu primera misión de laboratorio.', '🎒', 40, 5],
  ['misiones_3', 'Manos a la Obra', 'Completa 3 misiones calificadas.', '🧪', 100, 6],
  ['misiones_seguidas', 'Racha de Laboratorio', 'Aprueba 3 misiones consecutivas con 60% o más.', '🔥', 120, 7],
  ['nota_alta', 'Éxito Académico', 'Alcanza 80 puntos o más en la materia.', '🌟', 150, 8],
  ['nivel_5', 'Mago de Código', 'Alcanza el nivel 5 de héroe.', '🧙', 100, 9],
  ['nivel_10', 'Hechicero Senior', 'Alcanza el nivel 10 de héroe.', '🔮', 200, 10],
  ['racha_7', 'Racha de 7 Días', 'Registra actividad en 7 días consecutivos.', '📅', 200, 11],
  ['xp_2000', 'Leyenda del Gremio', 'Acumula 2000 XP de héroe.', '✨', 150, 12],
  ['coleccionista', 'Coleccionista de Medallas', 'Desbloquea 6 logros del Gremio.', '🏆', 250, 13],
  ['archimago', 'Archimago de Sistemas', 'Alcanza el nivel 12 de héroe.', '👑', 300, 14]
];

const insertarLogro = db.prepare(`
  INSERT INTO logros (codigo, nombre, descripcion, icono, xp_bonus, orden)
  VALUES (?, ?, ?, ?, ?, ?)
  ON CONFLICT(codigo) DO UPDATE SET
    nombre = excluded.nombre,
    descripcion = excluded.descripcion,
    icono = excluded.icono,
    xp_bonus = excluded.xp_bonus,
    orden = excluded.orden
`);
for (const logro of LOGROS_SEMILLA) {
  insertarLogro.run(...logro);
}

export default db;