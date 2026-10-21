// ============================================================================
// 💡 IMPORTACIONES DE REACT, CONTEXTO DE SESIÓN E ICONOS
// ============================================================================
import React, { useState, useEffect, useRef } from 'react';
// Importamos useAuth para leer los datos del docente y actualizar su foto en tiempo real
import { useAuth } from '../context/AuthContext';
// Importamos los íconos vectoriales de apoyo para los botones y acciones
import { 
  Users, BookOpen, FileCheck, Award, Sparkles, 
  Download, CheckCircle, BrainCircuit, Trash2, 
  ClipboardList, Eye, Copy, PlusCircle,
  Swords, Map, UserCog, Save, UploadCloud, FileText, ImagePlus
} from 'lucide-react';

// ============================================================================
// 🎨 SPRITES PIXEL ART 16-BIT (SVG CON CRISP-EDGES)
// Estos componentes dibujan arte retro en 16x16 píxeles sin necesidad de 
// cargar imágenes externas que puedan romperse.
// ============================================================================

// 🧙‍♂️ Sprite 1: Avatar por defecto del Game Master (Mago Dorado)
const GameMasterSprite16Bit = () => (
  <svg width="52" height="52" viewBox="0 0 16 16" shapeRendering="crispEdges">
    {/* Fondo oscuro del marco */}
    <rect width="16" height="16" fill="#13092b" />
    {/* Sombrero de Game Master con corona dorada */}
    <rect x="5" y="1" width="6" height="2" fill="#6b21a8" />
    <rect x="3" y="3" width="10" height="2" fill="#9333ea" />
    <rect x="5" y="3" width="6" height="1" fill="#fde047" />
    {/* Rostro y ojos brillantes */}
    <rect x="4" y="5" width="8" height="4" fill="#fed7aa" />
    <rect x="5" y="6" width="2" height="2" fill="#38bdf8" />
    <rect x="9" y="6" width="2" height="2" fill="#38bdf8" />
    {/* Barba blanca de sabio */}
    <rect x="4" y="9" width="8" height="3" fill="#f8fafc" />
    <rect x="5" y="12" width="6" height="1" fill="#cbd5e1" />
    {/* Túnica carmesí/dorada */}
    <rect x="3" y="11" width="10" height="5" fill="#7e22ce" />
    <rect x="6" y="12" width="4" height="4" fill="#fbbf24" />
  </svg>
);

// 🐉 Sprite 2: Icono de Jefe Final (Dragón / Demonio de Mazmorra)
const BossDragonSprite16Bit = () => (
  <svg width="36" height="36" viewBox="0 0 16 16" shapeRendering="crispEdges">
    {/* Cuernos dorados */}
    <rect x="2" y="2" width="2" height="3" fill="#fde047" />
    <rect x="12" y="2" width="2" height="3" fill="#fde047" />
    {/* Cabeza escamosa roja */}
    <rect x="4" y="3" width="8" height="9" fill="#dc2626" />
    <rect x="3" y="5" width="10" height="6" fill="#ef4444" />
    {/* Ojos amarillos encendidos */}
    <rect x="5" y="6" width="2" height="2" fill="#fef08a" />
    <rect x="9" y="6" width="2" height="2" fill="#fef08a" />
    {/* Colmillos inferiores */}
    <rect x="5" y="11" width="1" height="2" fill="#ffffff" />
    <rect x="10" y="11" width="1" height="2" fill="#ffffff" />
  </svg>
);

