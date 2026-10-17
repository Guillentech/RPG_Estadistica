import Database from 'better-sqlite3';

const db = new Database('database.sqlite');
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

// 3. Semilla inicial de Profesor Game Master
const existeProfesor = db.prepare('SELECT COUNT(*) as total FROM profesores').get();
if (existeProfesor.total === 0) {
  db.prepare(`
    INSERT INTO profesores (nombre, correo, password) 
    VALUES ('Profesor Game Master', 'admin@universidad.com', 'admin123')
  `).run();
}

// 4. Asegurar compañeros de Gremio de ejemplo para que el HUD del Mapa luzca como el mockup
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

export default db;