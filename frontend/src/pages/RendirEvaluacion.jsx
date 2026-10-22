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
        <div className={`card-pro result-card ${aprobado ? 'result-card--win' : 'result-card--lose'}`}>
          <h2 className={`pixel-font result-title ${aprobado ? 'is-pass' : 'is-fail'}`}>
            {aprobado ? '🏆 ¡JEFE FINAL DERROTADO!' : '💀 EL JEFE RESISTIÓ EL ATAQUE'}
          </h2>
          <p className="result-copy">{resultado.retroalimentacion}</p>

          <div className="result-score-box">
            <span className={`result-score ${aprobado ? 'is-pass' : 'is-fail'}`}>
              {resultado.puntaje}%
            </span>
            <span className="badge badge--gold result-xp">
              <Sparkles size={13} /> +{resultado.xp_ganada || 150} XP Ganados
            </span>
          </div>

          {resultado.desglose && (
            <div className="result-breakdown rpg-scroll">
              {resultado.desglose.map((d, i) => (
                <div key={i} className="result-detail">
                  <strong className="result-detail__q">{i + 1}. {d.enunciado}</strong>
                  <span className={`result-detail__a ${d.es_correcta ? 'is-pass' : 'is-fail'}`}>
                    Tu conjuro: {d.respuesta_estudiante} | Correcta: {d.opcion_correcta}
                  </span>
                </div>
              ))}
            </div>
          )}

          <button onClick={() => navigate('/panel-estudiante')} className="btn-pro btn-pro-primary btn-block">
            <ArrowLeft size={18} /> Volver al Mapa 2D
          </button>
        </div>
      </div>
    );
  }

  const preguntaActual = preguntas[turnoActual];

  return (
    <div className="container" style={{ maxWidth: '880px' }}>
      <div className="rpg-combat-shell">
        {/* ESCENARIO DE COMBATE 2D PIXEL ART */}
        <div className="rpg-combat-stage">
          {/* Barra Superior de Tiempo y Turno */}
          <div className="rpg-combat-top">
            <span className="rpg-combat-turn">
              TURNO {turnoActual + 1} DE {preguntas.length || 1}
            </span>
            <div className="rpg-combat-timer">
              <Clock size={15} />
              {minutos}:{segundos < 10 ? `0${segundos}` : segundos}
            </div>
          </div>

          {/* HÉROE 2D (IZQUIERDA) */}
          <div className="rpg-fighter rpg-fighter--hero">
            <div className="rpg-fighter__plate">
              <strong>{user?.nombre}</strong> (Nvl {user?.nivel || 1})
              <div className="rpg-stat-bar rpg-fighter__bar">
                <div className="rpg-stat-fill-xp" style={{ width: '100%' }} />
              </div>
            </div>
            <div className="rpg-fighter__sprite">
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
          </div>

          {/* BOLA DE FUEGO / RAYO ARCANO AL ATACAR */}
          {animacionAtaque && (
            <div className="rpg-attack-fx">
              🔥⚡💥
            </div>
          )}

          {/* JEFE FINAL DEMONIO 2D (DERECHA) */}
          <div className={`rpg-fighter rpg-fighter--boss ${animacionAtaque ? 'is-hit' : ''}`}>
            <div className="rpg-fighter__plate">
              <strong className="text-danger">👹 JEFE FINAL (HP {hpJefe}%)</strong>
              <div className="rpg-stat-bar rpg-fighter__bar">
                <div className="rpg-stat-fill-hp" style={{ width: `${hpJefe}%` }} />
              </div>
            </div>
            <div className="rpg-fighter__sprite">
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
        </div>

        {/* CAJA DE COMANDOS Y CONJUROS RPG (PREGUNTA ACTUAL) */}
        <div className="rpg-combat-panel">
          {!preguntaActual ? (
            <p className="rpg-empty">Cargando conjuros de la mazmorra...</p>
          ) : (
            <>
              {/* Selector de turnos rápidos */}
              <div className="rpg-turn-list">
                {preguntas.map((p, idx) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setTurnoActual(idx)}
                    className={`rpg-turn-btn ${turnoActual === idx ? 'is-active' : ''} ${respuestas[p.id] ? 'is-answered' : ''}`}
                  >
                    Conjuro #{idx + 1} {respuestas[p.id] ? `(${respuestas[p.id]})` : ''}
                  </button>
                ))}
              </div>

              <div className="rpg-question">
                <h4 className="rpg-question__text">
                  ⚔️ {preguntaActual.enunciado}
                </h4>
              </div>

              <div className="rpg-options">
                {['A', 'B', 'C', 'D'].map(op => {
                  const seleccionada = respuestas[preguntaActual.id] === op;
                  return (
                    <button
                      key={op}
                      type="button"
                      onClick={() => seleccionarConjuro(preguntaActual.id, op)}
                      className={`rpg-option ${seleccionada ? 'is-selected' : ''}`}
                    >
                      <strong className="rpg-option__key">[{op}]</strong>
                      <span>{preguntaActual[`opcion_${op.toLowerCase()}`]}</span>
                    </button>
                  );
                })}
              </div>

              <div className="rpg-combat-footer">
                <span className="rpg-combat-count">
                  Conjuros cargados: <strong>{respondidasCount} de {preguntas.length}</strong>
                </span>
                <button
                  type="button"
                  disabled={enviando}
                  onClick={() => enviarExamenServidor(respuestas)}
                  className="btn-pro btn-pro-primary"
                >
                  <Swords size={18} /> {enviando ? 'Resolviendo Combate...' : '¡Ejecutar Ataque Final y Terminar!'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
