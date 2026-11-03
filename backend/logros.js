import db from './db.js';

// 🏆 Motor de logros: evalúa las medallas de un héroe a partir de su actividad real.
// Mantiene las mismas reglas de progreso que el motor de corrección (XP base, nivel y nota).

const XP_BASE = 150;
const NOTA_MAX = 100;
const XP_POR_NIVEL = 250;
const MAX_VUELTAS = 4; // Permite desbloquear logros en cascada (p. ej. nivel → coleccionista)

const nivelDesdeXp = (xp) => Math.max(1, Math.floor((Number(xp) || 0) / XP_POR_NIVEL) + 1);

const diasEntre = (fechaA, fechaB) =>
  Math.round((Date.parse(`${fechaA}T00:00:00Z`) - Date.parse(`${fechaB}T00:00:00Z`)) / 86400000);

// Racha de días con actividad (evaluaciones + entregas), terminando hoy o ayer.
const contarRachaDias = (fechas = []) => {
  const dias = [...new Set(fechas.filter(Boolean).map((f) => String(f).slice(0, 10)))].sort().reverse();
  if (dias.length === 0) return 0;

  const hoy = new Date().toISOString().slice(0, 10);
  if (diasEntre(hoy, dias[0]) > 1) return 0;

  let racha = 1;
  for (let i = 1; i < dias.length; i += 1) {
    if (diasEntre(dias[i - 1], dias[i]) !== 1) break;
    racha += 1;
  }
  return racha;
};

// Últimas entregas calificadas aprobadas de forma consecutiva.
const contarRachaMisiones = (estudianteId) => {
  const entregas = db.prepare(`
    SELECT calificacion
    FROM entregas
    WHERE estudiante_id = ? AND calificacion IS NOT NULL
    ORDER BY id DESC
  `).all(estudianteId);

  let racha = 0;
  for (const entrega of entregas) {
    if (Number(entrega.calificacion) < 60) break;
    racha += 1;
  }
  return racha;
};

const calcularPerfil = (estudianteId) => {
  const estudiante = db.prepare(`
    SELECT id, nombre, codigo_unico, xp, nivel, hp, clase_rpg, avatar
    FROM estudiantes WHERE id = ?
  `).get(estudianteId);
  if (!estudiante) return null;

  const xpEvaluaciones = db.prepare(
    'SELECT COALESCE(SUM(xp_ganada), 0) as total FROM calificaciones WHERE estudiante_id = ?'
  ).get(estudianteId).total;
  const xpTareas = db.prepare(
    'SELECT COALESCE(SUM(calificacion * 2), 0) as total FROM entregas WHERE estudiante_id = ? AND calificacion IS NOT NULL'
  ).get(estudianteId).total;
  const xpLogros = db.prepare(`
    SELECT COALESCE(SUM(l.xp_bonus), 0) as total
    FROM estudiante_logros el
    JOIN logros l ON l.id = el.logro_id
    WHERE el.estudiante_id = ?
  `).get(estudianteId).total;

  const xp = Math.round(XP_BASE + xpEvaluaciones + xpTareas + xpLogros);

  const puntosEvaluaciones = db.prepare(`
    SELECT COALESCE(SUM(ROUND(MIN(100, MAX(0, c.puntaje)) / 100.0 * e.puntos_max)), 0) as puntos
    FROM calificaciones c
    JOIN evaluaciones e ON c.evaluacion_id = e.id
    WHERE c.estudiante_id = ?
  `).get(estudianteId).puntos;
  const puntosTareas = db.prepare(`
    SELECT COALESCE(SUM(ROUND(MIN(100, MAX(0, en.calificacion)) / 100.0 * t.puntos_max)), 0) as puntos
    FROM entregas en
    JOIN tareas t ON en.tarea_id = t.id
    WHERE en.estudiante_id = ? AND en.calificacion IS NOT NULL
  `).get(estudianteId).puntos;

  return {
    ...estudiante,
    xp,
    nivel: nivelDesdeXp(xp),
    nota_materia: Math.min(NOTA_MAX, Math.round((puntosEvaluaciones || 0) + (puntosTareas || 0)))
  };
};

