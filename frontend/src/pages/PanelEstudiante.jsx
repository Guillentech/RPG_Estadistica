import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Map, Backpack, Scroll, Users, Trophy, Swords, CloudLightning, 
  Send, X
} from 'lucide-react';
import { StatBar } from '../components/rpg';

// ============================================================================
// 💡 SPRITES PIXEL ART 16-BIT (SVG)
// Estos componentes dibujan los gráficos del juego usando vectores (SVG) 
// con la propiedad "shapeRendering='crispEdges'" para evitar el suavizado 
// y mantener el aspecto retro pixelado.
// ============================================================================

// 🦸‍♂️ Sprite del Héroe: Cambia el color de la ropa según si es 'Arquera' o 'Mago'
const AvatarHero16Bit = ({ clase = '' }) => {
  const esArquera = clase.toLowerCase().includes('arquer');
  return (
    <svg width="46" height="46" viewBox="0 0 16 16" shapeRendering="crispEdges">
      <rect width="16" height="16" fill="#1e1b4b" />
      {/* Cabello / Capucha */}
      <rect x="4" y="2" width="8" height="3" fill={esArquera ? '#059669' : '#7e22ce'} />
      <rect x="3" y="4" width="10" height="2" fill={esArquera ? '#10b981' : '#9333ea'} />
      <rect x="4" y="4" width="8" height="1" fill="#fbbf24" />
      {/* Rostro 16-bit */}
      <rect x="4" y="6" width="8" height="5" fill="#fed7aa" />
      <rect x="5" y="7" width="2" height="2" fill="#0f172a" />
      <rect x="9" y="7" width="2" height="2" fill="#0f172a" />
      <rect x="5" y="7" width="1" height="1" fill="#ffffff" />
      <rect x="9" y="7" width="1" height="1" fill="#ffffff" />
      <rect x="7" y="9" width="2" height="1" fill="#f97316" />
      {/* Armadura / Túnica */}
      <rect x="3" y="11" width="10" height="5" fill={esArquera ? '#047857' : '#2563eb'} />
      <rect x="6" y="11" width="4" height="5" fill="#fbbf24" />
    </svg>
  );
};

// 🦉 Sprite del Sabio Alquimista AI (El mentor del chat inferior)
const AlchemistWizard16Bit = () => (
  <svg width="64" height="68" viewBox="0 0 16 17" shapeRendering="crispEdges">
    {/* Sombrero Arcano con Estrella */}
    <rect x="6" y="0" width="4" height="2" fill="#581c87" />
    <rect x="5" y="2" width="6" height="2" fill="#7e22ce" />
    <rect x="2" y="4" width="12" height="2" fill="#9333ea" />
    <rect x="7" y="3" width="2" height="1" fill="#fde047" />
    {/* Rostro y Barba Blanca de Sabio */}
    <rect x="5" y="6" width="6" height="3" fill="#fed7aa" />
    <rect x="6" y="7" width="1" height="1" fill="#0f172a" />
    <rect x="9" y="7" width="1" height="1" fill="#0f172a" />
    <rect x="4" y="9" width="8" height="4" fill="#f8fafc" />
    <rect x="5" y="13" width="6" height="1" fill="#e2e8f0" />
    {/* Túnica Púrpura y Orbe Alquímico */}
    <rect x="3" y="10" width="2" height="6" fill="#6b21a8" />
    <rect x="11" y="10" width="2" height="6" fill="#6b21a8" />
    <rect x="5" y="14" width="6" height="3" fill="#7e22ce" />
    <rect x="13" y="7" width="2" height="2" fill="#38bdf8" />
    <rect x="13" y="9" width="1" height="7" fill="#b45309" />
  </svg>
);

// 🏰 Sprite de las Mazmorras/Castillos en el Mapa
// Cambia sus banderines (rojo a verde) y apaga el aura maligna si el Jefe fue derrotado.
const CastleDungeonSprite = ({ derrotado }) => (
  <svg width="88" height="84" viewBox="0 0 22 21" shapeRendering="crispEdges">
    {/* Aura o Jefe Demonio flotando sobre la mazmorra (desaparece al ganar) */}
    {!derrotado && (
      <g>
        <rect x="6" y="1" width="2" height="2" fill="#fde047" />
        <rect x="14" y="1" width="2" height="2" fill="#fde047" />
        <rect x="7" y="2" width="8" height="5" fill="#dc2626" />
        <rect x="8" y="4" width="2" height="1" fill="#fef08a" />
        <rect x="12" y="4" width="2" height="1" fill="#fef08a" />
      </g>
    )}
    {/* Estructura base del castillo */}
    <rect x="2" y="6" width="2" height="2" fill="#cbd5e1" />
    <rect x="5" y="6" width="2" height="2" fill="#cbd5e1" />
    <rect x="15" y="6" width="2" height="2" fill="#cbd5e1" />
    <rect x="18" y="6" width="2" height="2" fill="#cbd5e1" />
    <rect x="2" y="8" width="5" height="11" fill="#64748b" />
    <rect x="15" y="8" width="5" height="11" fill="#64748b" />
    <rect x="7" y="9" width="8" height="10" fill="#475569" />
    <rect x="8" y="8" width="2" height="1" fill="#94a3b8" />
    <rect x="12" y="8" width="2" height="1" fill="#94a3b8" />
    {/* Puerta principal */}
    <rect x="9" y="13" width="4" height="6" fill="#0f172a" />
    <rect x="10" y="12" width="2" height="1" fill="#0f172a" />
    <rect x="10" y="13" width="2" height="6" fill="#78350f" />
    {/* Banderines que cambian de color */}
    <rect x="4" y="4" width="1" height="2" fill="#f8fafc" />
    <rect x="5" y="4" width="2" height="1" fill={derrotado ? '#10b981' : '#ef4444'} />
    <rect x="17" y="4" width="1" height="2" fill="#f8fafc" />
    <rect x="18" y="4" width="2" height="1" fill={derrotado ? '#10b981' : '#ef4444'} />
  </svg>
);

