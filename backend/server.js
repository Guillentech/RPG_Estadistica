import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import crypto from 'crypto';
import db from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
// 💡 Aumentamos el límite del body a 50mb para permitir subir PDFs/Word largos en Base64
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Función auxiliar para calcular Nivel en base a XP (Req. 14)
// Cada 250 XP sube 1 nivel de personaje
const calcularNivel = (xpTotal) => Math.max(1, Math.floor((xpTotal || 0) / 250) + 1);

const obtenerTituloClase = (nivel, claseActual) => {
  if (nivel >= 12) return 'Archimago de Sistemas';
  if (nivel >= 8) return 'Hechicero Senior';
  if (nivel >= 4) return 'Mago de Código';
  return claseActual || 'Aprendiz de Código';
};

// Recalcular XP y Nivel de un estudiante sumando exámenes y tareas calificadas
const sincronizarProgresoEstudiante = (estudianteId) => {
  const examenes = db.prepare('SELECT COALESCE(SUM(xp_ganada), 0) as xp_eval FROM calificaciones WHERE estudiante_id = ?').get(estudianteId);
  const tareas = db.prepare('SELECT COALESCE(SUM(calificacion * 2), 0) as xp_tar FROM entregas WHERE estudiante_id = ? AND calificacion IS NOT NULL').get(estudianteId);
  
  const xpBase = 150; // XP inicial de bienvenida al gremio
  const xpTotal = Math.round(xpBase + (examenes?.xp_eval || 0) + (tareas?.xp_tar || 0));
  const nuevoNivel = calcularNivel(xpTotal);

  const estActual = db.prepare('SELECT clase_rpg FROM estudiantes WHERE id = ?').get(estudianteId);
  const nuevaClase = obtenerTituloClase(nuevoNivel, estActual?.clase_rpg);

  db.prepare(`
    UPDATE estudiantes 
    SET xp = ?, nivel = ?, clase_rpg = ?
    WHERE id = ?
  `).run(xpTotal, nuevoNivel, nuevaClase, estudianteId);

  return db.prepare('SELECT * FROM estudiantes WHERE id = ?').get(estudianteId);
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
  const est = sincronizarProgresoEstudiante(req.params.id);
  if (!est) return res.status(404).json({ error: 'Estudiante no encontrado' });
  res.json(est);
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

// --- TEMAS / BIOMAS Y EJEMPLOS / PERGAMINOS (Req. 8 y 9) ---
app.get('/api/temas', (req, res) => {
  const temas = db.prepare('SELECT * FROM temas ORDER BY id ASC').all();
  const ejemplos = db.prepare('SELECT * FROM ejemplos').all();
  
  const data = temas.map((t, index) => ({
    ...t,
    bioma: t.bioma || ['mazmorra', 'bosque', 'ruinas', 'laboratorio'][index % 4],
    ejemplos: ejemplos.filter(e => e.tema_id === t.id)
  }));
  res.json(data);
});

app.post('/api/temas', (req, res) => {
  const { titulo, descripcion, bioma, coord_x, coord_y } = req.body;
  if (!titulo?.trim()) return res.status(400).json({ error: 'El título del tema/bioma es obligatorio' });

  const biomaElegido = bioma || 'bosque';
  const x = coord_x ?? Math.floor(20 + Math.random() * 60);
  const y = coord_y ?? Math.floor(25 + Math.random() * 50);

  const info = db.prepare(`
    INSERT INTO temas (titulo, descripcion, bioma, coord_x, coord_y) 
    VALUES (?, ?, ?, ?, ?)
  `).run(titulo.trim(), descripcion?.trim() || '', biomaElegido, x, y);

  res.status(201).json({ id: info.lastInsertRowid, titulo, descripcion, bioma: biomaElegido });
});

app.delete('/api/temas/:id', (req, res) => {
  db.prepare('DELETE FROM temas WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

app.post('/api/ejemplos', (req, res) => {
  const { tema_id, titulo, contenido } = req.body;
  if (!tema_id || !titulo?.trim() || !contenido?.trim()) {
    return res.status(400).json({ error: 'Tema, título y contenido del pergamino son obligatorios' });
  }
  const info = db.prepare('INSERT INTO ejemplos (tema_id, titulo, contenido) VALUES (?, ?, ?)').run(tema_id, titulo.trim(), contenido.trim());
  res.status(201).json({ id: info.lastInsertRowid, tema_id, titulo, contenido });
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
  const { tema_id, titulo, nombre_jefe, xp_recompensa, fecha_limite } = req.body;
  if (!tema_id || !titulo?.trim()) return res.status(400).json({ error: 'Tema y título son obligatorios' });

  const jefe = nombre_jefe?.trim() || `Jefe Final: ${titulo.trim()}`;
  const xp = parseInt(xp_recompensa, 10) || 300;
  const limite = fecha_limite?.trim() || '24h';

  const info = db.prepare(`
    INSERT INTO evaluaciones (tema_id, titulo, nombre_jefe, xp_recompensa, fecha_limite) 
    VALUES (?, ?, ?, ?, ?)
  `).run(tema_id, titulo.trim(), jefe, xp, limite);

  res.status(201).json({ id: info.lastInsertRowid, tema_id, titulo, nombre_jefe: jefe, xp_recompensa: xp });
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

  const perfilActualizado = sincronizarProgresoEstudiante(estudiante_id);

  res.json({
    id: info.lastInsertRowid,
    puntaje,
    total_preguntas: preguntas.length,
    aciertos,
    xp_ganada: xpGanada,
    retroalimentacion: retroGeneral,
    desglose,
    estudiante: perfilActualizado
  });
});

app.get('/api/calificaciones', (req, res) => {
  const query = `
    SELECT c.*, e.nombre as estudiante_nombre, e.codigo_unico, e.nivel as estudiante_nivel, ev.titulo as evaluacion_titulo
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
    SELECT c.*, ev.titulo as evaluacion_titulo, ev.nombre_jefe
    FROM calificaciones c
    JOIN evaluaciones ev ON c.evaluacion_id = ev.id
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
  const { tema_id, titulo, descripcion, fecha_limite, archivo_adjunto } = req.body;
  if (!tema_id || !titulo?.trim() || !descripcion?.trim()) {
    return res.status(400).json({ error: 'Tema, título y descripción son obligatorios.' });
  }
  
  // 💡 NUEVO: Recibimos el archivo (PDF/Word en Base64) en la instrucción INSERT
  const info = db.prepare(`
    INSERT INTO tareas (tema_id, titulo, descripcion, fecha_limite, archivo_adjunto)
    VALUES (?, ?, ?, ?, ?)
  `).run(tema_id, titulo.trim(), descripcion.trim(), fecha_limite || 'Viernes 23:59 hrs', archivo_adjunto || null);
  res.status(201).json({ id: info.lastInsertRowid });
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

app.post('/api/entregas', (req, res) => {
  const { tarea_id, estudiante_id, contenido } = req.body;
  if (!tarea_id || !estudiante_id || !contenido?.trim()) {
    return res.status(400).json({ error: 'Debes redactar el pergamino de tu entrega antes de enviarlo.' });
  }

  const previa = db.prepare('SELECT id FROM entregas WHERE tarea_id = ? AND estudiante_id = ?').get(tarea_id, estudiante_id);
  if (previa) {
    db.prepare('UPDATE entregas SET contenido = ?, fecha = CURRENT_TIMESTAMP WHERE id = ?').run(contenido.trim(), previa.id);
    return res.json({ success: true, mensaje: '¡Misión actualizada en el Gremio con éxito!' });
  }

  const info = db.prepare(`
    INSERT INTO entregas (tarea_id, estudiante_id, contenido)
    VALUES (?, ?, ?)
  `).run(tarea_id, estudiante_id, contenido.trim());
  res.status(201).json({ id: info.lastInsertRowid, mensaje: '¡Misión entregada! Cuando el Game Master la califique recibirás tu XP.' });
});

app.get('/api/entregas/estudiante/:id', (req, res) => {
  const query = `
    SELECT en.*, t.titulo as tarea_titulo
    FROM entregas en
    JOIN tareas t ON en.tarea_id = t.id
    WHERE en.estudiante_id = ?
  `;
  const misEntregas = db.prepare(query).all(req.params.id);
  res.json(misEntregas);
});

app.put('/api/entregas/:id/calificar', (req, res) => {
  const { calificacion, retroalimentacion } = req.body;
  db.prepare(`
    UPDATE entregas 
    SET calificacion = ?, retroalimentacion = ? 
    WHERE id = ?
  `).run(calificacion, retroalimentacion?.trim() || '', req.params.id);

  // Actualizar XP y Nivel del estudiante al recibir nota de tarea
  const entrega = db.prepare('SELECT estudiante_id FROM entregas WHERE id = ?').get(req.params.id);
  if (entrega) {
    sincronizarProgresoEstudiante(entrega.estudiante_id);
  }

  res.json({ success: true });
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
      systemInstruction = `Eres un docente de programación y ciencias. Basándote en el tema indicado, genera un ejemplo práctico o de código bien comentado.
Responde ÚNICAMENTE un objeto JSON válido:
{
  "titulo": "Título breve y descriptivo",
  "contenido": "Código fuente o ejemplo explicado paso a paso"
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

app.listen(PORT, () => {
  console.log(`⚔️ Servidor Saga Académica corriendo en http://localhost:${PORT}`);
});