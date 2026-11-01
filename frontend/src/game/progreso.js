export const agruparTemasPorUnidad = (temas = []) => {
  const grupos = new Map();
  for (const tema of temas) {
    const clave = tema.unidad_id ?? 'sin-unidad';
    if (!grupos.has(clave)) grupos.set(clave, []);
    grupos.get(clave).push(tema);
  }
  return grupos;
};

export const temasDeUnidad = (temas = [], unidadId) =>
  temas
    .filter(tema => tema.unidad_id === unidadId)
    .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0) || a.id - b.id);

export const evaluacionesDeUnidad = (evaluaciones = [], temas = []) => {
  const ids = new Set(temas.map(tema => tema.id));
  return evaluaciones.filter(ev => ids.has(ev.tema_id));
};

export const tareasDeUnidad = (tareas = [], temas = []) => {
  const ids = new Set(temas.map(tema => tema.id));
  return tareas.filter(tarea => ids.has(tarea.tema_id));
};

export const calcularProgresoUnidad = ({
  temas = [],
  evaluaciones = [],
  tareas = [],
  calificaciones = [],
  entregas = []
}) => {
  const evals = evaluacionesDeUnidad(evaluaciones, temas);
  const tars = tareasDeUnidad(tareas, temas);
  const total = evals.length + tars.length;

  const evaluacionesHechas = evals.filter(ev => calificaciones.some(c => c.evaluacion_id === ev.id)).length;
  const tareasHechas = tars.filter(tar => entregas.some(e => e.tarea_id === tar.id)).length;
  const completadas = evaluacionesHechas + tareasHechas;

  return {
    total,
    completadas,
    porcentaje: total > 0 ? Math.round((completadas / total) * 100) : 0,
    evaluaciones: evals,
    tareas: tars,
    jefe: evals[0] || null
  };
};

export const crearUnidadCampamento = (temasSinUnidad = []) => {
  if (temasSinUnidad.length === 0) return null;
  return {
    id: 'campamento',
    numero: 0,
    nombre: 'Campamento del Gremio',
    descripcion: 'Contenido general que aún no pertenece a una Unidad del sílabo.',
    bioma: 'pradera',
    pos_col: null,
    pos_fila: null,
    total_temas: temasSinUnidad.length,
    esCampamento: true
  };
};
