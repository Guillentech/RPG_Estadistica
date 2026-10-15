import Database from 'better-sqlite3';

const db = new Database('database.sqlite');
db.pragma('foreign_keys = ON');

db.exec(`
  -- 1. Profesores (Game Masters)
  CREATE TABLE IF NOT EXISTS profesores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    correo TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  );

  -- 2. Estudiantes (Aventureros)
  CREATE TABLE IF NOT EXISTS estudiantes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    codigo_unico TEXT UNIQUE NOT NULL,
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- 3. Temas Académicos (Biomas del Mapa 2D)
  CREATE TABLE IF NOT EXISTS temas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo TEXT NOT NULL,
    descripcion TEXT NOT NULL
  );

  -- 4. Ejemplos de Estudio (Pergaminos / Cofres de Teoría)
  CREATE TABLE IF NOT EXISTS ejemplos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tema_id INTEGER NOT NULL,
    titulo TEXT NOT NULL,
    contenido TEXT NOT NULL,
    FOREIGN KEY (tema_id) REFERENCES temas(id) ON DELETE CASCADE
  );

  -- 5. Evaluaciones (Misiones y Jefes Finales)
  CREATE TABLE IF NOT EXISTS evaluaciones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tema_id INTEGER NOT NULL,
    titulo TEXT NOT NULL,
    FOREIGN KEY (tema_id) REFERENCES temas(id) ON DELETE CASCADE
  );

  -- 6. Preguntas de Evaluaciones (Ataques / Acertijos del Jefe)
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

  -- 7. Registro de Respuestas Individuales (Requisito 12 de la Rúbrica)
  CREATE TABLE IF NOT EXISTS respuestas_estudiante (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    estudiante_id INTEGER NOT NULL,
    evaluacion_id INTEGER NOT NULL,
    pregunta_id INTEGER NOT NULL,
    opcion_elegida TEXT NOT NULL,
    es_correcta INTEGER NOT NULL,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id) ON DELETE CASCADE,
    FOREIGN KEY (evaluacion_id) REFERENCES evaluaciones(id) ON DELETE CASCADE,
    FOREIGN KEY (pregunta_id) REFERENCES preguntas(id) ON DELETE CASCADE
  );

  -- 8. Calificaciones y XP (Requisito 14 de la Rúbrica)
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

  -- 9. Trabajos Prácticos (Misiones de Gremio)
  CREATE TABLE IF NOT EXISTS tareas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tema_id INTEGER NOT NULL,
    titulo TEXT NOT NULL,
    descripcion TEXT NOT NULL,
    fecha_limite TEXT,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tema_id) REFERENCES temas(id) ON DELETE CASCADE
  );

  -- 10. Entregas de Trabajos Prácticos
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
`);

// Semilla inicial (Seed) si la base de datos está vacía
const existeProfesor = db.prepare('SELECT COUNT(*) as total FROM profesores').get();
if (existeProfesor.total === 0) {
  db.prepare(`
    INSERT INTO profesores (nombre, correo, password) 
    VALUES ('Game Master Principal', 'admin@universidad.com', 'admin123')
  `).run();
}

export default db;