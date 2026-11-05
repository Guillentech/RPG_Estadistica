import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import crypto from 'crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import multer from 'multer';
import db from './db.js';
import { evaluarLogros, listarLogrosEstudiante } from './logros.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// 🌐 Orígenes permitidos por CORS. Sin CORS_ORIGIN se mantiene abierto en desarrollo.
// En producción se recomienda: CORS_ORIGIN=https://app.tudominio.com
const ORIGENES_CORS = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((origen) => origen.trim())
  .filter(Boolean);

const opcionesCors = ORIGENES_CORS.includes('*')
  ? undefined
  : ORIGENES_CORS.length > 0
    ? {
        origin: (origin, callback) => callback(null, !origin || ORIGENES_CORS.includes(origin))
      }
    : undefined;

// 📎 Carpeta de adjuntos: fuera del bundle y servida como estático de solo lectura.
// En Docker/producción se puede apuntar a un volumen persistente con UPLOADS_DIR.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOADS_DIR = process.env.UPLOADS_DIR
  ? path.resolve(process.env.UPLOADS_DIR)
  : path.join(__dirname, 'uploads');
const ENTREGAS_DIR = path.join(UPLOADS_DIR, 'entregas');
const FRONTEND_DIST = path.join(__dirname, '..', 'frontend', 'dist');
fs.mkdirSync(ENTREGAS_DIR, { recursive: true });

const MAX_ARCHIVO_BYTES = 10 * 1024 * 1024;
const EXTENSIONES_ENTREGA = new Set(['.pdf', '.doc', '.docx']);
const MIMES_ENTREGA = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
]);

const almacenamientoEntregas = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, ENTREGAS_DIR),
  filename: (_req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    cb(null, `entrega-${crypto.randomUUID()}${extension}`);
  }
});

const uploadEntrega = multer({
  storage: almacenamientoEntregas,
  limits: { fileSize: MAX_ARCHIVO_BYTES, files: 1 },
  fileFilter: (_req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const mimeValido = MIMES_ENTREGA.has(file.mimetype) || file.mimetype === 'application/octet-stream';
    if (!EXTENSIONES_ENTREGA.has(extension) || !mimeValido) {
      return cb(new Error('Solo se permiten archivos PDF, DOC o DOCX.'));
    }
    cb(null, true);
  }
});

// Verifica la firma real del archivo además de su extensión declarada.
const firmaArchivoValida = (ruta, extension) => {
  try {
    const descriptor = fs.openSync(ruta, 'r');
    const cabecera = Buffer.alloc(8);
    const leidos = fs.readSync(descriptor, cabecera, 0, cabecera.length, 0);
    fs.closeSync(descriptor);
    if (leidos < 4) return false;
    if (extension === '.pdf') return cabecera.subarray(0, 5).toString('ascii') === '%PDF-';
    if (extension === '.docx') {
      return cabecera[0] === 0x50 && cabecera[1] === 0x4b && cabecera[2] === 0x03 && cabecera[3] === 0x04;
    }
    if (extension === '.doc') {
      return cabecera[0] === 0xd0 && cabecera[1] === 0xcf && cabecera[2] === 0x11 && cabecera[3] === 0xe0;
    }
    return false;
  } catch {
    return false;
  }
};

const borrarArchivoFisico = (rutaAbsoluta) => {
  if (!rutaAbsoluta) return;
  try {
    const resoluta = path.resolve(rutaAbsoluta);
    if (path.dirname(resoluta) !== path.resolve(ENTREGAS_DIR)) return;
    fs.rmSync(resoluta, { force: true });
  } catch {
    // La limpieza de un archivo huérfano no debe romper la respuesta principal.
  }
};

const borrarArchivoPorRutaPublica = (rutaPublica) => {
  if (!rutaPublica) return;
  borrarArchivoFisico(path.join(ENTREGAS_DIR, path.basename(rutaPublica)));
};

const ejecutarSubidaEntrega = (req, res, next) => {
  uploadEntrega.single('archivo')(req, res, (error) => {
    if (!error) return next();
    const mensaje = error.code === 'LIMIT_FILE_SIZE'
      ? 'El archivo supera el tamaño máximo permitido de 10 MB.'
      : error.message;
    return res.status(400).json({ error: mensaje });
  });
};

const AVATARES_PRESET = new Set(['mago', 'arquera', 'guerrero', 'alquimista', 'game_master']);
const MAX_AVATAR_BYTES = 2 * 1024 * 1024;

const avatarValido = (avatar) => {
  if (typeof avatar !== 'string' || !avatar) return null;
  if (AVATARES_PRESET.has(avatar)) return avatar;
  const coincidencia = avatar.match(/^data:image\/(png|jpeg|webp|gif);base64,([A-Za-z0-9+/=]+)$/);
  if (!coincidencia) return null;
  const bytes = Buffer.from(coincidencia[2], 'base64').length;
  return bytes > 0 && bytes <= MAX_AVATAR_BYTES ? avatar : null;
};

app.use(cors(opcionesCors));
// 💡 Aumentamos el límite del body a 50mb para permitir subir PDFs/Word largos en Base64
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/uploads', express.static(UPLOADS_DIR, { fallthrough: true, index: false }));

// ❤️ Healthcheck para monitorización y despliegues.
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, servicio: 'Saga Académica' });
});

// Función auxiliar para calcular Nivel en base a XP (Req. 14)
// Cada 250 XP sube 1 nivel de personaje
const calcularNivel = (xpTotal) => Math.max(1, Math.floor((xpTotal || 0) / 250) + 1);

const obtenerTituloClase = (nivel, claseActual) => {
  if (nivel >= 12) return 'Archimago de Sistemas';
  if (nivel >= 8) return 'Hechicero Senior';
  if (nivel >= 4) return 'Mago de Código';
  return claseActual || 'Aprendiz de Código';
};

// --- CONSTANTES ACADÉMICAS DE LA MATERIA (Req.: nota máxima 100 puntos) ---
const NOTA_MAX = 100; // La materia vale 100 puntos en total

// Calcula los puntos ganados por una actividad según el desempeño (0-100) y sus puntos en la materia
const puntosGanadosActividad = (desempenoPorcentaje, puntosMax) =>
  Math.round((Math.min(NOTA_MAX, Math.max(0, Number(desempenoPorcentaje) || 0)) / NOTA_MAX) * (Number(puntosMax) || 0));

// Suma de puntos ya asignados (evaluaciones + tareas) sin exceder los 100 de la materia
const puntosAsignadosTotales = () => {
  const evals = db.prepare('SELECT COALESCE(SUM(puntos_max), 0) as total FROM evaluaciones').get();
  const tars = db.prepare('SELECT COALESCE(SUM(puntos_max), 0) as total FROM tareas').get();
  return (evals?.total || 0) + (tars?.total || 0);
};