// 🏛️ Sprites de otros biomas (Ruinas, Laboratorio, Bosque)
const BiomeStructureSprite = ({ tipo }) => {
  if (tipo === 'ruinas') {
    return (
      <svg width="76" height="68" viewBox="0 0 18 16" shapeRendering="crispEdges">
        <rect x="2" y="13" width="14" height="2" fill="#64748b" />
        <rect x="3" y="4" width="3" height="9" fill="#cbd5e1" />
        <rect x="8" y="5" width="2" height="8" fill="#94a3b8" />
        <rect x="13" y="7" width="2" height="6" fill="#64748b" />
        <rect x="2" y="3" width="9" height="2" fill="#e2e8f0" />
        <rect x="3" y="5" width="2" height="3" fill="#10b981" />
        <rect x="8" y="6" width="2" height="2" fill="#059669" />
      </svg>
    );
  }
  if (tipo === 'laboratorio') {
    return (
      <svg width="76" height="76" viewBox="0 0 18 18" shapeRendering="crispEdges">
        <rect x="8" y="1" width="2" height="3" fill="#38bdf8" />
        <rect x="5" y="4" width="8" height="3" fill="#7e22ce" />
        <rect x="4" y="7" width="10" height="9" fill="#475569" />
        <rect x="7" y="9" width="4" height="3" fill="#38bdf8" />
        <rect x="8" y="13" width="2" height="3" fill="#0f172a" />
        <rect x="3" y="16" width="12" height="1" fill="#94a3b8" />
      </svg>
    );
  }
  return (
    <svg width="78" height="70" viewBox="0 0 18 16" shapeRendering="crispEdges">
      <rect x="3" y="10" width="2" height="4" fill="#78350f" />
      <rect x="13" y="10" width="2" height="4" fill="#78350f" />
      <rect x="1" y="4" width="6" height="6" fill="#047857" />
      <rect x="2" y="2" width="4" height="3" fill="#10b981" />
      <rect x="11" y="4" width="6" height="6" fill="#065f46" />
      <rect x="12" y="2" width="4" height="3" fill="#34d399" />
      <rect x="7" y="10" width="4" height="4" fill="#d97706" />
      <rect x="7" y="10" width="4" height="1" fill="#fde047" />
      <rect x="8" y="11" width="2" height="1" fill="#fef08a" />
    </svg>
  );
};

