// ============================================================================
// 💡 IMPORTACIONES DE REACT, CONTEXTO DE SESIÓN E ICONOS
// ============================================================================
import React, { useState, useEffect, useRef } from 'react';
// Importamos useAuth para leer los datos del docente y actualizar su foto en tiempo real
import { useAuth } from '../context/AuthContext';
// Importamos los íconos vectoriales de apoyo para los botones y acciones
import { 
  Users, Award, Sparkles,
  Download, CheckCircle, BrainCircuit, Trash2,
  ClipboardList, Eye, Copy, PlusCircle,
  Swords, Map, UserCog, Save, UploadCloud, FileText, ImagePlus
} from 'lucide-react';
import { StatBar } from '../components/rpg';

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
  // 🖥️ RENDERIZADO DE LA INTERFAZ DEL GAME MASTER
  // ==========================================================================
  return (
    <div className="container page-shell" style={{ maxWidth: '1220px' }}>
      
      {/* 1. TOP HUD DEL GAME MASTER */}
      <div className="hud-panel hud-panel--teacher">
        {/* Izquierda: Avatar en Tiempo Real */}
        <div className="hud-hero">
          <button
            type="button"
            onClick={() => setPestana('perfil')}
            title="Haz clic para cambiar tu foto de Game Master"
            className="hud-avatar hud-avatar--gold"
          >
            {perfilDocente.avatar ? (
              <img src={perfilDocente.avatar} alt="Game Master" className="avatar-img" />
            ) : (
              <GameMasterSprite16Bit />
            )}
          </button>
          <div className="hud-identity">
            <span className="hud-eyebrow hud-eyebrow--gold">
              👑 CONSOLA GAME MASTER
            </span>
            <span className="hud-name">
              {perfilDocente.nombre}
            </span>
            <span className="hud-role">
              {perfilDocente.titulo}
            </span>
          </div>
        </div>

        {/* Centro: Barras de Estado del Mundo */}
        <div className="hud-stats">
          <StatBar label="★ DOMINIO DEL GREMIO" value={Math.max(15, promedioNotas)} max={100} color="xp" suffix="%" showPercent={false} />
          <StatBar label="⚔ AMENAZA DE JEFES" value={Math.min(100, Math.max(25, evaluaciones.length * 25))} max={100} color="hp" suffix="%" showPercent={false} />
        </div>

        {/* Derecha: Resumen Rápido */}
        <div className="hud-kpi-grid">
          <div className="hud-kpi hud-kpi--gold">
            <span className="hud-kpi__value">{estudiantes.length}</span>
            <span className="hud-kpi__label">Héroes</span>
          </div>
          <div className="hud-kpi hud-kpi--teacher">
            <span className="hud-kpi__value">{temas.length}</span>
            <span className="hud-kpi__label">Biomas</span>
          </div>
        </div>
      </div>

      {/* 2. HOTBAR DE PESTAÑAS DEL GAME MASTER (7 SECCIONES) */}
      <div className="rpg-tabbar">
        <button className={`rpg-tab rpg-tab--guild ${pestana === 'estudiantes' ? 'is-active' : ''}`} onClick={() => setPestana('estudiantes')}>
          <Users size={16} /> <span>1. Gremio ({estudiantes.length})</span>
        </button>
        <button className={`rpg-tab rpg-tab--oracle ${pestana === 'ia-evaluador' ? 'is-active' : ''}`} onClick={() => setPestana('ia-evaluador')}>
          <Sparkles size={16} /> <span>2. Oráculo IA</span>
        </button>
        <button className={`rpg-tab rpg-tab--map ${pestana === 'temas' ? 'is-active' : ''}`} onClick={() => setPestana('temas')}>
          <Map size={16} />
          <span>3. Biomas ({temas.length})</span>
        </button>
        <button className={`rpg-tab rpg-tab--boss ${pestana === 'evaluaciones' ? 'is-active' : ''}`} onClick={() => setPestana('evaluaciones')}>
          <Swords size={16} /> <span>4. Jefes ({evaluaciones.length})</span>
        </button>
        <button className={`rpg-tab rpg-tab--quest ${pestana === 'tareas' ? 'is-active' : ''}`} onClick={() => setPestana('tareas')}>
          <ClipboardList size={16} /> <span>5. Misiones ({tareas.length})</span>
        </button>
        <button className={`rpg-tab rpg-tab--log ${pestana === 'calificaciones' ? 'is-active' : ''}`} onClick={() => setPestana('calificaciones')}>
          <Award size={16} /> <span>6. Crónicas CSV</span>
        </button>
        <button className={`rpg-tab rpg-tab--profile ${pestana === 'perfil' ? 'is-active' : ''}`} onClick={() => setPestana('perfil')}>
          <UserCog size={16} /> <span>7. Mi Avatar</span>
        </button>
      </div>

      {/* =====================================================================
          PESTAÑA 1: ESTUDIANTES
         ===================================================================== */}
      {pestana === 'estudiantes' && (
        <div className="grid-2">
          <div className="card-pro">
            <h3 className="pixel-font section-title section-title--xp">
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
              <button type="submit" className="btn-pro btn-pro-primary btn-block">
                ⚡ Generar Token de Gremio y Matricular
              </button>
            </form>
          </div>

          <div className="card-pro">
            <h3 className="pixel-font section-title section-title--gold">
              📜 MIEMBROS DEL GREMIO ({estudiantes.length})
            </h3>
            <div className="rpg-scroll">
              {estudiantes.map(est => (
                <div key={est.id} className="roster-item roster-item--student">
                  <div className="roster-item__id">
                    <span className="roster-name">
                      {est.nombre} <span className="text-xp">(Nvl {est.nivel || 1} • {est.xp || 150} XP)</span>
                    </span>
                    <span className="roster-meta">{est.clase_rpg || 'Mago de Código'}</span>
                    <span className="roster-token">
                      TOKEN: {est.codigo_unico}
                    </span>
                  </div>
                  <div className="roster-actions">
                    <button 
                      onClick={() => { navigator.clipboard.writeText(est.codigo_unico); alert(`Token ${est.codigo_unico} copiado.`); }} 
                      className="btn-pro btn-pro--outline btn-sm"
                    >
                      <Copy size={13} /> Copiar
                    </button>
                    <button onClick={() => eliminarEstudiante(est.id, est.nombre)} className="btn-danger btn-sm" aria-label={`Expulsar a ${est.nombre}`}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
              {estudiantes.length === 0 && (
                <p className="rpg-empty">El gremio está vacío. Matricula al primer aventurero con el formulario.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          PESTAÑA 2: ORÁCULO & COPILOTO IA
         ===================================================================== */}
      {pestana === 'ia-evaluador' && (
        <div className="card-pro">
          <div className="profile-head">
            <div className="role-icon role-icon--student">
              <BrainCircuit size={30} />
            </div>
            <div>
              <h3 className="pixel-font section-title section-title--gold" style={{ borderBottom: 0, marginBottom: 0, paddingBottom: 0 }}>
                ORÁCULO ARCANO IA (GEMINI 2.5)
              </h3>
              <p className="section-sub" style={{ marginTop: '4px', marginBottom: 0 }}>
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
                className={`rpg-chip ${modoIA === m.id ? 'is-active' : ''}`}
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
          <button onClick={consultarCopiloto} disabled={cargandoIA} className="btn-pro btn-pro-ai btn-block" style={{ marginTop: '0.85rem' }}>
            <Sparkles size={18} /> {cargandoIA ? 'Invocando sabiduría del Oráculo...' : 'Invocar al Oráculo IA'}
          </button>

          {respuestaIA && (
            <div style={{ marginTop: '1.5rem' }}>
              <hr className="hud-divider" />
              {respuestaIA.tipo === 'chat' && (
                <div className="ai-output">
                  <pre className="rpg-code">{respuestaIA.resultado}</pre>
                </div>
              )}

              {respuestaIA.tipo === 'preguntas' && respuestaIA.resultado.map((preg, idx) => (
                <div key={idx} className="ai-output" style={{ marginBottom: '0.85rem' }}>
                  <p className="ai-question">{idx + 1}. {preg.enunciado}</p>
                  <div className="ai-options">
                    <div>A) {preg.opcion_a}</div><div>B) {preg.opcion_b}</div><div>C) {preg.opcion_c}</div><div>D) {preg.opcion_d}</div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <span className="badge badge-success">Clave Correcta: {preg.opcion_correcta}</span>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
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
                <div className="ai-output">
                  <h4 className="ai-result-title">📜 {respuestaIA.resultado.titulo}</h4>
                  <pre className="rpg-code">{respuestaIA.resultado.contenido}</pre>
                  <div style={{ marginTop: '1rem', display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                    <select id="tema-ejemplo-ia" className="input-pro" style={{ flex: '1 1 200px' }}>
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
                <div className="ai-output">
                  <h4 className="ai-result-title">🛡️ {respuestaIA.resultado.titulo}</h4>
                  <p style={{ whiteSpace: 'pre-wrap', fontSize: '20px', color: 'var(--text-main)' }}>{respuestaIA.resultado.descripcion}</p>
                  <button onClick={() => guardarTareaDesdeIA()} className="btn-pro btn-pro-primary btn-block" style={{ marginTop: '1rem' }}>
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
            <div className="card-pro">
              <h3 className="pixel-font section-title section-title--teacher">
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
                <button type="submit" className="btn-pro btn-pro-primary btn-block">Guardar Bioma en el Mapa</button>
              </form>
            </div>

            <div className="card-pro">
              <h3 className="pixel-font section-title section-title--gold">
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
                <button type="submit" className="btn-pro btn-pro-primary btn-block">Publicar Pergamino</button>
              </form>
            </div>
          </div>

          <div className="card-pro">
            <h3 className="pixel-font section-title section-title--xp">
              🗺️ REGIONES ACTIVAS EN EL MAPA ({temas.length})
            </h3>
            <div className="rpg-scroll" style={{ maxHeight: '560px' }}>
              {temas.map(t => (
                <div key={t.id} className="roster-item roster-item--teacher">
                  <div className="roster-item__id">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <strong className="text-teacher" style={{ fontSize: '20px' }}>🏰 {t.titulo}</strong>
                      <span className="tag-bioma">
                        {t.bioma || 'bosque'}
                      </span>
                    </div>
                    <p className="roster-meta" style={{ marginTop: '0.3rem' }}>{t.descripcion}</p>
                  </div>
                  <button onClick={() => eliminarTema(t.id, t.titulo)} className="btn-danger btn-sm" aria-label={`Destruir bioma ${t.titulo}`}>
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              {temas.length === 0 && (
                <p className="rpg-empty">El mapa no tiene biomas. Construye el primero con el formulario.</p>
              )}
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
            <div className="card-pro">
              <h3 className="pixel-font section-title section-title--danger">
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
                <button type="submit" className="btn-pro btn-pro-primary btn-block">
                  ⚔️ Invocar Jefe Final
                </button>
              </form>
            </div>

            <div className="card-pro card-pro--gold">
              <h3 className="pixel-font section-title section-title--gold" style={{ marginBottom: '0.5rem' }}>
                ⚡ PASO 2: CARGAR ATAQUES (PREGUNTAS)
              </h3>
              <p className="section-sub" style={{ marginBottom: '0.85rem' }}>
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
                <div className="form-grid-2">
                  <input type="text" className="input-pro" placeholder="Opción A" value={opA} onChange={(e) => setOpA(e.target.value)} required />
                  <input type="text" className="input-pro" placeholder="Opción B" value={opB} onChange={(e) => setOpB(e.target.value)} required />
                  <input type="text" className="input-pro" placeholder="Opción C" value={opC} onChange={(e) => setOpC(e.target.value)} required />
                  <input type="text" className="input-pro" placeholder="Opción D" value={opD} onChange={(e) => setOpD(e.target.value)} required />
                </div>
                <div className="form-grid-2 form-grid-2--wide">
                  <select className="input-pro" value={opCorrecta} onChange={(e) => setOpCorrecta(e.target.value)}>
                    <option value="A">Clave: A</option>
                    <option value="B">Clave: B</option>
                    <option value="C">Clave: C</option>
                    <option value="D">Clave: D</option>
                  </select>
                  <input type="text" className="input-pro" placeholder="Explicación (Opcional)" value={explicacionPreg} onChange={(e) => setExplicacionPreg(e.target.value)} />
                </div>
                <button type="submit" className="btn-pro btn-pro-primary btn-block">
                  <PlusCircle size={16} /> Añadir Pregunta a este Jefe
                </button>
              </form>
            </div>
          </div>

          <div className="card-pro">
            <h3 className="pixel-font section-title section-title--danger">
              🏰 JEFES FINALES EN EL MAPA ({evaluaciones.length})
            </h3>
            {evaluaciones.map(ev => (
              <div key={ev.id} className="roster-item roster-item--boss" style={{ display: 'block' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                  <div className="role-card__id">
                    <BossDragonSprite16Bit />
                    <div>
                      <h4 className="roster-name">{ev.titulo}</h4>
                      <span className="roster-meta text-xp">
                        +{ev.xp_recompensa || 300} XP • {ev.total_preguntas} preguntas cargadas
                      </span>
                    </div>
                  </div>
                  <div className="roster-actions">
                    <button onClick={() => toggleVerPreguntas(ev)} className="btn-pro btn-pro-primary btn-sm">
                      <Eye size={14} /> {evaluacionVerPreguntas?.id === ev.id ? 'Ocultar' : 'Ver Preguntas'}
                    </button>
                    <button onClick={() => eliminarEvaluacion(ev.id, ev.titulo)} className="btn-danger btn-sm" aria-label={`Eliminar jefe ${ev.titulo}`}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {evaluacionVerPreguntas?.id === ev.id && (
                  <div style={{ marginTop: '0.85rem', borderTop: '2px dashed var(--panel-hi)', paddingTop: '0.75rem' }}>
                    {preguntasDeEvaluacion.length === 0 ? (
                      <p className="rpg-empty">Aún no hay preguntas para este Jefe.</p>
                    ) : (
                      preguntasDeEvaluacion.map((p, idx) => (
                        <div key={p.id} className="pergamino-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.6rem' }}>
                          <div>
                            <strong className="ai-question" style={{ display: 'block', marginBottom: 0 }}>{idx + 1}. {p.enunciado}</strong>
                            <span className="roster-meta text-xp">Clave: {p.opcion_correcta}</span>
                          </div>
                          <button onClick={() => eliminarPreguntaIndividual(p.id)} className="btn-icon btn-icon--ghost" aria-label="Eliminar pregunta">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            ))}
            {evaluaciones.length === 0 && (
              <p className="rpg-empty">No hay Jefes Finales invocados. Crea el primero en el Paso 1.</p>
            )}
          </div>
        </div>
      )}

      {/* =====================================================================
          PESTAÑA 5: TRABAJOS PRÁCTICOS
         ===================================================================== */}
      {pestana === 'tareas' && (
        <div>
          <div className="grid-2">
            <div className="card-pro card-pro--teacher">
              <h3 className="section-title section-title--teacher">
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

                <div className="file-drop">
                  <label className="input-label file-drop__label">
                    📄 Adjuntar Documento (PDF / Word):
                  </label>
                  <input type="file" accept=".pdf,.doc,.docx" ref={fileInputTarea} style={{ display: 'none' }} onChange={handleArchivoTarea} />
                  <div className="file-drop__row">
                    <button type="button" onClick={() => fileInputTarea.current.click()} className="btn-pro btn-pro--outline btn-sm">
                      <UploadCloud size={16} /> Subir Archivo
                    </button>
                    {tareaArchivoNombre && (
                      <span className="file-drop__name">
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

            <div className="card-pro">
              <h3 className="section-title section-title--gold">
                📋 MISIONES ACTIVAS ({tareas.length})
              </h3>
              {tareas.length === 0 && (
                <p className="rpg-empty">Sin misiones publicadas. Crea la primera con el formulario.</p>
              )}
              {tareas.map(tar => (
                <div key={tar.id} className="quest-card">
                  <div className="quest-card__head">
                    <h4 className="quest-card__title">⚔️ {tar.titulo}</h4>
                    <button onClick={() => eliminarTarea(tar.id, tar.titulo)} className="btn-icon btn-icon--ghost" aria-label={`Eliminar misión ${tar.titulo}`}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                  {tar.archivo_adjunto && (
                    <div className="quest-card__desc quest-card__file">
                      <FileText size={13} /> Contiene documento PDF/Word descargable
                    </div>
                  )}
                  <div className="quest-card__footer">
                    <span className="text-xp">{tar.total_entregas || 0} entregas</span>
                    <button onClick={() => verEntregasDeTarea(tar)} className="btn-pro btn-pro-primary btn-sm">
                      Revisar Entregas
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {tareaSeleccionada && (
            <div className="card-pro card-pro--teacher" style={{ marginTop: '1.25rem' }}>
              <h3 className="section-title section-title--student">
                🔍 ENTREGAS DE: {tareaSeleccionada.titulo}
              </h3>
              {entregasTarea.length === 0 ? (
                <p className="rpg-empty">Ningún aventurero ha enviado esta misión.</p>
              ) : (
                entregasTarea.map(entrega => (
                  <div key={entrega.id} className="delivery-item">
                    <div className="delivery-item__meta">
                      <strong className="text-gold">{entrega.estudiante_nombre}</strong>{' '}
                      <span className="mono text-teacher">({entrega.codigo_unico})</span>
                    </div>
                    <pre className="rpg-code rpg-code--tight">
                      {entrega.contenido}
                    </pre>
                    <div className="form-grid-2 form-grid-2--wide">
                      <input type="number" className="input-pro" placeholder="Nota (0-100)" value={notaInput[entrega.id] !== undefined ? notaInput[entrega.id] : (entrega.calificacion ?? '')} onChange={(e) => setNotaInput({ ...notaInput, [entrega.id]: e.target.value })} />
                      <input type="text" className="input-pro" placeholder="Retroalimentación..." value={feedbackInput[entrega.id] !== undefined ? feedbackInput[entrega.id] : (entrega.retroalimentacion ?? '')} onChange={(e) => setFeedbackInput({ ...feedbackInput, [entrega.id]: e.target.value })} />
                    </div>
                    <button onClick={() => guardarCalificacionEntrega(entrega.id)} className="btn-pro btn-pro-primary btn-sm">
                      <CheckCircle size={15} /> Calificar y Dar XP
                    </button>
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
        <div className="card-pro">
          <div className="card-head-row">
            <h3 className="section-title section-title--gold">
              🏆 CRÓNICAS DE COMBATE Y AUDITORÍA DE XP
            </h3>
            <button onClick={exportarCalificacionesCSV} className="btn-pro btn-pro-primary">
              <Download size={16} /> Descargar Reporte Excel (CSV)
            </button>
          </div>
          <div className="rpg-table-wrap">
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
                    <td className="text-strong is-strong">{c.estudiante_nombre}</td>
                    <td className="cell-token">{c.codigo_unico}</td>
                    <td>{c.evaluacion_titulo}</td>
                    <td>{c.aciertos}/{c.total_preguntas}</td>
                    <td className="is-strong">{c.puntaje}%</td>
                    <td className="text-xp is-strong">+{c.xp_ganada || c.puntaje * 3} XP</td>
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
        <div className="card-pro card-pro--narrow">
          <div className="profile-head">
            <div className="profile-avatar">
              {perfilDocente.avatar ? (
                <img src={perfilDocente.avatar} alt="Avatar" />
              ) : (
                <GameMasterSprite16Bit />
              )}
              <input type="file" accept="image/*" ref={fileInputAvatar} style={{ display: 'none' }} onChange={handleAvatarChange} />
              <button
                type="button"
                onClick={() => fileInputAvatar.current.click()}
                className="profile-avatar__upload"
                title="Subir nueva foto"
                aria-label="Subir nueva foto de perfil"
              >
                <ImagePlus size={15} />
              </button>
            </div>

            <div className="profile-head__info">
              <h3 className="section-title section-title--gold profile-head__title">AVATAR DEL GAME MASTER</h3>
              <p className="profile-head__copy">
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