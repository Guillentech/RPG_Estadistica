import React, { useState, useEffect } from 'react';
import { 
  Users, BookOpen, FileCheck, Award, Sparkles, 
  Download, CheckCircle, BrainCircuit, Trash2, 
  ClipboardList, ChevronRight, Eye, Copy, PlusCircle,
  Swords, Map, Shield, UserCog, Save
} from 'lucide-react';

export default function PanelProfesor() {
  const [pestana, setPestana] = useState('estudiantes');

  // Estados de datos
  const [estudiantes, setEstudiantes] = useState([]);
  const [temas, setTemas] = useState([]);
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [calificaciones, setCalificaciones] = useState([]);
  const [tareas, setTareas] = useState([]);

  // Perfil del Game Master (Docente)
  const [perfilDocente, setPerfilDocente] = useState({
    nombre: 'Game Master Principal',
    titulo: 'Arquitecto del Sistema RPG',
    correo: 'admin@universidad.com',
    biografia: 'Encargado de diseñar los biomas, invocar jefes finales y calibrar la experiencia (XP) del gremio.'
  });

  // Visor interactivo de preguntas de una evaluación
  const [evaluacionVerPreguntas, setEvaluacionVerPreguntas] = useState(null);
  const [preguntasDeEvaluacion, setPreguntasDeEvaluacion] = useState([]);

  // Revisión de entregas de misiones
  const [tareaSeleccionada, setTareaSeleccionada] = useState(null);
  const [entregasTarea, setEntregasTarea] = useState([]);
  const [feedbackInput, setFeedbackInput] = useState({});
  const [notaInput, setNotaInput] = useState({});

  // Copiloto IA
  const [cargandoIA, setCargandoIA] = useState(false);
  const [promptIA, setPromptIA] = useState('');
  const [modoIA, setModoIA] = useState('chat');
  const [respuestaIA, setRespuestaIA] = useState(null);

  // Formularios
  const [nuevoEstudiante, setNuevoEstudiante] = useState('');
  const [temaTitulo, setTemaTitulo] = useState('');
  const [temaDesc, setTemaDesc] = useState('');
  const [ejTemaId, setEjTemaId] = useState('');
  const [ejTitulo, setEjTitulo] = useState('');
  const [ejContenido, setEjContenido] = useState('');
  const [evalTemaId, setEvalTemaId] = useState('');
  const [evalTitulo, setEvalTitulo] = useState('');

  // Tareas independientes
  const [tareaCategoriaLibre, setTareaCategoriaLibre] = useState('');
  const [tareaTitulo, setTareaTitulo] = useState('');
  const [tareaDesc, setTareaDesc] = useState('');
  const [tareaFecha, setTareaFecha] = useState('');

  // Preguntas manuales múltiples
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

  const consultarCopiloto = async () => {
    if (!promptIA.trim()) return alert("Escribe tu instrucción para el Copiloto.");
    setCargandoIA(true);
    setRespuestaIA(null);
    try {
      const res = await fetch('http://localhost:4000/api/ia/asistente', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mensaje: promptIA.trim(), modo: modoIA })
      });
      const data = await res.json();
      if (res.ok) setRespuestaIA(data);
    } catch {
      alert('Error con el Copiloto IA.');
    } finally {
      setCargandoIA(false);
    }
  };

  const guardarPreguntaDesdeIA = async (pregunta, evaluacionId) => {
    if (!evaluacionId) return alert("Selecciona la evaluación de destino.");
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
      alert("¡Pregunta añadida al examen con éxito!");
      setRespuestaIA(prev => ({ ...prev, resultado: prev.resultado.filter(p => p !== pregunta) }));
      cargarDatos();
    }
  };

  const verPreguntasDeEvaluacion = async (evaluacion) => {
    if (evaluacionVerPreguntas?.id === evaluacion.id) {
      setEvaluacionVerPreguntas(null);
      return;
    }
    setEvaluacionVerPreguntas(evaluacion);
    try {
      const res = await fetch(`http://localhost:4000/api/evaluaciones/${evaluacion.id}/preguntas-docente`);
      const data = await res.json();
      setPreguntasDeEvaluacion(data);
    } catch {
      alert('Error al consultar preguntas.');
    }
  };

  const eliminarPreguntaIndividual = async (id) => {
    if (!window.confirm('¿Eliminar esta pregunta?')) return;
    await fetch(`http://localhost:4000/api/preguntas/${id}`, { method: 'DELETE' });
    verPreguntasDeEvaluacion(evaluacionVerPreguntas);
    cargarDatos();
  };

  const verEntregasDeTarea = async (tarea) => {
    setTareaSeleccionada(tarea);
    const res = await fetch(`http://localhost:4000/api/tareas/${tarea.id}/entregas`);
    const data = await res.json();
    setEntregasTarea(data);
  };

  const guardarCalificacionEntrega = async (entregaId) => {
    const nota = notaInput[entregaId];
    const feedback = feedbackInput[entregaId] || '';
    if (nota === undefined || nota === '') return alert('Ingresa una nota válida.');

    const res = await fetch(`http://localhost:4000/api/entregas/${entregaId}/calificar`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ calificacion: parseFloat(nota), retroalimentacion: feedback })
    });
    if (res.ok) {
      alert('Calificación guardada.');
      verEntregasDeTarea(tareaSeleccionada);
      cargarDatos();
    }
  };

  const eliminarEstudiante = async (id, nombre) => {
    if (!window.confirm(`¿Eliminar a "${nombre}"?`)) return;
    await fetch(`http://localhost:4000/api/estudiantes/${id}`, { method: 'DELETE' });
    cargarDatos();
  };

  const eliminarTema = async (id, titulo) => {
    if (!window.confirm(`¿Eliminar el bioma "${titulo}"?`)) return;
    await fetch(`http://localhost:4000/api/temas/${id}`, { method: 'DELETE' });
    cargarDatos();
  };

  const eliminarEjemplo = async (id) => {
    await fetch(`http://localhost:4000/api/ejemplos/${id}`, { method: 'DELETE' });
    cargarDatos();
  };

  const eliminarEvaluacion = async (id, titulo) => {
    if (!window.confirm(`¿Eliminar al jefe "${titulo}"?`)) return;
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

  const exportarCalificacionesCSV = () => {
    if (calificaciones.length === 0) return alert("No hay calificaciones.");
    const encabezados = "Estudiante,Token,Evaluacion,Aciertos,Puntaje,XP,Estado,Fecha\n";
    const filas = calificaciones.map(c => 
      `"${c.estudiante_nombre}","${c.codigo_unico}","${c.evaluacion_titulo}",${c.aciertos}/${c.total_preguntas},${c.puntaje}%,+${c.puntaje * 5} XP,${c.puntaje >= 60 ? 'Aprobado' : 'Reprobado'},"${c.fecha}"`
    ).join("\n");
    const blob = new Blob([encabezados + filas], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Calificaciones_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  const registrarEstudiante = async (e) => {
    e.preventDefault();
    if (!nuevoEstudiante.trim()) return;
    const res = await fetch('http://localhost:4000/api/estudiantes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre: nuevoEstudiante })
    });
    if (res.ok) { setNuevoEstudiante(''); cargarDatos(); }
  };

  const crearTema = async (e) => {
    e.preventDefault();
    if (!temaTitulo.trim()) return;
    const res = await fetch('http://localhost:4000/api/temas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ titulo: temaTitulo, descripcion: temaDesc })
    });
    if (res.ok) { setTemaTitulo(''); setTemaDesc(''); cargarDatos(); }
  };

  const crearEjemplo = async (e) => {
    e.preventDefault();
    if (!ejTemaId || !ejTitulo.trim() || !ejContenido.trim()) return;
    const res = await fetch('http://localhost:4000/api/ejemplos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tema_id: ejTemaId, titulo: ejTitulo, contenido: ejContenido })
    });
    if (res.ok) { setEjTitulo(''); setEjContenido(''); cargarDatos(); }
  };

  const crearEvaluacion = async (e) => {
    e.preventDefault();
    if (!evalTemaId || !evalTitulo.trim()) return;
    const res = await fetch('http://localhost:4000/api/evaluaciones', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tema_id: evalTemaId, titulo: evalTitulo })
    });
    if (res.ok) { setEvalTitulo(''); cargarDatos(); alert('¡Jefe Final invocado con éxito!'); }
  };

  // Creación de Tarea con tema independiente o categoría libre
  const crearTareaIndependiente = async (e) => {
    e.preventDefault();
    if (!tareaTitulo.trim() || !tareaDesc.trim()) return;
    
    // Si no hay bioma seleccionado, vinculamos al primer tema disponible por defecto para cumplir la FK de SQLite
    const temaIdAsignado = tareaCategoriaLibre || (temas.length > 0 ? temas[0].id : 1);

    const res = await fetch('http://localhost:4000/api/tareas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tema_id: temaIdAsignado,
        titulo: `[${tareaCategoriaLibre || 'General'}] ${tareaTitulo.trim()}`,
        descripcion: tareaDesc.trim(),
        fecha_limite: tareaFecha || 'Sin límite'
      })
    });
    if (res.ok) {
      setTareaTitulo('');
      setTareaDesc('');
      setTareaFecha('');
      setTareaCategoriaLibre('');
      alert('¡Misión independiente publicada en el gremio!');
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
      alert('¡Pregunta añadida al banco del jefe con éxito! Puedes agregar más.');
      cargarDatos();
      verPreguntasDeEvaluacion(evaluaciones.find(ev => ev.id === Number(pregEvalId)));
    }
  };

  const getTabStyle = (nombreTab, esIA = false) => {
    const activa = pestana === nombreTab;
    return {
      background: activa 
        ? (esIA ? 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)' : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)')
        : 'rgba(255, 255, 255, 0.04)',
      color: activa ? '#ffffff' : '#94a3b8',
      border: activa ? '1px solid transparent' : '1px solid rgba(255, 255, 255, 0.08)',
      boxShadow: activa ? '0 4px 12px rgba(59, 130, 246, 0.35)' : 'none',
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span style={{ fontSize: '0.78rem', color: '#fbbf24', fontWeight: '800', textTransform: 'uppercase' }}>
            🧙‍♂️ CONSOLA DE ADMINISTRACIÓN DOCENTE
          </span>
          <h2 style={{ fontSize: '1.65rem', marginTop: '0.15rem' }}>Panel de Control del Game Master</h2>
        </div>
        <button 
          onClick={() => setPestana('perfil')} 
          className="btn-pro" 
          style={{ background: 'rgba(251, 191, 36, 0.15)', color: '#fbbf24', border: '1px solid rgba(251, 191, 36, 0.3)' }}
        >
          <UserCog size={18} /> Mi Perfil Game Master
        </button>
      </div>

      {/* 4 KPIs */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon"><Users size={24} /></div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Aventureros</span>
            <h3 style={{ fontSize: '1.6rem', marginTop: '0.2rem' }}>{estudiantes.length}</h3>
          </div>
        </div>
        <div className="kpi-card">

<Map size={24} />
<div className="kpi-icon" style={{ color: '#38bdf8', background: 'rgba(56, 189, 248, 0.12)' }}></div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Biomas</span>
            <h3 style={{ fontSize: '1.6rem', marginTop: '0.2rem' }}>{temas.length}</h3>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon" style={{ color: '#ef4444', background: 'rgba(239, 68, 68, 0.12)' }}><Swords size={24} /></div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Jefes Finales</span>
            <h3 style={{ fontSize: '1.6rem', marginTop: '0.2rem' }}>{evaluaciones.length}</h3>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon" style={{ color: '#fbbf24', background: 'rgba(245, 158, 11, 0.12)' }}><Award size={24} /></div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Promedio General</span>
            <h3 style={{ fontSize: '1.6rem', marginTop: '0.2rem' }}>{promedioNotas}%</h3>
          </div>
        </div>
      </div>

      {/* BARRA DE PESTAÑAS */}
      <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(15, 23, 42, 0.75)', padding: '0.45rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)', marginBottom: '1.75rem', flexWrap: 'wrap' }}>
        <button style={getTabStyle('estudiantes')} onClick={() => setPestana('estudiantes')}><Users size={18} /> Estudiantes</button>
        <button style={getTabStyle('ia-evaluador', true)} onClick={() => setPestana('ia-evaluador')}><Sparkles size={18} /> Copiloto IA</button>
        <button style={getTabStyle('temas')} onClick={() => setPestana('temas')}><BookOpen size={18} /> Temas y Biomas</button>
        <button style={getTabStyle('evaluaciones')} onClick={() => setPestana('evaluaciones')}><FileCheck size={18} /> Evaluaciones (Jefes)</button>
        <button style={getTabStyle('tareas')} onClick={() => setPestana('tareas')}><ClipboardList size={18} /> Trabajos Prácticos</button>
        <button style={getTabStyle('calificaciones')} onClick={() => setPestana('calificaciones')}><Award size={18} /> Calificaciones</button>
        <button style={getTabStyle('perfil')} onClick={() => setPestana('perfil')}><UserCog size={18} /> Perfil</button>
      </div>

      {/* 1. ESTUDIANTES */}
      {pestana === 'estudiantes' && (
        <div className="grid-2">
          <div className="card-pro">
            <h3>Matricular Aventurero</h3>
            <form onSubmit={registrarEstudiante} style={{ marginTop: '1rem' }}>
              <div className="input-group">
                <input type="text" className="input-pro" value={nuevoEstudiante} onChange={(e) => setNuevoEstudiante(e.target.value)} placeholder="Nombre del alumno" required />
              </div>
              <button type="submit" className="btn-pro btn-pro-primary" style={{ width: '100%' }}>Generar Token y Registrar</button>
            </form>
          </div>
          <div className="card-pro">
            <h3>Aventureros Registrados ({estudiantes.length})</h3>
            <div style={{ maxHeight: '420px', overflowY: 'auto', marginTop: '1rem' }}>
              {estudiantes.map(est => (
                <div key={est.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <div style={{ fontWeight: '600' }}>🛡️ {est.nombre}</div>
                    <span style={{ color: '#fbbf24', fontSize: '0.85rem', fontFamily: 'monospace' }}>Token: {est.codigo_unico}</span>
                  </div>
                  <button onClick={() => eliminarEstudiante(est.id, est.nombre)} className="btn-danger" style={{ padding: '0.4rem 0.6rem', borderRadius: '8px' }}><Trash2 size={16} /></button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. COPILOTO IA */}
      {pestana === 'ia-evaluador' && (
        <div className="card-pro">
          <h3>Oráculo & Copiloto IA</h3>
          <div style={{ display: 'flex', gap: '0.5rem', margin: '1rem 0', flexWrap: 'wrap' }}>
            {[{id: 'chat', label: '💬 Consulta'}, {id: 'preguntas', label: '🐉 Generar Preguntas'}, {id: 'ejemplo', label: '📜 Pergamino'}, {id: 'tarea', label: '🛡️ Misión'}].map(m => (
              <button key={m.id} onClick={() => setModoIA(m.id)} className="btn-pro" style={{ background: modoIA === m.id ? '#8b5cf6' : 'var(--bg-input)', color: '#fff', fontSize: '0.8rem' }}>{m.label}</button>
            ))}
          </div>
          <textarea className="input-pro" rows="4" placeholder="Escribe aquí tu consulta o tema..." value={promptIA} onChange={(e) => setPromptIA(e.target.value)} />
          <button onClick={consultarCopiloto} disabled={cargandoIA} className="btn-pro btn-pro-ai" style={{ width: '100%', marginTop: '1rem' }}>
            <Sparkles size={18} /> {cargandoIA ? 'Analizando...' : 'Consultar Copiloto'}
          </button>
          {respuestaIA && (
            <div style={{ marginTop: '1.5rem', background: 'var(--bg-input)', padding: '1rem', borderRadius: '8px' }}>
              <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', color: '#fff' }}>{typeof respuestaIA.resultado === 'string' ? respuestaIA.resultado : JSON.stringify(respuestaIA.resultado, null, 2)}</pre>
            </div>
          )}
        </div>
      )}

      {/* 3. TEMAS Y BIOMAS */}
      {pestana === 'temas' && (
        <div className="grid-2">
          <div>
            <div className="card-pro">
              <h3>Crear Bioma (Tema)</h3>
              <form onSubmit={crearTema} style={{ marginTop: '1rem' }}>
                <div className="input-group"><input type="text" className="input-pro" placeholder="Título del Bioma" value={temaTitulo} onChange={(e) => setTemaTitulo(e.target.value)} required /></div>
                <div className="input-group"><textarea className="input-pro" placeholder="Descripción teórica..." value={temaDesc} onChange={(e) => setTemaDesc(e.target.value)} rows="3" required /></div>
                <button type="submit" className="btn-pro btn-pro-primary" style={{ width: '100%' }}>Guardar Bioma</button>
              </form>
            </div>
            <div className="card-pro">
              <h3>Publicar Pergamino de Teoría</h3>
              <form onSubmit={crearEjemplo} style={{ marginTop: '1rem' }}>
                <div className="input-group">
                  <select className="input-pro" value={ejTemaId} onChange={(e) => setEjTemaId(e.target.value)} required>
                    <option value="">Seleccionar Bioma...</option>
                    {temas.map(t => <option key={t.id} value={t.id}>{t.titulo}</option>)}
                  </select>
                </div>
                <div className="input-group"><input type="text" className="input-pro" placeholder="Título del pergamino" value={ejTitulo} onChange={(e) => setEjTitulo(e.target.value)} required /></div>
                <div className="input-group"><textarea className="input-pro" placeholder="Contenido o código..." value={ejContenido} onChange={(e) => setEjContenido(e.target.value)} rows="3" required /></div>
                <button type="submit" className="btn-pro btn-pro-primary" style={{ width: '100%' }}>Publicar Pergamino</button>
              </form>
            </div>
          </div>
          <div className="card-pro">
            <h3>Biomas Registrados ({temas.length})</h3>
            {temas.map(t => (
              <div key={t.id} style={{ padding: '0.75rem 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong style={{ color: '#38bdf8' }}>🏰 {t.titulo}</strong>
                  <button onClick={() => eliminarTema(t.id, t.titulo)} className="btn-danger" style={{ padding: '0.2rem 0.5rem', borderRadius: '4px' }}><Trash2 size={13} /></button>
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{t.descripcion}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. EVALUACIONES (ARREGLADO PARA MÚLTIPLES PREGUNTAS) */}
      {pestana === 'evaluaciones' && (
        <div className="grid-2">
          <div>
            <div className="card-pro">
              <h3>Invocar Jefe Final (Evaluación)</h3>
              <form onSubmit={crearEvaluacion} style={{ marginTop: '1rem' }}>
                <div className="input-group">
                  <select className="input-pro" value={evalTemaId} onChange={(e) => setEvalTemaId(e.target.value)} required>
                    <option value="">Vincular a un Bioma...</option>
                    {temas.map(t => <option key={t.id} value={t.id}>{t.titulo}</option>)}
                  </select>
                </div>
                <div className="input-group"><input type="text" className="input-pro" placeholder="Nombre del Jefe (Ej: Guardián Binario)" value={evalTitulo} onChange={(e) => setEvalTitulo(e.target.value)} required /></div>
                <button type="submit" className="btn-pro btn-pro-primary" style={{ width: '100%' }}>Crear Jefe</button>
              </form>
            </div>

            <div className="card-pro" style={{ border: '1px solid #3b82f6' }}>
              <h3>Agregar Pregunta al Jefe Seleccionado</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                Puedes registrar todas las preguntas que desees para una misma evaluación.
              </p>
              <form onSubmit={crearPreguntaManual}>
                <div className="input-group">
                  <select className="input-pro" value={pregEvalId} onChange={(e) => setPregEvalId(e.target.value)} required>
                    <option value="">Seleccionar Jefe Final...</option>
                    {evaluaciones.map(ev => <option key={ev.id} value={ev.id}>{ev.titulo}</option>)}
                  </select>
                </div>
                <div className="input-group"><textarea className="input-pro" placeholder="Enunciado de la pregunta..." value={enunciado} onChange={(e) => setEnunciado(e.target.value)} rows="2" required /></div>
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
                <button type="submit" className="btn-pro btn-pro-primary" style={{ width: '100%' }}>Añadir Pregunta al Banco</button>
              </form>
            </div>
          </div>

          <div className="card-pro">
            <h3>Jefes Finales Activos ({evaluaciones.length})</h3>
            {evaluaciones.map(ev => (
              <div key={ev.id} style={{ background: 'var(--bg-input)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4>🐉 {ev.titulo}</h4>
                    <span style={{ fontSize: '0.8rem', color: '#38bdf8' }}>{ev.total_preguntas} preguntas registradas</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => verPreguntasDeEvaluacion(ev)} className="btn-pro btn-pro-primary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}><Eye size={14} /> Ver</button>
                    <button onClick={() => eliminarEvaluacion(ev.id, ev.titulo)} className="btn-danger" style={{ padding: '0.35rem 0.5rem', borderRadius: '6px' }}><Trash2 size={14} /></button>
                  </div>
                </div>

                {evaluacionVerPreguntas?.id === ev.id && (
                  <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
                    {preguntasDeEvaluacion.length === 0 ? (
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>No hay preguntas asignadas aún.</p>
                    ) : (
                      preguntasDeEvaluacion.map((p, idx) => (
                        <div key={p.id} style={{ background: 'rgba(0,0,0,0.3)', padding: '0.5rem', borderRadius: '6px', marginBottom: '0.5rem', fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between' }}>
                          <span>{idx + 1}. {p.enunciado} (Clave: {p.opcion_correcta})</span>
                          <button onClick={() => eliminarPreguntaIndividual(p.id)} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer' }}><Trash2 size={13} /></button>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. TRABAJOS PRÁCTICOS (TEMA INDEPENDIENTE) */}
      {pestana === 'tareas' && (
        <div>
          <div className="grid-2">
            <div className="card-pro">
              <h3>🛡️ Asignar Misión Independiente</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                Puedes crear tareas libres especificando su categoría sin que dependan obligatoriamente de los biomas del mapa.
              </p>
              <form onSubmit={crearTareaIndependiente}>
                <div className="input-group">
                  <label className="input-label">Categoría o Título Corto (Ej: Proyecto Final, Tarea Libre):</label>
                  <input type="text" className="input-pro" placeholder="Ej: Laboratorio 1" value={tareaCategoriaLibre} onChange={(e) => setTareaCategoriaLibre(e.target.value)} required />
                </div>
                <div className="input-group">
                  <input type="text" className="input-pro" placeholder="Título de la Misión" value={tareaTitulo} onChange={(e) => setTareaTitulo(e.target.value)} required />
                </div>
                <div className="input-group">
                  <textarea className="input-pro" placeholder="Instrucciones detalladas..." value={tareaDesc} onChange={(e) => setTareaDesc(e.target.value)} rows="3" required />
                </div>
                <button type="submit" className="btn-pro btn-pro-primary" style={{ width: '100%' }}>Publicar Misión Independiente</button>
              </form>
            </div>

            <div className="card-pro">
              <h3>Misiones Publicadas ({tareas.length})</h3>
              {tareas.map(tar => (
                <div key={tar.id} style={{ background: 'var(--bg-input)', padding: '0.85rem', borderRadius: '8px', marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4>{tar.titulo}</h4>
                    <span style={{ fontSize: '0.78rem', color: '#38bdf8' }}>{tar.total_entregas} entregas</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => verEntregasDeTarea(tar)} className="btn-pro btn-pro-primary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.78rem' }}>Revisar</button>
                    <button onClick={() => eliminarTarea(tar.id, tar.titulo)} className="btn-danger" style={{ padding: '0.3rem 0.5rem', borderRadius: '6px' }}><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {tareaSeleccionada && (
            <div className="card-pro" style={{ marginTop: '1.5rem', border: '1px solid #3b82f6' }}>
              <h3>Revisión de Entregas: {tareaSeleccionada.titulo}</h3>
              {entregasTarea.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', padding: '1rem 0' }}>No hay entregas todavía.</p>
              ) : (
                entregasTarea.map(entrega => (
                  <div key={entrega.id} style={{ background: 'var(--bg-input)', padding: '1rem', borderRadius: '8px', marginTop: '1rem' }}>
                    <strong>{entrega.estudiante_nombre}</strong> ({entrega.codigo_unico})
                    <pre style={{ margin: '0.5rem 0', padding: '0.5rem', background: '#090d16', borderRadius: '6px', fontSize: '0.85rem', color: '#a5f3fc' }}>{entrega.contenido}</pre>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                      <input type="number" className="input-pro" style={{ width: '100px' }} placeholder="Nota" value={notaInput[entrega.id] !== undefined ? notaInput[entrega.id] : (entrega.calificacion ?? '')} onChange={(e) => setNotaInput({...notaInput, [entrega.id]: e.target.value})} />
                      <input type="text" className="input-pro" style={{ flex: 1 }} placeholder="Feedback..." value={feedbackInput[entrega.id] !== undefined ? feedbackInput[entrega.id] : (entrega.retroalimentacion ?? '')} onChange={(e) => setFeedbackInput({...feedbackInput, [entrega.id]: e.target.value})} />
                      <button onClick={() => guardarCalificacionEntrega(entrega.id)} className="btn-pro btn-pro-primary"><CheckCircle size={15} /> Guardar</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* 6. CALIFICACIONES */}
      {pestana === 'calificaciones' && (
        <div className="card-pro">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h3>Calificaciones y Auditoría</h3>
            <button onClick={exportarCalificacionesCSV} className="btn-pro btn-pro-primary"><Download size={18} /> Exportar CSV</button>
          </div>
          <table>
            <thead>
              <tr><th>Estudiante</th><th>Token</th><th>Evaluación</th><th>Puntaje</th><th>XP</th><th>Estado</th></tr>
            </thead>
            <tbody>
              {calificaciones.map(c => (
                <tr key={c.id}>
                  <td>{c.estudiante_nombre}</td>
                  <td style={{ fontFamily: 'monospace', color: '#fbbf24' }}>{c.codigo_unico}</td>
                  <td>{c.evaluacion_titulo}</td>
                  <td style={{ fontWeight: 'bold' }}>{c.puntaje}%</td>
                  <td style={{ color: '#fbbf24' }}>+{c.puntaje * 5} XP</td>
                  <td><span className={`badge ${c.puntaje >= 60 ? 'badge-success' : 'badge-danger'}`}>{c.puntaje >= 60 ? 'Aprobado' : 'Reprobado'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 7. PERFIL DEL GAME MASTER */}
      {pestana === 'perfil' && (
        <div className="card-pro" style={{ maxWidth: '650px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(251, 191, 36, 0.2)', color: '#fbbf24', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem' }}>
              🧙‍♂️
            </div>
            <div>
              <h3>Perfil del Game Master</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Configura tu identidad docente visible en el sistema.</p>
            </div>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); alert('¡Perfil de Game Master actualizado con éxito!'); }}>
            <div className="input-group">
              <label className="input-label">Nombre del Docente:</label>
              <input type="text" className="input-pro" value={perfilDocente.nombre} onChange={(e) => setPerfilDocente({...perfilDocente, nombre: e.target.value})} required />
            </div>
            <div className="input-group">
              <label className="input-label">Título o Clase RPG:</label>
              <input type="text" className="input-pro" value={perfilDocente.titulo} onChange={(e) => setPerfilDocente({...perfilDocente, titulo: e.target.value})} required />
            </div>
            <div className="input-group">
              <label className="input-label">Correo Institucional:</label>
              <input type="email" className="input-pro" value={perfilDocente.correo} onChange={(e) => setPerfilDocente({...perfilDocente, correo: e.target.value})} required />
            </div>
            <div className="input-group">
              <label className="input-label">Biografía o Lema Docente:</label>
              <textarea className="input-pro" rows="3" value={perfilDocente.biografia} onChange={(e) => setPerfilDocente({...perfilDocente, biografia: e.target.value})} />
            </div>
            <button type="submit" className="btn-pro btn-pro-primary" style={{ width: '100%' }}>
              <Save size={16} /> Guardar Cambios de Perfil
            </button>
          </form>
        </div>
      )}
    </div>
  );
}