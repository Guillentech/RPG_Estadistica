import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Map, Backpack, Scroll, Users, Trophy, Swords, CloudLightning, 
  Send, Eye, X, Sparkles, Zap, Compass, CheckCircle2, Lock
} from 'lucide-react';

// ============================================================================
// SPRITES PIXEL ART 16-BIT (SVG CRISP-EDGES PARA UI Y MARCADORES DE BIOMAS)
// ============================================================================
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

const CastleDungeonSprite = ({ derrotado }) => (
  <svg width="88" height="84" viewBox="0 0 22 21" shapeRendering="crispEdges">
    {/* Aura o Jefe Demonio sobre la mazmorra */}
    {!derrotado && (
      <g>
        <rect x="6" y="1" width="2" height="2" fill="#fde047" />
        <rect x="14" y="1" width="2" height="2" fill="#fde047" />
        <rect x="7" y="2" width="8" height="5" fill="#dc2626" />
        <rect x="8" y="4" width="2" height="1" fill="#fef08a" />
        <rect x="12" y="4" width="2" height="1" fill="#fef08a" />
      </g>
    )}
    {/* Almenas y Torres */}
    <rect x="2" y="6" width="2" height="2" fill="#cbd5e1" />
    <rect x="5" y="6" width="2" height="2" fill="#cbd5e1" />
    <rect x="15" y="6" width="2" height="2" fill="#cbd5e1" />
    <rect x="18" y="6" width="2" height="2" fill="#cbd5e1" />
    <rect x="2" y="8" width="5" height="11" fill="#64748b" />
    <rect x="15" y="8" width="5" height="11" fill="#64748b" />
    <rect x="7" y="9" width="8" height="10" fill="#475569" />
    <rect x="8" y="8" width="2" height="1" fill="#94a3b8" />
    <rect x="12" y="8" width="2" height="1" fill="#94a3b8" />
    {/* Puerta de madera con reja */}
    <rect x="9" y="13" width="4" height="6" fill="#0f172a" />
    <rect x="10" y="12" width="2" height="1" fill="#0f172a" />
    <rect x="10" y="13" width="2" height="6" fill="#78350f" />
    {/* Banderines Rojos/Verdes */}
    <rect x="4" y="4" width="1" height="2" fill="#f8fafc" />
    <rect x="5" y="4" width="2" height="1" fill={derrotado ? '#10b981' : '#ef4444'} />
    <rect x="17" y="4" width="1" height="2" fill="#f8fafc" />
    <rect x="18" y="4" width="2" height="1" fill={derrotado ? '#10b981' : '#ef4444'} />
  </svg>
);

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