// Recalcular XP, Nivel y Nota Académica (0-100 puntos) de un estudiante
const sincronizarProgresoEstudiante = (estudianteId) => {
  const examenes = db.prepare('SELECT COALESCE(SUM(xp_ganada), 0) as xp_eval FROM calificaciones WHERE estudiante_id = ?').get(estudianteId);
  const tareas = db.prepare('SELECT COALESCE(SUM(calificacion * 2), 0) as xp_tar FROM entregas WHERE estudiante_id = ? AND calificacion IS NOT NULL').get(estudianteId);
  const logros = db.prepare(`
    SELECT COALESCE(SUM(l.xp_bonus), 0) as xp_logros
    FROM estudiante_logros el
    JOIN logros l ON l.id = el.logro_id
    WHERE el.estudiante_id = ?
  `).get(estudianteId);
  
  const xpBase = 150; // XP inicial de bienvenida al gremio
  const xpTotal = Math.round(xpBase + (examenes?.xp_eval || 0) + (tareas?.xp_tar || 0) + (logros?.xp_logros || 0));
  const nuevoNivel = calcularNivel(xpTotal);

  const estActual = db.prepare('SELECT clase_rpg FROM estudiantes WHERE id = ?').get(estudianteId);
  const nuevaClase = obtenerTituloClase(nuevoNivel, estActual?.clase_rpg);

  // 📚 NOTA ACADÉMICA: suma de puntos ganados por cada actividad, tope 100
  const notaEval = db.prepare(`
    SELECT COALESCE(SUM(ROUND(MIN(100, MAX(0, c.puntaje)) / 100.0 * e.puntos_max)), 0) as puntos
    FROM calificaciones c
    JOIN evaluaciones e ON c.evaluacion_id = e.id
    WHERE c.estudiante_id = ?
  `).get(estudianteId);
  const notaTar = db.prepare(`
    SELECT COALESCE(SUM(ROUND(MIN(100, MAX(0, en.calificacion)) / 100.0 * t.puntos_max)), 0) as puntos
    FROM entregas en
    JOIN tareas t ON en.tarea_id = t.id
    WHERE en.estudiante_id = ? AND en.calificacion IS NOT NULL
  `).get(estudianteId);

  const puntosGanados = Math.min(NOTA_MAX, (notaEval?.puntos || 0) + (notaTar?.puntos || 0));
  const totalEval = db.prepare('SELECT COUNT(*) as c FROM calificaciones WHERE estudiante_id = ?').get(estudianteId)?.c || 0;
  const totalTar = db.prepare('SELECT COUNT(*) as c FROM entregas WHERE estudiante_id = ? AND calificacion IS NOT NULL').get(estudianteId)?.c || 0;

  db.prepare(`
    UPDATE estudiantes 
    SET xp = ?, nivel = ?, clase_rpg = ?
    WHERE id = ?
  `).run(xpTotal, nuevoNivel, nuevaClase, estudianteId);

  const perfil = db.prepare('SELECT * FROM estudiantes WHERE id = ?').get(estudianteId);
  return {
    ...perfil,
    nota_materia: puntosGanados,
    puntos_ganados: puntosGanados,
    puntos_disponibles: Math.max(0, puntosAsignadosTotales() - puntosGanados),
    puntos_restantes_materia: Math.max(0, NOTA_MAX - puntosGanados),
    total_evaluaciones: totalEval,
    total_tareas_calificadas: totalTar
  };
};

// --- AUTENTICACIÓN Y MANEJO SEGURO DE SESIONES (Req. 2, 3, 18, 19 y 20) ---
app.post('/api/auth/profesor', (req, res) => {
  const { correo, password } = req.body;
  if (!correo?.trim() || !password?.trim()) {
    return res.status(400).json({ error: 'Debes ingresar correo y contraseña.' });
  }

  const profesor = db.prepare('SELECT id, nombre, correo FROM profesores WHERE correo = ? AND password = ?').get(correo.trim(), password);
  if (profesor) {
    const sessionToken = crypto.randomBytes(24).toString('hex');
    db.prepare('INSERT INTO sesiones (token, usuario_id, rol) VALUES (?, ?, ?)').run(sessionToken, profesor.id, 'profesor');
    res.json({ success: true, profesor: { ...profesor, sessionToken } });
  } else {
    res.status(401).json({ error: 'Credenciales inválidas. Usa admin@universidad.com / admin123' });
  }
});

app.post('/api/auth/estudiante', (req, res) => {
  const { codigo } = req.body;
  const codigoLimpio = codigo?.trim().toUpperCase();
  if (!codigoLimpio || codigoLimpio.length < 4) {
    return res.status(400).json({ error: 'Ingresa un código de gremio válido (ej: EST-XXXX).' });
  }

  let estudiante = db.prepare('SELECT * FROM estudiantes WHERE codigo_unico = ?').get(codigoLimpio);
  if (estudiante) {
    estudiante = sincronizarProgresoEstudiante(estudiante.id);
    const sessionToken = crypto.randomBytes(24).toString('hex');
    db.prepare('INSERT INTO sesiones (token, usuario_id, rol) VALUES (?, ?, ?)').run(sessionToken, estudiante.id, 'estudiante');
    res.json({ success: true, estudiante: { ...estudiante, sessionToken } });
  } else {
    res.status(404).json({ error: 'Código de estudiante no encontrado en el Gremio.' });
  }
});

// Cierre de sesión seguro en servidor (Req. 19 y 20)
app.post('/api/auth/logout', (req, res) => {
  const { token } = req.body;
  if (token) {
    db.prepare('DELETE FROM sesiones WHERE token = ?').run(token);
  }
  res.json({ success: true, mensaje: 'Sesión cerrada de forma segura.' });
});

// Obtener datos actualizados de un estudiante (XP, Nivel, HP)
app.get('/api/estudiantes/:id/perfil', (req, res) => {
  evaluarLogros(req.params.id); // 🏆 Sincroniza medallas retroactivas antes de devolver el perfil
  const est = sincronizarProgresoEstudiante(req.params.id);
  if (!est) return res.status(404).json({ error: 'Estudiante no encontrado' });
  res.json(est);
});

// 🏆 LOGROS Y MEDALLAS DEL HÉROE: catálogo completo con estado y progreso
app.get('/api/estudiantes/:id/logros', (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ error: 'El identificador del estudiante no es válido.' });
  }

  const estudiante = db.prepare('SELECT id FROM estudiantes WHERE id = ?').get(id);
  if (!estudiante) return res.status(404).json({ error: 'Estudiante no encontrado' });

  const nuevos = evaluarLogros(id); // Desbloquea medallas pendientes y devuelve las recién ganadas
  if (nuevos.length > 0) sincronizarProgresoEstudiante(id);

  res.json({ ...listarLogrosEstudiante(id), nuevos });
});

// 🛡️ Avatar del héroe: acepta un sprite preset o una imagen Base64 (máx. 2 MB).
app.patch('/api/estudiantes/:id/avatar', (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ error: 'El identificador del estudiante no es válido.' });
  }

  const avatar = avatarValido(req.body?.avatar);
  if (!avatar) {
    return res.status(400).json({
      error: 'Elige un avatar válido o sube una imagen PNG, JPG, WEBP o GIF de hasta 2 MB.'
    });
  }

  const estudiante = db.prepare('SELECT id FROM estudiantes WHERE id = ?').get(id);
  if (!estudiante) return res.status(404).json({ error: 'Estudiante no encontrado' });

  db.prepare('UPDATE estudiantes SET avatar = ? WHERE id = ?').run(avatar, id);
  res.json({ success: true, avatar });
});

