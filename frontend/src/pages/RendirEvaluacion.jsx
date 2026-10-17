import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Swords, Clock, ArrowLeft, Sparkles } from 'lucide-react';

export default function RendirEvaluacion() {
  const { id } = useParams();
  const { user, refrescarEstudiante } = useAuth();
  const navigate = useNavigate();

  const [preguntas, setPreguntas] = useState([]);
  const [turnoActual, setTurnoActual] = useState(0);
  const [respuestas, setRespuestas] = useState({});
  const [animacionAtaque, setAnimacionAtaque] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [tiempoRestante, setTiempoRestante] = useState(300);
  const [enviando, setEnviando] = useState(false);

  const respuestasRef = useRef(respuestas);
  useEffect(() => {
    respuestasRef.current = respuestas;
  }, [respuestas]);

  useEffect(() => {
    fetch(`http://localhost:4000/api/evaluaciones/${id}/preguntas`)
      .then(r => r.json())
      .then(data => setPreguntas(data))
      .catch(() => alert('Error al invocar al Jefe Final.'));
  }, [id]);

  useEffect(() => {
    if (resultado || preguntas.length === 0) return;
    const intervalo = setInterval(() => {
      setTiempoRestante(prev => {
        if (prev <= 1) {
          clearInterval(intervalo);
          enviarExamenServidor(respuestasRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(intervalo);
  }, [resultado, preguntas.length]);

  const minutos = Math.floor(tiempoRestante / 60);
  const segundos = tiempoRestante % 60;

  const respondidasCount = Object.keys(respuestas).length;
  const hpJefe = preguntas.length > 0 
    ? Math.max(5, Math.round(100 - (respondidasCount / preguntas.length) * 90))
    : 100;

  const seleccionarConjuro = (preguntaId, opcion) => {
    setRespuestas(prev => ({ ...prev, [preguntaId]: opcion }));
    setAnimacionAtaque(true);
    setTimeout(() => {
      setAnimacionAtaque(false);
      if (turnoActual < preguntas.length - 1) {
        setTurnoActual(prev => prev + 1);
      }
    }, 380);
  };

  const enviarExamenServidor = async (respuestasAEnviar) => {
    if (enviando) return;
    setEnviando(true);
    try {
      const res = await fetch(`http://localhost:4000/api/evaluaciones/${id}/calificar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          estudiante_id: user.id,
          respuestas: respuestasAEnviar
        })
      });
      const data = await res.json();
      if (res.ok) {
        setResultado(data);
        await refrescarEstudiante();
      } else {
        alert(data.error || 'Error al calificar el combate.');
      }
    } catch {
      alert('Error de conexión con el servidor.');
    } finally {
      setEnviando(false);
    }
  };

  if (resultado) {
    const aprobado = resultado.puntaje >= 60;
    return (
      <div className="container" style={{ maxWidth: '680px', marginTop: '1.5rem' }}>
        <div className="card-pro" style={{ textAlign: 'center', border: `3px solid ${aprobado ? '#10b981' : '#ef4444'}` }}>
          <h2 className="pixel-font" style={{ fontSize: '1.15rem', color: aprobado ? '#34d399' : '#f87171' }}>
            {aprobado ? '🏆 ¡JEFE FINAL DERROTADO!' : '💀 EL JEFE RESISTIÓ EL ATAQUE'}
          </h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>{resultado.retroalimentacion}</p>

          <div style={{ margin: '1.25rem 0', padding: '1.2rem', background: 'var(--bg-input)', borderRadius: '12px' }}>
            <div style={{ fontSize: '3rem', fontWeight: '900', color: aprobado ? '#10b981' : '#ef4444' }}>
              {resultado.puntaje}%
            </div>
            <span className="badge" style={{ background: 'rgba(251, 191, 36, 0.2)', color: '#fde047', border: '1px solid #fbbf24' }}>
              <Sparkles size={13} style={{ display: 'inline' }} /> +{resultado.xp_ganada || 150} XP Ganados
            </span>
          </div>

          {resultado.desglose && (
            <div style={{ textAlign: 'left', maxHeight: '240px', overflowY: 'auto', marginBottom: '1.25rem' }}>
              {resultado.desglose.map((d, i) => (
                <div key={i} style={{ background: 'rgba(0,0,0,0.35)', padding: '0.7rem', borderRadius: '8px', marginBottom: '0.5rem', fontSize: '0.82rem' }}>
                  <strong>{i + 1}. {d.enunciado}</strong>
                  <div style={{ color: d.es_correcta ? '#34d399' : '#f87171' }}>
                    Tu conjuro: {d.respuesta_estudiante} | Correcta: {d.opcion_correcta}
                  </div>
                </div>
              ))}
            </div>
          )}

          <button onClick={() => navigate('/panel-estudiante')} className="btn-pro btn-pro-ai" style={{ width: '100%' }}>
            <ArrowLeft size={18} /> Volver al Mapa 2D
          </button>
        </div>
      </div>
    );
  }

  const preguntaActual = preguntas[turnoActual];

  return (
    <div className="container" style={{ maxWidth: '880px' }}>
      {/* ESCENARIO DE COMBATE 2D PIXEL ART */}
      <div style={{
        position: 'relative',
        height: '270px',
        background: 'linear-gradient(180deg, #1a0b2e 0%, #2e1065 65%, #1e293b 65%, #0f172a 100%)',
        border: '3px solid #a855f7',
        borderRadius: '16px 16px 0 0',
        overflow: 'hidden',
        padding: '1.25rem'
      }}>
        {/* Barra Superior de Tiempo y Turno */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 5 }}>
          <span className="pixel-font" style={{ fontSize: '0.72rem', color: '#fde047' }}>
            TURNO {turnoActual + 1} DE {preguntas.length || 1}
          </span>
          <div style={{ background: 'rgba(0,0,0,0.65)', padding: '0.35rem 0.85rem', borderRadius: '8px', border: '1px solid #f87171', fontFamily: 'monospace', fontWeight: '800', color: '#fca5a5' }}>
            <Clock size={15} style={{ display: 'inline', marginRight: '5px' }} />
            {minutos}:{segundos < 10 ? `0${segundos}` : segundos}
          </div>
        </div>

        {/* HÉROE 2D (IZQUIERDA) */}
        <div style={{ position: 'absolute', left: '12%', bottom: '28px', textAlign: 'center' }}>
          <div style={{ background: 'rgba(15,23,42,0.9)', border: '1px solid #38bdf8', padding: '4px 10px', borderRadius: '8px', marginBottom: '6px', fontSize: '0.75rem' }}>
            <strong>{user?.nombre}</strong> (Nvl {user?.nivel || 1})
            <div className="rpg-stat-bar" style={{ width: '110px', height: '6px' }}>
              <div className="rpg-stat-fill-xp" style={{ width: '100%' }} />
            </div>
          </div>
          <svg width="76" height="84" viewBox="0 0 14 16" shapeRendering="crispEdges">
            <rect x="5" y="1" width="4" height="2" fill="#7e22ce" />
            <rect x="4" y="3" width="6" height="2" fill="#9333ea" />
            <rect x="2" y="5" width="10" height="1" fill="#a855f7" />
            <rect x="4" y="6" width="6" height="3" fill="#fed7aa" />
            <rect x="8" y="7" width="1" height="1" fill="#000" />
            <rect x="3" y="9" width="8" height="5" fill="#2563eb" />
            <rect x="11" y="5" width="1" height="10" fill="#fbbf24" />
          </svg>
        </div>

        {/* BOLA DE FUEGO / RAYO ARCANO AL ATACAR */}
        {animacionAtaque && (
          <div style={{
            position: 'absolute', left: '45%', top: '48%', transform: 'translate(-50%, -50%)',
            fontSize: '2.5rem', zIndex: 20
          }}>
            🔥⚡💥
          </div>
        )}

        {/* JEFE FINAL DEMONIO 2D (DERECHA) */}
        <div style={{
          position: 'absolute', right: '12%', bottom: '24px', textAlign: 'center',
          transform: animacionAtaque ? 'translateX(10px) scale(0.92)' : 'scale(1)',
          transition: 'transform 0.15s'
        }}>
          <div style={{ background: 'rgba(69,10,10,0.92)', border: '2px solid #f87171', padding: '4px 12px', borderRadius: '8px', marginBottom: '6px', fontSize: '0.75rem' }}>
            <strong style={{ color: '#fca5a5' }}>👹 JEFE FINAL (HP {hpJefe}%)</strong>
            <div className="rpg-stat-bar" style={{ width: '130px', height: '8px' }}>
              <div className="rpg-stat-fill-hp" style={{ width: `${hpJefe}%`, transition: 'width 0.3s' }} />
            </div>
          </div>
          <svg width="110" height="100" viewBox="0 0 18 16" shapeRendering="crispEdges">
            <rect x="3" y="1" width="2" height="3" fill="#fca5a5" />
            <rect x="13" y="1" width="2" height="3" fill="#fca5a5" />
            <rect x="4" y="3" width="10" height="9" fill="#dc2626" />
            <rect x="3" y="5" width="12" height="6" fill="#ef4444" />
            <rect x="5" y="6" width="3" height="2" fill="#fef08a" />
            <rect x="10" y="6" width="3" height="2" fill="#fef08a" />
            <rect x="6" y="10" width="6" height="2" fill="#450a0a" />
          </svg>
        </div>
      </div>

      {/* CAJA DE COMANDOS Y CONJUROS RPG (PREGUNTA ACTUAL) */}
      <div style={{
        background: '#0e1326',
        border: '3px solid #a855f7',
        borderTop: 'none',
        borderRadius: '0 0 16px 16px',
        padding: '1.5rem'
      }}>
        {!preguntaActual ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Cargando conjuros de la mazmorra...</p>
        ) : (
          <>
            {/* Selector de turnos rápidos */}
            <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
              {preguntas.map((p, idx) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setTurnoActual(idx)}
                  style={{
                    padding: '0.3rem 0.7rem',
                    borderRadius: '6px',
                    border: turnoActual === idx ? '2px solid #fbbf24' : '1px solid var(--border)',
                    background: respuestas[p.id] ? '#7e22ce' : 'var(--bg-input)',
                    color: '#fff',
                    fontSize: '0.78rem',
                    fontWeight: '800',
                    cursor: 'pointer'
                  }}
                >
                  Conjuro #{idx + 1} {respuestas[p.id] ? `(${respuestas[p.id]})` : ''}
                </button>
              ))}
            </div>

            <div style={{ background: 'rgba(0,0,0,0.4)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-light)', marginBottom: '1.15rem' }}>
              <h4 style={{ fontSize: '1.05rem', color: '#fff', lineHeight: 1.5 }}>
                ⚔️ {preguntaActual.enunciado}
              </h4>
            </div>

            <div className="grid-2" style={{ gap: '0.75rem' }}>
              {['A', 'B', 'C', 'D'].map(op => {
                const seleccionada = respuestas[preguntaActual.id] === op;
                return (
                  <button
                    key={op}
                    type="button"
                    onClick={() => seleccionarConjuro(preguntaActual.id, op)}
                    style={{
                      textAlign: 'left',
                      padding: '0.9rem 1.1rem',
                      borderRadius: '10px',
                      border: seleccionada ? '2px solid #fbbf24' : '1px solid #a855f7',
                      background: seleccionada ? 'rgba(168, 85, 247, 0.35)' : 'var(--bg-input)',
                      color: '#fff',
                      cursor: 'pointer',
                      fontWeight: '700',
                      fontSize: '0.92rem'
                    }}
                  >
                    <strong style={{ color: '#fde047', marginRight: '8px' }}>[{op}]</strong>
                    {preguntaActual[`opcion_${op.toLowerCase()}`]}
                  </button>
                );
              })}
            </div>

            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                Conjuros cargados: <strong>{respondidasCount} de {preguntas.length}</strong>
              </span>
              <button
                type="button"
                disabled={enviando}
                onClick={() => enviarExamenServidor(respuestas)}
                className="btn-pro btn-pro-ai"
                style={{ padding: '0.85rem 1.75rem' }}
              >
                <Swords size={18} /> {enviando ? 'Resolviendo Combate...' : '¡Ejecutar Ataque Final y Terminar!'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}