export default function PanelEstudiante() {
  const { user, refrescarEstudiante } = useAuth();
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  // Navegación Hotbar Inferior
  const [vistaHotbar, setVistaHotbar] = useState('mapa');

  // Datos sincronizados con el Backend
  const [temas, setTemas] = useState([]);
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [calificaciones, setCalificaciones] = useState([]);
  const [tareas, setTareas] = useState([]);
  const [misEntregas, setMisEntregas] = useState([]);
  const [gremio, setGremio] = useState([]);

  // Coordenadas del Héroe en el Mapa 2D (Porcentaje 0-100)
  const [heroPos, setHeroPos] = useState({ x: 38, y: 52 });
  const [caminando, setCaminando] = useState(false);
  const [zonaActivaModal, setZonaActivaModal] = useState(null);
  const [calificacionDetalle, setCalificacionDetalle] = useState(null);

  // Entregas de Misiones
  const [entregaTexto, setEntregaTexto] = useState({});
  const [enviandoTarea, setEnviandoTarea] = useState(false);

  // Búho / Sabio Alquimista AI
  const [dialogoAlquimistaAbierto, setDialogoAlquimistaAbierto] = useState(false);
  const [preguntaAlquimista, setPreguntaAlquimista] = useState('');
  const [respuestaAlquimista, setRespuestaAlquimista] = useState('');
  const [cargandoAlquimista, setCargandoAlquimista] = useState(false);

  // Posiciones de los Biomas sobre el Camino Empedrado (Izquierda: Pradera de Cálculo | Derecha: Bosque y Lab)
  const nodosBiomas = [
    { x: 22, y: 30, biomaDefault: 'mazmorra', etiqueta: 'Mazmorra Central' },
    { x: 24, y: 74, biomaDefault: 'ruinas', etiqueta: 'Ruinas Antiguas' },
    { x: 68, y: 58, biomaDefault: 'bosque', etiqueta: 'Bosque de Código' },
    { x: 74, y: 26, biomaDefault: 'laboratorio', etiqueta: 'Torre del Algoritmo' },
    { x: 84, y: 72, biomaDefault: 'mazmorra', etiqueta: 'Fortaleza Final' }
  ];

  // Hitos de nivel a lo largo del camino empedrado (Checkpoints)
  const hitosCamino = [
    { x: 23, y: 52, nivelReq: 1, nombre: 'Hito I' },
    { x: 38, y: 52, nivelReq: 1, nombre: 'Cruce del Valle' },
    { x: 50, y: 52, nivelReq: 2, nombre: 'Puente del Río' },
    { x: 68, y: 41, nivelReq: 2, nombre: 'Hito II' },
    { x: 76, y: 65, nivelReq: 3, nombre: 'Hito III' }
  ];

  const cargarDatos = () => {
    fetch('http://localhost:4000/api/temas').then(r => r.json()).then(setTemas);
    fetch('http://localhost:4000/api/evaluaciones').then(r => r.json()).then(setEvaluaciones);
    fetch('http://localhost:4000/api/tareas').then(r => r.json()).then(setTareas);
    fetch('http://localhost:4000/api/gremio').then(r => r.json()).then(setGremio);

    if (user?.id) {
      refrescarEstudiante();
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

  useEffect(() => {
    cargarDatos();
  }, [user?.id]);

  // ==========================================================================
  // RENDERIZADOR CANVAS 16-BIT PIXEL ART (480x270 NATIVO -> ESCALADO PIXELATED)
  // ==========================================================================
  useEffect(() => {
    if (vistaHotbar !== 'mapa') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    let frame = 0;
    let animId;

    // Función para dibujar un bloque de adoquines (Cobblestone road tile)
    const dibujarAdoquin = (cx, cy, w, h) => {
      ctx.fillStyle = '#57534e'; // Borde oscuro del camino
      ctx.fillRect(cx - 2, cy - 2, w + 4, h + 4);
      ctx.fillStyle = '#a8a29e'; // Piedra base
      ctx.fillRect(cx, cy, w, h);

      // Ladrillos internos pixelados
      for (let py = cy + 1; py < cy + h - 2; py += 5) {
        const offset = ((py / 5) % 2) * 4;
        for (let px = cx + 1 + offset; px < cx + w - 4; px += 8) {
          ctx.fillStyle = (px + py) % 3 === 0 ? '#d6d3d1' : '#78716c';
          ctx.fillRect(px, py, 6, 3);
        }
      }
    };

    // Función para dibujar árboles 16-bit en el mapa
    const dibujarArbol16Bit = (tx, ty, variante = 0) => {
      // Sombra
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.fillRect(tx + 2, ty + 18, 12, 4);
      // Tronco
      ctx.fillStyle = '#78350f';
      ctx.fillRect(tx + 5, ty + 12, 6, 8);
      ctx.fillStyle = '#92400e';
      ctx.fillRect(tx + 6, ty + 12, 2, 7);
      // Copa del árbol en capas pixeladas
      ctx.fillStyle = variante === 1 ? '#065f46' : '#14532d';
      ctx.fillRect(tx, ty + 4, 16, 10);
      ctx.fillStyle = variante === 1 ? '#059669' : '#16a34a';
      ctx.fillRect(tx + 2, ty + 1, 12, 9);
      ctx.fillStyle = variante === 1 ? '#34d399' : '#4ade80';
      ctx.fillRect(tx + 4, ty, 8, 4);
      ctx.fillRect(tx + 3, ty + 3, 4, 2);
    };

    const renderLoop = () => {
      frame++;
      const W = 480;
      const H = 270;

      // 1. Agua profunda base
      ctx.fillStyle = '#082f49';
      ctx.fillRect(0, 0, W, H);

      // 2. BIOMA IZQUIERDO: Pradera Verde de Cálculo (Lush Green Grassy Plains)
      // Acantilado inferior de tierra/roca
      ctx.fillStyle = '#334155';
      ctx.fillRect(14, 18, 206, 238);
      ctx.fillStyle = '#15803d'; // Borde de pasto
      ctx.fillRect(14, 14, 206, 232);
      ctx.fillStyle = '#22c55e'; // Pradera luminosa 16-bit
      ctx.fillRect(20, 20, 194, 220);

      // Textura de pasto y flores pixeladas en la pradera izquierda
      for (let y = 26; y < 234; y += 16) {
        for (let x = 26; x < 206; x += 18) {
          ctx.fillStyle = '#16a34a';
          ctx.fillRect(x, y, 3, 2);
          ctx.fillRect(x + 2, y - 1, 2, 2);
          if ((x + y) % 5 === 0) {
            ctx.fillStyle = '#fef08a'; // Flores amarillas pixeladas
            ctx.fillRect(x + 8, y + 6, 2, 2);
          }
        }
      }

      // 3. BIOMA DERECHO: Bosque Arcano y Tierras Altas de Programación
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(262, 18, 204, 238);
      ctx.fillStyle = '#065f46';
      ctx.fillRect(262, 14, 204, 232);
      ctx.fillStyle = '#059669';
      ctx.fillRect(268, 20, 192, 220);

      // Textura de bosque mágico en el lado derecho
      for (let y = 28; y < 232; y += 16) {
        for (let x = 274; x < 452; x += 20) {
          ctx.fillStyle = '#047857';
          ctx.fillRect(x, y, 4, 2);
          if ((x * y) % 7 === 0) {
            ctx.fillStyle = '#38bdf8'; // Cristales/flores arcanas
            ctx.fillRect(x + 6, y + 4, 2, 2);
          }
        }
      }

      // 4. RÍO CENTRAL VERTICAL CON CORRIENTE ANIMADA (División entre Biomas)
      ctx.fillStyle = '#0369a1';
      ctx.fillRect(220, 0, 42, H);
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(225, 0, 32, H);
      ctx.fillStyle = '#38bdf8';
      const offsetAgua = Math.floor(frame / 6) % 24;
      for (let wy = -24 + offsetAgua; wy < H; wy += 24) {
        ctx.fillRect(232, wy, 6, 3);
        ctx.fillRect(244, wy + 12, 5, 2);
      }

      // Orillas de espuma blanca en el río
      ctx.fillStyle = '#bae6fd';
      ctx.fillRect(220, 0, 2, H);
      ctx.fillRect(260, 0, 2, H);

      // 5. CUADRÍCULA EDUCATIVA SUTIL (Educational Map Grid 16-bit)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      for (let gx = 0; gx < W; gx += 24) {
        ctx.fillRect(gx, 0, 1, H);
      }
      for (let gy = 0; gy < H; gy += 24) {
        ctx.fillRect(0, gy, W, 1);
      }

      // 6. CAMINOS EMPEDRADOS (Cobblestone Pathways)
      // Tramo vertical izquierdo (une Mazmorra de Cálculo con Ruinas)
      dibujarAdoquin(100, 75, 18, 130);
      // Tramo horizontal central (cruza desde la izquierda hacia el puente y el bosque)
      dibujarAdoquin(100, 132, 235, 18);
      // Tramo vertical derecho (sube al Laboratorio y baja a la Fortaleza)
      dibujarAdoquin(320, 68, 18, 95);
      dibujarAdoquin(320, 145, 90, 16);
      dibujarAdoquin(394, 145, 18, 55);

      // 7. PUENTE DE MADERA PIXEL ART SOBRE EL RÍO CENTRAL
      const bx = 214;
      const by = 127;
      const bw = 54;
      const bh = 28;
      // Barandillas de madera
      ctx.fillStyle = '#451a03';
      ctx.fillRect(bx, by, bw, bh);
      ctx.fillStyle = '#b45309';
      ctx.fillRect(bx, by, bw, 4);
      ctx.fillRect(bx, by + bh - 4, bw, 4);
      // Tablones de madera
      for (let px = bx + 3; px < bx + bw - 3; px += 6) {
        ctx.fillStyle = (px % 12 === 0) ? '#92400e' : '#78350f';
        ctx.fillRect(px, by + 4, 5, bh - 8);
      }

      // 8. ÁRBOLES DECORATIVOS 16-BIT ALREDEDOR DE LOS CAMINOS
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

      animId = requestAnimationFrame(renderLoop);
    };

    renderLoop();
    return () => cancelAnimationFrame(animId);
  }, [vistaHotbar]);

  // Movimiento con teclado (WASD y Flechas)
  useEffect(() => {
    if (vistaHotbar !== 'mapa' || zonaActivaModal || dialogoAlquimistaAbierto) return;

    const handleKeyDown = (e) => {
      const k = e.key.toLowerCase();
      const paso = 3;
      let dx = 0;
      let dy = 0;

      if (k === 'w' || k === 'arrowup') dy = -paso;
      else if (k === 's' || k === 'arrowdown') dy = paso;
      else if (k === 'a' || k === 'arrowleft') dx = -paso;
      else if (k === 'd' || k === 'arrowright') dx = paso;
      else return;

      e.preventDefault();
      setCaminando(true);
      setHeroPos(prev => ({
        x: Math.max(8, Math.min(92, prev.x + dx)),
        y: Math.max(12, Math.min(88, prev.y + dy))
      }));
      setTimeout(() => setCaminando(false), 150);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [vistaHotbar, zonaActivaModal, dialogoAlquimistaAbierto]);

  const caminarHaciaBioma = (tema, nodo) => {
    setCaminando(true);
    setHeroPos({ x: nodo.x + 3, y: nodo.y + 6 });
    setTimeout(() => {
      setCaminando(false);
      setZonaActivaModal(tema);
    }, 280);
  };

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
          modo: 'alquimista',
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

  // Estadísticas para el Top HUD (Barras de XP y Energía/Stamina)
  const xpActual = user?.xp || 150;
  const nivelActual = user?.nivel || 3;
  const xpEnNivel = xpActual % 250;
  const porcentajeXP = Math.min(100, Math.max(20, Math.round((xpEnNivel / 250) * 100)));

  const examenesPendientes = evaluaciones.filter(ev => !calificaciones.some(c => c.evaluacion_id === ev.id));
  const tareasPendientes = tareas.filter(t => !misEntregas.some(e => e.tarea_id === t.id));
  const energiaActual = Math.max(35, 100 - (examenesPendientes.length * 10));
  const hayTormenta = examenesPendientes.length > 0 || tareasPendientes.length > 0;

  return (
    <div className="container" style={{ maxWidth: '1220px', paddingTop: '0.6rem' }}>
      
      {/* =====================================================================
          1. TOP HUD 16-BIT (AVATAR IZQ | BARRAS XP Y ENERGÍA CENTRO | CLIMA DER)
         ===================================================================== */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(240px, 1fr) minmax(320px, 2fr) minmax(210px, 0.85fr)',
        gap: '0.85rem',
        background: 'linear-gradient(180deg, #0f1329 0%, #090c1a 100%)',
        border: '3px solid #a855f7',
        borderRadius: '14px',
        padding: '0.7rem 1rem',
        marginBottom: '0.85rem',
        boxShadow: '0 0 22px rgba(168, 85, 247, 0.35), inset 0 0 18px rgba(168, 85, 247, 0.15)',
        alignItems: 'center'
      }}>
        {/* Izquierda: Avatar Principal + Nombre, Nivel y Clase */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '8px',
            border: '2px solid #c084fc',
            background: '#1e1b4b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 12px rgba(192, 132, 252, 0.4)',
            flexShrink: 0,
            overflow: 'hidden'
          }}>
            <AvatarHero16Bit clase={user?.clase_rpg || 'Arquera Lógica'} />
          </div>
          <div>
            <div className="pixel-font" style={{ fontSize: '0.72rem', color: '#ffffff', lineHeight: 1.35 }}>
              {user?.nombre || 'Sofía'}
            </div>
            <div style={{ fontSize: '0.78rem', fontWeight: '800', color: '#c084fc', marginTop: '2px' }}>
              Nvl {nivelActual} • {user?.clase_rpg || 'Arquera Lógica'}
            </div>
            <span style={{ fontSize: '0.68rem', color: '#38bdf8', fontFamily: 'monospace' }}>
              TOKEN: {user?.codigo_unico || 'EST-SOF2'}
            </span>
          </div>
        </div>

        {/* Centro: Barras Horizontales Brillantes de XP (Verde) y Energía/Stamina (Azul) */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          padding: '0.2rem 0.75rem',
          borderLeft: '1px solid rgba(168, 85, 247, 0.3)',
          borderRight: '1px solid rgba(168, 85, 247, 0.3)'
        }}>
          {/* Barra de Experiencia (XP) - Verde Neón */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', fontWeight: '800', marginBottom: '3px' }}>
              <span className="pixel-font" style={{ fontSize: '0.58rem', color: '#4ade80' }}>
                ★ EXPERIENCIA (XP)
              </span>
              <span style={{ fontFamily: 'monospace', color: '#86efac' }}>
                {xpActual} XP ({porcentajeXP}%)
              </span>
            </div>
            <div style={{
              width: '100%',
              height: '12px',
              background: '#050811',
              border: '2px solid #059669',
              borderRadius: '6px',
              overflow: 'hidden',
              boxShadow: 'inset 0 0 6px #000'
            }}>
              <div style={{
                width: `${porcentajeXP}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #10b981 0%, #4ade80 100%)',
                boxShadow: '0 0 12px #22c55e',
                transition: 'width 0.4s ease'
              }} />
            </div>
          </div>

          {/* Barra de Energía / Stamina - Azul Cian Brillante */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', fontWeight: '800', marginBottom: '3px' }}>
              <span className="pixel-font" style={{ fontSize: '0.58rem', color: '#38bdf8' }}>
                ⚡ ENERGÍA / STAMINA
              </span>
              <span style={{ fontFamily: 'monospace', color: '#7dd3fc' }}>
                {energiaActual} / 100 EN
              </span>
            </div>
            <div style={{
              width: '100%',
              height: '12px',
              background: '#050811',
              border: '2px solid #0284c7',
              borderRadius: '6px',
              overflow: 'hidden',
              boxShadow: 'inset 0 0 6px #000'
            }}>
              <div style={{
                width: `${energiaActual}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #0284c7 0%, #38bdf8 100%)',
                boxShadow: '0 0 12px #38bdf8',
                transition: 'width 0.4s ease'
              }} />
            </div>
          </div>
        </div>

        {/* Derecha: Widget Compacto de Clima / Tiempo */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
          justifyContent: 'flex-end'
        }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '8px',
            background: 'rgba(168, 85, 247, 0.16)',
            border: '2px solid #c084fc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fde047',
            flexShrink: 0
          }}>
            <CloudLightning size={22} />
          </div>
          <div>
            <div className="pixel-font" style={{ fontSize: '0.55rem', color: '#c084fc' }}>
              CLIMA: 24H
            </div>
            <div style={{ fontSize: '0.78rem', fontWeight: '800', color: '#ffffff', marginTop: '2px' }}>
              {hayTormenta ? 'TORMENTA DE FECHAS' : 'CIELO DESPEJADO'}
            </div>
            <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
              {examenesPendientes.length} Jefes activos
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================================
          2. VIEWPORT 16:9 DEL MAPA OVERWORLD 2D PIXEL ART
         ===================================================================== */}
      {vistaHotbar === 'mapa' && (
        <div style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '16 / 9',
          minHeight: '480px',
          maxHeight: '620px',
          border: '3px solid #a855f7',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 0 35px rgba(168, 85, 247, 0.35), inset 0 0 40px rgba(0,0,0,0.8)',
          backgroundColor: '#082f49',
          userSelect: 'none'
        }}>
          {/* Lienzo Pixel Art 16-bit de Fondo (480x270) */}
          <canvas
            ref={canvasRef}
            width={480}
            height={270}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              imageRendering: 'pixelated',
              zIndex: 1
            }}
          />

          {/* Placa de Título Superior del Mapa */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 20,
            background: 'linear-gradient(180deg, #2e1065 0%, #13092b 100%)',
            border: '2px solid #c084fc',
            borderTop: 'none',
            padding: '0.4rem 1.6rem',
            borderRadius: '0 0 12px 12px',
            boxShadow: '0 6px 16px rgba(0,0,0,0.75)'
          }}>
            <span className="pixel-font" style={{ fontSize: '0.7rem', color: '#ffffff' }}>
              MAPA DEL SEMESTRE
            </span>
          </div>

          {/* Etiquetas de Regiones Académicas (Izquierda: Pradera | Derecha: Bosque Arcano) */}
          <div style={{
            position: 'absolute', top: '12px', left: '14px', zIndex: 15,
            background: 'rgba(9, 13, 28, 0.85)', border: '1px solid #4ade80',
            padding: '4px 10px', borderRadius: '6px'
          }}>
            <span className="pixel-font" style={{ fontSize: '0.55rem', color: '#4ade80' }}>
              REGIÓN OESTE: PRADERA DE CÁLCULO
            </span>
          </div>

          <div style={{
            position: 'absolute', top: '12px', right: '14px', zIndex: 15,
            background: 'rgba(9, 13, 28, 0.85)', border: '1px solid #38bdf8',
            padding: '4px 10px', borderRadius: '6px'
          }}>
            <span className="pixel-font" style={{ fontSize: '0.55rem', color: '#38bdf8' }}>
              REGIÓN ESTE: BOSQUE DE ALGORITMOS
            </span>
          </div>

          {/* HITOS DE PROGRESO SOBRE EL CAMINO EMPEDRADO (Level Progress Markers) */}
          {hitosCamino.map((hito, i) => {
            const desbloqueado = nivelActual >= hito.nivelReq;
            return (
              <div
                key={i}
                onClick={() => setHeroPos({ x: hito.x, y: hito.y })}
                title={`${hito.nombre} (Nivel ${hito.nivelReq})`}
                style={{
                  position: 'absolute',
                  left: `${hito.x}%`,
                  top: `${hito.y}%`,
                  transform: 'translate(-50%, -50%)',
                  zIndex: 12,
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}
              >
                <div style={{
                  width: '18px',
                  height: '18px',
                  background: desbloqueado ? '#10b981' : '#334155',
                  border: `2px solid ${desbloqueado ? '#fde047' : '#94a3b8'}`,
                  transform: 'rotate(45deg)',
                  boxShadow: desbloqueado ? '0 0 10px #10b981' : 'none'
                }} />
                <span style={{
                  marginTop: '4px',
                  fontSize: '0.6rem',
                  fontWeight: '800',
                  color: '#fde047',
                  background: 'rgba(0,0,0,0.75)',
                  padding: '1px 5px',
                  borderRadius: '4px'
                }}>
                  {hito.nombre}
                </span>
              </div>
            );
          })}

          {/* BIOMAS ACADÉMICOS Y CASTILLO (MAZMORRA) EN EL MAPA */}
          {temas.map((tema, idx) => {
            const nodo = nodosBiomas[idx % nodosBiomas.length];
            const tipoBioma = idx === 0 ? 'mazmorra' : (tema.bioma || nodo.biomaDefault);
            const evalsDeTema = evaluaciones.filter(ev => ev.tema_id === tema.id);
            const jefeActivo = evalsDeTema[0];
            const yaDerrotado = jefeActivo && calificaciones.some(c => c.evaluacion_id === jefeActivo.id);

            return (
              <div
                key={tema.id}
                onClick={() => caminarHaciaBioma(tema, nodo)}
                style={{
                  position: 'absolute',
                  left: `${nodo.x}%`,
                  top: `${nodo.y}%`,
                  transform: 'translate(-50%, -50%)',
                  zIndex: 16,
                  textAlign: 'center',
                  cursor: 'pointer'
                }}
              >
                {/* Cartel de Jefe Final sobre el Castillo/Bioma */}
                {jefeActivo && (
                  <div className="rpg-boss-tag" style={{
                    marginBottom: '-4px',
                    fontFamily: "'Press Start 2P', monospace",
                    fontSize: '0.52rem',
                    padding: '4px 8px',
                    background: yaDerrotado 
                      ? 'linear-gradient(90deg, #065f46 0%, #10b981 100%)' 
                      : 'linear-gradient(90deg, #7f1d1d 0%, #dc2626 100%)'
                  }}>
                    {yaDerrotado ? `✓ ${jefeActivo.titulo}` : `⚔️ ${jefeActivo.titulo}`}
                  </div>
                )}

                {/* Sprite 16-bit de la Estructura */}
                <div style={{ filter: 'drop-shadow(0 6px 8px rgba(0,0,0,0.85))' }}>
                  {tipoBioma === 'mazmorra' ? (
                    <CastleDungeonSprite derrotado={yaDerrotado} />
                  ) : (
                    <BiomeStructureSprite tipo={tipoBioma} />
                  )}
                </div>

                {/* Placa de Nombre del Bioma con Borde Neón Púrpura */}
                <div style={{
                  marginTop: '-2px',
                  background: '#0f1329',
                  border: '2px solid #a855f7',
                  color: '#ffffff',
                  padding: '3px 9px',
                  borderRadius: '6px',
                  fontFamily: "'Press Start 2P', monospace",
                  fontSize: '0.55rem',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.9), 0 0 10px rgba(168,85,247,0.4)'
                }}>
                  {tema.titulo}
                </div>
              </div>
            );
          })}

          {/* PERSONAJE JUGABLE EN EL MAPA 2D */}
          <div style={{
            position: 'absolute',
            left: `${heroPos.x}%`,
            top: `${heroPos.y}%`,
            transform: 'translate(-50%, -50%)',
            zIndex: 22,
            transition: 'left 0.2s linear, top 0.2s linear',
            pointerEvents: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            <div className="pixel-font" style={{
              background: '#ffffff',
              color: '#0f172a',
              border: '2px solid #0f172a',
              borderRadius: '4px',
              padding: '2px 5px',
              fontSize: '0.55rem',
              marginBottom: '2px'
            }}>
              !
            </div>
            <div style={{
              border: '2px solid #fde047',
              borderRadius: '6px',
              overflow: 'hidden',
              boxShadow: '0 6px 14px rgba(0,0,0,0.85)',
              transform: caminando ? 'translateY(-4px)' : 'none'
            }}>
              <AvatarHero16Bit clase={user?.clase_rpg || 'Arquera Lógica'} />
            </div>
          </div>

          {/* =================================================================
              ESQUINA INFERIOR DERECHA: MARCO DEL MAGO / SABIO ALQUIMISTA AI
             ================================================================= */}
          <div
            onClick={() => setDialogoAlquimistaAbierto(true)}
            style={{
              position: 'absolute',
              right: '14px',
              bottom: '14px',
              zIndex: 25,
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              background: 'linear-gradient(180deg, rgba(15, 19, 41, 0.96) 0%, rgba(9, 12, 26, 0.98) 100%)',
              border: '3px solid #a855f7',
              borderRadius: '12px',
              padding: '0.55rem 0.85rem',
              maxWidth: '370px',
              cursor: 'pointer',
              boxShadow: '0 0 24px rgba(168, 85, 247, 0.45)'
            }}
          >
            {/* Burbuja de Diálogo Interna */}
            <div style={{
              background: '#ffffff',
              color: '#0f172a',
              border: '2px solid #1e1b4b',
              borderRadius: '8px',
              padding: '0.5rem 0.7rem',
              fontSize: '0.74rem',
              fontWeight: '800',
              lineHeight: 1.35
            }}>
              <div className="pixel-font" style={{ fontSize: '0.5rem', color: '#7e22ce', marginBottom: '3px' }}>
                SABIO ALQUIMISTA AI
              </div>
              {examenesPendientes.length > 0
                ? `¡Atención! El Jefe de "${examenesPendientes[0].titulo}" aguarda en el castillo. ¿Repasamos los pergaminos?`
                : `¡Buen trabajo en el camino! Haz clic aquí para consultar cualquier duda del temario.`}
            </div>

            {/* Sprite Pixel Art del Mago Alquimista */}
            <div style={{ flexShrink: 0, textAlign: 'center' }}>
              <AlchemistWizard16Bit />
            </div>
          </div>

          {/* Control D-Pad Compacto en Esquina Inferior Izquierda */}
          <div style={{
            position: 'absolute', left: '14px', bottom: '14px', zIndex: 25,
            background: 'rgba(9, 12, 26, 0.9)', border: '2px solid #a855f7',
            borderRadius: '10px', padding: '6px 10px', fontSize: '0.7rem', color: '#cbd5e1'
          }}>
            <span className="pixel-font" style={{ fontSize: '0.52rem', color: '#c084fc' }}>
              MOVIMIENTO: WASD / CLIC EN BIOMA
            </span>
          </div>

          {/* =================================================================
              MODAL DE BIOMA AL ENTRAR A UN CASTILLO / ZONA
             ================================================================= */}
          {zonaActivaModal && (
            <div style={{
              position: 'absolute', inset: '16px', zIndex: 40,
              background: 'rgba(9, 12, 26, 0.97)', border: '3px solid #a855f7',
              borderRadius: '14px', padding: '1.25rem 1.5rem', overflowY: 'auto',
              boxShadow: '0 0 35px rgba(168, 85, 247, 0.5)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
                <div>
                  <span className="pixel-font" style={{ fontSize: '0.55rem', color: '#4ade80' }}>
                    BIOMA ACADÉMICO DESBLOQUEADO
                  </span>
                  <h3 className="pixel-font" style={{ fontSize: '0.95rem', color: '#ffffff', marginTop: '4px' }}>
                    {zonaActivaModal.titulo}
                  </h3>
                </div>
                <button onClick={() => setZonaActivaModal(null)} className="btn-danger" style={{ padding: '0.4rem 0.8rem', borderRadius: '8px', fontWeight: '800' }}>
                  <X size={16} /> Cerrar
                </button>
              </div>

              <p style={{ color: '#cbd5e1', fontSize: '0.88rem', marginBottom: '1rem' }}>
                {zonaActivaModal.descripcion}
              </p>

              <div className="grid-2">
                {/* Pergaminos de Estudio */}
                <div style={{ background: 'var(--bg-input)', padding: '1rem', borderRadius: '10px', border: '1px solid #a855f7' }}>
                  <h4 className="pixel-font" style={{ fontSize: '0.68rem', color: '#fde047', marginBottom: '0.75rem' }}>
                    📜 PERGAMINOS DE ESTUDIO
                  </h4>
                  {zonaActivaModal.ejemplos?.length > 0 ? (
                    zonaActivaModal.ejemplos.map(ej => (
                      <div key={ej.id} style={{ background: '#050811', padding: '0.75rem', borderRadius: '8px', marginBottom: '0.6rem', border: '1px solid var(--border)' }}>
                        <strong style={{ color: '#38bdf8', fontSize: '0.84rem' }}>{ej.titulo}</strong>
                        <pre style={{ marginTop: '0.4rem', fontSize: '0.78rem', color: '#a5f3fc', overflowX: 'auto', whiteSpace: 'pre-wrap' }}>
                          {ej.contenido}
                        </pre>
                      </div>
                    ))
                  ) : (
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Sin pergaminos publicados en esta zona.</p>
                  )}
                </div>

                {/* Jefes de Evaluación y Misiones */}
                <div style={{ background: 'var(--bg-input)', padding: '1rem', borderRadius: '10px', border: '1px solid #a855f7' }}>
                  <h4 className="pixel-font" style={{ fontSize: '0.68rem', color: '#f87171', marginBottom: '0.75rem' }}>
                    ⚔️ JEFE DE MAZMORRA (EVALUACIÓN)
                  </h4>
                  {evaluaciones.filter(ev => ev.tema_id === zonaActivaModal.id).map(ev => {
                    const intento = calificaciones.find(c => c.evaluacion_id === ev.id);
                    return (
                      <div key={ev.id} style={{ background: '#050811', padding: '0.85rem', borderRadius: '8px', marginBottom: '0.65rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <strong style={{ color: '#fff', fontSize: '0.88rem' }}>{ev.titulo}</strong>
                          <div style={{ fontSize: '0.74rem', color: '#4ade80' }}>+{ev.xp_recompensa || 300} XP • {ev.total_preguntas} preguntas</div>
                        </div>
                        {intento ? (
                          <span className="badge badge-success">Completado ({intento.puntaje}%)</span>
                        ) : (
                          <button
                            onClick={() => navigate(`/evaluacion/${ev.id}`)}
                            className="btn-pro btn-pro-ai"
                            style={{ padding: '0.45rem 0.85rem', fontSize: '0.78rem' }}
                          >
                            <Swords size={15} /> Iniciar Combate
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* MODAL INTERACTIVO DEL SABIO ALQUIMISTA AI */}
          {dialogoAlquimistaAbierto && (
            <div style={{
              position: 'absolute', inset: '20px', zIndex: 45,
              background: 'rgba(9, 12, 26, 0.98)', border: '3px solid #a855f7',
              borderRadius: '14px', padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <AlchemistWizard16Bit />
                  <div>
                    <span className="pixel-font" style={{ fontSize: '0.6rem', color: '#fde047' }}>MENTOR ARCANO IA</span>
                    <h3 className="pixel-font" style={{ fontSize: '0.9rem', color: '#fff', marginTop: '4px' }}>Sabio Alquimista AI</h3>
                  </div>
                </div>
                <button onClick={() => setDialogoAlquimistaAbierto(false)} className="btn-danger" style={{ padding: '0.4rem 0.8rem', borderRadius: '8px' }}>
                  ✕ Cerrar
                </button>
              </div>

              <div style={{
                background: '#ffffff', color: '#0f172a', padding: '1rem', borderRadius: '10px',
                border: '2px solid #a855f7', fontWeight: '700', fontSize: '0.88rem', lineHeight: 1.5,
                margin: '1rem 0', flex: 1, overflowY: 'auto'
              }}>
                {respuestaAlquimista || `🧙‍♂️ "¡Saludos, ${user?.nombre || 'Aventurero'}! Escribe cualquier duda sobre Cálculo, Programación o Estadística y te guiaré antes de que cruces la puerta de la mazmorra."`}
              </div>

              <form onSubmit={consultarSabioAlquimista} style={{ display: 'flex', gap: '0.6rem' }}>
                <input
                  type="text"
                  className="input-pro"
                  placeholder="Pregúntale al Sabio Alquimista sobre un tema o ejercicio..."
                  value={preguntaAlquimista}
                  onChange={(e) => setPreguntaAlquimista(e.target.value)}
                />
                <button type="submit" disabled={cargandoAlquimista} className="btn-pro btn-pro-ai">
                  <Send size={16} /> {cargandoAlquimista ? 'Consultando...' : 'Consultar'}
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* =====================================================================
          3. SUB-VISTAS DE LA BARRA INFERIOR (INVENTARIO, PERGAMINOS, GREMIO, LOGROS)
         ===================================================================== */}
      {vistaHotbar === 'inventario' && (
        <div className="card-pro" style={{ border: '2px solid #a855f7' }}>
          <h3 className="pixel-font" style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>🎒 INVENTARIO Y MISIONES ({tareas.length})</h3>
          {tareas.map(tar => {
            const entrega = misEntregas.find(e => e.tarea_id === tar.id);
            return (
              <div key={tar.id} style={{ background: 'var(--bg-input)', padding: '1rem', borderRadius: '10px', marginBottom: '1rem', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <h4>⚔️ {tar.titulo} ({tar.tema_titulo})</h4>
                  <span className={`badge ${entrega ? 'badge-success' : 'badge-danger'}`}>
                    {entrega ? 'Entregada' : 'Pendiente'}
                  </span>
                </div>
                <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', margin: '0.5rem 0' }}>{tar.descripcion}</p>
                <textarea
                  className="input-pro"
                  rows="3"
                  placeholder="Escribe aquí tu código o respuesta de la misión..."
                  value={entregaTexto[tar.id] || ''}
                  onChange={(e) => setEntregaTexto({ ...entregaTexto, [tar.id]: e.target.value })}
                />
                <button onClick={() => enviarTrabajo(tar.id)} disabled={enviandoTarea} className="btn-pro btn-pro-primary" style={{ marginTop: '0.5rem', width: '100%' }}>
                  <Send size={15} /> {entrega ? 'Actualizar Misión' : 'Enviar Misión'}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {vistaHotbar === 'pergaminos' && (
        <div className="card-pro" style={{ border: '2px solid #a855f7' }}>
          <h3 className="pixel-font" style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>📜 PERGAMINOS DE TEORÍA</h3>
          {temas.map(t => (
            <div key={t.id} style={{ marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
              <h4 style={{ color: '#4ade80' }}>{t.titulo}</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{t.descripcion}</p>
              {t.ejemplos?.map(ej => (
                <pre key={ej.id} style={{ background: '#050811', padding: '0.85rem', borderRadius: '8px', color: '#a5f3fc', fontSize: '0.82rem', overflowX: 'auto', marginTop: '0.4rem' }}>
                  <strong>// {ej.titulo}</strong>{'\n'}{ej.contenido}
                </pre>
              ))}
            </div>
          ))}
        </div>
      )}

      {vistaHotbar === 'gremio' && (
        <div className="card-pro" style={{ border: '2px solid #a855f7' }}>
          <h3 className="pixel-font" style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>🛡️ TABLA DEL GREMIO</h3>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Aventurero</th>
                <th>Clase</th>
                <th>Nivel</th>
                <th>XP</th>
              </tr>
            </thead>
            <tbody>
              {gremio.map((m, i) => (
                <tr key={m.id}>
                  <td>#{i + 1}</td>
                  <td style={{ fontWeight: '800' }}>{m.nombre}</td>
                  <td style={{ color: '#c084fc' }}>{m.clase_rpg}</td>
                  <td>Nvl {m.nivel || 1}</td>
                  <td style={{ color: '#4ade80', fontWeight: '700' }}>{m.xp || 150} XP</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {vistaHotbar === 'logros' && (
        <div className="card-pro" style={{ border: '2px solid #a855f7' }}>
          <h3 className="pixel-font" style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>🏆 LOGROS Y RESULTADOS</h3>
          {calificaciones.map(cal => (
            <div key={cal.id} style={{ padding: '0.75rem 0', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <strong>{cal.evaluacion_titulo}</strong>
                <div style={{ fontSize: '0.78rem', color: '#4ade80' }}>+{cal.xp_ganada || 150} XP • {cal.aciertos}/{cal.total_preguntas} aciertos</div>
              </div>
              <strong style={{ fontSize: '1.15rem', color: cal.puntaje >= 60 ? '#4ade80' : '#f87171' }}>{cal.puntaje}%</strong>
            </div>
          ))}
        </div>
      )}

      {/* =====================================================================
          4. BOTTOM HUD (BARRA HORIZONTAL CON 5 ICONOS LIMPIOS)
         ===================================================================== */}
      <div className="rpg-hotbar" style={{ marginTop: '0.85rem', border: '3px solid #a855f7' }}>
        <button className={`rpg-hotbar-slot ${vistaHotbar === 'mapa' ? 'active' : ''}`} onClick={() => setVistaHotbar('mapa')}>
          <Map size={20} color="#4ade80" />
          <span className="pixel-font" style={{ fontSize: '0.55rem' }}>Mapa</span>
        </button>
        <button className={`rpg-hotbar-slot ${vistaHotbar === 'inventario' ? 'active' : ''}`} onClick={() => setVistaHotbar('inventario')}>
          <Backpack size={20} color="#fb923c" />
          <span className="pixel-font" style={{ fontSize: '0.55rem' }}>Inventario</span>
        </button>
        <button className={`rpg-hotbar-slot ${vistaHotbar === 'pergaminos' ? 'active' : ''}`} onClick={() => setVistaHotbar('pergaminos')}>
          <Scroll size={20} color="#fde047" />
          <span className="pixel-font" style={{ fontSize: '0.55rem' }}>Pergaminos</span>
        </button>
        <button className={`rpg-hotbar-slot ${vistaHotbar === 'gremio' ? 'active' : ''}`} onClick={() => setVistaHotbar('gremio')}>
          <Users size={20} color="#38bdf8" />
          <span className="pixel-font" style={{ fontSize: '0.55rem' }}>Gremio</span>
        </button>
        <button className={`rpg-hotbar-slot ${vistaHotbar === 'logros' ? 'active' : ''}`} onClick={() => setVistaHotbar('logros')}>
          <Trophy size={20} color="#fbbf24" />
          <span className="pixel-font" style={{ fontSize: '0.55rem' }}>Logros</span>
        </button>
      </div>
    </div>
  );
}