// 📚 BOLETA ACADÉMICA: desglose de la nota (0-100 puntos) por actividad con su tema de origen
app.get('/api/estudiantes/:id/boleta', (req, res) => {
  const estudianteId = req.params.id;
  evaluarLogros(estudianteId);
  const estudiante = sincronizarProgresoEstudiante(estudianteId);
  if (!estudiante) return res.status(404).json({ error: 'Estudiante no encontrado' });

  const rendimiento = db.prepare(`
    SELECT 'examen' as tipo,
           c.id as registro_id,
           ev.titulo as actividad,
           ev.puntos_max,
           ROUND(MIN(100, MAX(0, c.puntaje)) / 100.0 * ev.puntos_max) as puntos_ganados,
           MIN(100, MAX(0, c.puntaje)) as porcentaje,
           t.titulo as tema_titulo,
           c.fecha as fecha
    FROM calificaciones c
    JOIN evaluaciones ev ON c.evaluacion_id = ev.id
    JOIN temas t ON ev.tema_id = t.id
    WHERE c.estudiante_id = ?
    UNION ALL
    SELECT 'tarea' as tipo,
           en.id as registro_id,
           tt.titulo as actividad,
           tt.puntos_max,
           ROUND(MIN(100, MAX(0, en.calificacion)) / 100.0 * tt.puntos_max) as puntos_ganados,
           MIN(100, MAX(0, en.calificacion)) as porcentaje,
           t2.titulo as tema_titulo,
           en.fecha as fecha
    FROM entregas en
    JOIN tareas tt ON en.tarea_id = tt.id
    JOIN temas t2 ON tt.tema_id = t2.id
    WHERE en.estudiante_id = ? AND en.calificacion IS NOT NULL
    ORDER BY fecha DESC
  `).all(estudianteId, estudianteId);

  // Actividades aún no rendidas/entregadas (puntos que quedan por ganar)
  const pendientes = db.prepare(`
    SELECT 'examen' as tipo, ev.id as actividad_id, ev.titulo as actividad, ev.puntos_max, t.titulo as tema_titulo
    FROM evaluaciones ev
    JOIN temas t ON ev.tema_id = t.id
    WHERE ev.id NOT IN (SELECT evaluacion_id FROM calificaciones WHERE estudiante_id = ?)
    UNION ALL
    SELECT 'tarea' as tipo, t.id as actividad_id, t.titulo as actividad, t.puntos_max, te.titulo as tema_titulo
    FROM tareas t
    JOIN temas te ON t.tema_id = te.id
    WHERE t.id NOT IN (SELECT tarea_id FROM entregas WHERE estudiante_id = ? AND calificacion IS NOT NULL)
  `).all(estudianteId, estudianteId);

  res.json({
    estudiante: {
      id: estudiante.id,
      nombre: estudiante.nombre,
      codigo_unico: estudiante.codigo_unico
    },
    nota_materia: estudiante.nota_materia,
    puntos_ganados: estudiante.puntos_ganados,
    puntos_restantes_materia: estudiante.puntos_restantes_materia,
    nota_max: NOTA_MAX,
    rendimiento,
    pendientes
  });
});

// --- ESTUDIANTES Y GREMIO (Req. 6 y 7) ---
app.get('/api/estudiantes', (req, res) => {
  const estudiantes = db.prepare('SELECT * FROM estudiantes ORDER BY xp DESC, id DESC').all();
  res.json(estudiantes);
});

app.get('/api/gremio', (req, res) => {
  const miembros = db.prepare(`
    SELECT id, nombre, codigo_unico, xp, nivel, hp, clase_rpg, avatar 
    FROM estudiantes 
    ORDER BY xp DESC 
    LIMIT 8
  `).all();
  res.json(miembros);
});