const crearContexto = (estudianteId) => {
  const perfil = calcularPerfil(estudianteId);
  if (!perfil) return null;

  const evaluaciones = db.prepare(`
    SELECT COUNT(*) as total,
           COALESCE(SUM(CASE WHEN puntaje >= 60 THEN 1 ELSE 0 END), 0) as aprobadas,
           COALESCE(SUM(CASE WHEN puntaje >= 100 THEN 1 ELSE 0 END), 0) as perfectas
    FROM calificaciones
    WHERE estudiante_id = ?
  `).get(estudianteId);

  const entregas = db.prepare(`
    SELECT COUNT(*) as total,
           COALESCE(SUM(CASE WHEN calificacion IS NOT NULL THEN 1 ELSE 0 END), 0) as calificadas
    FROM entregas
    WHERE estudiante_id = ?
  `).get(estudianteId);

  const fechas = db.prepare(`
    SELECT fecha FROM calificaciones WHERE estudiante_id = ?
    UNION ALL
    SELECT fecha FROM entregas WHERE estudiante_id = ?
  `).all(estudianteId, estudianteId).map((fila) => fila.fecha);

  const desbloqueados = new Set(db.prepare(`
    SELECT l.codigo
    FROM estudiante_logros el
    JOIN logros l ON l.id = el.logro_id
    WHERE el.estudiante_id = ?
  `).all(estudianteId).map((fila) => fila.codigo));

  return {
    perfil,
    evaluaciones,
    entregas,
    rachaMisiones: contarRachaMisiones(estudianteId),
    rachaDias: contarRachaDias(fechas),
    desbloqueados
  };
};

// Regla de cada medalla: `valor` es el progreso actual y `meta` lo necesario para desbloquearla.
const REGLAS = {
  primer_jefe: { meta: 1, valor: (c) => c.evaluaciones.total },
  jefe_aprobado: { meta: 1, valor: (c) => c.evaluaciones.aprobadas },
  nota_perfecta: { meta: 1, valor: (c) => c.evaluaciones.perfectas },
  veterano_jefes: { meta: 3, valor: (c) => c.evaluaciones.aprobadas },
  primera_mision: { meta: 1, valor: (c) => c.entregas.total },
  misiones_3: { meta: 3, valor: (c) => c.entregas.calificadas },
  misiones_seguidas: { meta: 3, valor: (c) => c.rachaMisiones },
  nota_alta: { meta: 80, valor: (c) => c.perfil.nota_materia },
  nivel_5: { meta: 5, valor: (c) => c.perfil.nivel },
  nivel_10: { meta: 10, valor: (c) => c.perfil.nivel },
  racha_7: { meta: 7, valor: (c) => c.rachaDias },
  xp_2000: { meta: 2000, valor: (c) => c.perfil.xp },
  coleccionista: { meta: 6, valor: (c) => c.desbloqueados.size },
  archimago: { meta: 12, valor: (c) => c.perfil.nivel }
};

/**
 * Evalúa y desbloquea los logros pendientes del héroe.
 * Devuelve solo las medallas nuevas para que la UI pueda mostrar el toast.
 */
export const evaluarLogros = (estudianteId) => {
  const id = Number(estudianteId);
  if (!Number.isInteger(id) || id < 1) return [];

  const nuevos = [];
  const insertar = db.prepare(
    'INSERT OR IGNORE INTO estudiante_logros (estudiante_id, logro_id) VALUES (?, ?)'
  );
  const catalogo = db.prepare('SELECT * FROM logros ORDER BY orden, id').all();

  for (let vuelta = 0; vuelta < MAX_VUELTAS; vuelta += 1) {
    const contexto = crearContexto(id);
    if (!contexto) break;

    const pendientes = catalogo.filter((logro) => {
      if (contexto.desbloqueados.has(logro.codigo)) return false;
      const regla = REGLAS[logro.codigo];
      return Boolean(regla) && regla.valor(contexto) >= regla.meta;
    });

    if (pendientes.length === 0) break;

    for (const logro of pendientes) {
      const resultado = insertar.run(id, logro.id);
      if (resultado.changes > 0) {
        nuevos.push({ ...logro, fecha_desbloqueo: new Date().toISOString() });
      }
    }
  }

  return nuevos;
};

/**
 * Catálogo completo con el estado y el progreso de cada medalla para un héroe.
 */
export const listarLogrosEstudiante = (estudianteId) => {
  const id = Number(estudianteId);
  const contexto = crearContexto(id);
  if (!contexto) return null;

  const catalogo = db.prepare('SELECT * FROM logros ORDER BY orden, id').all();
  const desbloqueos = new Map(
    db.prepare('SELECT logro_id, fecha FROM estudiante_logros WHERE estudiante_id = ?')
      .all(id)
      .map((fila) => [fila.logro_id, fila.fecha])
  );

  const logros = catalogo.map((logro) => {
    const regla = REGLAS[logro.codigo];
    const progresoMeta = regla?.meta ?? 1;
    const progresoActual = Math.min(regla?.valor(contexto) ?? 0, progresoMeta);

    return {
      ...logro,
      desbloqueado: desbloqueos.has(logro.id),
      fecha_desbloqueo: desbloqueos.get(logro.id) || null,
      progreso_actual: progresoActual,
      progreso_meta: progresoMeta
    };
  });

  return {
    total: logros.length,
    desbloqueados: logros.filter((logro) => logro.desbloqueado).length,
    xp_bonus_total: logros
      .filter((logro) => logro.desbloqueado)
      .reduce((total, logro) => total + (Number(logro.xp_bonus) || 0), 0),
    logros
  };
};
