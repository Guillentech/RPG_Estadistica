import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Map, Backpack, Scroll, Users, Trophy, Swords, CloudLightning, 
  Send, Clock, MessageSquare, Check, Eye, X, Sparkles
} from 'lucide-react';

// ============================================================================
// SPRITES PIXEL ART EN SVG PURO (crispEdges = Pixel Art 2D nítido sin borrosidad)
// ============================================================================
const PixelCastleBoss = ({ derrotado }) => (
  <svg width="110" height="105" viewBox="0 0 22 21" shapeRendering="crispEdges">
    {/* Demonio Rojo (Jefe Final) asomándose sobre la muralla igual a 7468.jpg */}
    {!derrotado && (
      <g>
        <rect x="6" y="1" width="2" height="2" fill="#fca5a5" />
        <rect x="14" y="1" width="2" height="2" fill="#fca5a5" />
        <rect x="7" y="2" width="8" height="6" fill="#dc2626" />
        <rect x="6" y="3" width="10" height="4" fill="#ef4444" />
        <rect x="8" y="4" width="2" height="1" fill="#fef08a" />
        <rect x="12" y="4" width="2" height="1" fill="#fef08a" />
        <rect x="9" y="6" width="4" height="1" fill="#450a0a" />
      </g>
    )}
    {/* Torres y almenas de piedra gris */}
    <rect x="2" y="6" width="1" height="2" fill="#94a3b8" />
    <rect x="4" y="6" width="1" height="2" fill="#94a3b8" />
    <rect x="17" y="6" width="1" height="2" fill="#94a3b8" />
    <rect x="19" y="6" width="1" height="2" fill="#94a3b8" />
    <rect x="2" y="8" width="4" height="11" fill="#64748b" />
    <rect x="16" y="8" width="4" height="11" fill="#64748b" />
    <rect x="6" y="9" width="10" height="10" fill="#475569" />
    <rect x="7" y="8" width="2" height="1" fill="#94a3b8" />
    <rect x="10" y="8" width="2" height="1" fill="#94a3b8" />
    <rect x="13" y="8" width="2" height="1" fill="#94a3b8" />
    {/* Detalles de ladrillos y portón oscuro */}
    <rect x="3" y="10" width="2" height="2" fill="#1e293b" />
    <rect x="17" y="10" width="2" height="2" fill="#1e293b" />
    <rect x="9" y="13" width="4" height="6" fill="#0f172a" />
    <rect x="10" y="12" width="2" height="1" fill="#0f172a" />
    <rect x="10" y="13" width="1" height="6" fill="#334155" />
  </svg>
);

const PixelRuins = () => (
  <svg width="92" height="82" viewBox="0 0 18 16" shapeRendering="crispEdges">
    {/* Base y columnas antiguas en ruinas */}
    <rect x="2" y="13" width="14" height="2" fill="#64748b" />
    <rect x="3" y="4" width="3" height="9" fill="#94a3b8" />
    <rect x="8" y="6" width="2" height="7" fill="#94a3b8" />
    <rect x="13" y="8" width="2" height="5" fill="#64748b" />
    <rect x="2" y="3" width="8" height="2" fill="#cbd5e1" />
    {/* Enredaderas verdes sobre la piedra */}
    <rect x="3" y="5" width="2" height="2" fill="#10b981" />
    <rect x="7" y="4" width="2" height="2" fill="#059669" />
    <rect x="12" y="12" width="3" height="1" fill="#10b981" />
  </svg>
);

const PixelForestCamp = () => (
  <svg width="96" height="86" viewBox="0 0 18 16" shapeRendering="crispEdges">
    {/* Árboles frondosos Pixel Art + Cofre de Pergaminos */}
    <rect x="4" y="10" width="2" height="4" fill="#78350f" />
    <rect x="12" y="11" width="2" height="3" fill="#78350f" />
    <rect x="2" y="4" width="6" height="6" fill="#059669" />
    <rect x="3" y="2" width="4" height="3" fill="#10b981" />
    <rect x="10" y="5" width="6" height="6" fill="#047857" />
    <rect x="11" y="3" width="4" height="3" fill="#10b981" />
    {/* Cofre dorado en el centro */}
    <rect x="7" y="11" width="4" height="3" fill="#d97706" />
    <rect x="7" y="11" width="4" height="1" fill="#fbbf24" />
    <rect x="8" y="12" width="2" height="1" fill="#fef08a" />
  </svg>
);

const PixelLabTower = () => (
  <svg width="92" height="92" viewBox="0 0 18 18" shapeRendering="crispEdges">
    {/* Torre de alquimia / Laboratorio con cristal flotante */}
    <rect x="8" y="1" width="2" height="3" fill="#38bdf8" />
    <rect x="6" y="4" width="6" height="3" fill="#6d28d9" />
    <rect x="5" y="7" width="8" height="9" fill="#475569" />
    <rect x="7" y="9" width="4" height="3" fill="#38bdf8" />
    <rect x="8" y="13" width="2" height="3" fill="#1e1b4b" />
    <rect x="4" y="16" width="10" height="1" fill="#94a3b8" />
  </svg>
);