// ============================================================================
// 💡 COMPONENTE PRINCIPAL: PANEL DEL PROFESOR (CONSOLA GAME MASTER)
// ============================================================================
export default function PanelProfesor() {
  // Extraemos el usuario actual y la función para actualizar la foto en toda la app
  const { user, actualizarAvatar } = useAuth();

  // Estado que controla qué pestaña del Grimorio está activa en pantalla
  const [pestana, setPestana] = useState('estudiantes');

  // --------------------------------------------------------------------------
  // 🗄️ ESTADOS DE DATOS SINCRONIZADOS CON LA BASE DE DATOS (SQLite)
  // --------------------------------------------------------------------------
  const [estudiantes, setEstudiantes] = useState([]);      // Lista de aventureros
  const [temas, setTemas] = useState([]);                   // Lista de biomas del mapa
  const [evaluaciones, setEvaluaciones] = useState([]);     // Lista de Jefes Finales
  const [calificaciones, setCalificaciones] = useState([]); // Historial de combates
  const [tareas, setTareas] = useState([]);                 // Misiones prácticas

  // --------------------------------------------------------------------------
  // 🧙‍♂️ ESTADO DEL PERFIL DEL GAME MASTER
  // --------------------------------------------------------------------------
  const [perfilDocente, setPerfilDocente] = useState({
    nombre: user?.nombre || 'Game Master Principal',
    titulo: 'Arquitecto Supremo de Biomas',
    correo: user?.correo || 'admin@universidad.com',
    biografia: 'Encargado de diseñar las regiones del mapa, invocar Jefes Finales y otorgar puntos de experiencia (XP) al gremio.',
    avatar: user?.avatar || localStorage.getItem('avatar_lms_profesor') || null
  });

  // Referencias ocultas para abrir el selector de archivos de Windows
  const fileInputAvatar = useRef(null);
  const fileInputTarea = useRef(null);

  // --------------------------------------------------------------------------
  // 🔍 ESTADOS PARA VISORES INTERACTIVOS (PREGUNTAS Y ENTREGAS DE TAREAS)
  // --------------------------------------------------------------------------
  const [evaluacionVerPreguntas, setEvaluacionVerPreguntas] = useState(null);
  const [preguntasDeEvaluacion, setPreguntasDeEvaluacion] = useState([]);

  const [tareaSeleccionada, setTareaSeleccionada] = useState(null);
  const [entregasTarea, setEntregasTarea] = useState([]);
  const [feedbackInput, setFeedbackInput] = useState({});
  const [notaInput, setNotaInput] = useState({});

  // --------------------------------------------------------------------------
  // 🤖 ESTADOS DEL ORÁCULO & COPILOTO IA (GEMINI 2.5)
  // --------------------------------------------------------------------------
  const [cargandoIA, setCargandoIA] = useState(false);
  const [promptIA, setPromptIA] = useState('');
  const [modoIA, setModoIA] = useState('chat');
  const [respuestaIA, setRespuestaIA] = useState(null);

  // --------------------------------------------------------------------------
  // 📝 ESTADOS DE LOS FORMULARIOS RPG DE CREACIÓN
  // --------------------------------------------------------------------------
  const [nuevoEstudiante, setNuevoEstudiante] = useState('');
  const [nuevaClaseRpg, setNuevaClaseRpg] = useState('Mago de Código');

  const [temaTitulo, setTemaTitulo] = useState('');
  const [temaDesc, setTemaDesc] = useState('');
  const [temaBioma, setTemaBioma] = useState('mazmorra');

  const [ejTemaId, setEjTemaId] = useState('');
  const [ejTitulo, setEjTitulo] = useState('');
  const [ejContenido, setEjContenido] = useState('');

  const [evalTemaId, setEvalTemaId] = useState('');
  const [evalTitulo, setEvalTitulo] = useState('');
  const [evalXp, setEvalXp] = useState(350);

  const [tareaCategoriaLibre, setTareaCategoriaLibre] = useState('');
  const [tareaTitulo, setTareaTitulo] = useState('');
  const [tareaDesc, setTareaDesc] = useState('');
  const [tareaFecha, setTareaFecha] = useState('');
  const [tareaArchivoNombre, setTareaArchivoNombre] = useState('');
  const [tareaArchivoBase64, setTareaArchivoBase64] = useState(null);

  const [pregEvalId, setPregEvalId] = useState('');
  const [enunciado, setEnunciado] = useState('');
  const [opA, setOpA] = useState('');
  const [opB, setOpB] = useState('');
  const [opC, setOpC] = useState('');
  const [opD, setOpD] = useState('');
  const [opCorrecta, setOpCorrecta] = useState('A');
  const [explicacionPreg, setExplicacionPreg] = useState('');

  // ==========================================================================
  // 🔄 FUNCIÓN PARA CARGAR TODOS LOS DATOS DEL SERVIDOR BACKEND
  // ==========================================================================
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

  // ==========================================================================
  // 📸 LECTORES DE ARCHIVOS EN BASE64 (DOCUMENTOS Y FOTO EN TIEMPO REAL)
  // ==========================================================================
  const handleArchivoTarea = (e) => {
    const file = e.target.files[0];
    if (file) {
      setTareaArchivoNombre(file.name);
      const reader = new FileReader();
      reader.onloadend = () => setTareaArchivoBase64(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // 💡 FOTO EN TIEMPO REAL: Actualiza la imagen local y global en la barra superior
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Img = reader.result;
        setPerfilDocente(prev => ({ ...prev, avatar: base64Img }));
        if (actualizarAvatar) {
          actualizarAvatar(base64Img);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // ==========================================================================
  // 🤖 FUNCIONES DEL ORÁCULO DE INTELIGENCIA ARTIFICIAL (COPILOTO)
  // ==========================================================================
  const consultarCopiloto = async () => {
    if (!promptIA.trim()) return alert("Escribe tu instrucción o tema para el Oráculo IA.");
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
      else alert(data.error || 'Error al procesar la solicitud.');
    } catch {
      alert('Error de conexión con el servidor.');
    } finally {
      setCargandoIA(false);
    }
  };

  const guardarPreguntaDesdeIA = async (pregunta, evaluacionId) => {
    if (!evaluacionId) return alert("Selecciona primero a qué Jefe Final deseas asignarle esta pregunta.");
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
        opcion_correcta: pregunta.opcion_correcta,
        explicacion: pregunta.explicacion || ''
      })
    });
    if (res.ok) {
      alert("¡Ataque/Pregunta añadida al Jefe Final!");
      setRespuestaIA(prev => ({ ...prev, resultado: prev.resultado.filter(p => p !== pregunta) }));
      cargarDatos();
    }
  };

  const guardarEjemploDesdeIA = async (temaId) => {
    if (!temaId) return alert("Selecciona a qué Bioma deseas vincular este Pergamino.");
    const res = await fetch('http://localhost:4000/api/ejemplos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tema_id: temaId,
        titulo: respuestaIA.resultado.titulo,
        contenido: respuestaIA.resultado.contenido
      })
    });
    if (res.ok) { alert("¡Pergamino publicado en el Bioma!"); cargarDatos(); }
  };

  const guardarTareaDesdeIA = async (temaId) => {
    const idSeguro = temaId || (temas.length > 0 ? temas[0].id : 1);
    const res = await fetch('http://localhost:4000/api/tareas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tema_id: idSeguro,
        titulo: respuestaIA.resultado.titulo,
        descripcion: respuestaIA.resultado.descripcion,
        fecha_limite: 'Viernes 23:59 hrs'
      })
    });
    if (res.ok) { alert("¡Misión publicada en el Inventario de los Aventureros!"); cargarDatos(); }
  };

  // ==========================================================================
  // ⚔️ FUNCIONES DE CREACIÓN MANUAL
  // ==========================================================================
  const registrarEstudiante = async (e) => {
    e.preventDefault();
    if (!nuevoEstudiante.trim()) return;
    const res = await fetch('http://localhost:4000/api/estudiantes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre: nuevoEstudiante.trim(), clase_rpg: nuevaClaseRpg })
    });
    if (res.ok) {
      setNuevoEstudiante('');
      cargarDatos();
      alert('¡Aventurero matriculado con éxito!');
    }
  };

  const crearTema = async (e) => {
    e.preventDefault();
    if (!temaTitulo.trim()) return;
    const res = await fetch('http://localhost:4000/api/temas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        titulo: temaTitulo.trim(),
        descripcion: temaDesc.trim(),
        bioma: temaBioma
      })
    });
    if (res.ok) {
      setTemaTitulo('');
      setTemaDesc('');
      cargarDatos();
      alert('¡Nuevo Bioma desbloqueado en el Mapa 2D!');
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
      alert('¡Pergamino guardado en el Bioma!');
    }
  };

  const crearEvaluacion = async (e) => {
    e.preventDefault();
    if (!evalTemaId || !evalTitulo.trim()) return;
    const res = await fetch('http://localhost:4000/api/evaluaciones', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tema_id: evalTemaId,
        titulo: evalTitulo.trim(),
        nombre_jefe: evalTitulo.trim(),
        xp_recompensa: evalXp
      })
    });
    if (res.ok) {
      const nuevoJefe = await res.json();
      setEvalTitulo('');
      setPregEvalId(String(nuevoJefe.id));
      cargarDatos();
      alert('¡Jefe Final invocado! Ahora puedes agregarle todas las preguntas que quieras abajo.');
    }
  };

  const crearPreguntaManual = async (e) => {
    e.preventDefault();
    if (!pregEvalId || !enunciado.trim()) return alert('Selecciona un Jefe Final y escribe el enunciado.');

    const res = await fetch('http://localhost:4000/api/preguntas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        evaluacion_id: pregEvalId,
        enunciado: enunciado.trim(),
        opcion_a: opA.trim(),
        opcion_b: opB.trim(),
        opcion_c: opC.trim(),
        opcion_d: opD.trim(),
        opcion_correcta: opCorrecta,
        explicacion: explicacionPreg.trim() || `La respuesta correcta es la opción ${opCorrecta}.`
      })
    });

    if (res.ok) {
      setEnunciado('');
      setOpA('');
      setOpB('');
      setOpC('');
      setOpD('');
      setExplicacionPreg('');
      cargarDatos();
      const jefeActual = evaluaciones.find(ev => String(ev.id) === String(pregEvalId));
      if (jefeActual) cargarPreguntasDeJefe(jefeActual);
      alert('¡Pregunta añadida al Jefe! Escribe la siguiente pregunta cuando gustes.');
    } else {
      const err = await res.json();
      alert(err.error || 'Error al guardar la pregunta.');
    }
  };

  const crearTareaIndependiente = async (e) => {
    e.preventDefault();
    if (!tareaTitulo.trim() || !tareaDesc.trim()) return;

    let temaIdSeguro = temas.length > 0 ? temas[0].id : null;
    if (!temaIdSeguro) {
      const resTema = await fetch('http://localhost:4000/api/temas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titulo: 'Gremio General', descripcion: 'Misiones generales del curso', bioma: 'bosque' })
      });
      const nuevoTema = await resTema.json();
      temaIdSeguro = nuevoTema.id;
    }

    const prefijo = tareaCategoriaLibre.trim() ? `[${tareaCategoriaLibre.trim()}] ` : '';

    const res = await fetch('http://localhost:4000/api/tareas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tema_id: temaIdSeguro,
        titulo: `${prefijo}${tareaTitulo.trim()}`,
        descripcion: tareaDesc.trim(),
        fecha_limite: tareaFecha.trim() || 'Viernes 23:59 hrs',
        archivo_adjunto: tareaArchivoBase64
      })
    });

    if (res.ok) {
      setTareaTitulo('');
      setTareaDesc('');
      setTareaFecha('');
      setTareaCategoriaLibre('');
      setTareaArchivoNombre('');
      setTareaArchivoBase64(null);
      cargarDatos();
      alert('¡Misión publicada en el Inventario de los Aventureros!');
    } else {
      alert('Error al publicar la misión.');
    }
  };

  // ==========================================================================
  // 👁️ FUNCIONES DE AUDITORÍA, REVISIÓN Y ELIMINACIÓN
  // ==========================================================================
  const cargarPreguntasDeJefe = async (evaluacion) => {
    setEvaluacionVerPreguntas(evaluacion);
    try {
      const res = await fetch(`http://localhost:4000/api/evaluaciones/${evaluacion.id}/preguntas-docente`);
      const data = await res.json();
      setPreguntasDeEvaluacion(data);
    } catch {
      alert('Error al cargar las preguntas.');
    }
  };

  const toggleVerPreguntas = (evaluacion) => {
    if (evaluacionVerPreguntas?.id === evaluacion.id) {
      setEvaluacionVerPreguntas(null);
    } else {
      cargarPreguntasDeJefe(evaluacion);
    }
  };

  const eliminarPreguntaIndividual = async (id) => {
    if (!window.confirm('¿Eliminar esta pregunta del Jefe Final?')) return;
    await fetch(`http://localhost:4000/api/preguntas/${id}`, { method: 'DELETE' });
    cargarPreguntasDeJefe(evaluacionVerPreguntas);
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
    if (nota === undefined || nota === '') return alert('Ingresa una calificación de 0 a 100.');

    const res = await fetch(`http://localhost:4000/api/entregas/${entregaId}/calificar`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ calificacion: parseFloat(nota), retroalimentacion: feedback })
    });
    if (res.ok) {
      alert('¡Calificación guardada! El estudiante ha recibido su XP.');
      verEntregasDeTarea(tareaSeleccionada);
      cargarDatos();
    }
  };

  const eliminarEstudiante = async (id, nombre) => {
    if (!window.confirm(`¿Expulsar del gremio a "${nombre}"?`)) return;
    await fetch(`http://localhost:4000/api/estudiantes/${id}`, { method: 'DELETE' });
    cargarDatos();
  };

  const eliminarTema = async (id, titulo) => {
    if (!window.confirm(`¿Destruir el Bioma "${titulo}"?`)) return;
    await fetch(`http://localhost:4000/api/temas/${id}`, { method: 'DELETE' });
    cargarDatos();
  };

  const eliminarEjemplo = async (id) => {
    await fetch(`http://localhost:4000/api/ejemplos/${id}`, { method: 'DELETE' });
    cargarDatos();
  };

  const eliminarEvaluacion = async (id, titulo) => {
    if (!window.confirm(`¿Eliminar al Jefe "${titulo}"?`)) return;
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
    ? Math.round(calificaciones.reduce((acc, c) => acc + c.puntaje, 0) / calificaciones.length)
    : 0;

  const exportarCalificacionesCSV = () => {
    if (calificaciones.length === 0) return alert("No hay combates registrados para exportar.");
    const encabezados = "Estudiante,Token,Jefe_Final,Aciertos,Puntaje,XP_Ganada,Estado,Fecha\n";
    const filas = calificaciones.map(c => 
      `"${c.estudiante_nombre}","${c.codigo_unico}","${c.evaluacion_titulo}",${c.aciertos}/${c.total_preguntas},${c.puntaje}%,+${c.xp_ganada || c.puntaje * 3} XP,${c.puntaje >= 60 ? 'Jefe Derrotado' : 'Caido en Combate'},"${c.fecha}"`
    ).join("\n");
    const blob = new Blob([encabezados + filas], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Reporte_Gremio_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  // ==========================================================================
  // 🎨 ESTILOS TEMÁTICA RPG 16-BIT
  // ==========================================================================
  const rpgCardStyle = {
    background: 'linear-gradient(180deg, #11162d 0%, #090c1a 100%)',
    border: '2px solid #a855f7',
    borderRadius: '14px',
    padding: '1.35rem',
    boxShadow: '0 0 20px rgba(168, 85, 247, 0.2), inset 0 0 15px rgba(168, 85, 247, 0.08)'
  };

  const getRpgTabStyle = (nombreTab) => {
    const activa = pestana === nombreTab;
    return {
      background: activa 
        ? 'linear-gradient(180deg, #581c87 0%, #3b0764 100%)' 
        : 'rgba(15, 19, 41, 0.9)',
      color: activa ? '#fde047' : '#cbd5e1',
      border: activa ? '2px solid #fde047' : '2px solid #6b21a8',
      boxShadow: activa ? '0 0 14px rgba(253, 224, 71, 0.35)' : 'none',
      cursor: 'pointer',
      padding: '0.6rem 1rem',
      borderRadius: '10px',
      fontWeight: '800',
      fontSize: '0.8rem',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
      transition: 'all 0.2s ease'
    };
  };

  // ==========================================================================
  // 🖥️ RENDERIZADO DE LA INTERFAZ DEL GAME MASTER
  // ==========================================================================
  return (
    <div className="container" style={{ maxWidth: '1220px', paddingTop: '0.6rem' }}>
      
      {/* 1. TOP HUD DEL GAME MASTER */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(250px, 1.1fr) minmax(300px, 1.8fr) minmax(240px, 1fr)',
        gap: '1rem',
        background: 'linear-gradient(180deg, #13092b 0%, #090c1a 100%)',
        border: '3px solid #a855f7',
        borderRadius: '14px',
        padding: '0.8rem 1.1rem',
        marginBottom: '1rem',
        boxShadow: '0 0 25px rgba(168, 85, 247, 0.35), inset 0 0 18px rgba(168, 85, 247, 0.15)',
        alignItems: 'center'
      }}>
        {/* Izquierda: Avatar en Tiempo Real */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div 
            onClick={() => setPestana('perfil')}
            title="Haz clic para cambiar tu foto de Game Master"
            style={{
              width: '58px', height: '58px', borderRadius: '10px', border: '2px solid #fde047',
              background: '#1e1b4b', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 14px rgba(253, 224, 71, 0.45)', flexShrink: 0, overflow: 'hidden', cursor: 'pointer'
            }}
          >
            {perfilDocente.avatar ? (
              <img src={perfilDocente.avatar} alt="Game Master" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <GameMasterSprite16Bit />
            )}
          </div>
          <div>
            <span className="pixel-font" style={{ fontSize: '0.55rem', color: '#fde047' }}>
              👑 CONSOLA GAME MASTER
            </span>
            <div className="pixel-font" style={{ fontSize: '0.75rem', color: '#ffffff', marginTop: '4px' }}>
              {perfilDocente.nombre}
            </div>
            <div style={{ fontSize: '0.78rem', fontWeight: '800', color: '#c084fc', marginTop: '2px' }}>
              {perfilDocente.titulo}
            </div>
          </div>
        </div>

        {/* Centro: Barras de Estado del Mundo */}
        <div style={{
          display: 'flex', flexDirection: 'column', gap: '0.55rem',
          padding: '0.2rem 0.85rem', borderLeft: '1px solid rgba(168, 85, 247, 0.35)', borderRight: '1px solid rgba(168, 85, 247, 0.35)'
        }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', fontWeight: '800', marginBottom: '3px' }}>
              <span className="pixel-font" style={{ fontSize: '0.55rem', color: '#4ade80' }}>★ DOMINIO DEL GREMIO (PROMEDIO)</span>
              <span style={{ fontFamily: 'monospace', color: '#86efac' }}>{promedioNotas}% VICTORIA</span>
            </div>
            <div style={{ width: '100%', height: '12px', background: '#050811', border: '2px solid #059669', borderRadius: '6px', overflow: 'hidden' }}>
              <div style={{ width: `${Math.max(15, promedioNotas)}%`, height: '100%', background: 'linear-gradient(90deg, #10b981 0%, #4ade80 100%)', boxShadow: '0 0 12px #22c55e', transition: 'width 0.4s ease' }} />
            </div>
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', fontWeight: '800', marginBottom: '3px' }}>
              <span className="pixel-font" style={{ fontSize: '0.55rem', color: '#f87171' }}>⚔️ AMENAZA DE JEFES FINALES</span>
              <span style={{ fontFamily: 'monospace', color: '#fca5a5' }}>{evaluaciones.length} JEFES • {tareas.length} MISIONES</span>
            </div>
            <div style={{ width: '100%', height: '12px', background: '#050811', border: '2px solid #dc2626', borderRadius: '6px', overflow: 'hidden' }}>
              <div style={{ width: `${Math.min(100, Math.max(25, evaluaciones.length * 25))}%`, height: '100%', background: 'linear-gradient(90deg, #dc2626 0%, #f87171 100%)', boxShadow: '0 0 12px #ef4444', transition: 'width 0.4s ease' }} />
            </div>
          </div>
        </div>

        {/* Derecha: Resumen Rápido */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', textAlign: 'center' }}>
          <div style={{ background: 'rgba(168, 85, 247, 0.15)', border: '1px solid #c084fc', borderRadius: '8px', padding: '0.4rem' }}>
            <div className="pixel-font" style={{ fontSize: '0.85rem', color: '#fde047' }}>{estudiantes.length}</div>
            <div style={{ fontSize: '0.68rem', color: '#cbd5e1', fontWeight: '700' }}>Héroes</div>
          </div>
          <div style={{ background: 'rgba(56, 189, 248, 0.15)', border: '1px solid #38bdf8', borderRadius: '8px', padding: '0.4rem' }}>
            <div className="pixel-font" style={{ fontSize: '0.85rem', color: '#38bdf8' }}>{temas.length}</div>
            <div style={{ fontSize: '0.68rem', color: '#cbd5e1', fontWeight: '700' }}>Biomas</div>
          </div>
        </div>
      </div>

      {/* 2. HOTBAR DE PESTAÑAS DEL GAME MASTER (7 SECCIONES) */}
      <div style={{
        display: 'flex', gap: '0.5rem', background: 'linear-gradient(180deg, #0f1329 0%, #090c1a 100%)',
        padding: '0.6rem', borderRadius: '14px', border: '2px solid #a855f7', marginBottom: '1.25rem',
        flexWrap: 'wrap', justifyContent: 'center', boxShadow: '0 0 18px rgba(168, 85, 247, 0.25)'
      }}>
        <button style={getRpgTabStyle('estudiantes')} onClick={() => setPestana('estudiantes')}>
          <Users size={16} color="#4ade80" /> <span>1. Gremio ({estudiantes.length})</span>
        </button>
        <button style={getRpgTabStyle('ia-evaluador')} onClick={() => setPestana('ia-evaluador')}>
          <Sparkles size={16} color="#c084fc" /> <span>2. Oráculo IA</span>
        </button>
        <button style={getRpgTabStyle('temas')} onClick={() => setPestana('temas')}>

<Map size={16} color="#38bdf8" />
<span>3. Biomas ({temas.length})</span>
        </button>
        <button style={getRpgTabStyle('evaluaciones')} onClick={() => setPestana('evaluaciones')}>
          <Swords size={16} color="#f87171" /> <span>4. Jefes ({evaluaciones.length})</span>
        </button>
        <button style={getRpgTabStyle('tareas')} onClick={() => setPestana('tareas')}>
          <ClipboardList size={16} color="#fb923c" /> <span>5. Misiones ({tareas.length})</span>
        </button>
        <button style={getRpgTabStyle('calificaciones')} onClick={() => setPestana('calificaciones')}>
          <Award size={16} color="#fde047" /> <span>6. Crónicas CSV</span>
        </button>
        <button style={getRpgTabStyle('perfil')} onClick={() => setPestana('perfil')}>
          <UserCog size={16} color="#f472b6" /> <span>7. Mi Avatar</span>
        </button>
      </div>

      {/* =====================================================================
          PESTAÑA 1: ESTUDIANTES
         ===================================================================== */}
      {pestana === 'estudiantes' && (
        <div className="grid-2">
          <div style={rpgCardStyle}>
            <h3 className="pixel-font" style={{ fontSize: '0.8rem', color: '#4ade80', marginBottom: '1rem' }}>
              🛡️ RECLUTAR NUEVO AVENTURERO
            </h3>
            <form onSubmit={registrarEstudiante}>
              <div className="input-group">
                <label className="input-label">Nombre del Estudiante:</label>
                <input 
                  type="text" 
                  className="input-pro" 
                  value={nuevoEstudiante} 
                  onChange={(e) => setNuevoEstudiante(e.target.value)} 
                  placeholder="Ej: Alex Enmanuel Merlo" 
                  required 
                />
              </div>
              <div className="input-group">
                <label className="input-label">Vocación / Clase RPG Inicial:</label>
                <select className="input-pro" value={nuevaClaseRpg} onChange={(e) => setNuevaClaseRpg(e.target.value)}>
                  <option value="Mago de Código">🧙‍♂️ Mago de Código (Programación)</option>
                  <option value="Arquera Lógica">🏹 Arquera Lógica (Algoritmos)</option>
                  <option value="Paladín de Datos">🛡️ Paladín de Datos (Estadística)</option>
                  <option value="Alquimista SQL">⚗️ Alquimista SQL (Bases de Datos)</option>
                </select>
              </div>
              <button type="submit" className="btn-pro btn-pro-primary" style={{ width: '100%' }}>
                ⚡ Generar Token de Gremio y Matricular
              </button>
            </form>
          </div>

          <div style={rpgCardStyle}>
            <h3 className="pixel-font" style={{ fontSize: '0.8rem', color: '#fde047', marginBottom: '1rem' }}>
              📜 MIEMBROS DEL GREMIO ({estudiantes.length})
            </h3>
            <div style={{ maxHeight: '420px', overflowY: 'auto' }}>
              {estudiantes.map(est => (
                <div key={est.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '0.75rem', marginBottom: '0.6rem', background: '#050811',
                  border: '1px solid rgba(168, 85, 247, 0.35)', borderRadius: '10px'
                }}>
                  <div>
                    <div style={{ fontWeight: '800', color: '#ffffff' }}>
                      {est.nombre} <span style={{ color: '#4ade80', fontSize: '0.78rem' }}>(Nvl {est.nivel || 1} • {est.xp || 150} XP)</span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#c084fc' }}>{est.clase_rpg || 'Mago de Código'}</div>
                    <span style={{ color: '#fde047', fontSize: '0.82rem', fontFamily: 'monospace', fontWeight: 'bold' }}>
                      TOKEN: {est.codigo_unico}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.45rem' }}>
                    <button 
                      onClick={() => { navigator.clipboard.writeText(est.codigo_unico); alert(`Token ${est.codigo_unico} copiado.`); }} 
                      className="btn-pro" 
                      style={{ padding: '0.4rem 0.7rem', fontSize: '0.75rem', background: '#1e1b4b', color: '#fde047', border: '1px solid #fde047' }}
                    >
                      <Copy size={13} /> Copiar
                    </button>
                    <button onClick={() => eliminarEstudiante(est.id, est.nombre)} className="btn-danger" style={{ padding: '0.4rem 0.6rem', borderRadius: '8px' }}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          PESTAÑA 2: ORÁCULO & COPILOTO IA
         ===================================================================== */}
      {pestana === 'ia-evaluador' && (
        <div style={rpgCardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1rem' }}>
            <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'rgba(168, 85, 247, 0.25)', border: '2px solid #c084fc', color: '#fde047' }}>
              <BrainCircuit size={30} />
            </div>
            <div>
              <h3 className="pixel-font" style={{ fontSize: '0.85rem', color: '#fde047' }}>ORÁCULO ARCANO IA (GEMINI 2.5)</h3>
              <p style={{ color: '#cbd5e1', fontSize: '0.85rem', marginTop: '4px' }}>
                Forja preguntas de combate, pergaminos de código o misiones automáticamente con un clic.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            {[
              { id: 'chat', label: '💬 Consejo Pedagógico' },
              { id: 'preguntas', label: '🐉 Generar 3 Ataques (Preguntas)' },
              { id: 'ejemplo', label: '📜 Forjar Pergamino de Teoría' },
              { id: 'tarea', label: '🛡️ Diseñar Misión Práctica' }
            ].map(m => (
              <button 
                key={m.id} 
                onClick={() => setModoIA(m.id)} 
                style={{
                  padding: '0.55rem 0.95rem', borderRadius: '8px', fontSize: '0.82rem', fontWeight: '800', cursor: 'pointer',
                  border: modoIA === m.id ? '2px solid #fde047' : '1px solid #6b21a8',
                  background: modoIA === m.id ? '#581c87' : '#050811',
                  color: modoIA === m.id ? '#fde047' : '#cbd5e1'
                }}
              >
                {m.label}
              </button>
            ))}
          </div>

          <textarea 
            className="input-pro" 
            rows="3" 
            placeholder="Escribe el tema aquí (Ej: Cálculo de Varianza, Arreglos en C++, Consultas SQL INNER JOIN)..." 
            value={promptIA} 
            onChange={(e) => setPromptIA(e.target.value)} 
          />
          <button onClick={consultarCopiloto} disabled={cargandoIA} className="btn-pro btn-pro-ai" style={{ width: '100%', marginTop: '0.85rem' }}>
            <Sparkles size={18} /> {cargandoIA ? 'Invocando sabiduría del Oráculo...' : 'Invocar al Oráculo IA'}
          </button>

          {respuestaIA && (
            <div style={{ marginTop: '1.5rem', borderTop: '2px solid #6b21a8', paddingTop: '1.25rem' }}>
              {respuestaIA.tipo === 'chat' && (
                <div style={{ background: '#050811', padding: '1.25rem', borderRadius: '10px', border: '1px solid #a855f7' }}>
                  <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', color: '#f8fafc' }}>{respuestaIA.resultado}</pre>
                </div>
              )}

              {respuestaIA.tipo === 'preguntas' && respuestaIA.resultado.map((preg, idx) => (
                <div key={idx} style={{ background: '#050811', padding: '1rem', borderRadius: '10px', marginBottom: '0.85rem', border: '1px solid #a855f7' }}>
                  <p style={{ fontWeight: '800', color: '#fde047', marginBottom: '0.5rem' }}>{idx + 1}. {preg.enunciado}</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', fontSize: '0.84rem', color: '#cbd5e1', marginBottom: '0.75rem' }}>
                    <div>A) {preg.opcion_a}</div><div>B) {preg.opcion_b}</div><div>C) {preg.opcion_c}</div><div>D) {preg.opcion_d}</div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <span className="badge badge-success">Clave Correcta: {preg.opcion_correcta}</span>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <select id={`eval-ia-${idx}`} className="input-pro" style={{ padding: '0.4rem', fontSize: '0.82rem', width: 'auto' }}>
                        <option value="">Asignar a Jefe...</option>
                        {evaluaciones.map(e => <option key={e.id} value={e.id}>{e.titulo}</option>)}
                      </select>
                      <button onClick={() => guardarPreguntaDesdeIA(preg, document.getElementById(`eval-ia-${idx}`).value)} className="btn-pro btn-pro-primary">
                        Guardar en Jefe
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {respuestaIA.tipo === 'ejemplo' && (
                <div style={{ background: '#050811', padding: '1.25rem', borderRadius: '10px', border: '1px solid #a855f7' }}>
                  <h4 style={{ color: '#fde047', marginBottom: '0.5rem' }}>📜 {respuestaIA.resultado.titulo}</h4>
                  <pre style={{ background: '#090d16', padding: '0.85rem', borderRadius: '8px', color: '#a5f3fc', fontSize: '0.84rem', overflowX: 'auto' }}>{respuestaIA.resultado.contenido}</pre>
                  <div style={{ marginTop: '1rem', display: 'flex', gap: '0.6rem' }}>
                    <select id="tema-ejemplo-ia" className="input-pro" style={{ flex: 1 }}>
                      <option value="">Seleccionar Bioma...</option>
                      {temas.map(t => <option key={t.id} value={t.id}>{t.titulo}</option>)}
                    </select>
                    <button onClick={() => guardarEjemploDesdeIA(document.getElementById('tema-ejemplo-ia').value)} className="btn-pro btn-pro-primary">
                      <PlusCircle size={16} /> Publicar Pergamino
                    </button>
                  </div>
                </div>
              )}

              {respuestaIA.tipo === 'tarea' && (
                <div style={{ background: '#050811', padding: '1.25rem', borderRadius: '10px', border: '1px solid #a855f7' }}>
                  <h4 style={{ color: '#fde047', marginBottom: '0.5rem' }}>🛡️ {respuestaIA.resultado.titulo}</h4>
                  <p style={{ whiteSpace: 'pre-wrap', fontSize: '0.88rem', color: '#e2e8f0' }}>{respuestaIA.resultado.descripcion}</p>
                  <button onClick={() => guardarTareaDesdeIA()} className="btn-pro btn-pro-primary" style={{ marginTop: '1rem', width: '100%' }}>
                    <PlusCircle size={16} /> Publicar Misión en el Gremio
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* =====================================================================
          PESTAÑA 3: BIOMAS
         ===================================================================== */}
      {pestana === 'temas' && (
        <div className="grid-2">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={rpgCardStyle}>
              <h3 className="pixel-font" style={{ fontSize: '0.8rem', color: '#38bdf8', marginBottom: '1rem' }}>
                🏰 CONSTRUIR BIOMA EN EL MAPA 2D
              </h3>
              <form onSubmit={crearTema}>
                <div className="input-group">
                  <label className="input-label">Nombre de la Región / Bioma:</label>
                  <input type="text" className="input-pro" placeholder="Ej: Fortaleza de Cálculo" value={temaTitulo} onChange={(e) => setTemaTitulo(e.target.value)} required />
                </div>
                <div className="input-group">
                  <label className="input-label">Apariencia 16-Bit en el Mapa:</label>
                  <select className="input-pro" value={temaBioma} onChange={(e) => setTemaBioma(e.target.value)}>
                    <option value="mazmorra">🏰 Castillo de Mazmorra (Jefe Principal)</option>
                    <option value="bosque">🌲 Bosque Arcano de Algoritmos</option>
                    <option value="ruinas">🏛️ Ruinas Antiguas de Teoría</option>
                    <option value="laboratorio">⚗️ Torre de Laboratorio</option>
                  </select>
                </div>
                <div className="input-group">
                  <textarea className="input-pro" placeholder="Descripción teórica..." value={temaDesc} onChange={(e) => setTemaDesc(e.target.value)} rows="2" required />
                </div>
                <button type="submit" className="btn-pro btn-pro-primary" style={{ width: '100%' }}>Guardar Bioma en el Mapa</button>
              </form>
            </div>

            <div style={rpgCardStyle}>
              <h3 className="pixel-font" style={{ fontSize: '0.8rem', color: '#fbbf24', marginBottom: '1rem' }}>
                📜 ESCRIBIR PERGAMINO DE SABIDURÍA
              </h3>
              <form onSubmit={crearEjemplo}>
                <div className="input-group">
                  <select className="input-pro" value={ejTemaId} onChange={(e) => setEjTemaId(e.target.value)} required>
                    <option value="">Vincular a Bioma...</option>
                    {temas.map(t => <option key={t.id} value={t.id}>{t.titulo}</option>)}
                  </select>
                </div>
                <div className="input-group">
                  <input type="text" className="input-pro" placeholder="Título de la fórmula o código" value={ejTitulo} onChange={(e) => setEjTitulo(e.target.value)} required />
                </div>
                <div className="input-group">
                  <textarea className="input-pro" placeholder="Fórmula o código fuente..." value={ejContenido} onChange={(e) => setEjContenido(e.target.value)} rows="3" required />
                </div>
                <button type="submit" className="btn-pro btn-pro-primary" style={{ width: '100%' }}>Publicar Pergamino</button>
              </form>
            </div>
          </div>

          <div style={rpgCardStyle}>
            <h3 className="pixel-font" style={{ fontSize: '0.8rem', color: '#4ade80', marginBottom: '1rem' }}>
              🗺️ REGIONES ACTIVAS EN EL MAPA ({temas.length})
            </h3>
            <div style={{ maxHeight: '560px', overflowY: 'auto' }}>
              {temas.map(t => (
                <div key={t.id} style={{ background: '#050811', padding: '1rem', borderRadius: '10px', marginBottom: '0.85rem', border: '1px solid rgba(56, 189, 248, 0.4)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong style={{ color: '#38bdf8', fontSize: '0.95rem' }}>🏰 {t.titulo}</strong>
                      <span style={{ marginLeft: '8px', fontSize: '0.72rem', background: '#1e1b4b', color: '#c084fc', padding: '2px 7px', borderRadius: '4px', textTransform: 'uppercase' }}>
                        {t.bioma || 'bosque'}
                      </span>
                    </div>
                    <button onClick={() => eliminarTema(t.id, t.titulo)} className="btn-danger" style={{ padding: '0.3rem 0.5rem', borderRadius: '6px' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: '0.4rem 0' }}>{t.descripcion}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          PESTAÑA 4: JEFES FINALES
         ===================================================================== */}
      {pestana === 'evaluaciones' && (
        <div className="grid-2">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={rpgCardStyle}>
              <h3 className="pixel-font" style={{ fontSize: '0.8rem', color: '#f87171', marginBottom: '1rem' }}>
                🐉 PASO 1: INVOCAR JEFE DE MAZMORRA
              </h3>
              <form onSubmit={crearEvaluacion}>
                <div className="input-group">
                  <label className="input-label">Bioma donde aparecerá el Jefe:</label>
                  <select className="input-pro" value={evalTemaId} onChange={(e) => setEvalTemaId(e.target.value)} required>
                    <option value="">Seleccionar Bioma...</option>
                    {temas.map(t => <option key={t.id} value={t.id}>{t.titulo}</option>)}
                  </select>
                </div>
                <div className="input-group">
                  <label className="input-label">Nombre del Jefe Final:</label>
                  <input type="text" className="input-pro" placeholder="Ej: Guardián de la Varianza" value={evalTitulo} onChange={(e) => setEvalTitulo(e.target.value)} required />
                </div>
                <div className="input-group">
                  <label className="input-label">Recompensa de XP:</label>
                  <input type="number" className="input-pro" value={evalXp} onChange={(e) => setEvalXp(e.target.value)} min="100" max="1000" step="50" required />
                </div>
                <button type="submit" className="btn-pro btn-pro-primary" style={{ width: '100%' }}>
                  ⚔️ Invocar Jefe Final
                </button>
              </form>
            </div>

            <div style={{ ...rpgCardStyle, border: '2px solid #fde047' }}>
              <h3 className="pixel-font" style={{ fontSize: '0.8rem', color: '#fde047', marginBottom: '0.5rem' }}>
                ⚡ PASO 2: CARGAR ATAQUES (PREGUNTAS)
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '0.85rem' }}>
                Elige un Jefe y agrégale preguntas seguidas sin recargar.
              </p>
              <form onSubmit={crearPreguntaManual}>
                <div className="input-group">
                  <select className="input-pro" value={pregEvalId} onChange={(e) => setPregEvalId(e.target.value)} required>
                    <option value="">Seleccionar Jefe Final activo...</option>
                    {evaluaciones.map(ev => <option key={ev.id} value={ev.id}>🐉 {ev.titulo} ({ev.total_preguntas} preg.)</option>)}
                  </select>
                </div>
                <div className="input-group">
                  <textarea className="input-pro" placeholder="Enunciado de la pregunta..." value={enunciado} onChange={(e) => setEnunciado(e.target.value)} rows="2" required />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <input type="text" className="input-pro" placeholder="Opción A" value={opA} onChange={(e) => setOpA(e.target.value)} required />
                  <input type="text" className="input-pro" placeholder="Opción B" value={opB} onChange={(e) => setOpB(e.target.value)} required />
                  <input type="text" className="input-pro" placeholder="Opción C" value={opC} onChange={(e) => setOpC(e.target.value)} required />
                  <input type="text" className="input-pro" placeholder="Opción D" value={opD} onChange={(e) => setOpD(e.target.value)} required />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <select className="input-pro" value={opCorrecta} onChange={(e) => setOpCorrecta(e.target.value)}>
                    <option value="A">Clave: A</option>
                    <option value="B">Clave: B</option>
                    <option value="C">Clave: C</option>
                    <option value="D">Clave: D</option>
                  </select>
                  <input type="text" className="input-pro" placeholder="Explicación (Opcional)" value={explicacionPreg} onChange={(e) => setExplicacionPreg(e.target.value)} />
                </div>
                <button type="submit" className="btn-pro btn-pro-primary" style={{ width: '100%' }}>
                  <PlusCircle size={16} /> Añadir Pregunta a este Jefe
                </button>
              </form>
            </div>
          </div>

          <div style={rpgCardStyle}>
            <h3 className="pixel-font" style={{ fontSize: '0.8rem', color: '#f87171', marginBottom: '1rem' }}>
              🏰 JEFES FINALES EN EL MAPA ({evaluaciones.length})
            </h3>
            {evaluaciones.map(ev => (
              <div key={ev.id} style={{ background: '#050811', padding: '1rem', borderRadius: '10px', marginBottom: '0.85rem', border: '1px solid #ef4444' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <BossDragonSprite16Bit />
                    <div>
                      <h4 style={{ color: '#ffffff' }}>{ev.titulo}</h4>
                      <span style={{ fontSize: '0.78rem', color: '#4ade80', fontWeight: 'bold' }}>
                        +{ev.xp_recompensa || 300} XP • {ev.total_preguntas} preguntas cargadas
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button onClick={() => toggleVerPreguntas(ev)} className="btn-pro btn-pro-primary" style={{ padding: '0.35rem 0.7rem', fontSize: '0.78rem' }}>
                      <Eye size={14} /> {evaluacionVerPreguntas?.id === ev.id ? 'Ocultar' : 'Ver Preguntas'}
                    </button>
                    <button onClick={() => eliminarEvaluacion(ev.id, ev.titulo)} className="btn-danger" style={{ padding: '0.35rem 0.5rem', borderRadius: '6px' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {evaluacionVerPreguntas?.id === ev.id && (
                  <div style={{ marginTop: '0.85rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '0.75rem' }}>
                    {preguntasDeEvaluacion.length === 0 ? (
                      <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Aún no hay preguntas para este Jefe.</p>
                    ) : (
                      preguntasDeEvaluacion.map((p, idx) => (
                        <div key={p.id} style={{ background: '#0f172a', padding: '0.6rem', borderRadius: '6px', marginBottom: '0.45rem', fontSize: '0.82rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <strong style={{ color: '#fde047' }}>{idx + 1}. {p.enunciado}</strong>
                            <div style={{ color: '#4ade80', fontSize: '0.75rem' }}>Clave: {p.opcion_correcta}</div>
                          </div>
                          <button onClick={() => eliminarPreguntaIndividual(p.id)} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer' }}>
                            <Trash2 size={14} />
                          </button>
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

      {/* =====================================================================
          PESTAÑA 5: TRABAJOS PRÁCTICOS
         ===================================================================== */}
      {pestana === 'tareas' && (
        <div>
          <div className="grid-2">
            <div style={rpgCardStyle}>
              <h3 className="pixel-font" style={{ fontSize: '0.8rem', color: '#fb923c', marginBottom: '1rem' }}>
                🎒 PUBLICAR MISIÓN CON GUÍA (WORD / PDF)
              </h3>
              <form onSubmit={crearTareaIndependiente}>
                <div className="input-group">
                  <label className="input-label">Categoría o Tema Libre:</label>
                  <input type="text" className="input-pro" placeholder="Ej: Laboratorio 1" value={tareaCategoriaLibre} onChange={(e) => setTareaCategoriaLibre(e.target.value)} />
                </div>
                <div className="input-group">
                  <label className="input-label">Título de la Misión:</label>
                  <input type="text" className="input-pro" placeholder="Ej: Análisis Estadístico" value={tareaTitulo} onChange={(e) => setTareaTitulo(e.target.value)} required />
                </div>
                <div className="input-group">
                  <label className="input-label">Instrucciones:</label>
                  <textarea className="input-pro" placeholder="Describe qué debe entregar el alumno..." value={tareaDesc} onChange={(e) => setTareaDesc(e.target.value)} rows="3" required />
                </div>

                <div className="input-group" style={{ background: '#050811', padding: '0.9rem', borderRadius: '10px', border: '1px dashed #a855f7' }}>
                  <label className="input-label" style={{ color: '#c084fc', marginBottom: '0.5rem' }}>
                    📄 Adjuntar Documento (PDF / Word):
                  </label>
                  <input type="file" accept=".pdf,.doc,.docx" ref={fileInputTarea} style={{ display: 'none' }} onChange={handleArchivoTarea} />
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <button type="button" onClick={() => fileInputTarea.current.click()} className="btn-pro" style={{ background: '#1e1b4b', color: '#38bdf8', border: '1px solid #38bdf8', fontSize: '0.8rem' }}>
                      <UploadCloud size={16} /> Subir Archivo
                    </button>
                    {tareaArchivoNombre && (
                      <span style={{ fontSize: '0.8rem', color: '#4ade80', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <FileText size={14} /> {tareaArchivoNombre}
                      </span>
                    )}
                  </div>
                </div>

                <button type="submit" className="btn-pro btn-pro-primary" style={{ width: '100%' }}>
                  🚀 Publicar Misión
                </button>
              </form>
            </div>

            <div style={rpgCardStyle}>
              <h3 className="pixel-font" style={{ fontSize: '0.8rem', color: '#fde047', marginBottom: '1rem' }}>
                📋 MISIONES ACTIVAS ({tareas.length})
              </h3>
              {tareas.map(tar => (
                <div key={tar.id} style={{ background: '#050811', padding: '0.9rem', borderRadius: '10px', marginBottom: '0.75rem', border: '1px solid rgba(251, 146, 60, 0.4)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ color: '#ffffff' }}>⚔️ {tar.titulo}</h4>
                    <button onClick={() => eliminarTarea(tar.id, tar.titulo)} className="btn-danger" style={{ padding: '0.3rem 0.5rem', borderRadius: '6px' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                  {tar.archivo_adjunto && (
                    <div style={{ fontSize: '0.76rem', color: '#38bdf8', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <FileText size={13} /> Contiene documento PDF/Word descargable
                    </div>
                  )}
                  <div style={{ marginTop: '0.65rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.78rem', color: '#4ade80' }}>{tar.total_entregas || 0} entregas</span>
                    <button onClick={() => verEntregasDeTarea(tar)} className="btn-pro btn-pro-primary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}>
                      Revisar Entregas
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {tareaSeleccionada && (
            <div style={{ ...rpgCardStyle, marginTop: '1.25rem', border: '2px solid #38bdf8' }}>
              <h3 className="pixel-font" style={{ fontSize: '0.8rem', color: '#38bdf8' }}>
                🔍 ENTREGAS DE: {tareaSeleccionada.titulo}
              </h3>
              {entregasTarea.length === 0 ? (
                <p style={{ color: '#94a3b8', marginTop: '0.75rem' }}>Ningún aventurero ha enviado esta misión.</p>
              ) : (
                entregasTarea.map(entrega => (
                  <div key={entrega.id} style={{ background: '#050811', padding: '1rem', borderRadius: '10px', marginTop: '0.85rem', border: '1px solid #334155' }}>
                    <strong style={{ color: '#fde047' }}>{entrega.estudiante_nombre}</strong> <span style={{ color: '#38bdf8', fontFamily: 'monospace' }}>({entrega.codigo_unico})</span>
                    <pre style={{ margin: '0.5rem 0', padding: '0.65rem', background: '#090d16', borderRadius: '6px', fontSize: '0.84rem', color: '#a5f3fc', whiteSpace: 'pre-wrap' }}>
                      {entrega.contenido}
                    </pre>
                    <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center', flexWrap: 'wrap' }}>
                      <input type="number" className="input-pro" style={{ width: '110px' }} placeholder="Nota (0-100)" value={notaInput[entrega.id] !== undefined ? notaInput[entrega.id] : (entrega.calificacion ?? '')} onChange={(e) => setNotaInput({ ...notaInput, [entrega.id]: e.target.value })} />
                      <input type="text" className="input-pro" style={{ flex: 1 }} placeholder="Retroalimentación..." value={feedbackInput[entrega.id] !== undefined ? feedbackInput[entrega.id] : (entrega.retroalimentacion ?? '')} onChange={(e) => setFeedbackInput({ ...feedbackInput, [entrega.id]: e.target.value })} />
                      <button onClick={() => guardarCalificacionEntrega(entrega.id)} className="btn-pro btn-pro-primary">
                        <CheckCircle size={15} /> Calificar y Dar XP
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* =====================================================================
          PESTAÑA 6: CRÓNICAS (CALIFICACIONES CSV)
         ===================================================================== */}
      {pestana === 'calificaciones' && (
        <div style={rpgCardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h3 className="pixel-font" style={{ fontSize: '0.85rem', color: '#fde047' }}>
              🏆 CRÓNICAS DE COMBATE Y AUDITORÍA DE XP
            </h3>
            <button onClick={exportarCalificacionesCSV} className="btn-pro btn-pro-primary">
              <Download size={16} /> Descargar Reporte Excel (CSV)
            </button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Aventurero</th>
                  <th>Token</th>
                  <th>Jefe Enfrentado</th>
                  <th>Aciertos</th>
                  <th>Puntaje</th>
                  <th>XP Ganada</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {calificaciones.map(c => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: '800' }}>{c.estudiante_nombre}</td>
                    <td style={{ fontFamily: 'monospace', color: '#fde047' }}>{c.codigo_unico}</td>
                    <td>{c.evaluacion_titulo}</td>
                    <td>{c.aciertos}/{c.total_preguntas}</td>
                    <td style={{ fontWeight: 'bold' }}>{c.puntaje}%</td>
                    <td style={{ color: '#4ade80', fontWeight: 'bold' }}>+{c.xp_ganada || c.puntaje * 3} XP</td>
                    <td>
                      <span className={`badge ${c.puntaje >= 60 ? 'badge-success' : 'badge-danger'}`}>
                        {c.puntaje >= 60 ? 'Jefe Derrotado' : 'Derrotado'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =====================================================================
          PESTAÑA 7: PERFIL DEL GAME MASTER
         ===================================================================== */}
      {pestana === 'perfil' && (
        <div style={{ ...rpgCardStyle, maxWidth: '640px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem' }}>
            <div style={{ position: 'relative' }}>
              <div style={{
                width: '88px', height: '88px', borderRadius: '14px', background: '#1e1b4b',
                border: '3px solid #fde047', display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden', boxShadow: '0 0 20px rgba(253, 224, 71, 0.4)'
              }}>
                {perfilDocente.avatar ? (
                  <img src={perfilDocente.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <GameMasterSprite16Bit />
                )}
              </div>
              <input type="file" accept="image/*" ref={fileInputAvatar} style={{ display: 'none' }} onChange={handleAvatarChange} />
              <button 
                type="button"
                onClick={() => fileInputAvatar.current.click()} 
                style={{
                  position: 'absolute', bottom: '-6px', right: '-6px', background: '#a855f7',
                  border: '2px solid #fde047', color: '#fff', width: '32px', height: '32px',
                  borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
                title="Subir nueva foto"
              >
                <ImagePlus size={15} />
              </button>
            </div>

            <div>
              <h3 className="pixel-font" style={{ fontSize: '0.85rem', color: '#fde047' }}>AVATAR DEL GAME MASTER</h3>
              <p style={{ color: '#cbd5e1', fontSize: '0.84rem', marginTop: '4px' }}>
                Al elegir una imagen de tu PC, se actualizará en tiempo real en este panel y en la barra superior.
              </p>
            </div>
          </div>

          <form onSubmit={(e) => {
            e.preventDefault();
            if (perfilDocente.avatar && actualizarAvatar) {
              actualizarAvatar(perfilDocente.avatar);
            }
            alert('¡Identidad del Game Master guardada con éxito!');
          }}>
            <div className="input-group">
              <label className="input-label">Nombre del Game Master:</label>
              <input type="text" className="input-pro" value={perfilDocente.nombre} onChange={(e) => setPerfilDocente({ ...perfilDocente, nombre: e.target.value })} required />
            </div>
            <div className="input-group">
              <label className="input-label">Título o Rango Arcano:</label>
              <input type="text" className="input-pro" value={perfilDocente.titulo} onChange={(e) => setPerfilDocente({ ...perfilDocente, titulo: e.target.value })} required />
            </div>
            <div className="input-group">
              <label className="input-label">Biografía o Lema del Curso:</label>
              <textarea className="input-pro" rows="3" value={perfilDocente.biografia} onChange={(e) => setPerfilDocente({ ...perfilDocente, biografia: e.target.value })} />
            </div>
            <button type="submit" className="btn-pro btn-pro-primary" style={{ width: '100%' }}>
              <Save size={16} /> Guardar Identidad de Game Master
            </button>
          </form>
        </div>
      )}

    </div>
  );
}