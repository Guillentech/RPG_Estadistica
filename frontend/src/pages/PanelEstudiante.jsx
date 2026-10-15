import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { 
  BookOpen, Award, ClipboardList, Send, Clock, 
  MessageSquare, Check, Swords, Shield, Sparkles, 
  Map, ScrollText, Trophy, Zap, ArrowUp, ArrowDown, 
  ArrowLeft, ArrowRight, Eye
} from 'lucide-react';

export default function PanelEstudiante() {
  const { user } = useAuth();

  // Datos del servidor
  const [temas, setTemas] = useState([]);
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [calificaciones, setCalificaciones] = useState([]);
  const [tareas, setTareas] = useState([]);
  const [misEntregas, setMisEntregas] = useState([]);

  // Estados de entrega de misiones (tareas)
  const [entregaTexto, setEntregaTexto] = useState({});
  const [enviandoTarea, setEnviandoTarea] = useState(false);

  // Estados del Motor 2D RPG
  const [modoVista, setModoVista] = useState('mapa'); // 'mapa' | 'lista'
  const [heroPos, setHeroPos] = useState({ x: 1, y: 2 });
  const [zonaActiva, setZonaActiva] = useState(null); // { tipo: 'bioma' | 'jefes' | 'gremio' | 'fama', data: ... }

  const cargarDatos = () => {
    fetch('http://localhost:4000/api/temas').then(r => r.json()).then(data => {
      setTemas(data);
      if (data.length > 0 && !zonaActiva) {
        setZonaActiva({ tipo: 'bioma', data: data[0] });
      }
    });
    fetch('http://localhost:4000/api/evaluaciones').then(r => r.json()).then(setEvaluaciones);
    fetch('http://localhost:4000/api/tareas').then(r => r.json()).then(setTareas);

    if (user?.id) {
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

  // --- CÁLCULO DINÁMICO DE XP, NIVEL Y RANGO (REQUISITO 14) ---
  const xpExamenes = calificaciones.reduce((acc, c) => acc + (c.puntaje * 5), 0);
  const xpTareas = misEntregas.reduce((acc, e) => acc + ((e.calificacion || 20) * 3), 0);
  const xpTotal = xpExamenes + xpTareas;
  const nivelActual = Math.floor(xpTotal / 500) + 1;
  const xpEnNivelActual = xpTotal % 500;
  const porcentajeNivel = Math.min(100, Math.round((xpEnNivelActual / 500) * 100));

  const obtenerRango = (lvl) => {
    if (lvl === 1) return 'Novato del Gremio';
    if (lvl === 2) return 'Aprendiz de Código';
    if (lvl === 3) return 'Caballero Lógico';
    if (lvl === 4) return 'Paladín de Algoritmos';
    return 'Gran Maestro Arcano';
  };

  // --- DEFINICIÓN DEL MAPA 2D (10 Columnas x 6 Filas) ---
  // Construimos puntos de interés dinámicos según los temas y misiones
  const puntosDeInteres = {};

  // Biomas (Temas) ubicados en la parte superior y media del camino
  const coordenadasBiomas = [
    { x: 2, y: 1 }, { x: 5, y: 1 }, { x: 8, y: 1 },
    { x: 2, y: 4 }, { x: 5, y: 4 }
  ];

  temas.slice(0, 5).forEach((tema, idx) => {
    const coord = coordenadasBiomas[idx];
    puntosDeInteres[`${coord.x},${coord.y}`] = {
      icono: '🏰',
      etiqueta: `Bioma ${idx + 1}`,
      clase: 'tile-biome',
      accion: () => setZonaActiva({ tipo: 'bioma', data: tema })
    };
  });

  // Bastión de Jefes Finales (Evaluaciones)
  puntosDeInteres['8,2'] = {
    icono: '🐉',
    etiqueta: 'Jefes (Exámenes)',
    clase: 'tile-boss',
    accion: () => setZonaActiva({ tipo: 'jefes' })
  };

  // Gremio de Misiones (Trabajos Prácticos)
  puntosDeInteres['4,2'] = {
    icono: '🛡️',
    etiqueta: 'Gremio (Tareas)',
    clase: 'tile-guild',
    accion: () => setZonaActiva({ tipo: 'gremio' })
  };

  // Salón de la Fama (Calificaciones y XP)
  puntosDeInteres['8,4'] = {
    icono: '🏆',
    etiqueta: 'Salón de Fama',
    clase: 'tile-biome',
    accion: () => setZonaActiva({ tipo: 'fama' })
  };

  // Caminos transitables
  const esCamino = (x, y) => {
    if (y === 2 && x >= 1 && x <= 8) return true;
    if (y === 3 && (x === 2 || x === 5 || x === 8)) return true;
    if (y === 1 && (x === 2 || x === 5 || x === 8)) return true;
    if (y === 4 && (x === 2 || x === 5 || x === 8)) return true;
    return false;
  };

  const esAgua = (x, y) => {
    return (x === 0 || x === 9 || y === 0 || y === 5);
  };

  // Mover personaje y activar casilla si es un edificio
  const moverPersonaje = useCallback((nuevoX, nuevoY) => {
    if (nuevoX < 1 || nuevoX > 8 || nuevoY < 1 || nuevoY > 4) return;
    setHeroPos({ x: nuevoX, y: nuevoY });

    const poi = puntosDeInteres[`${nuevoX},${nuevoY}`];
    if (poi && poi.accion) {
      poi.accion();
    }
  }, [temas]);

  // Escuchar teclado (WASD y Flechas)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (modoVista !== 'mapa') return;
      // No interceptar teclas si el estudiante está escribiendo en un textarea
      if (['TEXTAREA', 'INPUT'].includes(document.activeElement?.tagName)) return;

      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        moverPersonaje(heroPos.x, heroPos.y - 1);
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        e.preventDefault();
        moverPersonaje(heroPos.x, heroPos.y + 1);
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        moverPersonaje(heroPos.x - 1, heroPos.y);
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        moverPersonaje(heroPos.x + 1, heroPos.y);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [heroPos, modoVista, moverPersonaje]);

  const enviarTrabajo = async (tareaId) => {
    const contenido = entregaTexto[tareaId];
    if (!contenido?.trim()) return alert('Debes redactar la solución de tu misión antes de enviarla.');

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
        alert('⚔️ ¡Misión entregada al Game Master! Has ganado puntos de progreso.');
        cargarDatos();
      }
    } catch {
      alert('Error al enviar la misión.');
    } finally {
      setEnviandoTarea(false);
    }
  };

  return (
    <div className="container">
      
      {/* HUD SUPERIOR DEL PERSONAJE (NIVEL, RANGO Y BARRA DE XP) */}
      <div className="rpg-box" style={{ 
        marginBottom: '1.75rem', 
        background: 'linear-gradient(135deg, #111827 0%, #1e1b4b 100%)' 
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.25rem' }}>
          
          {/* Avatar y Datos del Héroe */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ 
              width: '64px', 
              height: '64px', 
              borderRadius: '14px', 
              background: 'rgba(251, 191, 36, 0.15)', 
              border: '2px solid #fbbf24', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              fontSize: '2.2rem',
              boxShadow: '0 0 15px rgba(251, 191, 36, 0.3)'
            }}>
              🧙‍♂️
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                <span className="badge" style={{ background: '#fbbf24', color: '#090d16', fontWeight: '800' }}>
                  NIVEL {nivelActual}
                </span>
                <span style={{ color: '#c4b5fd', fontSize: '0.85rem', fontWeight: '700' }}>
                  • {obtenerRango(nivelActual)}
                </span>
              </div>
              <h2 style={{ fontSize: '1.5rem', marginTop: '0.25rem', color: '#fff' }}>{user?.nombre}</h2>
              <span style={{ fontSize: '0.8rem', color: '#38bdf8', fontFamily: 'monospace' }}>
                Token de Gremio: {user?.codigo_unico}
              </span>
            </div>
          </div>

          {/* Barra de Experiencia (XP) */}
          <div style={{ flex: 1, minWidth: '260px', maxWidth: '420px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.4rem', fontWeight: '700' }}>
              <span style={{ color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Zap size={15} /> Experiencia Total: {xpTotal} XP
              </span>
              <span style={{ color: 'var(--text-muted)' }}>{xpEnNivelActual} / 500 XP (Sig. Nivel)</span>
            </div>
            <div className="xp-bar-container">
              <div className="xp-bar-fill" style={{ width: `${porcentajeNivel}%` }} />
            </div>
          </div>

          {/* Selector de Modo: Mapa 2D vs Vista Completa */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              onClick={() => setModoVista('mapa')}
              className="btn-pro"
              style={{ 
                background: modoVista === 'mapa' ? '#fbbf24' : 'rgba(255,255,255,0.06)', 
                color: modoVista === 'mapa' ? '#090d16' : '#fff',
                fontWeight: '800'
              }}
            >

<Map size={16} />
Mapa 2D
            </button>
            <button 
              onClick={() => setModoVista('lista')}
              className="btn-pro"
              style={{ 
                background: modoVista === 'lista' ? '#3b82f6' : 'rgba(255,255,255,0.06)', 
                color: '#fff' 
              }}
            >
              <ScrollText size={16} /> Vista Clásica
            </button>
          </div>

        </div>
      </div>

      {/* =================================================================
          MODO 1: EXPLORACIÓN EN MAPA 2D INTERACTIVO (REQUISITO 5, 8, 9, 10)
          ================================================================= */}
      {modoVista === 'mapa' && (
        <div className="grid-2" style={{ alignItems: 'start' }}>
          
          {/* COLUMNA IZQUIERDA: MOTOR DE MAPA 2D */}
          <div className="card-pro" style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fbbf24' }}>

<Map size={20} />
Mapa del Semestre (2D Grid)
              </h3>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Usa <strong>WASD / Flechas</strong> o haz <strong>clic en una casilla</strong>
              </span>
            </div>

            {/* Cuadrícula 10x6 */}
            <div className="rpg-map-grid">
              {Array.from({ length: 6 }).map((_, filaY) =>
                Array.from({ length: 10 }).map((__, colX) => {
                  const clave = `${colX},${filaY}`;
                  const poi = puntosDeInteres[clave];
                  const estaElHeroe = heroPos.x === colX && heroPos.y === filaY;
                  const agua = esAgua(colX, filaY);
                  const camino = esCamino(colX, filaY);

                  let claseTile = 'tile-grass';
                  if (agua) claseTile = 'tile-water';
                  else if (poi) claseTile = poi.clase;
                  else if (camino) claseTile = 'tile-path';

                  return (
                    <div
                      key={clave}
                      className={`rpg-tile ${claseTile}`}
                      onClick={() => !agua && moverPersonaje(colX, filaY)}
                      title={poi ? poi.etiqueta : agua ? 'Mar Inexplorable' : `Casilla (${colX}, ${filaY})`}
                    >
                      {/* Decoración de fondo */}
                      {!poi && !estaElHeroe && agua && <span style={{ opacity: 0.45, fontSize: '1rem' }}>🌊</span>}
                      {!poi && !estaElHeroe && !agua && !camino && (colX + filaY) % 3 === 0 && (
                        <span style={{ opacity: 0.5, fontSize: '1.1rem' }}>🌲</span>
                      )}

                      {/* Icono del Edificio / Bioma / Jefe */}
                      {poi && !estaElHeroe && <span>{poi.icono}</span>}

                      {/* Sprite del Personaje Jugador */}
                      {estaElHeroe && <span className="hero-sprite">🧙‍♂️</span>}

                      {/* Etiqueta de la ubicación */}
                      {poi && <span className="tile-label">{poi.etiqueta}</span>}
                    </div>
                  );
                })
              )}
            </div>

            {/* Controles Táctiles (D-Pad para Móviles - Requisito 17) y Accesos Rápidos */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
              
              {/* Cruceta D-Pad */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', margin: '0 auto' }}>
                <button onClick={() => moverPersonaje(heroPos.x - 1, heroPos.y)} className="btn-pro" style={{ padding: '0.6rem', background: 'var(--bg-input)', color: '#fff' }}>
                  <ArrowLeft size={18} />
                </button>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <button onClick={() => moverPersonaje(heroPos.x, heroPos.y - 1)} className="btn-pro" style={{ padding: '0.6rem', background: 'var(--bg-input)', color: '#fff' }}>
                    <ArrowUp size={18} />
                  </button>
                  <button onClick={() => moverPersonaje(heroPos.x, heroPos.y + 1)} className="btn-pro" style={{ padding: '0.6rem', background: 'var(--bg-input)', color: '#fff' }}>
                    <ArrowDown size={18} />
                  </button>
                </div>
                <button onClick={() => moverPersonaje(heroPos.x + 1, heroPos.y)} className="btn-pro" style={{ padding: '0.6rem', background: 'var(--bg-input)', color: '#fff' }}>
                  <ArrowRight size={18} />
                </button>
              </div>

              {/* Leyenda Rápida */}
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center', width: '100%', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                <span>🏰 <strong>Biomas:</strong> Temas y Pergaminos</span> •
                <span>🛡️ <strong>Gremio:</strong> Trabajos Prácticos</span> •
                <span>🐉 <strong>Jefes:</strong> Exámenes</span> •
                <span>🏆 <strong>Fama:</strong> Notas</span>
              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA: INSPECTOR DE LA ZONA ACTUAL DEL MAPA */}
          <div>
            {!zonaActiva && (
              <div className="card-pro" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
                <Sparkles size={42} color="#fbbf24" style={{ margin: '0 auto 1rem auto' }} />
                <h3>Explora el Mapa del Semestre</h3>
                <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', fontSize: '0.92rem' }}>
                  Camina hacia un <strong>🏰 Bioma</strong> para estudiar pergaminos de código, al <strong>🛡️ Gremio</strong> para entregar tareas, o a la guarida del <strong>🐉 Jefe</strong> para rendir tus exámenes.
                </p>
              </div>
            )}

            {/* ZONA: BIOMA DE ESTUDIO Y PERGAMINOS (REQ 8 y 9) */}
            {zonaActiva?.tipo === 'bioma' && zonaActiva.data && (
              <div className="card-pro" style={{ border: '2px solid #3b82f6' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span className="badge" style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa' }}>
                    🏰 BIOMA ACADÉMICO EXPLORADO
                  </span>
                  {temas.length > 1 && (
                    <select 
                      className="input-pro" 
                      style={{ width: 'auto', padding: '0.35rem 0.7rem', fontSize: '0.8rem' }}
                      value={zonaActiva.data.id}
                      onChange={(e) => {
                        const t = temas.find(item => item.id === Number(e.target.value));
                        if (t) setZonaActiva({ tipo: 'bioma', data: t });
                      }}
                    >
                      {temas.map(t => <option key={t.id} value={t.id}>Ir a: {t.titulo}</option>)}
                    </select>
                  )}
                </div>

                <h3 style={{ fontSize: '1.4rem', color: '#38bdf8' }}>{zonaActiva.data.titulo}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', margin: '0.6rem 0 1.25rem 0' }}>
                  {zonaActiva.data.descripcion}
                </p>

                <h4 style={{ fontSize: '0.9rem', color: '#fbbf24', textTransform: 'uppercase', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <ScrollText size={16} /> Pergaminos y Cofres de Sabiduría ({zonaActiva.data.ejemplos?.length || 0}):
                </h4>

                {(!zonaActiva.data.ejemplos || zonaActiva.data.ejemplos.length === 0) ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Aún no hay pergaminos ocultos en este bioma.</p>
                ) : (
                  zonaActiva.data.ejemplos.map(ej => (
                    <div key={ej.id} style={{ background: 'var(--bg-input)', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(251, 191, 36, 0.3)', marginBottom: '0.85rem' }}>
                      <strong style={{ color: '#fde68a', fontSize: '0.92rem' }}>📜 {ej.titulo}</strong>
                      <pre style={{ marginTop: '0.6rem', padding: '0.75rem', background: '#090d16', borderRadius: '8px', color: '#a5f3fc', fontSize: '0.84rem', overflowX: 'auto', border: '1px solid var(--border)' }}>
                        {ej.contenido}
                      </pre>
                    </div>
                  ))
                )}

                <div style={{ marginTop: '1.25rem', display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                  <button onClick={() => setZonaActiva({ tipo: 'jefes' })} className="btn-pro" style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.4)' }}>
                    🐉 Ir a los Jefes Finales
                  </button>
                  <button onClick={() => setZonaActiva({ tipo: 'gremio' })} className="btn-pro" style={{ background: 'rgba(139, 92, 246, 0.2)', color: '#c4b5fd', border: '1px solid rgba(139, 92, 246, 0.4)' }}>
                    🛡️ Ir al Tablón de Misiones
                  </button>
                </div>
              </div>
            )}

            {/* ZONA: GUARIDA DE JEFES FINALES (EVALUACIONES - REQ 10) */}
            {zonaActiva?.tipo === 'jefes' && (
              <div className="card-pro" style={{ border: '2px solid #ef4444' }}>
                <span className="badge badge-danger" style={{ marginBottom: '0.5rem' }}>
                  🐉 GUARIDA DE JEFES FINALES
                </span>
                <h3 style={{ fontSize: '1.35rem', marginBottom: '0.4rem' }}>Desafíos de Evaluación</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
                  Cada Jefe custodia un Bioma. Solo tienes <strong>un intento único</strong> para derrotarlo antes de que el reloj llegue a cero.
                </p>

                {evaluaciones.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)' }}>No hay Jefes activos en este momento.</p>
                ) : (
                  evaluaciones.map(ev => {
                    const intentoPrevio = calificaciones.find(c => c.evaluacion_id === ev.id);
                    const yaCompletado = !!intentoPrevio;

                    return (
                      <div key={ev.id} style={{ background: 'var(--bg-input)', padding: '1rem', borderRadius: '12px', marginBottom: '0.85rem', border: yaCompletado ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(239, 68, 68, 0.35)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                        <div>
                          <h4 style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            {yaCompletado ? '🏆' : '🐉'} Jefe: {ev.titulo}
                          </h4>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            Bioma: {ev.tema_titulo} • {ev.total_preguntas} ataques (preguntas)
                          </span>
                        </div>

                        {yaCompletado ? (
                          <span className="badge badge-success" style={{ padding: '0.5rem 0.85rem' }}>
                            ✓ Derrotado ({intentoPrevio.puntaje}% • +{intentoPrevio.puntaje * 5} XP)
                          </span>
                        ) : (
                          <Link to={`/evaluacion/${ev.id}`} className="btn-pro" style={{ background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)', color: '#fff' }}>
                            <Swords size={16} /> ¡Enfrentar Jefe!
                          </Link>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* ZONA: GREMIO DE MISIONES (TRABAJOS PRÁCTICOS) */}
            {zonaActiva?.tipo === 'gremio' && (
              <div className="card-pro" style={{ border: '2px solid #8b5cf6' }}>
                <span className="badge" style={{ background: 'rgba(139, 92, 246, 0.2)', color: '#c4b5fd', marginBottom: '0.5rem' }}>
                  🛡️ TABLÓN DEL GREMIO
                </span>
                <h3 style={{ fontSize: '1.35rem', marginBottom: '0.4rem' }}>Misiones y Trabajos Prácticos</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
                  Envía tu código o reporte para que el Game Master lo califique y te otorgue bonificaciones de XP.
                </p>

                {tareas.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)' }}>No hay misiones publicadas en el tablón.</p>
                ) : (
                  tareas.map(tar => {
                    const entrega = misEntregas.find(e => e.tarea_id === tar.id);
                    const estaEntregada = !!entrega;
                    const tieneCalificacion = entrega && entrega.calificacion !== null;

                    return (
                      <div key={tar.id} style={{ background: 'var(--bg-input)', padding: '1.1rem', borderRadius: '12px', marginBottom: '1rem', border: estaEntregada ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <h4>📜 {tar.titulo}</h4>
                          <span className={`badge ${estaEntregada ? 'badge-success' : 'badge-danger'}`}>
                            {estaEntregada ? 'Misión Entregada' : 'En Curso'}
                          </span>
                        </div>

                        <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', margin: '0.5rem 0' }}>{tar.descripcion}</p>

                        {tar.fecha_limite && (
                          <div style={{ fontSize: '0.78rem', color: '#fbbf24', marginBottom: '0.6rem' }}>
                            ⏳ Plazo: {tar.fecha_limite}
                          </div>
                        )}

                        {tieneCalificacion && (
                          <div style={{ background: 'rgba(16, 185, 129, 0.12)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.3)', marginBottom: '0.75rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ fontSize: '0.8rem', color: '#34d399', fontWeight: '700' }}>Recompensa del Game Master:</span>
                              <strong style={{ color: '#10b981' }}>{entrega.calificacion} / 100 pts</strong>
                            </div>
                            {entrega.retroalimentacion && (
                              <p style={{ fontSize: '0.84rem', marginTop: '0.35rem', color: '#fff' }}>
                                💬 <strong>Feedback:</strong> {entrega.retroalimentacion}
                              </p>
                            )}
                          </div>
                        )}

                        <textarea 
                          className="input-pro"
                          rows="3"
                          placeholder="Escribe aquí tu código o solución para esta misión..."
                          value={entregaTexto[tar.id] || ''}
                          onChange={(e) => setEntregaTexto({ ...entregaTexto, [tar.id]: e.target.value })}
                        />
                        <button 
                          onClick={() => enviarTrabajo(tar.id)}
                          disabled={enviandoTarea}
                          className="btn-pro btn-pro-primary"
                          style={{ width: '100%', marginTop: '0.5rem' }}
                        >
                          <Send size={15} /> {estaEntregada ? 'Actualizar Entrega de Misión' : 'Entregar Misión al Gremio'}
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* ZONA: SALÓN DE LA FAMA (CALIFICACIONES Y RESULTADOS - REQ 14 y 15) */}
            {zonaActiva?.tipo === 'fama' && (
              <div className="card-pro" style={{ border: '2px solid #fbbf24' }}>
                <span className="badge" style={{ background: 'rgba(251, 191, 36, 0.2)', color: '#fbbf24', marginBottom: '0.5rem' }}>
                  🏆 SALÓN DE LA FAMA
                </span>
                <h3 style={{ fontSize: '1.35rem', marginBottom: '0.4rem' }}>Registro de Victorias y Calificaciones</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1rem' }}>
                  Historial oficial de combates contra Jefes y puntos de experiencia obtenidos.
                </p>

                {calificaciones.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)' }}>Aún no has registrado combates contra Jefes.</p>
                ) : (
                  calificaciones.map(cal => (
                    <div key={cal.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.8rem 0', borderBottom: '1px solid var(--border)' }}>
                      <div>
                        <div style={{ fontWeight: '700' }}>{cal.evaluacion_titulo}</div>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          Aciertos: {cal.aciertos}/{cal.total_preguntas} • {cal.fecha}
                        </span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.15rem', fontWeight: '800', color: cal.puntaje >= 60 ? '#10b981' : '#ef4444' }}>
                          {cal.puntaje}% <span style={{ fontSize: '0.8rem', color: '#fbbf24' }}>(+{cal.puntaje * 5} XP)</span>
                        </div>
                        <span className={`badge ${cal.puntaje >= 60 ? 'badge-success' : 'badge-danger'}`}>
                          {cal.puntaje >= 60 ? 'Jefe Derrotado' : 'No Superado'}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

          </div>
        </div>
      )}

      {/* =================================================================
          MODO 2: VISTA CLÁSICA COMPLETA (TODOS LOS MÓDULOS EN PANTALLA)
          ================================================================= */}
      {modoVista === 'lista' && (
        <div className="grid-2">
          <div>
            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BookOpen size={20} color="#38bdf8" /> Biomas y Pergaminos de Estudio
            </h3>
            {temas.map(t => (
              <div key={t.id} className="card-pro">
                <h4 style={{ color: '#38bdf8' }}>🏰 {t.titulo}</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: '0.5rem 0' }}>{t.descripcion}</p>
                {t.ejemplos?.map(ej => (
                  <div key={ej.id} style={{ background: 'var(--bg-input)', padding: '0.85rem', borderRadius: '8px', marginTop: '0.6rem' }}>
                    <strong style={{ color: '#fde68a', fontSize: '0.85rem' }}>📜 {ej.titulo}</strong>
                    <pre style={{ marginTop: '0.4rem', padding: '0.6rem', background: '#090d16', borderRadius: '6px', color: '#a5f3fc', fontSize: '0.82rem', overflowX: 'auto' }}>
                      {ej.contenido}
                    </pre>
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div>
            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Swords size={20} color="#ef4444" /> Jefes Finales (Exámenes)
            </h3>
            {evaluaciones.map(ev => {
              const intentoPrevio = calificaciones.find(c => c.evaluacion_id === ev.id);
              const yaCompletado = !!intentoPrevio;
              return (
                <div key={ev.id} className="card-pro" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4>🐉 {ev.titulo}</h4>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Bioma: {ev.tema_titulo}</span>
                  </div>
                  {yaCompletado ? (
                    <span className="badge badge-success">✓ Derrotado ({intentoPrevio.puntaje}%)</span>
                  ) : (
                    <Link to={`/evaluacion/${ev.id}`} className="btn-pro btn-pro-primary">Enfrentar Jefe</Link>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}