// ============================================================================
// 💡 COMPONENTE PRINCIPAL: PANEL DEL ESTUDIANTE (AVENTURERO)
// ============================================================================
export default function PanelEstudiante() {
  const { user, refrescarEstudiante } = useAuth();
  const navigate = useNavigate();
  const canvasRef = useRef(null); // Referencia al motor del mapa 2D

  // 💡 Estados para la navegación de la barra inferior (Hotbar)
  const [vistaHotbar, setVistaHotbar] = useState('mapa');

  // 💡 Estados para almacenar los datos traídos del Backend (SQLite)
  const [temas, setTemas] = useState([]);
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [calificaciones, setCalificaciones] = useState([]);
  const [tareas, setTareas] = useState([]);
  const [misEntregas, setMisEntregas] = useState([]);
  const [gremio, setGremio] = useState([]);

  // 💡 Estados del Motor de Mapa 2D
  // 'heroPos' guarda las coordenadas X e Y en porcentaje (0% a 100%)
  const [heroPos, setHeroPos] = useState({ x: 38, y: 52 });
  const [caminando, setCaminando] = useState(false); // Para la animación de salto
  const [zonaActivaModal, setZonaActivaModal] = useState(null); // Ventana al entrar a un bioma

  // 💡 Estados de Entregas de Misiones (Trabajos Prácticos)
  const [entregaTexto, setEntregaTexto] = useState({});
  const [enviandoTarea, setEnviandoTarea] = useState(false);

  // 💡 Estados del Sabio Alquimista (Copiloto IA Estudiantil)
  const [dialogoAlquimistaAbierto, setDialogoAlquimistaAbierto] = useState(false);
  const [preguntaAlquimista, setPreguntaAlquimista] = useState('');
  const [respuestaAlquimista, setRespuestaAlquimista] = useState('');
  const [cargandoAlquimista, setCargandoAlquimista] = useState(false);

  // 📍 Coordenadas fijas donde se renderizan los Biomas en el Mapa 2D
  const nodosBiomas = [
    { x: 22, y: 30, biomaDefault: 'mazmorra', etiqueta: 'Mazmorra Central' },
    { x: 24, y: 74, biomaDefault: 'ruinas', etiqueta: 'Ruinas Antiguas' },
    { x: 68, y: 58, biomaDefault: 'bosque', etiqueta: 'Bosque de Código' },
    { x: 74, y: 26, biomaDefault: 'laboratorio', etiqueta: 'Torre del Algoritmo' },
    { x: 84, y: 72, biomaDefault: 'mazmorra', etiqueta: 'Fortaleza Final' }
  ];

  // 📍 Puntos de control (Checkpoints) en el camino empedrado para click rápido
  const hitosCamino = [
    { x: 23, y: 52, nivelReq: 1, nombre: 'Hito I' },
    { x: 38, y: 52, nivelReq: 1, nombre: 'Cruce del Valle' },
    { x: 50, y: 52, nivelReq: 2, nombre: 'Puente del Río' },
    { x: 68, y: 41, nivelReq: 2, nombre: 'Hito II' },
    { x: 76, y: 65, nivelReq: 3, nombre: 'Hito III' }
  ];

  // 💡 FUNCIÓN: Cargar toda la data de la base de datos al inicio
  const cargarDatos = () => {
    fetch('http://localhost:4000/api/temas').then(r => r.json()).then(setTemas);
    fetch('http://localhost:4000/api/evaluaciones').then(r => r.json()).then(setEvaluaciones);
    fetch('http://localhost:4000/api/tareas').then(r => r.json()).then(setTareas);
    fetch('http://localhost:4000/api/gremio').then(r => r.json()).then(setGremio);

    if (user?.id) {
      refrescarEstudiante(); // Actualiza XP y Nivel en vivo
      fetch(`http://localhost:4000/api/calificaciones/estudiante/${user.id}`)
        .then(r => r.json())
        .then(setCalificaciones);

      fetch(`http://localhost:4000/api/entregas/estudiante/${user.id}`)
        .then(r => r.json())
        .then(data => {
          setMisEntregas(data);
          const mapa = {};
          data.forEach(e => { mapa[e.tarea_id] = e.contenido; });
          setEntregaTexto(prev => ({ ...mapa, ...prev }));
        });
    }
  };

  // Se ejecuta una vez al montar la vista
  useEffect(() => {
    cargarDatos();
  }, [user?.id]);

  // ==========================================================================
  // 💡 RENDERIZADOR CANVAS 16-BIT (EL MOTOR DEL MAPA 2D)
  // Utiliza la API nativa de Canvas de HTML5 para dibujar la pradera, el río,
  // los árboles y el camino frame por frame (a 60 fps).
  // ==========================================================================
  useEffect(() => {
    // Si no estamos en la pestaña "mapa", no procesamos el motor para ahorrar RAM
    if (vistaHotbar !== 'mapa') return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false; // Evita el blur, mantiene el pixel art afilado

    let frame = 0;
    let animId;

    // Función auxiliar para dibujar "Adoquines" (el camino gris)
    const dibujarAdoquin = (cx, cy, w, h) => {
      ctx.fillStyle = '#57534e'; // Borde oscuro
      ctx.fillRect(cx - 2, cy - 2, w + 4, h + 4);
      ctx.fillStyle = '#a8a29e'; // Piedra clara
      ctx.fillRect(cx, cy, w, h);

      // Dibuja ladrillitos internos iterando sobre X y Y
      for (let py = cy + 1; py < cy + h - 2; py += 5) {
        const offset = ((py / 5) % 2) * 4;
        for (let px = cx + 1 + offset; px < cx + w - 4; px += 8) {
          ctx.fillStyle = (px + py) % 3 === 0 ? '#d6d3d1' : '#78716c';
          ctx.fillRect(px, py, 6, 3);
        }
      }
    };

    // Función auxiliar para dibujar un árbol pixelado
    const dibujarArbol16Bit = (tx, ty, variante = 0) => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)'; // Sombra
      ctx.fillRect(tx + 2, ty + 18, 12, 4);
      ctx.fillStyle = '#78350f'; // Tronco base
      ctx.fillRect(tx + 5, ty + 12, 6, 8);
      ctx.fillStyle = '#92400e'; // Brillo del tronco
      ctx.fillRect(tx + 6, ty + 12, 2, 7);
      
      // Hojas verdes dibujadas en capas (layering)
      ctx.fillStyle = variante === 1 ? '#065f46' : '#14532d';
      ctx.fillRect(tx, ty + 4, 16, 10);
      ctx.fillStyle = variante === 1 ? '#059669' : '#16a34a';
      ctx.fillRect(tx + 2, ty + 1, 12, 9);
      ctx.fillStyle = variante === 1 ? '#34d399' : '#4ade80';
      ctx.fillRect(tx + 4, ty, 8, 4);
      ctx.fillRect(tx + 3, ty + 3, 4, 2);
    };

    // 💡 Bucle principal de animación (Game Loop)
    const renderLoop = () => {
      frame++;
      const W = 480; // Resolución base X
      const H = 270; // Resolución base Y

      // 1. Fondo de agua profunda
      ctx.fillStyle = '#082f49';
      ctx.fillRect(0, 0, W, H);

      // 2. BIOMA IZQUIERDO: Pradera de Cálculo (Verde claro)
      ctx.fillStyle = '#334155'; ctx.fillRect(14, 18, 206, 238); // Acantilado
      ctx.fillStyle = '#15803d'; ctx.fillRect(14, 14, 206, 232); // Borde
      ctx.fillStyle = '#22c55e'; ctx.fillRect(20, 20, 194, 220); // Pasto base

      // Agregar flores y texturas al bioma izquierdo
      for (let y = 26; y < 234; y += 16) {
        for (let x = 26; x < 206; x += 18) {
          ctx.fillStyle = '#16a34a';
          ctx.fillRect(x, y, 3, 2);
          ctx.fillRect(x + 2, y - 1, 2, 2);
          if ((x + y) % 5 === 0) { // Probabilidad matemática de dibujar una flor
            ctx.fillStyle = '#fef08a'; 
            ctx.fillRect(x + 8, y + 6, 2, 2);
          }
        }
      }

      // 3. BIOMA DERECHO: Bosque de Algoritmos (Verde oscuro arcano)
      ctx.fillStyle = '#1e293b'; ctx.fillRect(262, 18, 204, 238);
      ctx.fillStyle = '#065f46'; ctx.fillRect(262, 14, 204, 232);
      ctx.fillStyle = '#059669'; ctx.fillRect(268, 20, 192, 220);

      for (let y = 28; y < 232; y += 16) {
        for (let x = 274; x < 452; x += 20) {
          ctx.fillStyle = '#047857';
          ctx.fillRect(x, y, 4, 2);
          if ((x * y) % 7 === 0) { // Cristales azules
            ctx.fillStyle = '#38bdf8';
            ctx.fillRect(x + 6, y + 4, 2, 2);
          }
        }
      }

      // 4. RÍO CENTRAL CON ANIMACIÓN DE CORRIENTE
      ctx.fillStyle = '#0369a1'; ctx.fillRect(220, 0, 42, H);
      ctx.fillStyle = '#0284c7'; ctx.fillRect(225, 0, 32, H);
      ctx.fillStyle = '#38bdf8';
      
      // Desplaza el agua hacia abajo dividiendo el frame actual (velocidad de corriente)
      const offsetAgua = Math.floor(frame / 6) % 24; 
      for (let wy = -24 + offsetAgua; wy < H; wy += 24) {
        ctx.fillRect(232, wy, 6, 3);
        ctx.fillRect(244, wy + 12, 5, 2);
      }
      ctx.fillStyle = '#bae6fd'; // Espuma orillas
      ctx.fillRect(220, 0, 2, H);
      ctx.fillRect(260, 0, 2, H);

      // 5. CUADRÍCULA EDUCATIVA SUTIL (Ayuda a ver el movimiento por casillas)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      for (let gx = 0; gx < W; gx += 24) ctx.fillRect(gx, 0, 1, H);
      for (let gy = 0; gy < H; gy += 24) ctx.fillRect(0, gy, W, 1);

      // 6. CAMINOS EMPEDRADOS (Rutas entre biomas)
      dibujarAdoquin(100, 75, 18, 130);
      dibujarAdoquin(100, 132, 235, 18);
      dibujarAdoquin(320, 68, 18, 95);
      dibujarAdoquin(320, 145, 90, 16);
      dibujarAdoquin(394, 145, 18, 55);

      // 7. PUENTE DE MADERA SOBRE EL RÍO
      const bx = 214, by = 127, bw = 54, bh = 28;
      ctx.fillStyle = '#451a03'; ctx.fillRect(bx, by, bw, bh);
      ctx.fillStyle = '#b45309'; ctx.fillRect(bx, by, bw, 4); ctx.fillRect(bx, by + bh - 4, bw, 4);
      for (let px = bx + 3; px < bx + bw - 3; px += 6) {
        ctx.fillStyle = (px % 12 === 0) ? '#92400e' : '#78350f';
        ctx.fillRect(px, by + 4, 5, bh - 8);
      }

      // 8. ÁRBOLES DECORATIVOS FIJOS EN COORDENADAS ESPECÍFICAS
      const arbolesIzq = [
        [28, 28], [48, 34], [155, 32], [175, 45],
        [32, 110], [52, 125], [160, 95], [34, 195], [165, 195]
      ];
      arbolesIzq.forEach(([ax, ay]) => dibujarArbol16Bit(ax, ay, 0));

      const arbolesDer = [
        [278, 32], [298, 42], [415, 28], [435, 42],
        [280, 185], [302, 200], [428, 110], [442, 128]
      ];
      arbolesDer.forEach(([ax, ay]) => dibujarArbol16Bit(ax, ay, 1));

      // Solicita el siguiente frame del navegador
      animId = requestAnimationFrame(renderLoop);
    };

    renderLoop();
    return () => cancelAnimationFrame(animId); // Limpia la animación al desmontar
  }, [vistaHotbar]);

  // ==========================================================================
  // 💡 LÓGICA DE MOVIMIENTO CON TECLADO (WASD / Flechas)
  // ==========================================================================
  useEffect(() => {
    // Si no estamos en el mapa, o hay una ventana abierta, bloqueamos el movimiento
    if (vistaHotbar !== 'mapa' || zonaActivaModal || dialogoAlquimistaAbierto) return;

    const handleKeyDown = (e) => {
      const k = e.key.toLowerCase();
      const paso = 3; // Porcentaje de pantalla que avanza por tecla
      let dx = 0;
      let dy = 0;

      if (k === 'w' || k === 'arrowup') dy = -paso;
      else if (k === 's' || k === 'arrowdown') dy = paso;
      else if (k === 'a' || k === 'arrowleft') dx = -paso;
      else if (k === 'd' || k === 'arrowright') dx = paso;
      else return;

      e.preventDefault();
      setCaminando(true); // Activa animación CSS de salto
      setHeroPos(prev => ({
        // Limita que el héroe no se salga del mapa (Clamp entre 8% y 92%)
        x: Math.max(8, Math.min(92, prev.x + dx)),
        y: Math.max(12, Math.min(88, prev.y + dy))
      }));
      setTimeout(() => setCaminando(false), 150); // Desactiva animación tras el paso
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [vistaHotbar, zonaActivaModal, dialogoAlquimistaAbierto]);

  // 💡 FUNCIÓN: Mover héroe a un bioma al hacerle clic
  const caminarHaciaBioma = (tema, nodo) => {
    setCaminando(true);
    setHeroPos({ x: nodo.x + 3, y: nodo.y + 6 });
    setTimeout(() => {
      setCaminando(false);
      setZonaActivaModal(tema); // Abre el modal del bioma (Pergaminos/Jefes)
    }, 280);
  };

  // 💡 FUNCIÓN: Enviar un Trabajo Práctico al Servidor
  const enviarTrabajo = async (tareaId) => {
    const contenido = entregaTexto[tareaId];
    if (!contenido?.trim()) return alert('Redacta el pergamino de tu entrega antes de enviarlo.');

    setEnviandoTarea(true);
    try {
      const res = await fetch('http://localhost:4000/api/entregas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tarea_id: tareaId,
          estudiante_id: user.id,
          contenido: contenido.trim()
        })
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.mensaje || '¡Misión entregada con éxito!');
        cargarDatos();
      }
    } catch {
      alert('Error al enviar la misión.');
    } finally {
      setEnviandoTarea(false);
    }
  };

  // 💡 FUNCIÓN: Consultar al Bot AI del Sabio Alquimista
  const consultarSabioAlquimista = async (e) => {
    e.preventDefault();
    if (!preguntaAlquimista.trim()) return;
    setCargandoAlquimista(true);
    try {
      const titulosTemas = temas.map(t => t.titulo).join(', ');
      const res = await fetch('http://localhost:4000/api/ia/asistente', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mensaje: preguntaAlquimista.trim(),
          modo: 'alquimista', // Dispara el System Prompt del Búho en el backend
          contexto: `Biomas del mapa: ${titulosTemas}`
        })
      });
      const data = await res.json();
      if (res.ok) setRespuestaAlquimista(data.resultado);
    } catch {
      setRespuestaAlquimista('🦉 El Sabio Alquimista medita sobre tu consulta... intenta nuevamente.');
    } finally {
      setCargandoAlquimista(false);
    }
  };

  // ==========================================================================
  // 💡 CÁLCULOS DEL HUD (ESTADÍSTICAS DEL JUGADOR Y CLIMA)
  // ==========================================================================
  const xpActual = user?.xp || 150;
  const nivelActual = user?.nivel || 1;
  const xpEnNivel = xpActual % 250; // Progreso hacia el siguiente nivel (cada 250 XP sube de nivel)

  // Determinar eventos pendientes para la stamina y el clima
  const examenesPendientes = evaluaciones.filter(ev => !calificaciones.some(c => c.evaluacion_id === ev.id));
  const tareasPendientes = tareas.filter(t => !misEntregas.some(e => e.tarea_id === t.id));
  
  // La energía baja si hay exámenes pendientes (causa estrés)
  const energiaActual = Math.max(35, 100 - (examenesPendientes.length * 10));
  // Si hay tareas o exámenes sin hacer, hay "Tormenta" en el mapa
  const hayTormenta = examenesPendientes.length > 0 || tareasPendientes.length > 0;

  return (
    <div className="container page-shell" style={{ maxWidth: '1220px' }}>
      
      {/* =====================================================================
          1. TOP HUD 16-BIT (AVATAR IZQ | BARRAS XP Y ENERGÍA CENTRO | CLIMA DER)
         ===================================================================== */}
      <div className="hud-panel">
        {/* IZQUIERDA: Avatar, Nombre, Nivel, Clase y Token */}
        <div className="hud-hero">
          <div className="hud-avatar">
            <AvatarHero16Bit clase={user?.clase_rpg || 'Arquera Lógica'} />
          </div>
          <div className="hud-identity">
            <span className="hud-name">
              {user?.nombre || 'Estudiante'}
            </span>
            <span className="hud-role">
              Nvl {nivelActual} • {user?.clase_rpg || 'Aventurero'}
            </span>
            <span className="hud-token">
              TOKEN: {user?.codigo_unico || 'N/A'}
            </span>
          </div>
        </div>

        {/* CENTRO: Barras de XP (Oro) y Energía/Stamina (Cian) - estilo RPG pergamino */}
        <div className="hud-stats">
          <StatBar label="★ EXPERIENCIA (XP)" value={xpEnNivel} max={250} color="xp" suffix=" XP" showPercent />
          <StatBar label="⚡ ENERGÍA / STAMINA" value={energiaActual} max={100} color="stamina" suffix=" EN" showPercent />
          <StatBar label="❤ HP DEL JUGADOR" value={Math.min(100, 60 + nivelActual * 5)} max={100} color="hp" suffix=" HP" showPercent />
        </div>

        {/* DERECHA: Widget del Clima */}
        <div className="hud-weather">
          <div className="hud-weather__icon">
            <CloudLightning size={22} />
          </div>
          <div>
            <span className="hud-weather__label">CLIMA: 24H</span>
            <span className={`hud-weather__state ${hayTormenta ? 'is-storm' : ''}`}>
              {hayTormenta ? 'TORMENTA DE FECHAS' : 'CIELO DESPEJADO'}
            </span>
            <span className="hud-weather__meta">
              {examenesPendientes.length} Jefes activos
            </span>
          </div>
        </div>
      </div>

      {/* =====================================================================
          2. VIEWPORT 16:9 DEL MAPA OVERWORLD 2D PIXEL ART
         ===================================================================== */}
      {vistaHotbar === 'mapa' && (
        <div className="map-viewport">
          {/* El Canvas de HTML5 donde corre el Game Loop */}
          <canvas ref={canvasRef} width={480} height={270} className="pixel-canvas" />

          <div className="map-banner">
            <span>MAPA DEL SEMESTRE</span>
          </div>

          <div className="map-region map-region--west">
            <span>REGIÓN OESTE: PRADERA DE CÁLCULO</span>
          </div>

          <div className="map-region map-region--east">
            <span>REGIÓN ESTE: BOSQUE DE ALGORITMOS</span>
          </div>

          {/* Hitos del camino (Diamantes Verdes) */}
          {hitosCamino.map((hito, i) => {
            const desbloqueado = nivelActual >= hito.nivelReq;
            return (
              <button
                type="button"
                key={i}
                onClick={() => setHeroPos({ x: hito.x, y: hito.y })}
                title={`${hito.nombre} (Nivel ${hito.nivelReq})`}
                className={`map-hito ${desbloqueado ? '' : 'is-locked'}`}
                style={{ left: `${hito.x}%`, top: `${hito.y}%` }}
              >
                <span className="map-hito__gem" />
                <span className="map-hito__label">{hito.nombre}</span>
              </button>
            );
          })}

          {/* Renderizado de Biomas y Castillos desde SQLite */}
          {temas.map((tema, idx) => {
            const nodo = nodosBiomas[idx % nodosBiomas.length];
            const tipoBioma = idx === 0 ? 'mazmorra' : (tema.bioma || nodo.biomaDefault);
            const evalsDeTema = evaluaciones.filter(ev => ev.tema_id === tema.id);
            const jefeActivo = evalsDeTema[0];
            const yaDerrotado = jefeActivo && calificaciones.some(c => c.evaluacion_id === jefeActivo.id);

            return (
              <button
                type="button"
                key={tema.id}
                onClick={() => caminarHaciaBioma(tema, nodo)}
                className="map-node"
                style={{ left: `${nodo.x}%`, top: `${nodo.y}%` }}
              >
                {jefeActivo && (
                  <span className={`rpg-boss-tag ${yaDerrotado ? 'is-defeated' : ''}`}>
                    {yaDerrotado ? `✓ ${jefeActivo.titulo}` : `⚔️ ${jefeActivo.titulo}`}
                  </span>
                )}
                <span className="map-node__art">
                  {tipoBioma === 'mazmorra' ? <CastleDungeonSprite derrotado={yaDerrotado} /> : <BiomeStructureSprite tipo={tipoBioma} />}
                </span>
                <span className="map-nameplate">
                  {tema.titulo}
                </span>
              </button>
            );
          })}

          {/* PERSONAJE JUGABLE MOVIÉNDOSE EN EL MAPA */}
          <div
            className={`map-hero ${caminando ? 'is-walking' : ''}`}
            style={{ left: `${heroPos.x}%`, top: `${heroPos.y}%` }}
          >
            <span className="map-hero__alert">!</span>
            <span className="map-hero__frame">
              <AvatarHero16Bit clase={user?.clase_rpg || 'Arquera Lógica'} />
            </span>
          </div>

          {/* Sabio Alquimista AI (Esquina Inferior Derecha) */}
          <button type="button" onClick={() => setDialogoAlquimistaAbierto(true)} className="alchemist-bubble">
            <span className="alchemist-bubble__text">
              <span className="alchemist-bubble__name">SABIO ALQUIMISTA AI</span>
              {examenesPendientes.length > 0 ? `¡Atención! El Jefe de "${examenesPendientes[0].titulo}" aguarda en el castillo. ¿Repasamos los pergaminos?` : `¡Buen trabajo en el camino! Haz clic aquí para consultar cualquier duda del temario.`}
            </span>
            <span className="alchemist-bubble__sprite"><AlchemistWizard16Bit /></span>
          </button>

          {/* D-Pad Legend */}
          <div className="map-legend">
            MOVIMIENTO: WASD / CLIC EN BIOMA
          </div>

          {/* 💡 MODAL DE BIOMA (Pergaminos y Jefes al entrar) */}
          {zonaActivaModal && (
            <div className="rpg-modal" role="dialog" aria-modal="true" aria-label={zonaActivaModal.titulo}>
              <div className="rpg-modal__head">
                <div>
                  <span className="hud-eyebrow hud-eyebrow--xp">BIOMA ACADÉMICO DESBLOQUEADO</span>
                  <h3 className="rpg-modal__title">{zonaActivaModal.titulo}</h3>
                </div>
                <button onClick={() => setZonaActivaModal(null)} className="btn-danger btn-sm">
                  <X size={16} /> Cerrar
                </button>
              </div>
              <div className="rpg-modal__body">
                <p className="section-sub">{zonaActivaModal.descripcion}</p>

                <div className="grid-2">
                  {/* Lado de Pergaminos */}
                  <div className="zone-column">
                    <h4 className="zone-column__title">📜 PERGAMINOS DE ESTUDIO</h4>
                    {zonaActivaModal.ejemplos?.length > 0 ? (
                      zonaActivaModal.ejemplos.map(ej => (
                        <div key={ej.id} className="pergamino-card">
                          <strong className="pergamino-card__title">{ej.titulo}</strong>
                          <pre className="rpg-code rpg-code--tight">{ej.contenido}</pre>
                        </div>
                      ))
                    ) : (
                      <p className="rpg-empty">Sin pergaminos publicados en esta zona.</p>
                    )}
                  </div>

                  {/* Lado de Evaluaciones (Jefes) */}
                  <div className="zone-column zone-column--boss">
                    <h4 className="zone-column__title">⚔️ JEFE DE MAZMORRA</h4>
                    {evaluaciones.filter(ev => ev.tema_id === zonaActivaModal.id).map(ev => {
                      const intento = calificaciones.find(c => c.evaluacion_id === ev.id);
                      return (
                        <div key={ev.id} className="boss-row">
                          <div>
                            <strong className="boss-row__title">{ev.titulo}</strong>
                            <span className="boss-row__meta">+{ev.xp_recompensa || 300} XP • {ev.total_preguntas} preguntas</span>
                          </div>
                          {intento ? (
                            <span className="badge badge-success">Completado ({intento.puntaje}%)</span>
                          ) : (
                            <button onClick={() => navigate(`/evaluacion/${ev.id}`)} className="btn-pro btn-pro-ai btn-sm">
                              <Swords size={15} /> Iniciar Combate
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 💡 MODAL DEL MENTOR AI (Chat con el Sabio Alquimista) */}
          {dialogoAlquimistaAbierto && (
            <div className="rpg-modal" role="dialog" aria-modal="true" aria-label="Sabio Alquimista AI">
              <div className="rpg-modal__head">
                <div className="role-card__id">
                  <span className="alchemist-bubble__sprite"><AlchemistWizard16Bit /></span>
                  <div>
                    <span className="hud-eyebrow hud-eyebrow--gold">MENTOR ARCANO IA</span>
                    <h3 className="rpg-modal__title">Sabio Alquimista AI</h3>
                  </div>
                </div>
                <button onClick={() => setDialogoAlquimistaAbierto(false)} className="btn-danger btn-sm">✕ Cerrar</button>
              </div>

              <div className="rpg-modal__body rpg-modal__body--column">
                <div className="ai-dialogue">
                  {respuestaAlquimista || `🧙‍♂️ "¡Saludos, ${user?.nombre || 'Aventurero'}! Escribe cualquier duda sobre Cálculo, Programación o Estadística y te guiaré antes de que cruces la puerta de la mazmorra."`}
                </div>

                <form onSubmit={consultarSabioAlquimista} className="ai-ask">
                  <input type="text" className="input-pro" placeholder="Pregúntale al Sabio Alquimista..." value={preguntaAlquimista} onChange={(e) => setPreguntaAlquimista(e.target.value)} />
                  <button type="submit" disabled={cargandoAlquimista} className="btn-pro btn-pro-ai">
                    <Send size={16} /> {cargandoAlquimista ? 'Consultando...' : 'Consultar'}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =====================================================================
          3. SUB-VISTAS DE LA BARRA INFERIOR (INVENTARIO, PERGAMINOS, GREMIO, LOGROS)
         ===================================================================== */}
      
      {/* 💡 INVENTARIO (Aquí entregas las misiones y descargas PDFs/Word) */}
      {vistaHotbar === 'inventario' && (
        <div className="card-pro">
          <h3 className="pixel-font section-title section-title--gold">🎒 INVENTARIO Y MISIONES ({tareas.length})</h3>
          {tareas.length === 0 && (
            <p className="rpg-empty">Aún no hay misiones publicadas. El Game Master las dejará caer en tu inventario.</p>
          )}
          {tareas.map(tar => {
            const entrega = misEntregas.find(e => e.tarea_id === tar.id);
            return (
              <div key={tar.id} className="quest-card">
                <div className="quest-card__head">
                  <h4 className="quest-card__title">⚔️ {tar.titulo} <span className="text-muted">({tar.tema_titulo})</span></h4>
                  <span className={`badge ${entrega ? 'badge-success' : 'badge-danger'}`}>
                    {entrega ? 'Entregada' : 'Pendiente'}
                  </span>
                </div>
                <p className="quest-card__desc">{tar.descripcion}</p>

                {/* 💡 NUEVO: Botón de descarga de archivo adjunto (PDF/Word Base64) */}
                {tar.archivo_adjunto && (
                  <a
                    href={tar.archivo_adjunto}
                    download={`Guia_Mision_${tar.titulo.replace(/\s+/g, '_')}`}
                    className="quest-file"
                  >
                    📄 Descargar Documento Adjunto
                  </a>
                )}

                <textarea
                  className="input-pro"
                  rows="3"
                  placeholder="Escribe aquí tu código o respuesta de la misión..."
                  value={entregaTexto[tar.id] || ''}
                  onChange={(e) => setEntregaTexto({ ...entregaTexto, [tar.id]: e.target.value })}
                />
                <button onClick={() => enviarTrabajo(tar.id)} disabled={enviandoTarea} className="btn-pro btn-pro-primary btn-block" style={{ marginTop: '0.5rem' }}>
                  <Send size={15} /> {entrega ? 'Actualizar Misión' : 'Enviar Misión'}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* 💡 PERGAMINOS (Librería de teoría generada por el profe) */}
      {vistaHotbar === 'pergaminos' && (
        <div className="card-pro">
          <h3 className="pixel-font section-title section-title--xp">📜 PERGAMINOS DE TEORÍA</h3>
          {temas.length === 0 && (
            <p className="rpg-empty">La biblioteca aún está vacía. Consulta al Sabio Alquimista AI mientras tanto.</p>
          )}
          {temas.map(t => (
            <div key={t.id} className="scroll-entry">
              <h4 className="scroll-entry__title">{t.titulo}</h4>
              <p className="scroll-entry__desc">{t.descripcion}</p>
              {t.ejemplos?.map(ej => (
                <pre key={ej.id} className="rpg-code">
                  <strong>// {ej.titulo}</strong>{'\n'}{ej.contenido}
                </pre>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* 💡 GREMIO (Leaderboard / Ranking de XP) */}
      {vistaHotbar === 'gremio' && (
        <div className="card-pro">
          <h3 className="pixel-font section-title section-title--teacher">🛡️ TABLA DEL GREMIO</h3>
          <div className="rpg-table-wrap">
            <table>
              <thead>
                <tr><th>#</th><th>Aventurero</th><th>Clase</th><th>Nivel</th><th>XP</th></tr>
              </thead>
              <tbody>
                {gremio.map((m, i) => (
                  <tr key={m.id}>
                    <td>{i + 1}</td>
                    <td className="text-strong">{m.nombre}</td>
                    <td className="text-student">{m.clase_rpg}</td>
                    <td>Nvl {m.nivel || 1}</td>
                    <td className="text-xp">{m.xp || 150} XP</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {gremio.length === 0 && <p className="rpg-empty">El gremio aún no tiene aventureros registrados.</p>}
        </div>
      )}

      {/* 💡 LOGROS (Historial de batallas y notas) */}
      {vistaHotbar === 'logros' && (
        <div className="card-pro">
          <h3 className="pixel-font section-title section-title--gold">🏆 LOGROS Y RESULTADOS</h3>
          {calificaciones.length === 0 && (
            <p className="rpg-empty">Todavía no has librado ningún combate. ¡Entra a un bioma y desafía a su Jefe!</p>
          )}
          {calificaciones.map(cal => (
            <div key={cal.id} className="achievement-row">
              <div>
                <strong className="achievement-row__title">{cal.evaluacion_titulo}</strong>
                <span className="achievement-row__meta">+{cal.xp_ganada || 150} XP • {cal.aciertos}/{cal.total_preguntas} aciertos</span>
              </div>
              <span className={`achievement-score ${cal.puntaje >= 60 ? 'is-pass' : 'is-fail'}`}>{cal.puntaje}%</span>
            </div>
          ))}
        </div>
      )}

      {/* =====================================================================
          4. BOTTOM HUD (BARRA DE NAVEGACIÓN INFERIOR CON 5 ICONOS)
         ===================================================================== */}
      <div className="rpg-hotbar" style={{ marginTop: '0.85rem' }}>
        <button className={`rpg-hotbar-slot rpg-hotbar-slot--map ${vistaHotbar === 'mapa' ? 'active' : ''}`} onClick={() => setVistaHotbar('mapa')}>
          <Map size={20} />
          <span className="pixel-font">Mapa</span>
        </button>
        <button className={`rpg-hotbar-slot rpg-hotbar-slot--bag ${vistaHotbar === 'inventario' ? 'active' : ''}`} onClick={() => setVistaHotbar('inventario')}>
          <Backpack size={20} />
          <span className="pixel-font">Inventario</span>
        </button>
        <button className={`rpg-hotbar-slot rpg-hotbar-slot--scroll ${vistaHotbar === 'pergaminos' ? 'active' : ''}`} onClick={() => setVistaHotbar('pergaminos')}>
          <Scroll size={20} />
          <span className="pixel-font">Pergaminos</span>
        </button>
        <button className={`rpg-hotbar-slot rpg-hotbar-slot--guild ${vistaHotbar === 'gremio' ? 'active' : ''}`} onClick={() => setVistaHotbar('gremio')}>
          <Users size={20} />
          <span className="pixel-font">Gremio</span>
        </button>
        <button className={`rpg-hotbar-slot rpg-hotbar-slot--trophy ${vistaHotbar === 'logros' ? 'active' : ''}`} onClick={() => setVistaHotbar('logros')}>
          <Trophy size={20} />
          <span className="pixel-font">Logros</span>
        </button>
      </div>
    </div>
  );
}