app.post('/api/estudiantes', (req, res) => {
  const { nombre, clase_rpg } = req.body;
  if (!nombre?.trim()) return res.status(400).json({ error: 'El nombre del estudiante es obligatorio' });

  const codigoUnico = 'EST-' + Math.random().toString(36).substring(2, 6).toUpperCase();
  const claseInicial = clase_rpg || 'Mago de Código';
  const info = db.prepare(`
    INSERT INTO estudiantes (nombre, codigo_unico, xp, nivel, hp, clase_rpg) 
    VALUES (?, ?, 150, 1, 100, ?)
  `).run(nombre.trim(), codigoUnico, claseInicial);

  const nuevo = db.prepare('SELECT * FROM estudiantes WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json(nuevo);
});

app.delete('/api/estudiantes/:id', (req, res) => {
  db.prepare('DELETE FROM estudiantes WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// --- UNIDADES / CIUDADELAS DEL MAPA CONTINENTAL ---
app.get('/api/unidades', (req, res) => {
  const query = `
    SELECT u.*,
           (SELECT COUNT(*) FROM temas t WHERE t.unidad_id = u.id) as total_temas,
           (SELECT COUNT(*) FROM evaluaciones e JOIN temas t ON e.tema_id = t.id WHERE t.unidad_id = u.id) as total_evaluaciones,
           (SELECT COUNT(*) FROM tareas ta JOIN temas t ON ta.tema_id = t.id WHERE t.unidad_id = u.id) as total_tareas
    FROM unidades u
    WHERE u.activa = 1
    ORDER BY u.orden ASC, u.numero ASC
  `;
  res.json(db.prepare(query).all());
});

app.post('/api/unidades', (req, res) => {
  const { numero, nombre, descripcion, objetivo, bioma, pos_col, pos_fila, orden } = req.body;
  const numeroUnidad = Math.round(Number(numero));
  if (!Number.isFinite(numeroUnidad) || numeroUnidad < 1) {
    return res.status(400).json({ error: 'El número de la Unidad debe ser un entero mayor o igual a 1.' });
  }
  if (!nombre?.trim()) {
    return res.status(400).json({ error: 'El nombre de la Ciudadela es obligatorio.' });
  }

  const existente = db.prepare('SELECT id FROM unidades WHERE numero = ?').get(numeroUnidad);
  if (existente) {
    return res.status(400).json({ error: `La Unidad ${numeroUnidad} ya existe en el mapa.` });
  }

  const info = db.prepare(`
    INSERT INTO unidades (numero, nombre, descripcion, objetivo, bioma, pos_col, pos_fila, orden)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    numeroUnidad,
    nombre.trim(),
    descripcion?.trim() || '',
    objetivo?.trim() || '',
    bioma || 'pradera',
    Number.isInteger(pos_col) ? pos_col : null,
    Number.isInteger(pos_fila) ? pos_fila : null,
    Number.isInteger(orden) ? orden : numeroUnidad
  );

  res.status(201).json({ id: info.lastInsertRowid, numero: numeroUnidad, nombre: nombre.trim() });
});

app.patch('/api/unidades/:id', (req, res) => {
  const actual = db.prepare('SELECT * FROM unidades WHERE id = ?').get(req.params.id);
  if (!actual) return res.status(404).json({ error: 'La Ciudadela no existe.' });

  const { nombre, descripcion, objetivo, bioma, pos_col, pos_fila, orden, activa } = req.body;
  const nuevoNombre = nombre?.trim() || actual.nombre;
  if (!nuevoNombre) return res.status(400).json({ error: 'El nombre de la Ciudadela no puede quedar vacío.' });

  db.prepare(`
    UPDATE unidades
    SET nombre = ?, descripcion = ?, objetivo = ?, bioma = ?, pos_col = ?, pos_fila = ?, orden = ?, activa = ?
    WHERE id = ?
  `).run(
    nuevoNombre,
    descripcion ?? actual.descripcion,
    objetivo ?? actual.objetivo,
    bioma ?? actual.bioma,
    Number.isInteger(pos_col) ? pos_col : actual.pos_col,
    Number.isInteger(pos_fila) ? pos_fila : actual.pos_fila,
    Number.isInteger(orden) ? orden : actual.orden,
    Number.isInteger(activa) ? activa : actual.activa,
    req.params.id
  );

  res.json({ success: true, id: Number(req.params.id) });
});

// --- TEMAS / BIOMAS Y EJEMPLOS / PERGAMINOS (Req. 8 y 9) ---
app.get('/api/temas', (req, res) => {
  const filtroUnidad = req.query.unidad_id != null ? Number(req.query.unidad_id) : null;
  const temas = filtroUnidad != null && Number.isFinite(filtroUnidad)
    ? db.prepare('SELECT * FROM temas WHERE unidad_id = ? ORDER BY orden ASC, id ASC').all(filtroUnidad)
    : db.prepare('SELECT * FROM temas ORDER BY COALESCE(unidad_id, 0) ASC, orden ASC, id ASC').all();
  const ejemplos = db.prepare('SELECT * FROM ejemplos ORDER BY orden ASC, id ASC').all();
  
  const data = temas.map((t, index) => ({
    ...t,
    bioma: t.bioma || ['mazmorra', 'bosque', 'ruinas', 'laboratorio'][index % 4],
    ejemplos: ejemplos.filter(e => e.tema_id === t.id)
  }));
  res.json(data);
});

app.post('/api/temas', (req, res) => {
  const { titulo, descripcion, bioma, unidad_id, orden, pos_col, pos_fila } = req.body;
  if (!titulo?.trim()) return res.status(400).json({ error: 'El título del tema/bioma es obligatorio' });

  let unidadSegura = null;
  if (unidad_id != null && unidad_id !== '') {
    const unidad = db.prepare('SELECT * FROM unidades WHERE id = ?').get(unidad_id);
    if (!unidad) return res.status(400).json({ error: 'La Unidad seleccionada no existe.' });
    unidadSegura = unidad;
  }

  const biomaElegido = bioma || unidadSegura?.bioma || 'bosque';
  const ordenFinal = Number.isInteger(orden)
    ? orden
    : (db.prepare('SELECT COALESCE(MAX(orden), 0) + 1 as siguiente FROM temas WHERE unidad_id IS ?').get(unidadSegura?.id ?? null)?.siguiente || 1);

  const info = db.prepare(`
    INSERT INTO temas (titulo, descripcion, bioma, unidad_id, orden, pos_col, pos_fila) 
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    titulo.trim(),
    descripcion?.trim() || '',
    biomaElegido,
    unidadSegura?.id ?? null,
    ordenFinal,
    Number.isInteger(pos_col) ? pos_col : null,
    Number.isInteger(pos_fila) ? pos_fila : null
  );

  res.status(201).json({ id: info.lastInsertRowid, titulo, descripcion, bioma: biomaElegido, unidad_id: unidadSegura?.id ?? null, orden: ordenFinal });
});

app.put('/api/temas/:id', (req, res) => {
  const actual = db.prepare('SELECT * FROM temas WHERE id = ?').get(req.params.id);
  if (!actual) return res.status(404).json({ error: 'El tema no existe.' });

  const { titulo, descripcion, bioma, unidad_id, orden, pos_col, pos_fila } = req.body;
  let unidadFinal = actual.unidad_id;
  if (unidad_id !== undefined) {
    if (unidad_id === null || unidad_id === '') {
      unidadFinal = null;
    } else {
      const unidad = db.prepare('SELECT id FROM unidades WHERE id = ?').get(unidad_id);
      if (!unidad) return res.status(400).json({ error: 'La Unidad seleccionada no existe.' });
      unidadFinal = unidad.id;
    }
  }

  db.prepare(`
    UPDATE temas
    SET titulo = ?, descripcion = ?, bioma = ?, unidad_id = ?, orden = ?, pos_col = ?, pos_fila = ?
    WHERE id = ?
  `).run(
    titulo?.trim() || actual.titulo,
    descripcion ?? actual.descripcion,
    bioma || actual.bioma,
    unidadFinal,
    Number.isInteger(orden) ? orden : actual.orden,
    Number.isInteger(pos_col) ? pos_col : actual.pos_col,
    Number.isInteger(pos_fila) ? pos_fila : actual.pos_fila,
    req.params.id
  );

  res.json({ success: true, id: Number(req.params.id) });
});

app.delete('/api/temas/:id', (req, res) => {
  db.prepare('DELETE FROM temas WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

app.post('/api/ejemplos', (req, res) => {
  const { tema_id, titulo, contenido, orden } = req.body;
  if (!tema_id || !titulo?.trim() || !contenido?.trim()) {
    return res.status(400).json({ error: 'Tema, título y contenido del pergamino son obligatorios' });
  }
  const ordenFinal = Number.isInteger(orden)
    ? orden
    : (db.prepare('SELECT COALESCE(MAX(orden), 0) + 1 as siguiente FROM ejemplos WHERE tema_id = ?').get(tema_id)?.siguiente || 1);
  const info = db.prepare('INSERT INTO ejemplos (tema_id, titulo, contenido, orden) VALUES (?, ?, ?, ?)').run(tema_id, titulo.trim(), contenido.trim(), ordenFinal);
  res.status(201).json({ id: info.lastInsertRowid, tema_id, titulo, contenido, orden: ordenFinal });
});

app.delete('/api/ejemplos/:id', (req, res) => {
  db.prepare('DELETE FROM ejemplos WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// --- EVALUACIONES / JEFES FINALES Y PREGUNTAS (Req. 10 y 11) ---
app.get('/api/evaluaciones', (req, res) => {
  const query = `
    SELECT e.*, t.titulo as tema_titulo, t.bioma as tema_bioma,
           (SELECT COUNT(*) FROM preguntas WHERE evaluacion_id = e.id) as total_preguntas 
    FROM evaluaciones e
    JOIN temas t ON e.tema_id = t.id
    ORDER BY e.id DESC
  `;
  const evaluaciones = db.prepare(query).all();
  res.json(evaluaciones);
});

app.post('/api/evaluaciones', (req, res) => {
  const { tema_id, titulo, nombre_jefe, xp_recompensa, fecha_limite, puntos_max } = req.body;
  if (!tema_id || !titulo?.trim()) return res.status(400).json({ error: 'Tema y título son obligatorios' });

  const jefe = nombre_jefe?.trim() || `Jefe Final: ${titulo.trim()}`;
  const xp = parseInt(xp_recompensa, 10) || 300;
  const limite = fecha_limite?.trim() || '24h';

  // 📚 Validación de puntos académicos: entero ≥ 1 y sin pasarse de los 100 de la materia
  const puntos = Math.round(Number(puntos_max));
  if (!Number.isFinite(puntos) || puntos < 1) {
    return res.status(400).json({ error: 'Los puntos en la materia deben ser al menos 1.' });
  }
  const asignados = puntosAsignadosTotales();
  if (asignados + puntos > NOTA_MAX) {
    return res.status(400).json({ error: `Esta evaluación vale ${puntos} puntos, pero solo quedan ${NOTA_MAX - asignados} de los ${NOTA_MAX} puntos de la materia por asignar.` });
  }

  const info = db.prepare(`
    INSERT INTO evaluaciones (tema_id, titulo, nombre_jefe, xp_recompensa, fecha_limite, puntos_max) 
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(tema_id, titulo.trim(), jefe, xp, limite, puntos);

  res.status(201).json({ id: info.lastInsertRowid, tema_id, titulo, nombre_jefe: jefe, xp_recompensa: xp, puntos_max: puntos });
});

app.delete('/api/evaluaciones/:id', (req, res) => {
  db.prepare('DELETE FROM evaluaciones WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// Endpoint para el estudiante (Oculta opcion_correcta por seguridad)
app.get('/api/evaluaciones/:id/preguntas', (req, res) => {
  const preguntas = db.prepare('SELECT id, evaluacion_id, enunciado, opcion_a, opcion_b, opcion_c, opcion_d FROM preguntas WHERE evaluacion_id = ?').all(req.params.id);
  res.json(preguntas);
});

// Endpoint para el docente (Incluye opcion_correcta y explicacion)
app.get('/api/evaluaciones/:id/preguntas-docente', (req, res) => {
  const preguntas = db.prepare('SELECT * FROM preguntas WHERE evaluacion_id = ?').all(req.params.id);
  res.json(preguntas);
});

app.post('/api/preguntas', (req, res) => {
  const { evaluacion_id, enunciado, opcion_a, opcion_b, opcion_c, opcion_d, opcion_correcta, explicacion } = req.body;
  if (!evaluacion_id || !enunciado?.trim() || !opcion_a?.trim() || !opcion_b?.trim() || !opcion_c?.trim() || !opcion_d?.trim() || !opcion_correcta) {
    return res.status(400).json({ error: 'Todos los campos de la pregunta son obligatorios' });
  }
  const info = db.prepare(`
    INSERT INTO preguntas (evaluacion_id, enunciado, opcion_a, opcion_b, opcion_c, opcion_d, opcion_correcta, explicacion)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    evaluacion_id,
    enunciado.trim(),
    opcion_a.trim(),
    opcion_b.trim(),
    opcion_c.trim(),
    opcion_d.trim(),
    opcion_correcta.toUpperCase(),
    explicacion?.trim() || 'Revisa los pergaminos del tema para reforzar este concepto.'
  );
  
  res.status(201).json({ id: info.lastInsertRowid, evaluacion_id });
});

app.delete('/api/preguntas/:id', (req, res) => {
  db.prepare('DELETE FROM preguntas WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// --- MOTOR DE CORRECCIÓN RPG: REGISTRO DE RESPUESTAS, XP Y NIVEL (Req. 12, 13, 14 y 15) ---
app.post('/api/evaluaciones/:id/calificar', (req, res) => {
  const evaluacionId = req.params.id;
  const { estudiante_id, respuestas } = req.body;

  if (!estudiante_id || !respuestas) {
    return res.status(400).json({ error: 'Datos incompletos para calificar el enfrentamiento' });
  }

  const intentoPrevio = db.prepare('SELECT id, puntaje FROM calificaciones WHERE estudiante_id = ? AND evaluacion_id = ?').get(estudiante_id, evaluacionId);
  if (intentoPrevio) {
    return res.status(400).json({ 
      error: `Ya te enfrentaste a este Jefe previamente obteniendo ${intentoPrevio.puntaje}%. Solo se permite un intento por mazmorra.` 
    });
  }

  const evaluacion = db.prepare('SELECT * FROM evaluaciones WHERE id = ?').get(evaluacionId);
  const preguntas = db.prepare('SELECT * FROM preguntas WHERE evaluacion_id = ?').all(evaluacionId);
  if (preguntas.length === 0) {
    return res.status(400).json({ error: 'Esta mazmorra aún no contiene preguntas configuradas' });
  }

  let aciertos = 0;
  const desglose = [];

  preguntas.forEach((p) => {
    const marcada = respuestas[p.id] ? respuestas[p.id].toUpperCase() : 'SIN RESPONDER';
    const correcta = p.opcion_correcta.toUpperCase();
    const esCorrecta = marcada === correcta;
    if (esCorrecta) aciertos++;

    desglose.push({
      pregunta_id: p.id,
      enunciado: p.enunciado,
      respuesta_estudiante: marcada,
      opcion_correcta: correcta,
      es_correcta: esCorrecta,
      explicacion: p.explicacion || `La respuesta correcta era la opción ${correcta}.`
    });
  });

  const puntaje = Math.round((aciertos / preguntas.length) * 100);
  const xpBaseEval = evaluacion?.xp_recompensa || 300;
  const xpGanada = Math.round((puntaje / 100) * xpBaseEval) + (puntaje >= 60 ? 50 : 15);
  const retroGeneral = puntaje >= 80
    ? '¡Victoria Épica! Dominaste los conjuros del tema y derrotaste al Jefe sin sufrir daño.'
    : puntaje >= 60
    ? '¡Jefe Derrotado! Lograste superar la mazmorra, pero revisa los pergaminos en los puntos donde fallaste.'
    : 'El Jefe resistió tu ataque. Repasa los Pergaminos de Estudio del mapa para recuperar HP y subir tu nivel.';

  const info = db.prepare(`
    INSERT INTO calificaciones (estudiante_id, evaluacion_id, puntaje, total_preguntas, aciertos, xp_ganada, detalle_respuestas, retroalimentacion)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    estudiante_id,
    evaluacionId,
    puntaje,
    preguntas.length,
    aciertos,
    xpGanada,
    JSON.stringify(desglose),
    retroGeneral
  );

  const logrosDesbloqueados = evaluarLogros(estudiante_id);
  const perfilActualizado = sincronizarProgresoEstudiante(estudiante_id);

  // 📚 Puntos académicos ganados en esta actividad (sobre los 100 de la materia)
  const puntosMaxEval = Number(evaluacion?.puntos_max) || 0;
  const puntosGanadosEval = puntosGanadosActividad(puntaje, puntosMaxEval);

  res.json({
    id: info.lastInsertRowid,
    puntaje,
    total_preguntas: preguntas.length,
    aciertos,
    xp_ganada: xpGanada,
    puntos_max: puntosMaxEval,
    puntos_ganados: puntosGanadosEval,
    nota_materia: perfilActualizado?.nota_materia,
    retroalimentacion: retroGeneral,
    desglose,
    logros_desbloqueados: logrosDesbloqueados,
    estudiante: perfilActualizado
  });
});

app.get('/api/calificaciones', (req, res) => {
  const query = `
    SELECT c.*, e.nombre as estudiante_nombre, e.codigo_unico, e.nivel as estudiante_nivel, ev.titulo as evaluacion_titulo,
           ev.puntos_max,
           ROUND(MIN(100, MAX(0, c.puntaje)) / 100.0 * ev.puntos_max) as puntos_ganados
    FROM calificaciones c
    JOIN estudiantes e ON c.estudiante_id = e.id
    JOIN evaluaciones ev ON c.evaluacion_id = ev.id
    ORDER BY c.id DESC
  `;
  const calificaciones = db.prepare(query).all();
  res.json(calificaciones);
});

app.get('/api/calificaciones/estudiante/:id', (req, res) => {
  const query = `
    SELECT c.*, ev.titulo as evaluacion_titulo, ev.nombre_jefe, ev.puntos_max,
           ROUND(MIN(100, MAX(0, c.puntaje)) / 100.0 * ev.puntos_max) as puntos_ganados,
           t.titulo as tema_titulo, t.bioma as tema_bioma
    FROM calificaciones c
    JOIN evaluaciones ev ON c.evaluacion_id = ev.id
    JOIN temas t ON ev.tema_id = t.id
    WHERE c.estudiante_id = ?
    ORDER BY c.id DESC
  `;
  const notas = db.prepare(query).all(req.params.id);
  res.json(notas);
});

// --- 6. TRABAJOS PRÁCTICOS / MISIONES DE LABORATORIO ---

// 💡 MIGRACIÓN AUTOMÁTICA: Añadir columna para archivos adjuntos sin romper datos
try {
  db.prepare("ALTER TABLE tareas ADD COLUMN archivo_adjunto TEXT").run();
} catch (e) {
  // Se ignora el error de forma silenciosa si la columna ya existe
}

app.get('/api/tareas', (req, res) => {
  const query = `
    SELECT t.*, te.titulo as tema_titulo, te.bioma as tema_bioma,
           (SELECT COUNT(*) FROM entregas WHERE tarea_id = t.id) as total_entregas
    FROM tareas t
    JOIN temas te ON t.tema_id = te.id
    ORDER BY t.id DESC
  `;
  const tareas = db.prepare(query).all();
  res.json(tareas);
});

app.post('/api/tareas', (req, res) => {
  const { tema_id, titulo, descripcion, fecha_limite, archivo_adjunto, puntos_max } = req.body;
  if (!tema_id || !titulo?.trim() || !descripcion?.trim()) {
    return res.status(400).json({ error: 'Tema, título y descripción son obligatorios.' });
  }

  // 📚 Validación de puntos académicos: entero ≥ 1 y sin pasarse de los 100 de la materia
  const puntos = Math.round(Number(puntos_max));
  if (!Number.isFinite(puntos) || puntos < 1) {
    return res.status(400).json({ error: 'Los puntos en la materia deben ser al menos 1.' });
  }
  const asignados = puntosAsignadosTotales();
  if (asignados + puntos > NOTA_MAX) {
    return res.status(400).json({ error: `Esta tarea vale ${puntos} puntos, pero solo quedan ${NOTA_MAX - asignados} de los ${NOTA_MAX} puntos de la materia por asignar.` });
  }

  // 💡 NUEVO: Recibimos el archivo (PDF/Word en Base64) en la instrucción INSERT
  const info = db.prepare(`
    INSERT INTO tareas (tema_id, titulo, descripcion, fecha_limite, archivo_adjunto, puntos_max)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(tema_id, titulo.trim(), descripcion.trim(), fecha_limite || 'Viernes 23:59 hrs', archivo_adjunto || null, puntos);
  res.status(201).json({ id: info.lastInsertRowid, puntos_max: puntos });
});

app.delete('/api/tareas/:id', (req, res) => {
  db.prepare('DELETE FROM tareas WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

app.get('/api/tareas/:id/entregas', (req, res) => {
  const query = `
    SELECT en.*, es.nombre as estudiante_nombre, es.codigo_unico, es.nivel
    FROM entregas en
    JOIN estudiantes es ON en.estudiante_id = es.id
    WHERE en.tarea_id = ?
    ORDER BY en.id DESC
  `;
  const entregas = db.prepare(query).all(req.params.id);
  res.json(entregas);
});

app.post('/api/entregas', ejecutarSubidaEntrega, (req, res) => {
  const tareaId = Number(req.body?.tarea_id);
  const estudianteId = Number(req.body?.estudiante_id);
  const contenido = (req.body?.contenido || '').trim();
  const archivo = req.file || null;
  const limpiarArchivoNuevo = () => {
    if (archivo) borrarArchivoFisico(archivo.path);
  };

  if (!Number.isInteger(tareaId) || tareaId < 1 || !Number.isInteger(estudianteId) || estudianteId < 1) {
    limpiarArchivoNuevo();
    return res.status(400).json({ error: 'La misión y el estudiante son obligatorios.' });
  }
  if (!contenido && !archivo) {
    limpiarArchivoNuevo();
    return res.status(400).json({ error: 'Adjunta un archivo o redacta el pergamino de tu entrega antes de enviarlo.' });
  }

  const tarea = db.prepare('SELECT id FROM tareas WHERE id = ?').get(tareaId);
  if (!tarea) {
    limpiarArchivoNuevo();
    return res.status(404).json({ error: 'La misión indicada no existe.' });
  }
  const estudiante = db.prepare('SELECT id FROM estudiantes WHERE id = ?').get(estudianteId);
  if (!estudiante) {
    limpiarArchivoNuevo();
    return res.status(404).json({ error: 'El estudiante indicado no existe.' });
  }

  if (archivo) {
    const extension = path.extname(archivo.originalname).toLowerCase();
    if (!firmaArchivoValida(archivo.path, extension)) {
      limpiarArchivoNuevo();
      return res.status(400).json({ error: 'El contenido del archivo no coincide con un PDF, DOC o DOCX válido.' });
    }
  }

  try {
    const previa = db.prepare(`
      SELECT id, archivo_nombre, archivo_ruta, archivo_tipo, archivo_tamano
      FROM entregas
      WHERE tarea_id = ? AND estudiante_id = ?
    `).get(tareaId, estudianteId);

    const archivoNombre = archivo ? archivo.originalname : (previa?.archivo_nombre ?? null);
    const archivoRuta = archivo ? `/uploads/entregas/${archivo.filename}` : (previa?.archivo_ruta ?? null);
    const archivoTipo = archivo ? archivo.mimetype : (previa?.archivo_tipo ?? null);
    const archivoTamano = archivo ? archivo.size : (previa?.archivo_tamano ?? null);

    if (previa) {
      db.prepare(`
        UPDATE entregas
        SET contenido = ?, fecha = CURRENT_TIMESTAMP,
            archivo_nombre = ?, archivo_ruta = ?, archivo_tipo = ?, archivo_tamano = ?
        WHERE id = ?
      `).run(contenido, archivoNombre, archivoRuta, archivoTipo, archivoTamano, previa.id);

      if (archivo && previa.archivo_ruta) {
        borrarArchivoPorRutaPublica(previa.archivo_ruta);
      }
      return res.json({
        success: true,
        mensaje: '¡Misión actualizada en el Gremio con éxito!',
        archivo_nombre: archivoNombre,
        archivo_ruta: archivoRuta
      });
    }

    const info = db.prepare(`
      INSERT INTO entregas (
        tarea_id, estudiante_id, contenido,
        archivo_nombre, archivo_ruta, archivo_tipo, archivo_tamano
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(tareaId, estudianteId, contenido, archivoNombre, archivoRuta, archivoTipo, archivoTamano);

    res.status(201).json({
      id: info.lastInsertRowid,
      mensaje: '¡Misión entregada! Cuando el Game Master la califique recibirás tu XP.',
      archivo_nombre: archivoNombre,
      archivo_ruta: archivoRuta
    });
  } catch (error) {
    limpiarArchivoNuevo();
    console.error('❌ Error al guardar la entrega:', error.message);
    return res.status(500).json({ error: 'No se pudo guardar la entrega. Intenta nuevamente.' });
  }
});

app.get('/api/entregas/estudiante/:id', (req, res) => {
  const query = `
    SELECT en.*, t.titulo as tarea_titulo, t.puntos_max,
           CASE WHEN en.calificacion IS NULL THEN NULL
                ELSE ROUND(MIN(100, MAX(0, en.calificacion)) / 100.0 * t.puntos_max)
           END as puntos_ganados,
           te.titulo as tema_titulo, te.bioma as tema_bioma
    FROM entregas en
    JOIN tareas t ON en.tarea_id = t.id
    JOIN temas te ON t.tema_id = te.id
    WHERE en.estudiante_id = ?
  `;
  const misEntregas = db.prepare(query).all(req.params.id);
  res.json(misEntregas);
});

app.put('/api/entregas/:id/calificar', (req, res) => {
  const { calificacion, retroalimentacion } = req.body;

  // 📚 Validación estricta: la nota de una actividad es un porcentaje de 0 a 100
  const nota = Number(calificacion);
  if (!Number.isFinite(nota) || nota < 0 || nota > 100) {
    return res.status(400).json({ error: 'La calificación debe ser un número entre 0 y 100.' });
  }

  const entrega = db.prepare('SELECT estudiante_id FROM entregas WHERE id = ?').get(req.params.id);
  if (!entrega) return res.status(404).json({ error: 'Entrega no encontrada' });

  db.prepare(`
    UPDATE entregas 
    SET calificacion = ?, retroalimentacion = ? 
    WHERE id = ?
  `).run(nota, retroalimentacion?.trim() || '', req.params.id);

  // 🏆 Evalúa medallas nuevas y actualiza XP/Nivel del estudiante al recibir la nota
  const logrosDesbloqueados = evaluarLogros(entrega.estudiante_id);
  const perfilActualizado = sincronizarProgresoEstudiante(entrega.estudiante_id);

  res.json({
    success: true,
    logros_desbloqueados: logrosDesbloqueados,
    estudiante: perfilActualizado
  });
});
// --- COPILOTO DE IA BLINDADO (CON AUTO-FALLBACK Y MULTI-MODELO) ---
const generarRespuestaRespaldo = (mensaje, modo) => {
  if (modo === 'preguntas') {
    return {
      tipo: 'preguntas',
      resultado: [
        {
          enunciado: `A partir del estudio de "${mensaje.slice(0, 45)}", ¿cuál es el principio fundamental para resolver este reto?`,
          opcion_a: "Estructurar la lógica de forma modular, validando entradas y tipos de datos",
          opcion_b: "Solo funciona en procesadores mononúcleo sin memoria caché",
          opcion_c: "Elimina la necesidad de validar la sintaxis y las excepciones",
          opcion_d: "No admite el uso de variables ni funciones auxiliares",
          opcion_correcta: "A",
          explicacion: "La modularidad y validación garantizan soluciones escalables y sin errores."
        },
        {
          enunciado: `¿Qué buena práctica técnica se desprende directamente de "${mensaje.slice(0, 35)}"?`,
          opcion_a: "Acoplar todas las dependencias en una única función global",
          opcion_b: "Manejo explícito de casos borde y separación de responsabilidades",
          opcion_c: "Omitir las pruebas de escritorio y el análisis de datos",
          opcion_d: "Duplicar bloques de código en todo el archivo",
          opcion_correcta: "B",
          explicacion: "Separar responsabilidades y validar casos borde evita fallos críticos en ejecución."
        },
        {
          enunciado: `¿Cuál es el beneficio principal de dominar este bioma dentro del proyecto?`,
          opcion_a: "Facilita la mantenibilidad, escalabilidad y precisión de los resultados",
          opcion_b: "Inhabilita el acceso concurrente a la base de datos SQLite",
          opcion_c: "Bloquea las llamadas a funciones del sistema",
          opcion_d: "Reduce el rendimiento general de la aplicación",
          opcion_correcta: "A",
          explicacion: "Aplicar adecuadamente estos principios mejora la calidad y mantenibilidad del software."
        }
      ]
    };
  }

  if (modo === 'ejemplo') {
    return {
      tipo: 'ejemplo',
      resultado: {
        titulo: `Pergamino Práctico: ${mensaje.slice(0, 35)}`,
        contenido: `// 📜 Demostración práctica generada por el Oráculo IA\n// Tema: ${mensaje}\n\n#include <iostream>\nusing namespace std;\n\nvoid ejecutarDemostracion() {\n    cout << "Conjuro compilado y ejecutado con éxito." << endl;\n}\n\nint main() {\n    ejecutarDemostracion();\n    return 0;\n}`
      }
    };
  }

  if (modo === 'tarea') {
    return {
      tipo: 'tarea',
      resultado: {
        titulo: `Misión de Laboratorio: ${mensaje.slice(0, 35)}`,
        descripcion: `⚔️ Objetivo de la Misión:\nDesarrollar una solución práctica que aplique los conceptos de: "${mensaje}".\n\n📜 Requisitos de entrega:\n1. Desarrollo o código fuente debidamente comentado.\n2. Estructura clara y modular.\n3. Comprobación con al menos un caso de prueba.`
      }
    };
  }

  return {
    tipo: modo === 'alquimista' ? 'alquimista' : 'chat',
    resultado: `🧙‍♂️ **Oráculo & Copiloto IA:** He analizado tu consulta sobre **"${mensaje}"**.\n\n**Recomendaciones clave:**\n1. **Estructura:** Divide este tema en un concepto teórico breve (Pergamino) seguido de un ejercicio paso a paso.\n2. **Puntos críticos:** Asegúrate de resaltar los errores más comunes para que los estudiantes no pierdan HP en la evaluación.\n3. **Acción rápida:** Usa los botones superiores (*Generar Preguntas*, *Crear Ejemplo* o *Diseñar Misión*) para publicar este contenido directamente en el mapa.`
  };
};
const limpiarTextoPlano = (texto = '') => {
  if (typeof texto !== 'string') return texto;
  return texto
    // 1. Bloques de código y código en línea
    .replace(/```[\s\S]*?```/g, (match) => match.replace(/```[a-zA-Z]*\n?/g, '').replace(/```/g, ''))
    .replace(/`([^`]+)`/g, '$1')
    
    // 2. Elementos multimedia y enlaces (extrae solo el texto visible)
    .replace(/!\[([^\]]*?)\]\([^)]*?\)/g, '$1') // Imágenes ![alt](url) -> alt
    .replace(/\[([^\]]+?)\]\([^)]*?\)/g, '$1')   // Enlaces [texto](url) -> texto
    
    // 3. Estructura (Títulos y Citas)
    .replace(/^#{1,6}\s+/gm, '')                 // Elimina # de los títulos
    .replace(/^\s*>\s?/gm, '')                   // Elimina el símbolo de citas >
    
    // 4. Formato de texto (Tachado, Negritas y Cursivas)
    .replace(/~~(.*?)~~/g, '$1')                 // Tachado ~~texto~~
    .replace(/\*\*([^*]+?)\*\*/g, '$1')          // Negritas **texto**
    .replace(/\*([^*]+?)\*/g, '$1')              // Cursivas *texto*
    .replace(/__([^_]+?)__/g, '$1')              // Negritas __texto__
    .replace(/_([^_]+?)_/g, '$1')                // Cursivas _texto_
    
    // 5. Listas y separadores
    .replace(/^\s*[-*+]\s+/gm, '• ')             // Viñetas estandarizadas
    .replace(/^\s*\d+\.\s+/gm, '')               // Listas numeradas (opcional)
    .replace(/^([-*_]){3,}\s*$/gm, '')           // Líneas divisorias (---, ***, ___)
    
    // 6. Limpieza de espacios y saltos de línea excesivos
    .replace(/[ \t]+\n/g, '\n')                  // Espacios sobrantes al final de las líneas
    .replace(/\n{3,}/g, '\n\n')                  // Reduce múltiples saltos de línea a un máximo de dos
    .trim();
};
app.post('/api/ia/asistente', async (req, res) => {
  const { mensaje, modo = 'chat', contexto = '' } = req.body;
  // Limpia comillas o espacios accidentales en el archivo .env
  const apiKey = (process.env.GEMINI_API_KEY || '').replace(/['"]/g, '').trim();

  if (!mensaje?.trim()) {
    return res.status(400).json({ error: 'Por favor escribe tu consulta o información.' });
  }

  // Si no hay API Key configurada, usa el respaldo directo
  if (!apiKey || apiKey === 'tu_api_key_aqui') {
    console.log('ℹ️ [Copiloto IA] Sin API Key en .env -> Usando generador local.');
    return res.json(generarRespuestaRespaldo(mensaje.trim(), modo));
  }

  try {
    let systemInstruction = "";
    let forceJson = false;

    if (modo === 'preguntas') {
      forceJson = true;
      systemInstruction = `Eres un docente universitario experto. A partir del tema suministrado, genera exactamente 3 preguntas de opción múltiple.
Responde ÚNICAMENTE un arreglo JSON válido con este formato exacto:
[
  {
    "enunciado": "Texto de la pregunta",
    "opcion_a": "Opción A",
    "opcion_b": "Opción B",
    "opcion_c": "Opción C",
    "opcion_d": "Opción D",
    "opcion_correcta": "A"
  }
]`;
    } else if (modo === 'ejemplo') {
      forceJson = true;
      systemInstruction = `Eres un docente universitario experto. Basándote en el tema indicado, genera un ejemplo práctico bien comentado.
Responde ÚNICAMENTE un objeto JSON válido:
{
  "titulo": "Título breve y descriptivo",
  "contenido": "Ejemplo explicado paso a paso para que los estudiantes comprendan la aplicación del tema"
}`;
    } else if (modo === 'tarea') {
      forceJson = true;
      systemInstruction = `Eres un docente universitario. Genera un trabajo práctico o misión académica con instrucciones claras.
Responde ÚNICAMENTE un objeto JSON válido:
{
  "titulo": "Título de la tarea o misión",
  "descripcion": "Instrucciones detalladas, requisitos y criterios de entrega"
}`;
    } else {
      systemInstruction = `Eres el Oráculo & Copiloto de Inteligencia Artificial de la plataforma "Saga Académica" (${contexto}). Asiste con excelente calidad técnica y didáctica de forma clara, estructurada y concisa.`;
    }

    const payload = {
      contents: [{ parts: [{ text: `${systemInstruction}\n\nMENSAJE:\n${mensaje}` }] }]
    };

    if (forceJson) {
      payload.generationConfig = { responseMimeType: "application/json" };
    }

    // Probamos primero con gemini-2.5-flash y como respaldo gemini-2.0-flash
    const modelos = ['gemini-3.5-flash-lite', 'gemini-3.8-flash', 'gemini-2.5-flash', 'gemini-2.0-flash'];
    let textoGenerado = null;
    let ultimoErrorAPI = null;

    for (const modelo of modelos) {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent?key=${apiKey}`,
      {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }
      );

      const data = await response.json();

      if (response.ok && data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        textoGenerado = data.candidates[0].content.parts[0].text;
        console.log(`✅ [Copiloto IA] Respuesta generada con éxito usando ${modelo}`);
        break;
      } else {
        ultimoErrorAPI = data?.error?.message || `HTTP ${response.status}`;
        console.warn(`⚠️ [Copiloto IA] Falló ${modelo}: ${ultimoErrorAPI}`);
      }
    }

    // Si la API Key falló en ambos modelos, mostramos aviso en consola y activamos el auto-rescate
    if (!textoGenerado) {
      console.error(`❌ [Copiloto IA] La API Key fue rechazada por Google (${ultimoErrorAPI}). Activando respuesta de respaldo automática.`);
      return res.json(generarRespuestaRespaldo(mensaje.trim(), modo));
    }

    if (forceJson) {
      // Limpiar bloques ```json ... ``` si el modelo los incluyó
      const jsonLimpio = textoGenerado.replace(/```json/gi, '').replace(/```/g, '').trim();
      res.json({ tipo: modo, resultado: JSON.parse(jsonLimpio) });
    } else {
      res.json({ tipo: modo === 'alquimista' ? 'alquimista' : 'chat', resultado: textoGenerado });
    }
  } catch (error) {
    console.error("❌ Error interno en Copiloto IA:", error.message);
    // En lugar de devolver 500 y bloquear al usuario, devolvemos el respaldo
    return res.json(generarRespuestaRespaldo(mensaje.trim(), modo));
  }
});

// Compatibilidad con endpoint anterior
app.post('/api/ia/generar-evaluacion', (req, res) => {
  res.redirect(307, '/api/ia/asistente');
});

// 🔎 Cualquier /api desconocida responde JSON, no el index.html de la SPA.
app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'Endpoint no encontrado.' });
});

// 🌐 Sirve la SPA compilada. En desarrollo el frontend lo sirve Vite.
if (fs.existsSync(FRONTEND_DIST)) {
  app.use(express.static(FRONTEND_DIST));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/uploads/')) return next();
    return res.sendFile(path.join(FRONTEND_DIST, 'index.html'));
  });
} else {
  app.get('/', (_req, res) => {
    res.status(404).json({
      error: 'Frontend no compilado. Ejecuta "npm run build" o usa "npm run dev".'
    });
  });
}

app.listen(PORT, () => {
  console.log(`⚔️ Servidor Saga Académica corriendo en http://localhost:${PORT}`);
});