const PixelHeroWizard = ({ caminando }) => (
  <svg 
    width="48" 
    height="54" 
    viewBox="0 0 14 16" 
    shapeRendering="crispEdges"
    style={{ transform: caminando ? 'translateY(-3px)' : 'none', transition: 'transform 0.15s' }}
  >
    {/* Sombrero de Mago Morado */}
    <rect x="5" y="1" width="4" height="2" fill="#7e22ce" />
    <rect x="4" y="3" width="6" height="2" fill="#9333ea" />
    <rect x="2" y="5" width="10" height="1" fill="#a855f7" />
    <rect x="4" y="4" width="6" height="1" fill="#fbbf24" />
    {/* Rostro */}
    <rect x="4" y="6" width="6" height="3" fill="#fed7aa" />
    <rect x="5" y="7" width="1" height="1" fill="#0f172a" />
    <rect x="8" y="7" width="1" height="1" fill="#0f172a" />
    {/* Túnica Azul/Morada y Báculo */}
    <rect x="3" y="9" width="8" height="5" fill="#2563eb" />
    <rect x="5" y="9" width="4" height="5" fill="#7e22ce" />
    <rect x="11" y="6" width="1" height="9" fill="#92400e" />
    <rect x="10" y="4" width="3" height="2" fill="#38bdf8" />
    {/* Botas */}
    <rect x="4" y="14" width="2" height="2" fill="#1e293b" />
    <rect x="8" y="14" width="2" height="2" fill="#1e293b" />
  </svg>
);

const PixelOwlAlchemist = () => (
  <svg width="78" height="86" viewBox="0 0 16 18" shapeRendering="crispEdges">
    {/* Sombrero de Mago del Búho con estrella dorada */}
    <rect x="6" y="0" width="4" height="2" fill="#6b21a8" />
    <rect x="5" y="2" width="6" height="2" fill="#7e22ce" />
    <rect x="2" y="4" width="12" height="2" fill="#9333ea" />
    <rect x="7" y="3" width="2" height="2" fill="#fbbf24" />
    {/* Cuerpo del Búho */}
    <rect x="4" y="6" width="8" height="9" fill="#b45309" />
    <rect x="3" y="8" width="2" height="5" fill="#92400e" />
    <rect x="11" y="8" width="2" height="5" fill="#92400e" />
    {/* Ojos grandes sabios y pico */}
    <rect x="5" y="7" width="2" height="2" fill="#ffffff" />
    <rect x="9" y="7" width="2" height="2" fill="#ffffff" />
    <rect x="6" y="8" width="1" height="1" fill="#000000" />
    <rect x="10" y="8" width="1" height="1" fill="#000000" />
    <rect x="7" y="9" width="2" height="2" fill="#fbbf24" />
    {/* Pecho emplumado y patas */}
    <rect x="6" y="11" width="4" height="3" fill="#fde68a" />
    <rect x="5" y="15" width="2" height="2" fill="#f59e0b" />
    <rect x="9" y="15" width="2" height="2" fill="#f59e0b" />
  </svg>
);

