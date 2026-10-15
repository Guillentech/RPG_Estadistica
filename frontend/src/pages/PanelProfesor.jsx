import React, { useState, useEffect } from 'react';
import { 
  Users, BookOpen, FileCheck, Award, Sparkles, 
  Download, CheckCircle, BrainCircuit, Trash2, 
  ClipboardList, ChevronRight, Eye, Copy, PlusCircle,
  Swords, Map, ScrollText, Shield, Zap
} from 'lucide-react';

export default function PanelProfesor() {
  // Orden solicitado: 1. Estudiantes -> 2. Copiloto IA -> 3. Temas -> 4. Evaluaciones -> 5. Trabajos -> 6. Calificaciones
  const [pestana, setPestana] = useState('estudiantes');

  // Estados de datos
  const [estudiantes, setEstudiantes] = useState([]);
  const [temas, setTemas] = useState([]);
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [calificaciones, setCalificaciones] = useState([]);
  const [tareas, setTareas] = useState([]);

  // Visor interactivo de preguntas de una evaluación
  const [evaluacionVerPreguntas, setEvaluacionVerPreguntas] = useState(null);
  const [preguntasDeEvaluacion, setPreguntasDeEvaluacion] = useState([]);

  // Revisión de entregas de misiones (tareas)
  const [tareaSeleccionada, setTareaSeleccionada] = useState(null);
  const [entregasTarea, setEntregasTarea] = useState([]);
  const [feedbackInput, setFeedbackInput] = useState({});
  const [notaInput, setNotaInput] = useState({});

  // Estados del Copiloto IA Libre
  const [cargandoIA, setCargandoIA] = useState(false);
  const [promptIA, setPromptIA] = useState('');
  const [modoIA, setModoIA] = useState('chat'); // 'chat' | 'preguntas' | 'ejemplo' | 'tarea'
  const [respuestaIA, setRespuestaIA] = useState(null);

  // Formularios manuales
  const [nuevoEstudiante, setNuevoEstudiante] = useState('');
  const [temaTitulo, setTemaTitulo] = useState('');
  const [temaDesc, setTemaDesc] = useState('');
  const [ejTemaId, setEjTemaId] = useState('');
  const [ejTitulo, setEjTitulo] = useState('');
  const [ejContenido, setEjContenido] = useState('');
  const [evalTemaId, setEvalTemaId] = useState('');
  const [evalTitulo, setEvalTitulo] = useState('');

  // Formulario Tareas / Misiones
  const [tareaTemaId, setTareaTemaId] = useState('');
  const [tareaTitulo, setTareaTitulo] = useState('');
  const [tareaDesc, setTareaDesc] = useState('');
  const [tareaFecha, setTareaFecha] = useState('');

  // Preguntas manuales
  const [pregEvalId, setPregEvalId] = useState('');
  const [enunciado, setEnunciado] = useState('');
  const [opA, setOpA] = useState('');
  const [opB, setOpB] = useState('');
  const [opC, setOpC] = useState('');
  const [opD, setOpD] = useState('');
  const [opCorrecta, setOpCorrecta] = useState('A');

  const cargarDatos = () => {
    fetch('http://localhost:4000/api/estudiantes').then(r => r.json()).then(setEstudiantes);
    fetch('http://localhost:4000/api/temas').then(r => r.json()).then(setTemas);
    fetch('http://localhost:4000/api/evaluaciones').then(r => r.json()).then(setEvaluaciones);
    fetch('http://localhost:4000/api/calificaciones').then(r => r.json()).then(setCalificaciones);
    fetch('http://localhost:4000/api/tareas').then(r => r.json()).then(setTareas);
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // --- COPILOTO DE IA ---
  const consultarCopiloto = async () => {
    if (!promptIA.trim()) {
      return alert("Escribe tu instrucción, tema o consulta para el Copiloto.");
    }
    setCargandoIA(true);
    setRespuestaIA(null);

    try {
      const res = await fetch('http://localhost:4000/api/ia/asistente', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mensaje: promptIA.trim(), modo: modoIA })
      });
      const data = await res.json();
      if (res.ok) {
        setRespuestaIA(data);
      } else {
        alert(data.error || 'Error al procesar la solicitud.');
      }
    } catch {
      alert('Error de conexión con el Copiloto IA.');
    } finally {
      setCargandoIA(false);
    }
  };

  const guardarPreguntaDesdeIA = async (pregunta, evaluacionId) => {
    if (!evaluacionId) return alert("Selecciona la evaluación (Jefe Final) de destino.");
    const res = await fetch('http://localhost:4000/api/preguntas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        evaluacion_id: evaluacionId,
        enunciado: pregunta.enunciado,
        opcion_a: pregunta.opcion_a,
        opcion_b: pregunta.opcion_b,
        opcion_c: pregunta.opcion_c,
        opcion_d: pregunta.opcion_d,
        opcion_correcta: pregunta.opcion_correcta
      })
    });
    if (res.ok) {
      alert("¡Pregunta asignada al Jefe Final!");
      setRespuestaIA(prev => ({
        ...prev,
        resultado: prev.resultado.filter(p => p !== pregunta)
      }));
      cargarDatos();
    }
  };

  const guardarEjemploDesdeIA = async (temaId) => {
    if (!temaId) return alert("Selecciona a qué Bioma (Tema) deseas vincular este Pergamino.");
    const res = await fetch('http://localhost:4000/api/ejemplos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tema_id: temaId,
        titulo: respuestaIA.resultado.titulo,
        contenido: respuestaIA.resultado.contenido
      })
    });
    if (res.ok) {
      alert("¡Pergamino de código publicado en el Bioma!");
      cargarDatos();
    }
  };

  const guardarTareaDesdeIA = async (temaId) => {
    if (!temaId) return alert("Selecciona a qué Bioma (Tema) deseas asignar esta misión.");
    const res = await fetch('http://localhost:4000/api/tareas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tema_id: temaId,
        titulo: respuestaIA.resultado.titulo,
        descripcion: respuestaIA.resultado.descripcion,
        fecha_limite: 'Próxima sesión'
      })
    });
    if (res.ok) {
      alert("¡Misión práctica publicada en el Tablón del Gremio!");
      cargarDatos();
    }
  };

  // --- VISOR DE PREGUNTAS DE EVALUACIÓN ---
  const verPreguntasDeEvaluacion = async (evaluacion) => {
    if (evaluacionVerPreguntas?.id === evaluacion.id) {
      setEvaluacionVerPreguntas(null);
      return;
    }

    setEvaluacionVerPreguntas(evaluacion);
    try {
      let res = await fetch(`http://localhost:4000/api/evaluaciones/${evaluacion.id}/preguntas-docente`);
      if (!res.ok) {
        res = await fetch(`http://localhost:4000/api/evaluaciones/${evaluacion.id}/preguntas`);
      }
      const data = await res.json();
      setPreguntasDeEvaluacion(data);
    } catch {
      alert('Error al consultar las preguntas.');
    }
  };

  const eliminarPreguntaIndividual = async (id) => {
    if (!window.confirm('¿Eliminar esta pregunta del Jefe Final?')) return;
    await fetch(`http://localhost:4000/api/preguntas/${id}`, { method: 'DELETE' });
    verPreguntasDeEvaluacion(evaluacionVerPreguntas);
    cargarDatos();
  };

  // --- REVISIÓN DE ENTREGAS ---
  const verEntregasDeTarea = async (tarea) => {
    setTareaSeleccionada(tarea);
    try {
      const res = await fetch(`http://localhost:4000/api/tareas/${tarea.id}/entregas`);
      const data = await res.json();
      setEntregasTarea(data);
    } catch {
      alert('Error al cargar entregas.');
    }
  };

  const guardarCalificacionEntrega = async (entregaId) => {
    const nota = notaInput[entregaId];
    const feedback = feedbackInput[entregaId] || '';

    if (nota === undefined || nota === '') {
      return alert('Ingresa una calificación numérica (0 - 100).');
    }

    const res = await fetch(`http://localhost:4000/api/entregas/${entregaId}/calificar`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ calificacion: parseFloat(nota), retroalimentacion: feedback })
    });

    if (res.ok) {
      alert('Calificación y retroalimentación enviadas al aventurero.');
      verEntregasDeTarea(tareaSeleccionada);
      cargarDatos();
    }
  };

  // --- ELIMINACIONES ---
  const eliminarEstudiante = async (id, nombre) => {
    if (!window.confirm(`¿Dar de baja al estudiante "${nombre}"?`)) return;
    await fetch(`http://localhost:4000/api/estudiantes/${id}`, { method: 'DELETE' });
    cargarDatos();
  };

  const eliminarTema = async (id, titulo) => {
    if (!window.confirm(`¿Eliminar el Bioma "${titulo}" con todos sus pergaminos y evaluaciones?`)) return;
    await fetch(`http://localhost:4000/api/temas/${id}`, { method: 'DELETE' });
    cargarDatos();
  };

  const eliminarEjemplo = async (id) => {
    if (!window.confirm('¿Eliminar este pergamino de ejemplo?')) return;
    await fetch(`http://localhost:4000/api/ejemplos/${id}`, { method: 'DELETE' });
    cargarDatos();
  };

  const eliminarEvaluacion = async (id, titulo) => {
    if (!window.confirm(`¿Eliminar al Jefe Final "${titulo}" y todas sus preguntas?`)) return;
    await fetch(`http://localhost:4000/api/evaluaciones/${id}`, { method: 'DELETE' });
    if (evaluacionVerPreguntas?.id === id) setEvaluacionVerPreguntas(null);
    cargarDatos();
  };

  const eliminarTarea = async (id, titulo) => {
    if (!window.confirm(`¿Eliminar la misión "${titulo}"?`)) return;
    await fetch(`http://localhost:4000/api/tareas/${id}`, { method: 'DELETE' });
    if (tareaSeleccionada?.id === id) setTareaSeleccionada(null);
    cargarDatos();
  };

  const promedioNotas = calificaciones.length 
    ? (calificaciones.reduce((acc, c) => acc + c.puntaje, 0) / calificaciones.length).toFixed(1)
    : 0;

  // --- EXPORTAR CSV ---
  const exportarCalificacionesCSV = () => {
    if (calificaciones.length === 0) return alert("No hay calificaciones registradas aún.");
    const encabezados = "Estudiante,Token_Gremio,Jefe_Evaluacion,Aciertos,Puntaje,XP_Ganada,Estado,Fecha\n";
    const filas = calificaciones.map(c => 
      `"${c.estudiante_nombre}","${c.codigo_unico}","${c.evaluacion_titulo}",${c.aciertos}/${c.total_preguntas},${c.puntaje}%,+${c.puntaje * 5} XP,${c.puntaje >= 60 ? 'Jefe Derrotado' : 'No Superado'},"${c.fecha}"`
    ).join("\n");

    const blob = new Blob([encabezados + filas], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Saga_Academica_Notas_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- REGISTROS MANUALES ---
  const registrarEstudiante = async (e) => {
    e.preventDefault();
    if (!nuevoEstudiante.trim()) return;
    const res = await fetch('http://localhost:4000/api/estudiantes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre: nuevoEstudiante })
    });
    if (res.ok) {
      setNuevoEstudiante('');
      cargarDatos();
    }
  };

  const crearTema = async (e) => {
    e.preventDefault();
    if (!temaTitulo.trim()) return;
    const res = await fetch('http://localhost:4000/api/temas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ titulo: temaTitulo, descripcion: temaDesc })
    });
    if (res.ok) {
      setTemaTitulo('');
      setTemaDesc('');
      cargarDatos();
    }
  };

  const crearEjemplo = async (e) => {
    e.preventDefault();
    if (!ejTemaId || !ejTitulo.trim() || !ejContenido.trim()) return;
    const res = await fetch('http://localhost:4000/api/ejemplos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tema_id: ejTemaId, titulo: ejTitulo, contenido: ejContenido })
    });
    if (res.ok) {
      setEjTitulo('');
      setEjContenido('');
      cargarDatos();
    }
  };

  const crearEvaluacion = async (e) => {
    e.preventDefault();
    if (!evalTemaId || !evalTitulo.trim()) return;
    const res = await fetch('http://localhost:4000/api/evaluaciones', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tema_id: evalTemaId, titulo: evalTitulo })
    });
    if (res.ok) {
      setEvalTitulo('');
      cargarDatos();
    }
  };

  const crearTarea = async (e) => {
    e.preventDefault();
    if (!tareaTemaId || !tareaTitulo.trim() || !tareaDesc.trim()) return;
    const res = await fetch('http://localhost:4000/api/tareas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tema_id: tareaTemaId,
        titulo: tareaTitulo,
        descripcion: tareaDesc,
        fecha_limite: tareaFecha
      })
    });
    if (res.ok) {
      setTareaTitulo('');
      setTareaDesc('');
      setTareaFecha('');
      alert('Misión asignada en el Tablón del Gremio.');
      cargarDatos();
    }
  };

  const crearPreguntaManual = async (e) => {
    e.preventDefault();
    if (!pregEvalId || !enunciado.trim()) return;
    const res = await fetch('http://localhost:4000/api/preguntas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        evaluacion_id: pregEvalId,
        enunciado,
        opcion_a: opA,
        opcion_b: opB,
        opcion_c: opC,
        opcion_d: opD,
        opcion_correcta: opCorrecta
      })
    });
    if (res.ok) {
      setEnunciado('');
      setOpA('');
      setOpB('');
      setOpC('');
      setOpD('');
      alert('Ataque / Pregunta añadida al Jefe.');
      cargarDatos();
    }
  };

  const getTabStyle = (nombreTab, esIA = false) => {
    const activa = pestana === nombreTab;
    if (activa) {
      return {
        background: esIA 
          ? 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)' 
          : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
        color: '#ffffff',
        border: '1px solid transparent',
        boxShadow: esIA ? '0 4px 12px rgba(139, 92, 246, 0.35)' : '0 4px 12px rgba(59, 130, 246, 0.35)',
        cursor: 'pointer',
        padding: '0.65rem 1.15rem',
        borderRadius: '8px',
        fontWeight: '600',
        fontSize: '0.88rem',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        transition: 'all 0.2s ease'
      };
    }
    return {
      background: 'rgba(255, 255, 255, 0.04)',
      color: '#94a3b8',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      cursor: 'pointer',
      padding: '0.65rem 1.15rem',
      borderRadius: '8px',
      fontWeight: '600',
      fontSize: '0.88rem',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
      transition: 'all 0.2s ease'
    };
  };

  return (
    <div className="container">
      
      {/* Encabezado de Consola del Game Master */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span style={{ fontSize: '0.78rem', color: '#fbbf24', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            🧙‍♂️ CONSOLA DE ADMINISTRACIÓN DOCENTE
          </span>
          <h2 style={{ fontSize: '1.65rem', marginTop: '0.15rem' }}>Panel de Control del Game Master</h2>
        </div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', background: 'var(--bg-card)', padding: '0.6rem 1rem', borderRadius: '10px', border: '1px solid var(--border)' }}>
          Sincronizado en tiempo real con el <strong>Mapa 2D de Estudiantes</strong>
        </div>
      </div>

      {/* 4 KPIs */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon"><Users size={24} /></div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Aventureros (Alumnos)</span>
            <h3 style={{ fontSize: '1.6rem', marginTop: '0.2rem' }}>{estudiantes.length}</h3>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon" style={{ color: '#38bdf8', background: 'rgba(56, 189, 248, 0.12)' }}>
            <Map size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Biomas (Temas)</span>
            <h3 style={{ fontSize: '1.6rem', marginTop: '0.2rem' }}>{temas.length}</h3>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon" style={{ color: '#ef4444', background: 'rgba(239, 68, 68, 0.12)' }}>
            <Swords size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Jefes (Evaluaciones)</span>
            <h3 style={{ fontSize: '1.6rem', marginTop: '0.2rem' }}>{evaluaciones.length}</h3>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon" style={{ color: '#fbbf24', background: 'rgba(251, 191, 36, 0.12)' }}>
            <Award size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Promedio General</span>
            <h3 style={{ fontSize: '1.6rem', marginTop: '0.2rem' }}>{promedioNotas}%</h3>
          </div>
        </div>
      </div>

      {/* BARRA DE PESTAÑAS EN EL ORDEN EXACTO SOLICITADO */}
      <div style={{ 
        display: 'flex', 
        gap: '0.5rem', 
        background: 'rgba(15, 23, 42, 0.75)', 
        padding: '0.45rem', 
        borderRadius: '12px', 
        border: '1px solid rgba(255, 255, 255, 0.08)', 
        marginBottom: '1.75rem', 
        flexWrap: 'wrap' 
      }}>
        {/* 1. Estudiantes */}
        <button style={getTabStyle('estudiantes')} onClick={() => setPestana('estudiantes')}>
          <Users size={18} /> Estudiantes
        </button>

        {/* 2. Copiloto IA */}
        <button style={getTabStyle('ia-evaluador', true)} onClick={() => setPestana('ia-evaluador')}>
          <Sparkles size={18} /> Copiloto IA
        </button>

        {/* 3. Temas y Ejemplos */}
        <button style={getTabStyle('temas')} onClick={() => setPestana('temas')}>
          <BookOpen size={18} /> Temas y Ejemplos
        </button>

        {/* 4. Evaluaciones */}
        <button style={getTabStyle('evaluaciones')} onClick={() => setPestana('evaluaciones')}>
          <FileCheck size={18} /> Evaluaciones
        </button>

        {/* 5. Trabajos Prácticos */}
        <button style={getTabStyle('tareas')} onClick={() => setPestana('tareas')}>
          <ClipboardList size={18} /> Trabajos Prácticos
        </button>

        {/* 6. Calificaciones */}
        <button style={getTabStyle('calificaciones')} onClick={() => setPestana('calificaciones')}>
          <Award size={18} /> Calificaciones
        </button>
      </div>

      {/* =================================================================
          1. PESTAÑA: ESTUDIANTES (REQUISITOS 6 Y 7)
          ================================================================= */}
      {pestana === 'estudiantes' && (
        <div className="grid-2">
          <div className="card-pro">
            <h3>Reclutar Estudiante (Matrícula)</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              El sistema generará un <strong>Token Único de Gremio (EST-XXXX)</strong> para que el estudiante acceda al Mapa 2D.
            </p>
            <form onSubmit={registrarEstudiante}>
              <div className="input-group">
                <label className="input-label">Nombre Completo del Estudiante:</label>
                <input 
                  type="text" 
                  className="input-pro" 
                  value={nuevoEstudiante} 
                  onChange={(e) => setNuevoEstudiante(e.target.value)} 
                  placeholder="Ej: Alex Enmanuel Merlo"
                  required 
                />
              </div>
              <button type="submit" className="btn-pro btn-pro-primary" style={{ width: '100%' }}>
                Generar Código Único y Registrar
              </button>
            </form>
          </div>

          <div className="card-pro">
            <h3>Aventureros Matriculados ({estudiantes.length})</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '0.75rem' }}>
              Comparte el código con cada estudiante para que pueda iniciar sesión.
            </p>
            <div style={{ maxHeight: '420px', overflowY: 'auto', marginTop: '0.5rem' }}>
              {estudiantes.map(est => (
                <div key={est.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.8rem 0', borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <div style={{ fontWeight: '700' }}>🛡️ {est.nombre}</div>
                    <span style={{ color: '#fbbf24', fontSize: '0.88rem', fontFamily: 'monospace', fontWeight: '700' }}>
                      Token: {est.codigo_unico}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.45rem' }}>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(est.codigo_unico);
                        alert(`Código ${est.codigo_unico} copiado al portapapeles.`);
                      }}
                      className="btn-pro"
                      style={{ padding: '0.4rem 0.7rem', fontSize: '0.78rem', background: 'rgba(255,255,255,0.06)', color: '#fff' }}
                      title="Copiar código"
                    >
                      <Copy size={14} /> Copiar
                    </button>
                    <button onClick={() => eliminarEstudiante(est.id, est.nombre)} className="btn-danger" style={{ padding: '0.4rem 0.6rem', borderRadius: '8px' }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =================================================================
          2. PESTAÑA: COPILOTO IA LIBRE Y MULTIFUNCIONAL
          ================================================================= */}
      {pestana === 'ia-evaluador' && (
        <div className="card-pro">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.25rem' }}>
            <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'rgba(139, 92, 246, 0.2)', color: '#8b5cf6' }}>
              <BrainCircuit size={32} />
            </div>
            <div>
              <h3>Oráculo & Copiloto de IA para el Game Master</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Ingresa libremente cualquier duda, temario o apunte. El Copiloto te asistirá o creará contenido listo para el Mapa 2D.
              </p>
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label className="input-label">Selecciona la modalidad de asistencia:</label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {[
                { id: 'chat', label: '💬 Consulta Didáctica Libre' },
                { id: 'preguntas', label: '🐉 Generar Preguntas para Jefe (Examen)' },
                { id: 'ejemplo', label: '📜 Crear Pergamino de Código (Ejemplo)' },
                { id: 'tarea', label: '🛡️ Diseñar Misión Práctica (Tarea)' }
              ].map(m => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setModoIA(m.id)}
                  style={{
                    padding: '0.5rem 0.9rem',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    border: modoIA === m.id ? '1px solid #8b5cf6' : '1px solid var(--border)',
                    background: modoIA === m.id ? 'rgba(139, 92, 246, 0.25)' : 'var(--bg-input)',
                    color: modoIA === m.id ? '#c4b5fd' : 'var(--text-muted)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Escribe tu instrucción, pregunta o tema:</label>
            <textarea 
              className="input-pro"
              rows="5"
              placeholder="Escribe aquí cualquier concepto, pega código o pide ayuda pedagógica al Copiloto..."
              value={promptIA}
              onChange={(e) => setPromptIA(e.target.value)}
            />
          </div>

          <button 
            onClick={consultarCopiloto} 
            disabled={cargandoIA} 
            className="btn-pro btn-pro-ai"
            style={{ width: '100%', padding: '0.85rem', fontSize: '0.95rem' }}
          >
            <Sparkles size={18} /> {cargandoIA ? 'Consultando al Oráculo de IA...' : 'Enviar al Copiloto de IA'}
          </button>

          {respuestaIA && (
            <div style={{ marginTop: '2rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
              
              {respuestaIA.tipo === 'chat' && (
                <div style={{ background: 'var(--bg-input)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                    <strong style={{ color: '#c4b5fd', fontSize: '0.95rem' }}>Respuesta del Copiloto Docente:</strong>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(respuestaIA.resultado);
                        alert("Respuesta copiada.");
                      }}
                      className="btn-pro" 
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', background: 'rgba(255,255,255,0.06)', color: 'white' }}
                    >
                      <Copy size={14} /> Copiar Texto
                    </button>
                  </div>
                  <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: '0.92rem', color: '#f8fafc', lineHeight: '1.6' }}>
                    {respuestaIA.resultado}
                  </pre>
                </div>
              )}

              {respuestaIA.tipo === 'preguntas' && (
                <div>
                  <h4 style={{ marginBottom: '1rem', color: '#c4b5fd' }}>
                    Reactivos Generados para Asignar a un Jefe Final:
                  </h4>
                  {respuestaIA.resultado.map((preg, index) => (
                    <div key={index} style={{ background: 'var(--bg-input)', padding: '1.25rem', borderRadius: '10px', marginBottom: '1rem', border: '1px solid var(--border)' }}>
                      <p style={{ fontWeight: '600', marginBottom: '0.75rem' }}>{index + 1}. {preg.enunciado}</p>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                        <div><strong>A)</strong> {preg.opcion_a}</div>
                        <div><strong>B)</strong> {preg.opcion_b}</div>
                        <div><strong>C)</strong> {preg.opcion_c}</div>
                        <div><strong>D)</strong> {preg.opcion_d}</div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                        <span className="badge badge-success">Clave Correcta: Opción {preg.opcion_correcta}</span>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <select id={`eval-ia-${index}`} className="input-pro" style={{ padding: '0.45rem', fontSize: '0.85rem', width: 'auto' }}>
                            <option value="">Seleccionar Evaluación (Jefe)...</option>
                            {evaluaciones.map(e => <option key={e.id} value={e.id}>{e.titulo}</option>)}
                          </select>
                          <button 
                            onClick={() => {
                              const evalId = document.getElementById(`eval-ia-${index}`).value;
                              guardarPreguntaDesdeIA(preg, evalId);
                            }}
                            className="btn-pro btn-pro-primary" 
                            style={{ padding: '0.45rem 0.9rem', fontSize: '0.85rem' }}
                          >
                            <CheckCircle size={15} /> Guardar en Prueba
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {respuestaIA.tipo === 'ejemplo' && (
                <div style={{ background: 'var(--bg-input)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <h4 style={{ color: '#fde68a', marginBottom: '0.5rem' }}>📜 {respuestaIA.resultado.titulo}</h4>
                  <pre style={{ background: '#0b0f19', padding: '1rem', borderRadius: '8px', color: '#a5f3fc', fontSize: '0.88rem', overflowX: 'auto', border: '1px solid var(--border)' }}>
                    {respuestaIA.resultado.contenido}
                  </pre>
                  <div style={{ marginTop: '1rem', display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <select id="tema-ejemplo-ia" className="input-pro" style={{ width: 'auto', flex: 1, minWidth: '220px' }}>
                      <option value="">Seleccionar Bioma (Tema)...</option>
                      {temas.map(t => <option key={t.id} value={t.id}>{t.titulo}</option>)}
                    </select>
                    <button 
                      onClick={() => {
                        const temaId = document.getElementById('tema-ejemplo-ia').value;
                        guardarEjemploDesdeIA(temaId);
                      }}
                      className="btn-pro btn-pro-primary"
                    >
                      <PlusCircle size={16} /> Publicar Pergamino en Bioma
                    </button>
                  </div>
                </div>
              )}

              {respuestaIA.tipo === 'tarea' && (
                <div style={{ background: 'var(--bg-input)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <h4 style={{ color: '#c4b5fd', marginBottom: '0.5rem' }}>🛡️ {respuestaIA.resultado.titulo}</h4>
                  <p style={{ whiteSpace: 'pre-wrap', fontSize: '0.9rem', color: 'var(--text-main)', margin: '0.75rem 0' }}>
                    {respuestaIA.resultado.descripcion}
                  </p>
                  <div style={{ marginTop: '1.25rem', display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <select id="tema-tarea-ia" className="input-pro" style={{ width: 'auto', flex: 1, minWidth: '220px' }}>
                      <option value="">Seleccionar Bioma (Tema)...</option>
                      {temas.map(t => <option key={t.id} value={t.id}>{t.titulo}</option>)}
                    </select>
                    <button 
                      onClick={() => {
                        const temaId = document.getElementById('tema-tarea-ia').value;
                        guardarTareaDesdeIA(temaId);
                      }}
                      className="btn-pro btn-pro-primary"
                    >
                      <PlusCircle size={16} /> Publicar como Trabajo Práctico
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
      )}

      {/* =================================================================
          3. PESTAÑA: TEMAS Y EJEMPLOS (BIOMAS Y PERGAMINOS - REQ 8 Y 9)
          ================================================================= */}
      {pestana === 'temas' && (
        <div className="grid-2">
          <div>
            <div className="card-pro">
              <h3>🏰 Crear Tema Académico (Bioma del Mapa)</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.83rem', marginBottom: '1rem' }}>
                Cada tema que crees aparecerá automáticamente como un Bioma explorable en el Mapa 2D del estudiante.
              </p>
              <form onSubmit={crearTema}>
                <div className="input-group">
                  <input type="text" className="input-pro" placeholder="Título del Tema / Bioma" value={temaTitulo} onChange={(e) => setTemaTitulo(e.target.value)} required />
                </div>
                <div className="input-group">
                  <textarea className="input-pro" placeholder="Descripción teórica de la unidad..." value={temaDesc} onChange={(e) => setTemaDesc(e.target.value)} rows="3" required />
                </div>
                <button type="submit" className="btn-pro btn-pro-primary" style={{ width: '100%' }}>Guardar Tema (Bioma)</button>
              </form>
            </div>

            <div className="card-pro">
              <h3>📜 Publicar Ejemplo de Estudio (Pergamino)</h3>
              <form onSubmit={crearEjemplo} style={{ marginTop: '0.75rem' }}>
                <div className="input-group">
                  <select className="input-pro" value={ejTemaId} onChange={(e) => setEjTemaId(e.target.value)} required>
                    <option value="">Seleccionar Bioma (Tema padre)...</option>
                    {temas.map(t => <option key={t.id} value={t.id}>{t.titulo}</option>)}
                  </select>
                </div>
                <div className="input-group">
                  <input type="text" className="input-pro" placeholder="Título del pergamino o ejemplo" value={ejTitulo} onChange={(e) => setEjTitulo(e.target.value)} required />
                </div>
                <div className="input-group">
                  <textarea className="input-pro" placeholder="Código fuente o explicación práctica..." value={ejContenido} onChange={(e) => setEjContenido(e.target.value)} rows="4" required />
                </div>
                <button type="submit" className="btn-pro btn-pro-primary" style={{ width: '100%' }}>Publicar Ejemplo</button>
              </form>
            </div>
          </div>

          <div className="card-pro">
            <h3>Biomas y Pergaminos Activos ({temas.length})</h3>
            <div style={{ maxHeight: '600px', overflowY: 'auto', marginTop: '1rem' }}>
              {temas.map((t, idx) => (
                <div key={t.id} style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h4 style={{ color: '#38bdf8' }}>🏰 Bioma {idx + 1}: {t.titulo}</h4>
                    <button onClick={() => eliminarTema(t.id, t.titulo)} className="btn-danger" style={{ padding: '0.35rem 0.5rem', borderRadius: '6px' }}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.4rem 0' }}>{t.descripcion}</p>
                  {t.ejemplos && t.ejemplos.length > 0 && (
                    <div style={{ marginTop: '0.5rem' }}>
                      <strong style={{ fontSize: '0.8rem', color: '#fbbf24' }}>Pergaminos de Estudio ({t.ejemplos.length}):</strong>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.35rem' }}>
                        {t.ejemplos.map(e => (
                          <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-input)', padding: '0.45rem 0.75rem', borderRadius: '6px', fontSize: '0.85rem' }}>
                            <span>📜 {e.titulo}</span>
                            <button onClick={() => eliminarEjemplo(e.id)} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer' }}>
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =================================================================
          4. PESTAÑA: EVALUACIONES (JEFES FINALES - REQ 10 Y 11)
          ================================================================= */}
      {pestana === 'evaluaciones' && (
        <div className="grid-2">
          <div>
            <div className="card-pro">
              <h3>🐉 Crear Evaluación (Invocar Jefe Final)</h3>
              <form onSubmit={crearEvaluacion} style={{ marginTop: '1rem' }}>
                <div className="input-group">
                  <select className="input-pro" value={evalTemaId} onChange={(e) => setEvalTemaId(e.target.value)} required>
                    <option value="">Vincular a un Bioma (Tema)...</option>
                    {temas.map(t => <option key={t.id} value={t.id}>{t.titulo}</option>)}
                  </select>
                </div>
                <div className="input-group">
                  <input type="text" className="input-pro" placeholder="Nombre del Jefe / Evaluación (Ej: Guardián de Punteros)" value={evalTitulo} onChange={(e) => setEvalTitulo(e.target.value)} required />
                </div>
                <button type="submit" className="btn-pro btn-pro-primary" style={{ width: '100%' }}>Crear Evaluación</button>
              </form>
            </div>

            <div className="card-pro">
              <h3>⚔️ Añadir Pregunta Manual</h3>
              <form onSubmit={crearPreguntaManual} style={{ marginTop: '1rem' }}>
                <div className="input-group">
                  <select className="input-pro" value={pregEvalId} onChange={(e) => setPregEvalId(e.target.value)} required>
                    <option value="">Seleccionar Evaluación (Jefe)...</option>
                    {evaluaciones.map(ev => <option key={ev.id} value={ev.id}>{ev.titulo}</option>)}
                  </select>
                </div>
                <div className="input-group">
                  <textarea className="input-pro" placeholder="Enunciado de la pregunta..." value={enunciado} onChange={(e) => setEnunciado(e.target.value)} rows="2" required />
                </div>
                <div className="input-group"><input type="text" className="input-pro" placeholder="Opción A" value={opA} onChange={(e) => setOpA(e.target.value)} required /></div>
                <div className="input-group"><input type="text" className="input-pro" placeholder="Opción B" value={opB} onChange={(e) => setOpB(e.target.value)} required /></div>
                <div className="input-group"><input type="text" className="input-pro" placeholder="Opción C" value={opC} onChange={(e) => setOpC(e.target.value)} required /></div>
                <div className="input-group"><input type="text" className="input-pro" placeholder="Opción D" value={opD} onChange={(e) => setOpD(e.target.value)} required /></div>
                <div className="input-group">
                  <label className="input-label">Clave Correcta:</label>
                  <select className="input-pro" value={opCorrecta} onChange={(e) => setOpCorrecta(e.target.value)}>
                    <option value="A">Opción A</option>
                    <option value="B">Opción B</option>
                    <option value="C">Opción C</option>
                    <option value="D">Opción D</option>
                  </select>
                </div>
                <button type="submit" className="btn-pro btn-pro-primary" style={{ width: '100%' }}>Guardar Pregunta</button>
              </form>
            </div>
          </div>

          <div className="card-pro">
            <h3>Jefes Finales Activos ({evaluaciones.length})</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
              Haz clic en <strong>Ver Preguntas</strong> para auditar el banco de reactivos de cada Jefe.
            </p>

            <div style={{ marginTop: '1rem' }}>
              {evaluaciones.map(ev => (
                <div 
                  key={ev.id} 
                  style={{ 
                    background: evaluacionVerPreguntas?.id === ev.id ? 'rgba(59, 130, 246, 0.15)' : 'var(--bg-input)', 
                    border: `1px solid ${evaluacionVerPreguntas?.id === ev.id ? 'var(--primary)' : 'var(--border)'}`, 
                    padding: '1rem', 
                    borderRadius: '12px', 
                    marginBottom: '1rem' 
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div>
                      <h4 style={{ fontSize: '1.05rem', color: '#fff' }}>🐉 {ev.titulo}</h4>
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                        Bioma: {ev.tema_titulo}
                      </p>
                      <span className="badge badge-success" style={{ marginTop: '0.4rem' }}>
                        {ev.total_preguntas} preguntas asignadas
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <button 
                        onClick={() => verPreguntasDeEvaluacion(ev)}
                        className="btn-pro btn-pro-primary" 
                        style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem', gap: '0.4rem' }}
                      >
                        <Eye size={15} /> Ver Preguntas
                      </button>

                      <button 
                        onClick={() => eliminarEvaluacion(ev.id, ev.titulo)} 
                        className="btn-danger" 
                        style={{ padding: '0.45rem 0.65rem', borderRadius: '8px' }}
                        title="Eliminar evaluación"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {evaluacionVerPreguntas?.id === ev.id && (
                    <div style={{ marginTop: '1.25rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                        <strong style={{ fontSize: '0.9rem', color: '#60a5fa' }}>
                          Preguntas de este Jefe ({preguntasDeEvaluacion.length}):
                        </strong>
                        <button 
                          onClick={() => setEvaluacionVerPreguntas(null)} 
                          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.8rem' }}
                        >
                          ✕ Ocultar
                        </button>
                      </div>

                      {preguntasDeEvaluacion.length === 0 ? (
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Aún no hay preguntas asignadas.</p>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                          {preguntasDeEvaluacion.map((p, idx) => (
                            <div key={p.id} style={{ background: 'rgba(0,0,0,0.3)', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <p style={{ fontSize: '0.9rem', fontWeight: '600' }}>{idx + 1}. {p.enunciado}</p>
                                <button 
                                  onClick={() => eliminarPreguntaIndividual(p.id)} 
                                  className="btn-danger" 
                                  style={{ padding: '0.25rem 0.45rem', borderRadius: '6px' }}
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>

                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.35rem', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                                <div>A) {p.opcion_a}</div>
                                <div>B) {p.opcion_b}</div>
                                <div>C) {p.opcion_c}</div>
                                <div>D) {p.opcion_d}</div>
                              </div>

                              {p.opcion_correcta && (
                                <div style={{ marginTop: '0.5rem' }}>
                                  <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>
                                    Correcta: {p.opcion_correcta}
                                  </span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =================================================================
          5. PESTAÑA: TRABAJOS PRÁCTICOS (MISIONES DE GREMIO)
          ================================================================= */}
      {pestana === 'tareas' && (
        <div>
          <div className="grid-2">
            <div className="card-pro">
              <h3>🛡️ Asignar Trabajo Práctico (Misión de Gremio)</h3>
              <form onSubmit={crearTarea} style={{ marginTop: '1rem' }}>
                <div className="input-group">
                  <select className="input-pro" value={tareaTemaId} onChange={(e) => setTareaTemaId(e.target.value)} required>
                    <option value="">Seleccionar Bioma (Tema)...</option>
                    {temas.map(t => <option key={t.id} value={t.id}>{t.titulo}</option>)}
                  </select>
                </div>
                <div className="input-group">
                  <input type="text" className="input-pro" placeholder="Título de la Misión / Trabajo" value={tareaTitulo} onChange={(e) => setTareaTitulo(e.target.value)} required />
                </div>
                <div className="input-group">
                  <textarea className="input-pro" placeholder="Instrucciones detalladas y requisitos..." value={tareaDesc} onChange={(e) => setTareaDesc(e.target.value)} rows="4" required />
                </div>
                <div className="input-group">
                  <label className="input-label">Plazo de Entrega (Opcional):</label>
                  <input type="text" className="input-pro" placeholder="Ej: Viernes 23:59 hrs" value={tareaFecha} onChange={(e) => setTareaFecha(e.target.value)} />
                </div>
                <button type="submit" className="btn-pro btn-pro-primary" style={{ width: '100%' }}>Publicar Misión en el Gremio</button>
              </form>
            </div>

            <div className="card-pro">
              <h3>Misiones Asignadas ({tareas.length})</h3>
              <div style={{ maxHeight: '480px', overflowY: 'auto', marginTop: '1rem' }}>
                {tareas.map(tar => (
                  <div key={tar.id} style={{ background: tareaSeleccionada?.id === tar.id ? 'rgba(59, 130, 246, 0.15)' : 'var(--bg-input)', border: `1px solid ${tareaSeleccionada?.id === tar.id ? 'var(--primary)' : 'var(--border)'}`, padding: '1rem', borderRadius: '10px', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h4>🛡️ {tar.titulo}</h4>
                        <span style={{ fontSize: '0.8rem', color: '#38bdf8' }}>Bioma: {tar.tema_titulo}</span>
                      </div>
                      <button onClick={() => eliminarTarea(tar.id, tar.titulo)} className="btn-danger" style={{ padding: '0.35rem 0.5rem', borderRadius: '6px' }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.5rem 0' }}>{tar.descripcion}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem' }}>
                      <span className="badge badge-success">{tar.total_entregas} entregas recibidas</span>
                      <button onClick={() => verEntregasDeTarea(tar)} className="btn-pro btn-pro-primary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}>
                        Revisar Entregas <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {tareaSeleccionada && (
            <div className="card-pro" style={{ marginTop: '1.5rem', border: '1px solid #3b82f6' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div>
                  <h3>Revisión de Misión: {tareaSeleccionada.titulo}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Soluciones enviadas por aventureros: {entregasTarea.length}</p>
                </div>
                <button onClick={() => setTareaSeleccionada(null)} className="btn-pro" style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'white' }}>
                  Cerrar Revisión
                </button>
              </div>

              {entregasTarea.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', padding: '1.5rem 0', textAlign: 'center' }}>Ningún estudiante ha entregado esta misión todavía.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {entregasTarea.map(entrega => (
                    <div key={entrega.id} style={{ background: 'var(--bg-input)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                        <div>
                          <strong>🛡️ {entrega.estudiante_nombre}</strong>
                          <span style={{ marginLeft: '0.6rem', fontFamily: 'monospace', color: '#fbbf24', fontSize: '0.85rem' }}>({entrega.codigo_unico})</span>
                        </div>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Enviado: {entrega.fecha}</span>
                      </div>

                      <div style={{ background: 'rgba(0,0,0,0.25)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)', marginBottom: '1rem' }}>
                        <span style={{ fontSize: '0.75rem', color: '#c4b5fd', textTransform: 'uppercase', fontWeight: 'bold' }}>Código / Respuesta del Estudiante:</span>
                        <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: '0.9rem', marginTop: '0.4rem', color: '#f8fafc' }}>
                          {entrega.contenido}
                        </pre>
                      </div>

                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                        <div style={{ width: '130px' }}>
                          <label className="input-label">Nota (0 - 100):</label>
                          <input 
                            type="number" 
                            className="input-pro" 
                            placeholder={entrega.calificacion !== null ? `${entrega.calificacion}` : 'Sin calificar'} 
                            value={notaInput[entrega.id] !== undefined ? notaInput[entrega.id] : (entrega.calificacion ?? '')} 
                            onChange={(e) => setNotaInput({ ...notaInput, [entrega.id]: e.target.value })} 
                          />
                        </div>

                        <div style={{ flex: 1, minWidth: '240px' }}>
                          <label className="input-label">Retroalimentación del Game Master:</label>
                          <input 
                            type="text" 
                            className="input-pro" 
                            placeholder={entrega.retroalimentacion || 'Escribe comentarios para el estudiante...'} 
                            value={feedbackInput[entrega.id] !== undefined ? feedbackInput[entrega.id] : (entrega.retroalimentacion ?? '')} 
                            onChange={(e) => setFeedbackInput({ ...feedbackInput, [entrega.id]: e.target.value })} 
                          />
                        </div>

                        <button onClick={() => guardarCalificacionEntrega(entrega.id)} className="btn-pro btn-pro-primary">
                          <CheckCircle size={16} /> Guardar Calificación
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* =================================================================
          6. PESTAÑA: CALIFICACIONES Y XP (REQUISITOS 14 Y 15)
          ================================================================= */}
      {pestana === 'calificaciones' && (
        <div className="card-pro">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3>🏆 Registro General de Calificaciones y Puntos XP</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Auditoría en tiempo real de combates contra Jefes Finales, porcentajes y experiencia otorgada.
              </p>
            </div>
            <button onClick={exportarCalificacionesCSV} className="btn-pro btn-pro-primary">
              <Download size={18} /> Exportar CSV para Excel
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Aventurero (Estudiante)</th>
                  <th>Token Gremio</th>
                  <th>Jefe (Evaluación)</th>
                  <th>Aciertos</th>
                  <th>Puntaje</th>
                  <th>Recompensa XP</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {calificaciones.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                      No hay combates ni calificaciones registradas todavía.
                    </td>
                  </tr>
                ) : (
                  calificaciones.map(c => (
                    <tr key={c.id}>
                      <td style={{ fontWeight: '600' }}>🛡️ {c.estudiante_nombre}</td>
                      <td style={{ fontFamily: 'monospace', color: '#fbbf24', fontWeight: '700' }}>{c.codigo_unico}</td>
                      <td>🐉 {c.evaluacion_titulo}</td>
                      <td>{c.aciertos} / {c.total_preguntas}</td>
                      <td style={{ fontWeight: '800', fontSize: '1rem' }}>{c.puntaje}%</td>
                      <td style={{ color: '#fbbf24', fontWeight: '700' }}>⚡ +{c.puntaje * 5} XP</td>
                      <td>
                        <span className={`badge ${c.puntaje >= 60 ? 'badge-success' : 'badge-danger'}`}>
                          {c.puntaje >= 60 ? 'Jefe Derrotado' : 'No Superado'}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{c.fecha}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}