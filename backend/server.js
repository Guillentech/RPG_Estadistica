import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import db from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// --- 1. AUTENTICACIÓN ---
app.post('/api/auth/profesor', (req, res) => {
  const { correo, password } = req.body;
  const profesor = db.prepare('SELECT id, nombre, correo FROM profesores WHERE correo = ? AND password = ?').get(correo, password);
  if (profesor) {
    res.json({ success: true, profesor });
  } else {
    res.status(401).json({ error: 'Credenciales inválidas. Usa admin@universidad.com / admin123' });
  }
});

app.post('/api/auth/estudiante', (req, res) => {
  const { codigo } = req.body;
  const estudiante = db.prepare('SELECT * FROM estudiantes WHERE codigo_unico = ?').get(codigo?.trim().toUpperCase());
  if (estudiante) {
    res.json({ success: true, estudiante });
  } else {
    res.status(404).json({ error: 'Token de gremio no encontrado. Verifica con tu profesor.' });
  }
});

// --- 2. ESTUDIANTES ---
app.get('/api/estudiantes', (req, res) => {
  const estudiantes = db.prepare('SELECT * FROM estudiantes ORDER BY id DESC').all();
  res.json(estudiantes);
});

app.post('/api/estudiantes', (req, res) => {
  const { nombre } = req.body;
  if (!nombre?.trim()) return res.status(400).json({ error: 'El nombre es obligatorio' });

  const codigoUnico = 'EST-' + Math.random().toString(36).substring(2, 6).toUpperCase();
  const info = db.prepare('INSERT INTO estudiantes (nombre, codigo_unico) VALUES (?, ?)').run(nombre.trim(), codigoUnico);
  res.status(201).json({ id: info.lastInsertRowid, nombre, codigo_unico: codigoUnico });
});