export default function PanelEstudiante() {
  const { user, refrescarEstudiante } = useAuth();
  const navigate = useNavigate();

  // Hotbar inferior
  const [vistaHotbar, setVistaHotbar] = useState('mapa'); // 'mapa' | 'inventario' | 'pergaminos' | 'gremio' | 'logros'

  // Datos del backend
  const [temas, setTemas] = useState([]);
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [calificaciones, setCalificaciones] = useState([]);
  const [tareas, setTareas] = useState([]);
  const [misEntregas, setMisEntregas] = useState([]);
  const [gremio, setGremio] = useState([]);

  // Posición 2D del Héroe en el Mapa (Porcentajes X: 0-100, Y: 0-100)
  const [heroPos, setHeroPos] = useState({ x: 50, y: 54 });
  const [caminando, setCaminando] = useState(false);
  const [zonaActivaModal, setZonaActivaModal] = useState(null);
  const [calificacionDetalle, setCalificacionDetalle] = useState(null);

  // Entregas
  const [entregaTexto, setEntregaTexto] = useState({});
  const [enviandoTarea, setEnviandoTarea] = useState(false);

  // Búho Sabio Alquimista AI
  const [dialogoBuhoAbierto, setDialogoBuhoAbierto] = useState(false);
  const [preguntaAlquimista, setPreguntaAlquimista] = useState('');
  const [respuestaAlquimista, setRespuestaAlquimista] = useState('');
  const [cargandoAlquimista, setCargandoAlquimista] = useState(false);

  // Coordenadas 2D fijas estilo Mockup 7468.jpg para los biomas del curso
  const coordenadasMapa = [
    { x: 26, y: 30, biomaDefault: 'mazmorra' },    // Arriba-Izquierda (Castillo Mazmorra)
    { x: 27, y: 74, biomaDefault: 'ruinas' },      // Abajo-Izquierda (Ruinas)
    { x: 67, y: 55, biomaDefault: 'bosque' },      // Derecha-Centro (Bosque tras el puente)
    { x: 73, y: 26, biomaDefault: 'laboratorio' }, // Arriba-Derecha (Lab: El Algoritmo)
    { x: 52, y: 80, biomaDefault: 'bosque' },
    { x: 82, y: 72, biomaDefault: 'mazmorra' }
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

  // Movimiento 2D con Teclado (WASD o Flechas)
  useEffect(() => {
    if (vistaHotbar !== 'mapa' || zonaActivaModal || dialogoBuhoAbierto) return;

    const manejarTecla = (e) => {
      const tecla = e.key.toLowerCase();
      const paso = 3.5;
      let dx = 0;
      let dy = 0;

      if (tecla === 'w' || tecla === 'arrowup') dy = -paso;
      else if (tecla === 's' || tecla === 'arrowdown') dy = paso;
      else if (tecla === 'a' || tecla === 'arrowleft') dx = -paso;
      else if (tecla === 'd' || tecla === 'arrowright') dx = paso;
      else return;

      e.preventDefault();
      setCaminando(true);
      setHeroPos(prev => ({
        x: Math.max(8, Math.min(92, prev.x + dx)),
        y: Math.max(14, Math.min(88, prev.y + dy))
      }));
      setTimeout(() => setCaminando(false), 160);
    };

    window.addEventListener('keydown', manejarTecla);
    return () => window.removeEventListener('keydown', manejarTecla);
  }, [vistaHotbar, zonaActivaModal, dialogoBuhoAbierto]);

  // Mover héroe con botones táctiles o al hacer clic en un Bioma
  const moverHeroePaso = (dx, dy) => {
    setCaminando(true);
    setHeroPos(prev => ({
      x: Math.max(8, Math.min(92, prev.x + dx)),
      y: Math.max(14, Math.min(88, prev.y + dy))
    }));
    setTimeout(() => setCaminando(false), 180);
  };

  const viajarABioma = (tema, coords) => {
    setCaminando(true);
    setHeroPos({ x: coords.x + 4, y: coords.y + 8 });
    setTimeout(() => {
      setCaminando(false);
      setZonaActivaModal(tema);
    }, 320);
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
        alert(data.mensaje || '¡Misión entregada al Gremio!');
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
      setRespuestaAlquimista('🦉 El Sabio Alquimista consulta los astros... intenta de nuevo.');
    } finally {
      setCargandoAlquimista(false);
    }
  };

  // Estadísticas del HUD
  const xpActual = user?.xp || 150;
  const nivelActual = user?.nivel || 1;
  const progresoNivel = ((xpActual % 250) / 250) * 100;
  const examenesPendientes = evaluaciones.filter(ev => !calificaciones.some(c => c.evaluacion_id === ev.id));
  const tareasPendientes = tareas.filter(t => !misEntregas.some(e => e.tarea_id === t.id));
  const hayTormenta = examenesPendientes.length > 0 || tareasPendientes.length > 0;
  const companerosParty = gremio.filter(m => m.id !== user?.id).slice(0, 3);

  return (
    <div className="container" style={{ maxWidth: '1180px', paddingTop: '0.75rem' }}>
      {/* =====================================================================
          1. BARRA SUPERIOR HUD (IDÉNTICA AL MOCKUP: JUGADOR | PARTY | CLIMA)
         ===================================================================== */}
      <div className="rpg-hud-top">
        {/* Jugador */}
        <div className="rpg-hud-box">
          <div style={{
            width: '52px', height: '52px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #581c87 0%, #1e3a8a 100%)',
            border: '2px solid #e879f9', display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden', flexShrink: 0
          }}>
            <PixelHeroWizard caminando={false} />
          </div>
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: '0.68rem', color: '#38bdf8', fontWeight: '800', textTransform: 'uppercase' }}>
              Gremio
            </span>
            <div style={{ fontWeight: '800', fontSize: '1.02rem', color: '#fff', lineHeight: 1.15 }}>
              {user?.nombre}
            </div>
            <div style={{ fontSize: '0.74rem', color: '#cbd5e1', marginTop: '2px' }}>
              {user?.clase_rpg || 'Mago de Código'}, Nvl {nivelActual}
            </div>
            <div className="rpg-stat-bar">
              <div className="rpg-stat-fill-xp" style={{ width: `${Math.max(18, progresoNivel)}%` }} />
            </div>
          </div>
        </div>

        {/* Party: Leo, Sofía, Ana */}
        <div className="rpg-hud-box" style={{ justifyContent: 'space-around', flexWrap: 'wrap' }}>
          {companerosParty.map((comp, idx) => (
            <div key={comp.id} style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', minWidth: '100px' }}>
              <div style={{
                width: '34px', height: '34px', borderRadius: '8px',
                background: '#1e1b4b', border: '1px solid #a855f7',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem'
              }}>
                {idx === 0 ? '🧑🏽‍💻' : idx === 1 ? '👩🏻' : '👩🏻‍🦰'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.76rem', fontWeight: '800', color: '#fff' }}>{comp.nombre.split(' ')[0]}</div>
                <div className="rpg-stat-bar" style={{ height: '5px' }}>
                  <div className="rpg-stat-fill-hp" style={{ width: `${comp.hp || 90}%` }} />
                </div>
                <div className="rpg-stat-bar" style={{ height: '5px' }}>
                  <div className="rpg-stat-fill-xp" style={{ width: `${Math.min(100, ((comp.xp || 200) % 250) / 2.5)}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Clima: Tormenta de Fechas (24h) */}
        <div className="rpg-hud-box" style={{ borderColor: '#a855f7' }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: '10px',
            background: 'rgba(251, 191, 36, 0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fbbf24', flexShrink: 0
          }}>
            <CloudLightning size={26} />
          </div>
          <div>
            <span style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: '700' }}>TIEMPO:</span>
            <div style={{ fontSize: '0.84rem', fontWeight: '800', color: '#f8fafc' }}>
              {hayTormenta ? 'TORMENTA DE FECHAS (24h)' : 'CLIMA DESPEJADO'}
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================================
          2. LIENZO DEL VIDEOJUEGO 2D PIXEL ART (CON MOVIMIENTO REAL)
         ===================================================================== */}
      {vistaHotbar === 'mapa' && (
        <div 
          style={{
            position: 'relative',
            width: '100%',
            height: '530px',
            borderRadius: '18px',
            border: '3px solid #a855f7',
            boxShadow: '0 0 35px rgba(168, 85, 247, 0.35), inset 0 0 50px rgba(0,0,0,0.8)',
            overflow: 'hidden',
            backgroundColor: '#071324',
            userSelect: 'none'
          }}
        >
          {/* Banner Superior Central "MAPA DEL SEMESTRE" */}
          <div style={{
            position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
            zIndex: 25, background: 'linear-gradient(180deg, #2e1065 0%, #170d36 100%)',
            border: '2px solid #c084fc', borderTop: 'none',
            padding: '0.45rem 1.8rem', borderRadius: '0 0 16px 16px',
            fontFamily: "'Press Start 2P', monospace", fontSize: '0.78rem', color: '#fff',
            boxShadow: '0 6px 20px rgba(0,0,0,0.7)'
          }}>
            MAPA DEL SEMESTRE
          </div>

          {/* Indicador "Semestre 1" y Controles en Esquina Superior Izquierda */}
          <div style={{ position: 'absolute', top: '14px', left: '18px', zIndex: 20 }}>
            <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#fff', textShadow: '0 2px 6px #000' }}>
              Semestre 1
            </div>
            <div style={{ fontSize: '0.72rem', color: '#a5f3fc', background: 'rgba(0,0,0,0.55)', padding: '3px 8px', borderRadius: '6px', marginTop: '3px' }}>
              🎮 Usa <strong>WASD / Flechas</strong> o haz clic en un Bioma para caminar
            </div>
          </div>

          {/* CAPA 1: MUNDO 2D PIXEL ART (ISLAS, RÍO, PUENTE DE MADERA Y CAMINOS MORADOS) */}
          <svg 
            viewBox="0 0 1000 530" 
            preserveAspectRatio="none"
            shapeRendering="crispEdges"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 1 }}
          >
            {/* Agua profunda y río central */}
            <rect width="1000" height="530" fill="#081c2e" />
            <path d="M 460 0 L 560 0 L 520 530 L 410 530 Z" fill="#0e3a5c" />
            <path d="M 480 0 L 535 0 L 495 530 L 435 530 Z" fill="#165b8a" />

            {/* Isla Izquierda (Acantilado de piedra + Pasto pixelado) */}
            <polygon points="40,120 450,90 480,470 60,495" fill="#1e293b" />
            <polygon points="40,95 450,70 475,445 60,470" fill="#065f46" />
            <polygon points="65,115 430,90 455,425 85,445" fill="#10b981" />

            {/* Isla Derecha (Bosque de la Programación y Lab) */}
            <polygon points="530,95 955,85 940,475 515,465" fill="#1e293b" />
            <polygon points="530,75 955,65 940,450 515,440" fill="#065f46" />
            <polygon points="555,95 930,85 915,425 540,415" fill="#10b981" />

            {/* Caminos Morados estilo RPG conectando las zonas igual a 7468.jpg */}
            <path 
              d="M 260 175 L 340 280 L 270 395 M 340 280 L 500 265 L 670 290 L 730 145 M 670 290 L 820 380" 
              fill="none" 
              stroke="#7e22ce" 
              strokeWidth="34" 
              strokeLinecap="square"
            />
            <path 
              d="M 260 175 L 340 280 L 270 395 M 340 280 L 500 265 L 670 290 L 730 145 M 670 290 L 820 380" 
              fill="none" 
              stroke="#a855f7" 
              strokeWidth="22" 
              strokeLinecap="square"
            />

            {/* Puente de Madera Pixel Art cruzando el río central */}
            <rect x="440" y="242" width="115" height="44" fill="#78350f" />
            <rect x="440" y="236" width="115" height="6" fill="#b45309" />
            <rect x="440" y="286" width="115" height="6" fill="#b45309" />
            <rect x="455" y="242" width="10" height="44" fill="#92400e" />
            <rect x="475" y="242" width="10" height="44" fill="#92400e" />
            <rect x="495" y="242" width="10" height="44" fill="#92400e" />
            <rect x="515" y="242" width="10" height="44" fill="#92400e" />
            <rect x="535" y="242" width="10" height="44" fill="#92400e" />

            {/* Árboles decorativos Pixel Art distribuidos por el mapa */}
            {[
              { x: 95, y: 150 }, { x: 135, y: 210 }, { x: 85, y: 310 },
              { x: 400, y: 130 }, { x: 585, y: 120 }, { x: 865, y: 140 },
              { x: 880, y: 250 }, { x: 600, y: 360 }, { x: 410, y: 375 }
            ].map((arb, i) => (
              <g key={i} transform={`translate(${arb.x}, ${arb.y})`}>
                <rect x="12" y="28" width="10" height="12" fill="#78350f" />
                <rect x="2" y="10" width="30" height="20" fill="#047857" />
                <rect x="6" y="2" width="22" height="14" fill="#10b981" />
              </g>
            ))}
          </svg>

          {/* CAPA 2: ESTRUCTURAS 2D INTERACTIVAS (CADA TEMA DE LA BD ES UN EDIFICIO EN EL MAPA) */}
          {temas.map((tema, idx) => {
            const coord = coordenadasMapa[idx % coordenadasMapa.length];
            const tipoBioma = tema.bioma || coord.biomaDefault;
            const evalsDeTema = evaluaciones.filter(ev => ev.tema_id === tema.id);
            const jefeActivo = evalsDeTema[0];
            const yaDerrotado = jefeActivo && calificaciones.some(c => c.evaluacion_id === jefeActivo.id);

            return (
              <div
                key={tema.id}
                onClick={() => viajarABioma(tema, coord)}
                style={{
                  position: 'absolute',
                  left: `${coord.x}%`,
                  top: `${coord.y}%`,
                  transform: 'translate(-50%, -50%)',
                  zIndex: 10,
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease'
                }}
                title="Haz clic para caminar hacia este Bioma"
              >
                {/* Cartel Rojo de Jefe Final sobre el Castillo (Igual a "¡Befe Final: Examen 2!") */}
                {jefeActivo && (
                  <div className="rpg-boss-tag" style={{
                    marginBottom: '-6px',
                    position: 'relative',
                    zIndex: 12,
                    background: yaDerrotado 
                      ? 'linear-gradient(90deg, #065f46 0%, #10b981 100%)' 
                      : 'linear-gradient(90deg, #7f1d1d 0%, #dc2626 100%)'
                  }}>
                    {yaDerrotado 
                      ? `✓ ${jefeActivo.titulo} Superado` 
                      : `¡${jefeActivo.nombre_jefe || `Befe Final: ${jefeActivo.titulo}`}!`}
                  </div>
                )}

                {/* Sprite 2D Pixel Art según el Bioma */}
                <div style={{ filter: 'drop-shadow(0 8px 10px rgba(0,0,0,0.75))' }}>
                  {tipoBioma === 'mazmorra' && <PixelCastleBoss derrotado={yaDerrotado} />}
                  {tipoBioma === 'ruinas' && <PixelRuins />}
                  {tipoBioma === 'laboratorio' && <PixelLabTower />}
                  {tipoBioma === 'bosque' && <PixelForestCamp />}
                </div>

                {/* Etiqueta morada oscura con nombre del Bioma igual a 7468.jpg */}
                <div style={{
                  marginTop: '-4px',
                  background: 'rgba(15, 23, 42, 0.92)',
                  border: '2px solid #a855f7',
                  color: '#ffffff',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '8px',
                  fontSize: '0.78rem',
                  fontWeight: '800',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.8)'
                }}>
                  {tema.titulo}
                </div>
              </div>
            );
          })}

          {/* CAPA 3: PERSONAJE JUGABLE 2D CON GLOBO DE EXCLAMACIÓN [ ! ] */}
          <div
            style={{
              position: 'absolute',
              left: `${heroPos.x}%`,
              top: `${heroPos.y}%`,
              transform: 'translate(-50%, -50%)',
              zIndex: 18,
              transition: 'left 0.22s linear, top 0.22s linear',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              pointerEvents: 'none'
            }}
          >
            {/* Globo blanco con signo de exclamación dorado igual al centro del mapa en 7468.jpg */}
            <div style={{
              background: '#ffffff',
              color: '#d97706',
              border: '2px solid #0f172a',
              borderRadius: '8px',
              padding: '1px 8px',
              fontWeight: '900',
              fontSize: '0.85rem',
              marginBottom: '2px',
              boxShadow: '0 4px 8px rgba(0,0,0,0.5)'
            }}>
              !
            </div>
            <PixelHeroWizard caminando={caminando} />
            <span style={{
              background: 'rgba(0,0,0,0.75)',
              color: '#fde047',
              fontSize: '0.65rem',
              fontWeight: '800',
              padding: '1px 6px',
              borderRadius: '4px',
              marginTop: '2px'
            }}>
              {user?.nombre?.split(' ')[0]}
            </span>
          </div>

          {/* CAPA 4: BÚHO "SABIO ALQUIMISTA AI" EN LA ESQUINA INFERIOR DERECHA (IGUAL A 7468.jpg) */}
          <div
            style={{
              position: 'absolute',
              right: '18px',
              bottom: '14px',
              zIndex: 22,
              display: 'flex',
              alignItems: 'flex-end',
              gap: '0.6rem'
            }}
          >
            {/* Bocadillo de diálogo blanco estilo cómic RPG */}
            <div 
              onClick={() => setDialogoBuhoAbierto(true)}
              style={{
                background: '#ffffff',
                color: '#0f172a',
                border: '3px solid #1e1b4b',
                borderRadius: '12px',
                padding: '0.65rem 0.9rem',
                maxWidth: '250px',
                fontSize: '0.78rem',
                fontWeight: '800',
                lineHeight: 1.35,
                boxShadow: '0 8px 20px rgba(0,0,0,0.65)',
                cursor: 'pointer'
              }}
            >
              {examenesPendientes.length > 0 
                ? `¡Atención! El Boss de "${examenesPendientes[0].titulo}" acecha. ¿Invocamos un consejo táctico? (Clic aquí)`
                : `¡Mazmorras despejadas! Haz clic sobre mí si necesitas ayuda con algún pergamino o tarea.`}
            </div>

            {/* Sprite del Búho con Sombrero de Mago */}
            <div 
              onClick={() => setDialogoBuhoAbierto(true)}
              style={{ textAlign: 'center', cursor: 'pointer' }}
            >
              <div style={{ filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.8))' }}>
                <PixelOwlAlchemist />
              </div>
              <div style={{
                background: '#1e1b4b',
                border: '2px solid #a855f7',
                color: '#f8fafc',
                fontSize: '0.7rem',
                fontWeight: '800',
                padding: '2px 8px',
                borderRadius: '6px',
                marginTop: '-4px'
              }}>
                Sabio Alquimista AI
              </div>
            </div>
          </div>

          {/* D-PAD TÁCTIL EN LA ESQUINA INFERIOR IZQUIERDA (Para Móviles o Mouse) */}
          <div style={{
            position: 'absolute', left: '16px', bottom: '14px', zIndex: 22,
            display: 'grid', gridTemplateColumns: 'repeat(3, 32px)', gap: '4px',
            background: 'rgba(15, 23, 42, 0.75)', padding: '6px', borderRadius: '12px',
            border: '1px solid rgba(168, 85, 247, 0.5)'
          }}>
            <div />
            <button onClick={() => moverHeroePaso(0, -6)} style={{ background: '#1e293b', color: '#fff', border: '1px solid #a855f7', borderRadius: '6px', cursor: 'pointer', height: '28px' }}>▲</button>
            <div />
            <button onClick={() => moverHeroePaso(-6, 0)} style={{ background: '#1e293b', color: '#fff', border: '1px solid #a855f7', borderRadius: '6px', cursor: 'pointer', height: '28px' }}>◀</button>
            <button onClick={() => temas[0] && setZonaActivaModal(temas[0])} title="Explorar zona" style={{ background: '#7e22ce', color: '#fde047', border: '1px solid #f0abfc', borderRadius: '6px', cursor: 'pointer', height: '28px', fontWeight: '900', fontSize: '0.7rem' }}>OK</button>
            <button onClick={() => moverHeroePaso(6, 0)} style={{ background: '#1e293b', color: '#fff', border: '1px solid #a855f7', borderRadius: '6px', cursor: 'pointer', height: '28px' }}>▶</button>
            <div />
            <button onClick={() => moverHeroePaso(0, 6)} style={{ background: '#1e293b', color: '#fff', border: '1px solid #a855f7', borderRadius: '6px', cursor: 'pointer', height: '28px' }}>▼</button>
            <div />
          </div>

          {/* =================================================================
              MODAL FLOTANTE 2D AL ENTRAR A UN BIOMA (COFRES, MISIONES Y JEFE)
             ================================================================= */}
          {zonaActivaModal && (
            <div style={{
              position: 'absolute', inset: '18px', zIndex: 40,
              background: 'rgba(10, 14, 29, 0.96)', border: '3px solid #fbbf24',
              borderRadius: '16px', padding: '1.25rem 1.5rem', overflowY: 'auto',
              boxShadow: '0 0 40px rgba(0,0,0,0.9)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
                <div>
                  <span style={{ fontSize: '0.72rem', color: '#fbbf24', fontWeight: '800', textTransform: 'uppercase' }}>
                    📍 Zona Explorable del Mapa
                  </span>
                  <h3 className="pixel-font" style={{ fontSize: '1rem', color: '#fff', marginTop: '4px' }}>
                    {zonaActivaModal.titulo}
                  </h3>
                </div>
                <button 
                  onClick={() => setZonaActivaModal(null)}
                  className="btn-danger"
                  style={{ padding: '0.4rem 0.75rem', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: '700' }}
                >
                  <X size={16} /> Salir al Mapa
                </button>
              </div>

              <p style={{ color: '#cbd5e1', fontSize: '0.9rem', marginBottom: '1.1rem' }}>
                {zonaActivaModal.descripcion}
              </p>

              <div className="grid-2">
                {/* Pergaminos / Cofres de Teoría del Bioma */}
                <div style={{ background: 'var(--bg-input)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <h4 style={{ color: '#fde047', marginBottom: '0.65rem', fontSize: '0.95rem' }}>
                    📜 Pergaminos y Cofres de Teoría
                  </h4>
                  {zonaActivaModal.ejemplos && zonaActivaModal.ejemplos.length > 0 ? (
                    zonaActivaModal.ejemplos.map(ej => (
                      <div key={ej.id} style={{ marginBottom: '0.75rem', background: '#070a14', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                        <strong style={{ color: '#38bdf8', fontSize: '0.85rem' }}>{ej.titulo}</strong>
                        <pre style={{ marginTop: '0.4rem', fontSize: '0.78rem', color: '#a5f3fc', overflowX: 'auto', whiteSpace: 'pre-wrap' }}>
                          {ej.contenido}
                        </pre>
                      </div>
                    ))
                  ) : (
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>No hay pergaminos en este bioma todavía.</p>
                  )}
                </div>

                {/* Jefes Finales y Misiones de este Bioma */}
                <div style={{ background: 'var(--bg-input)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <h4 style={{ color: '#f87171', marginBottom: '0.65rem', fontSize: '0.95rem' }}>
                    👹 Enfrentamientos contra Jefes
                  </h4>
                  {evaluaciones.filter(ev => ev.tema_id === zonaActivaModal.id).length === 0 ? (
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Sin Jefe Final en esta zona.</p>
                  ) : (
                    evaluaciones.filter(ev => ev.tema_id === zonaActivaModal.id).map(ev => {
                      const intento = calificaciones.find(c => c.evaluacion_id === ev.id);
                      return (
                        <div key={ev.id} style={{ background: 'rgba(0,0,0,0.35)', padding: '0.85rem', borderRadius: '10px', marginBottom: '0.65rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <strong style={{ color: '#fff', fontSize: '0.9rem' }}>{ev.titulo}</strong>
                            <div style={{ fontSize: '0.75rem', color: '#fca5a5' }}>{ev.total_preguntas} conjuros • +{ev.xp_recompensa || 300} XP</div>
                          </div>
                          {intento ? (
                            <span className="badge badge-success">Derrotado ({intento.puntaje}%)</span>
                          ) : (
                            <button
                              onClick={() => navigate(`/evaluacion/${ev.id}`)}
                              className="btn-pro btn-pro-primary"
                              style={{ background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)', padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}
                            >
                              <Swords size={15} /> ¡Atacar Jefe!
                            </button>
                          )}
                        </div>
                      );
                    })
                  )}

                  <h4 style={{ color: '#c084fc', margin: '1rem 0 0.65rem 0', fontSize: '0.95rem' }}>
                    ⚔️ Misiones de Laboratorio en esta Zona
                  </h4>
                  {tareas.filter(t => t.tema_id === zonaActivaModal.id).map(tar => (
                    <div key={tar.id} style={{ background: 'rgba(0,0,0,0.35)', padding: '0.75rem', borderRadius: '10px', marginBottom: '0.5rem' }}>
                      <strong style={{ fontSize: '0.85rem' }}>{tar.titulo}</strong>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '4px 0' }}>{tar.descripcion}</p>
                      <button 
                        onClick={() => { setZonaActivaModal(null); setVistaHotbar('inventario'); }}
                        className="btn-pro btn-pro-ai"
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', marginTop: '4px' }}
                      >
                        Entregar Misión
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* MODAL DE DIÁLOGO CON EL BÚHO SABIO ALQUIMISTA AI */}
          {dialogoBuhoAbierto && (
            <div style={{
              position: 'absolute', inset: '24px', zIndex: 45,
              background: 'rgba(14, 17, 38, 0.96)', border: '3px solid #a855f7',
              borderRadius: '16px', padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <PixelOwlAlchemist />
                  <div>
                    <span className="badge" style={{ background: 'rgba(251, 191, 36, 0.2)', color: '#fde047', border: '1px solid #fbbf24' }}>
                      Oráculo del Mapa
                    </span>
                    <h3 className="pixel-font" style={{ fontSize: '0.95rem', marginTop: '4px' }}>Sabio Alquimista AI</h3>
                  </div>
                </div>
                <button onClick={() => setDialogoBuhoAbierto(false)} className="btn-danger" style={{ padding: '0.4rem 0.75rem', borderRadius: '8px' }}>
                  ✕ Cerrar
                </button>
              </div>

              <div style={{
                background: '#ffffff', color: '#0f172a', padding: '1rem', borderRadius: '12px',
                fontWeight: '700', fontSize: '0.9rem', lineHeight: 1.5, margin: '1rem 0', flex: 1, overflowY: 'auto'
              }}>
                {respuestaAlquimista || `🦉 "¡Saludos, ${user?.nombre}! Soy el Sabio Alquimista AI. Pregúntame cualquier duda sobre tus temas de estudio, código o cómo prepararte para vencer al Jefe Final de la mazmorra."`}
              </div>

              <form onSubmit={consultarSabioAlquimista} style={{ display: 'flex', gap: '0.6rem' }}>
                <input
                  type="text"
                  className="input-pro"
                  placeholder="Escribe tu duda académica para el Sabio Alquimista..."
                  value={preguntaAlquimista}
                  onChange={(e) => setPreguntaAlquimista(e.target.value)}
                />
                <button type="submit" disabled={cargandoAlquimista} className="btn-pro btn-pro-ai">
                  <Send size={16} /> {cargandoAlquimista ? 'Consultando...' : 'Preguntar'}
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* =====================================================================
          3. SUB-VISTAS DE LA HOTBAR (INVENTARIO, PERGAMINOS, GREMIO, LOGROS)
         ===================================================================== */}
      {vistaHotbar === 'inventario' && (
        <div className="card-pro" style={{ border: '2px solid #a855f7' }}>
          <h3 style={{ marginBottom: '1rem' }}>🎒 Inventario de Misiones y Entregas ({tareas.length})</h3>
          {tareas.map(tar => {
            const entrega = misEntregas.find(e => e.tarea_id === tar.id);
            return (
              <div key={tar.id} style={{ background: 'var(--bg-input)', padding: '1rem', borderRadius: '12px', marginBottom: '1rem', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <h4>⚔️ {tar.titulo} ({tar.tema_titulo})</h4>
                  <span className={`badge ${entrega ? 'badge-success' : 'badge-danger'}`}>
                    {entrega ? 'Entregada' : 'Pendiente'}
                  </span>
                </div>
                <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', margin: '0.5rem 0' }}>{tar.descripcion}</p>
                {entrega?.calificacion !== null && entrega?.calificacion !== undefined && (
                  <div style={{ color: '#34d399', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: '700' }}>
                    Calificación del Game Master: {entrega.calificacion}/100 • {entrega.retroalimentacion}
                  </div>
                )}
                <textarea
                  className="input-pro"
                  rows="3"
                  placeholder="Escribe tu solución o código para entregar la misión..."
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
        <div className="card-pro" style={{ border: '2px solid #fbbf24' }}>
          <h3 style={{ marginBottom: '1rem' }}>📜 Pergaminos de Estudio Desbloqueados</h3>
          {temas.map(t => (
            <div key={t.id} style={{ marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
              <h4 style={{ color: '#fde047' }}>{t.titulo}</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{t.descripcion}</p>
              {t.ejemplos?.map(ej => (
                <pre key={ej.id} style={{ background: '#070a14', padding: '0.85rem', borderRadius: '8px', color: '#a5f3fc', fontSize: '0.82rem', overflowX: 'auto', marginTop: '0.4rem' }}>
                  <strong>// {ej.titulo}</strong>{'\n'}{ej.contenido}
                </pre>
              ))}
            </div>
          ))}
        </div>
      )}

      {vistaHotbar === 'gremio' && (
        <div className="card-pro" style={{ border: '2px solid #38bdf8' }}>
          <h3 style={{ marginBottom: '1rem' }}>🛡️ Clasificación del Gremio (Classroom)</h3>
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
                  <td style={{ color: '#34d399', fontWeight: '700' }}>{m.xp || 150} XP</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {vistaHotbar === 'logros' && (
        <div className="card-pro" style={{ border: '2px solid #10b981' }}>
          <h3 style={{ marginBottom: '1rem' }}>🏆 Historial de Jefes Derrotados y Retroalimentación</h3>
          {calificaciones.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>Aún no has derrotado a ningún Jefe Final en el mapa.</p>
          ) : (
            calificaciones.map(cal => {
              let detalle = [];
              try { detalle = JSON.parse(cal.detalle_respuestas || '[]'); } catch { detalle = []; }
              const abierto = calificacionDetalle === cal.id;
              return (
                <div key={cal.id} style={{ padding: '0.85rem 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong>{cal.evaluacion_titulo}</strong>
                      <div style={{ fontSize: '0.78rem', color: '#34d399' }}>+{cal.xp_ganada || 150} XP • {cal.aciertos}/{cal.total_preguntas} aciertos</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '1.2rem', fontWeight: '800', color: cal.puntaje >= 60 ? '#10b981' : '#ef4444' }}>{cal.puntaje}%</span>
                      {detalle.length > 0 && (
                        <div>
                          <button onClick={() => setCalificacionDetalle(abierto ? null : cal.id)} style={{ background: 'none', border: 'none', color: '#38bdf8', fontSize: '0.75rem', cursor: 'pointer' }}>
                            <Eye size={12} /> {abierto ? 'Ocultar' : 'Ver Retroalimentación'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  {abierto && (
                    <div style={{ marginTop: '0.6rem', background: 'var(--bg-input)', padding: '0.75rem', borderRadius: '8px', fontSize: '0.8rem' }}>
                      {detalle.map((d, idx) => (
                        <div key={idx} style={{ marginBottom: '0.4rem' }}>
                          <strong>{idx + 1}. {d.enunciado}</strong> — Tu respuesta: {d.respuesta_estudiante} (Correcta: {d.opcion_correcta})
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* =====================================================================
          4. HOTBAR INFERIOR DE 5 SLOTS (IDÉNTICA A 7468.jpg)
         ===================================================================== */}
      <div className="rpg-hotbar">
        <button className={`rpg-hotbar-slot ${vistaHotbar === 'mapa' ? 'active' : ''}`} onClick={() => setVistaHotbar('mapa')}>
          <Map size={20} color="#34d399" />
          <span>Map</span>
        </button>
        <button className={`rpg-hotbar-slot ${vistaHotbar === 'inventario' ? 'active' : ''}`} onClick={() => setVistaHotbar('inventario')}>
          <Backpack size={20} color="#f97316" />
          <span>Inventario</span>
        </button>
        <button className={`rpg-hotbar-slot ${vistaHotbar === 'pergaminos' ? 'active' : ''}`} onClick={() => setVistaHotbar('pergaminos')}>
          <Scroll size={20} color="#fde047" />
          <span>Pergaminos</span>
        </button>
        <button className={`rpg-hotbar-slot ${vistaHotbar === 'gremio' ? 'active' : ''}`} onClick={() => setVistaHotbar('gremio')}>
          <Users size={20} color="#38bdf8" />
          <span>Gremio</span>
        </button>
        <button className={`rpg-hotbar-slot ${vistaHotbar === 'logros' ? 'active' : ''}`} onClick={() => setVistaHotbar('logros')}>
          <Trophy size={20} color="#fbbf24" />
          <span>Logros</span>
        </button>
      </div>
    </div>
  );
}