app.delete('/api/estudiantes/:id', (req, res) => {
  db.prepare('DELETE FROM estudiantes WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// --- 3. TEMAS (BIOMAS) Y EJEMPLOS (PERGAMINOS) ---
app.get('/api/temas', (req, res) => {
  const temas = db.prepare('SELECT * FROM temas ORDER BY id DESC').all();
  const ejemplos = db.prepare('SELECT * FROM ejemplos').all();
  
  const data = temas.map(t => ({
    ...t,
    ejemplos: ejemplos.filter(e => e.tema_id === t.id)
  }));
  res.json(data);
});

app.post('/api/temas', (req, res) => {
  const { titulo, descripcion } = req.body;
  if (!titulo?.trim()) return res.status(400).json({ error: 'El título es obligatorio' });
  const info = db.prepare('INSERT INTO temas (titulo, descripcion) VALUES (?, ?)').run(titulo.trim(), descripcion?.trim() || '');
  res.status(201).json({ id: info.lastInsertRowid, titulo, descripcion });
});

app.delete('/api/temas/:id', (req, res) => {
  db.prepare('DELETE FROM temas WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

app.post('/api/ejemplos', (req, res) => {
  const { tema_id, titulo, contenido } = req.body;
  if (!tema_id || !titulo?.trim() || !contenido?.trim()) {
    return res.status(400).json({ error: 'Tema, título y contenido son obligatorios' });
  }
  const info = db.prepare('INSERT INTO ejemplos (tema_id, titulo, contenido) VALUES (?, ?, ?)').run(tema_id, titulo.trim(), contenido.trim());
  res.status(201).json({ id: info.lastInsertRowid, tema_id, titulo, contenido });
});

app.delete('/api/ejemplos/:id', (req, res) => {
  db.prepare('DELETE FROM ejemplos WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// --- 4. EVALUACIONES (JEFES FINALES) Y PREGUNTAS ---
app.get('/api/evaluaciones', (req, res) => {
  const query = `
    SELECT e.*, t.titulo as tema_titulo, 
           (SELECT COUNT(*) FROM preguntas WHERE evaluacion_id = e.id) as total_preguntas 
    FROM evaluaciones e
    JOIN temas t ON e.tema_id = t.id
    ORDER BY e.id DESC
  `;
  const evaluaciones = db.prepare(query).all();
  res.json(evaluaciones);
});

app.post('/api/evaluaciones', (req, res) => {
  const { tema_id, titulo } = req.body;
  if (!tema_id || !titulo?.trim()) return res.status(400).json({ error: 'Tema y título son obligatorios' });
  const info = db.prepare('INSERT INTO evaluaciones (tema_id, titulo) VALUES (?, ?)').run(tema_id, titulo.trim());
  res.status(201).json({ id: info.lastInsertRowid, tema_id, titulo });
});

app.delete('/api/evaluaciones/:id', (req, res) => {
  db.prepare('DELETE FROM evaluaciones WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

app.get('/api/evaluaciones/:id/preguntas', (req, res) => {
  const preguntas = db.prepare('SELECT id, evaluacion_id, enunciado, opcion_a, opcion_b, opcion_c, opcion_d FROM preguntas WHERE evaluacion_id = ?').all(req.params.id);
  res.json(preguntas);
});

app.get('/api/evaluaciones/:id/preguntas-docente', (req, res) => {
  const preguntas = db.prepare('SELECT * FROM preguntas WHERE evaluacion_id = ?').all(req.params.id);
  res.json(preguntas);
});

app.post('/api/preguntas', (req, res) => {
  const { evaluacion_id, enunciado, opcion_a, opcion_b, opcion_c, opcion_d, opcion_correcta } = req.body;
  if (!evaluacion_id || !enunciado?.trim() || !opcion_correcta) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }
  const info = db.prepare(`
    INSERT INTO preguntas (evaluacion_id, enunciado, opcion_a, opcion_b, opcion_c, opcion_d, opcion_correcta)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(evaluacion_id, enunciado.trim(), opcion_a.trim(), opcion_b.trim(), opcion_c.trim(), opcion_d.trim(), opcion_correcta.toUpperCase());
  
  res.status(201).json({ id: info.lastInsertRowid, evaluacion_id });
});

app.delete('/api/preguntas/:id', (req, res) => {
  db.prepare('DELETE FROM preguntas WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// --- 5. MOTOR DE CORRECCIÓN, REGISTRO DE RESPUESTAS Y XP ---
app.post('/api/evaluaciones/:id/calificar', (req, res) => {
  const evaluacionId = req.params.id;
  const { estudiante_id, respuestas } = req.body;

  if (!estudiante_id || !respuestas) {
    return res.status(400).json({ error: 'Datos incompletos para calificar' });
  }

  const intentoPrevio = db.prepare('SELECT id, puntaje FROM calificaciones WHERE estudiante_id = ? AND evaluacion_id = ?').get(estudiante_id, evaluacionId);
  if (intentoPrevio) {
    return res.status(400).json({ 
      error: `Ya has enfrentado a este Jefe previamente con un puntaje de ${intentoPrevio.puntaje}%. No se permiten múltiples intentos.` 
    });
  }

  const preguntas = db.prepare('SELECT * FROM preguntas WHERE evaluacion_id = ?').all(evaluacionId);
  if (preguntas.length === 0) {
    return res.status(400).json({ error: 'La evaluación no contiene preguntas' });
  }

  let aciertos = 0;
  const detalleRetroalimentacion = [];

  const insertRespuesta = db.prepare(`
    INSERT INTO respuestas_estudiante (estudiante_id, evaluacion_id, pregunta_id, opcion_elegida, es_correcta)
    VALUES (?, ?, ?, ?, ?)
  `);

  preguntas.forEach((p) => {
    const elegida = (respuestas[p.id] || 'SIN_RESPONDER').toUpperCase();
    const correcta = p.opcion_correcta.toUpperCase();
    const acertada = elegida === correcta ? 1 : 0;

    if (acertada) aciertos++;

    insertRespuesta.run(estudiante_id, evaluacionId, p.id, elegida, acertada);

    detalleRetroalimentacion.push({
      pregunta_id: p.id,
      enunciado: p.enunciado,
      opcion_elegida: elegida,
      opcion_correcta: correcta,
      es_correcta: acertada === 1
    });
  });

  const puntaje = Math.round((aciertos / preguntas.length) * 100);
  const xpGanada = puntaje * 5;

  const info = db.prepare(`
    INSERT INTO calificaciones (estudiante_id, evaluacion_id, puntaje, total_preguntas, aciertos)
    VALUES (?, ?, ?, ?, ?)
  `).run(estudiante_id, evaluacionId, puntaje, preguntas.length, aciertos);

  res.json({
    id: info.lastInsertRowid,
    puntaje,
    xp_ganada: xpGanada,
    total_preguntas: preguntas.length,
    aciertos,
    retroalimentacion: detalleRetroalimentacion
  });
});

app.get('/api/calificaciones', (req, res) => {
  const query = `
    SELECT c.*, e.nombre as estudiante_nombre, e.codigo_unico, ev.titulo as evaluacion_titulo
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
    SELECT c.*, ev.titulo as evaluacion_titulo
    FROM calificaciones c
    JOIN evaluaciones ev ON c.evaluacion_id = ev.id
    WHERE c.estudiante_id = ?
    ORDER BY c.id DESC
  `;
  const notas = db.prepare(query).all(req.params.id);
  res.json(notas);
});

// --- 6. TRABAJOS PRÁCTICOS (MISIONES DE GREMIO) ---
app.get('/api/tareas', (req, res) => {
  const query = `
    SELECT t.*, te.titulo as tema_titulo,
           (SELECT COUNT(*) FROM entregas WHERE tarea_id = t.id) as total_entregas
    FROM tareas t
    JOIN temas te ON t.tema_id = te.id
    ORDER BY t.id DESC
  `;
  const tareas = db.prepare(query).all();
  res.json(tareas);
});

app.post('/api/tareas', (req, res) => {
  const { tema_id, titulo, descripcion, fecha_limite } = req.body;
  if (!tema_id || !titulo?.trim() || !descripcion?.trim()) {
    return res.status(400).json({ error: 'Tema, título y descripción son obligatorios.' });
  }
  const info = db.prepare(`
    INSERT INTO tareas (tema_id, titulo, descripcion, fecha_limite)
    VALUES (?, ?, ?, ?)
  `).run(tema_id, titulo.trim(), descripcion.trim(), fecha_limite || 'Sin fecha');
  res.status(201).json({ id: info.lastInsertRowid });
});

app.delete('/api/tareas/:id', (req, res) => {
  db.prepare('DELETE FROM tareas WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

app.get('/api/tareas/:id/entregas', (req, res) => {
  const query = `
    SELECT en.*, es.nombre as estudiante_nombre, es.codigo_unico
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
    return res.status(400).json({ error: 'Debes redactar tu entrega.' });
  }

  const previa = db.prepare('SELECT id FROM entregas WHERE tarea_id = ? AND estudiante_id = ?').get(tarea_id, estudiante_id);
  if (previa) {
    db.prepare('UPDATE entregas SET contenido = ?, fecha = CURRENT_TIMESTAMP WHERE id = ?').run(contenido.trim(), previa.id);
    return res.json({ success: true, mensaje: 'Entrega actualizada con éxito.' });
  }

  const info = db.prepare(`
    INSERT INTO entregas (tarea_id, estudiante_id, contenido)
    VALUES (?, ?, ?)
  `).run(tarea_id, estudiante_id, contenido.trim());
  res.status(201).json({ id: info.lastInsertRowid, mensaje: 'Entrega enviada con éxito.' });
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
  res.json({ success: true });
});

// --- 7. COPILOTO DE IA LIBRE Y MULTIFUNCIONAL ---
app.post('/api/ia/asistente', async (req, res) => {
  const { mensaje, modo = 'chat' } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!mensaje?.trim()) {
    return res.status(400).json({ error: 'Por favor escribe tu consulta o información.' });
  }

  if (!apiKey || apiKey === 'tu_api_key_aqui' || apiKey === '') {
    if (modo === 'preguntas') {
      return res.json({
        tipo: 'preguntas',
        resultado: [
          {
            enunciado: `Sobre "${mensaje.slice(0, 40)}": ¿Cuál es el principio fundamental en programación?`,
            opcion_a: "Modularidad, reutilización y control seguro en memoria",
            opcion_b: "Ejecución exclusiva en modo monohilo sin funciones",
            opcion_c: "Omitir la validación de tipos de datos",
            opcion_d: "Deshabilitar el uso de parámetros",
            opcion_correcta: "A"
          },
          {
            enunciado: `¿Qué buena práctica evita errores críticos al implementar este tema?`,
            opcion_a: "Concentrar todo el código en una sola línea",
            opcion_b: "Validar entradas, liberar recursos y estructurar clases limpias",
            opcion_c: "Evitar el uso de constructores o funciones",
            opcion_d: "Declarar todas las variables como globales",
            opcion_correcta: "B"
          },
          {
            enunciado: `¿Qué ventaja obtiene un sistema bien diseñado bajo este concepto?`,
            opcion_a: "Código escalable, fácil de depurar y mantener en equipo",
            opcion_b: "Mayor consumo innecesario de memoria RAM",
            opcion_c: "Incompatibilidad con bases de datos relacionales",
            opcion_d: "Bloqueo del flujo de compilación",
            opcion_correcta: "A"
          }
        ]
      });
    }

    if (modo === 'ejemplo') {
      return res.json({
        tipo: 'ejemplo',
        resultado: {
          titulo: `Pergamino Práctico: ${mensaje.slice(0, 35)}`,
          contenido: `// Ejemplo didáctico generado por el Oráculo IA\n// Tema: ${mensaje}\n\n#include <iostream>\nusing namespace std;\n\nclass ModuloAcademico {\npublic:\n    void ejecutar() {\n        cout << "Demostracion ejecutada correctamente." << endl;\n    }\n};\n\nint main() {\n    ModuloAcademico obj;\n    obj.ejecutar();\n    return 0;\n}`
        }
      });
    }

    if (modo === 'tarea') {
      return res.json({
        tipo: 'tarea',
        resultado: {
          titulo: `Misión de Gremio: ${mensaje.slice(0, 35)}`,
          descripcion: `Objetivo de la Misión:\nDesarrollar una solución en código aplicando "${mensaje}".\n\nRequisitos de entrega:\n1. Implementar la lógica modularizada y documentada.\n2. Incluir al menos un caso de prueba funcional.\n3. Explicar brevemente cómo se gestionan los datos en memoria.`
        }
      });
    }

    return res.json({
      tipo: 'chat',
      resultado: `### Análisis Didáctico del Oráculo IA\n**Consulta:** *"${mensaje}"*\n\n#### 1. Explicación Conceptual y Técnica\nEste concepto permite estructurar programas eficientes separando las responsabilidades del código y controlando de forma segura el ciclo de vida de las variables en memoria (Stack y Heap).\n\n\`\`\`cpp\n#include <iostream>\nusing namespace std;\n\nint main() {\n    int* recurso = new int(100); // Reserva dinámica\n    cout << "Valor en memoria: " << *recurso << endl;\n    delete recurso;              // Liberación segura\n    recurso = nullptr;           // Prevención de puntero colgante\n    return 0;\n}\n\`\`\`\n\n#### 2. Errores Comunes de los Estudiantes\n* **Fugas de memoria (Memory Leaks):** Olvidar liberar memoria dinámica con \`delete\`.\n* **Variables sin inicializar:** Usar punteros o atributos antes de asignarles un valor válido.\n\n#### 3. Sugerencia para tu Clase\nPuedes cambiar arriba a la pestaña **"🐉 Generar Preguntas"** o **"📜 Crear Pergamino"** para transformar este mismo tema en material evaluable con un solo clic.`
    });
  }

  try {
    let systemInstruction = "";
    let forceJson = false;

    if (modo === 'preguntas') {
      forceJson = true;
      systemInstruction = `Genera exactamente 3 preguntas de opción múltiple sobre el tema dado. Responde ÚNICAMENTE un arreglo JSON con: [{"enunciado":"","opcion_a":"","opcion_b":"","opcion_c":"","opcion_d":"","opcion_correcta":"A"}]`;
    } else if (modo === 'ejemplo') {
      forceJson = true;
      systemInstruction = `Genera un ejemplo de código didáctico sobre el tema dado. Responde ÚNICAMENTE un objeto JSON: {"titulo":"","contenido":""}`;
    } else if (modo === 'tarea') {
      forceJson = true;
      systemInstruction = `Genera un trabajo práctico universitario sobre el tema dado. Responde ÚNICAMENTE un objeto JSON: {"titulo":"","descripcion":""}`;
    } else {
      systemInstruction = `Eres el Copiloto de IA para docentes universitarios de Saga Académica. Responde con profundidad técnica, ejemplos de código claros y consejos pedagógicos.`;
    }

    const payload = {
      contents: [{ parts: [{ text: `${systemInstruction}\n\nSOLICITUD DEL PROFESOR:\n${mensaje}` }] }]
    };

    if (forceJson) {
      payload.generationConfig = { responseMimeType: "application/json" };
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    const textoGenerado = data.candidates[0].content.parts[0].text;

    if (forceJson) {
      res.json({ tipo: modo, resultado: JSON.parse(textoGenerado) });
    } else {
      res.json({ tipo: 'chat', resultado: textoGenerado });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error al procesar la solicitud con la IA.' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor de Saga Académica corriendo en http://localhost:${PORT}`);
});