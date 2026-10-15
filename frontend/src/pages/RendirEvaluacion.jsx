import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Swords, Clock, AlertTriangle, ArrowLeft, 
  Trophy, Skull, Zap, CheckCircle2, XCircle 
} from 'lucide-react';

export default function RendirEvaluacion() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [preguntas, setPreguntas] = useState([]);
  const [respuestas, setRespuestas] = useState({});
  const [resultado, setResultado] = useState(null);
  const [tiempoRestante, setTiempoRestante] = useState(300); // 5 minutos
  const [enviando, setEnviando] = useState(false);

  const respuestasRef = useRef(respuestas);
  useEffect(() => {
    respuestasRef.current = respuestas;
  }, [respuestas]);

  useEffect(() => {
    fetch(`http://localhost:4000/api/evaluaciones/${id}/preguntas`)
      .then(r => r.json())
      .then(data => setPreguntas(data))
      .catch(() => alert('Error al invocar al Jefe de la evaluación.'));
  }, [id]);

  useEffect(() => {
    if (resultado || preguntas.length === 0) return;

    const intervalo = setInterval(() => {
      setTiempoRestante(prev => {
        if (prev <= 1) {
          clearInterval(intervalo);
          autoFinalizarExamen();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalo);
  }, [resultado, preguntas.length]);

  const minutos = Math.floor(tiempoRestante / 60);
  const segundos = tiempoRestante % 60;
  const tiempoCritico = tiempoRestante <= 60;

  // Cálculo visual de la vida del Jefe mientras el estudiante prepara sus ataques
  const respondidasCount = Object.keys(respuestas).length;
  const hpJefeEstimado = preguntas.length > 0
    ? Math.max(10, Math.round(100 - (respondidasCount / preguntas.length) * 85))
    : 100;

  const autoFinalizarExamen = async () => {
    alert('⌛ ¡El tiempo del combate se ha agotado! Lanzando ataque final con las respuestas marcadas.');
    await enviarExamenServidor(respuestasRef.current);
  };

  const handleSubmitManual = async (e) => {
    e.preventDefault();

    if (respondidasCount < preguntas.length) {
      const confirmar = window.confirm(
        `Has preparado ${respondidasCount} de ${preguntas.length} ataques. ¿Deseas lanzar el golpe definitivo de todos modos?`
      );
      if (!confirmar) return;
    }

    await enviarExamenServidor(respuestas);
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
      } else {
        alert(data.error || 'Error al procesar el combate.');
        navigate('/panel-estudiante');
      }
    } catch {
      alert('Error de conexión con el servidor.');
    } finally {
      setEnviando(false);
    }
  };

  // --- PANTALLA DE RESULTADOS Y RETROALIMENTACIÓN (REQ 14 Y 15) ---
  if (resultado) {
    const victoria = resultado.puntaje >= 60;
    const xpGanada = resultado.xp_ganada || (resultado.puntaje * 5);

    return (
      <div className="container" style={{ maxWidth: '720px', marginTop: '2rem' }}>
        <div className="rpg-box" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: '0.5rem' }}>
            {victoria ? '🏆' : '💀'}
          </div>

          <h2 className="font-pixel" style={{ fontSize: '1.35rem', color: victoria ? '#10b981' : '#ef4444' }}>
            {victoria ? '¡JEFE DERROTADO!' : 'HAS CAÍDO EN COMBATE'}
          </h2>

          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', fontSize: '0.92rem' }}>
            {victoria 
              ? 'Has superado la prueba con éxito y reclamado la recompensa del Bioma.' 
              : 'Tus ataques no fueron suficientes para vencer al guardián, pero has ganado experiencia.'}
          </p>

          {/* Tarjeta de Puntaje y XP */}
          <div style={{ margin: '1.75rem 0', padding: '1.5rem', background: 'rgba(0,0,0,0.4)', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '3.5rem', fontWeight: '800', color: victoria ? '#10b981' : '#f87171', lineHeight: 1 }}>
              {resultado.puntaje}%
            </div>

            <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <span className="badge" style={{ background: '#fbbf24', color: '#090d16', fontSize: '0.85rem', padding: '0.4rem 0.9rem' }}>
                ⚡ +{xpGanada} XP Ganada
              </span>
              <span className={`badge ${victoria ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.85rem', padding: '0.4rem 0.9rem' }}>
                Impactos Críticos: {resultado.aciertos} de {resultado.total_preguntas}
              </span>
            </div>
          </div>

          {/* RETROALIMENTACIÓN DETALLADA PREGUNTA POR PREGUNTA (REQUISITO 15) */}
          {resultado.retroalimentacion && (
            <div style={{ textAlign: 'left', marginTop: '1.5rem', marginBottom: '1.75rem' }}>
              <h4 style={{ color: '#fbbf24', marginBottom: '0.85rem', fontSize: '0.95rem', textTransform: 'uppercase' }}>
                📜 Registro de Combate y Retroalimentación:
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {resultado.retroalimentacion.map((item, idx) => (
                  <div 
                    key={idx} 
                    style={{ 
                      background: 'var(--bg-input)', 
                      padding: '0.9rem 1rem', 
                      borderRadius: '10px', 
                      borderLeft: `4px solid ${item.es_correcta ? '#10b981' : '#ef4444'}` 
                    }}
                  >
                    <div style={{ fontWeight: '600', fontSize: '0.9rem', marginBottom: '0.35rem' }}>
                      {idx + 1}. {item.enunciado}
                    </div>
                    <div style={{ fontSize: '0.82rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                      <span style={{ color: item.es_correcta ? '#34d399' : '#f87171' }}>
                        {item.es_correcta ? '✓ Ataque Certero' : '✕ Ataque Fallido'} (Elegiste: <strong>{item.opcion_elegida}</strong>)
                      </span>
                      {!item.es_correcta && (
                        <span style={{ color: '#fbbf24' }}>
                          Clave Correcta: <strong>Opción {item.opcion_correcta}</strong>
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button 
            onClick={() => navigate('/panel-estudiante')} 
            className="btn-pro" 
            style={{ width: '100%', padding: '0.95rem', background: '#fbbf24', color: '#090d16', fontWeight: '800' }}
          >
            <ArrowLeft size={18} /> Regresar al Mapa del Semestre
          </button>
        </div>
      </div>
    );
  }

  // --- PANTALLA DE BATALLA EN CURSO ---
  return (
    <div className="container" style={{ maxWidth: '850px' }}>
      
      {/* CABECERA FLOTANTE DE COMBATE: VIDA DEL JEFE Y RELOJ */}
      <div className="rpg-box" style={{
        position: 'sticky',
        top: '72px',
        zIndex: 40,
        marginBottom: '2rem',
        padding: '1.1rem 1.5rem',
        background: 'rgba(17, 24, 39, 0.95)',
        backdropFilter: 'blur(8px)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          
          {/* Avatar y Barra de HP del Jefe */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem', flex: 1, minWidth: '240px' }}>
            <div style={{ fontSize: '2.4rem', filter: 'drop-shadow(0 0 8px #ef4444)' }}>🐉</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: '700', marginBottom: '0.3rem' }}>
                <span style={{ color: '#f87171' }}>GUARDIÁN DE LA EVALUACIÓN</span>
                <span style={{ color: '#fca5a5' }}>HP: {hpJefeEstimado}%</span>
              </div>
              <div className="hp-bar-container">
                <div className="hp-bar-fill" style={{ width: `${hpJefeEstimado}%` }} />
              </div>
            </div>
          </div>

          {/* Temporizador de Combate */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            background: tiempoCritico ? 'rgba(239, 68, 68, 0.2)' : 'rgba(251, 191, 36, 0.15)',
            color: tiempoCritico ? '#f87171' : '#fbbf24',
            fontWeight: '800',
            fontSize: '1.25rem',
            fontFamily: 'monospace',
            border: `2px solid ${tiempoCritico ? '#ef4444' : '#fbbf24'}`
          }}>
            {tiempoCritico ? <AlertTriangle size={20} /> : <Clock size={20} />}
            <span>{minutos}:{segundos < 10 ? `0${segundos}` : segundos}</span>
          </div>

        </div>
      </div>

      {preguntas.length === 0 ? (
        <div className="card-pro" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: 'var(--text-muted)' }}>Este Jefe aún no tiene ataques configurados por el Game Master.</p>
          <button onClick={() => navigate('/panel-estudiante')} className="btn-pro btn-pro-primary" style={{ marginTop: '1.25rem' }}>
            Volver al Mapa
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmitManual}>
          {preguntas.map((p, index) => {
            const seleccionActual = respuestas[p.id];
            return (
              <div key={p.id} className="card-pro" style={{ marginBottom: '1.5rem', border: seleccionActual ? '1px solid #fbbf24' : '1px solid var(--border)' }}>
                <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.2rem' }}>
                  <span style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '8px',
                    background: seleccionActual ? '#fbbf24' : 'rgba(255, 255, 255, 0.06)',
                    color: seleccionActual ? '#090d16' : 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '800',
                    flexShrink: 0
                  }}>
                    {index + 1}
                  </span>
                  <h4 style={{ fontSize: '1.05rem', lineHeight: '1.5', marginTop: '0.2rem' }}>
                    {p.enunciado}
                  </h4>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {['A', 'B', 'C', 'D'].map(op => {
                    const textoOpcion = p[`opcion_${op.toLowerCase()}`];
                    const estaSeleccionada = seleccionActual === op;

                    return (
                      <label 
                        key={op}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.9rem',
                          padding: '0.85rem 1.15rem',
                          borderRadius: '10px',
                          background: estaSeleccionada ? 'rgba(251, 191, 36, 0.16)' : 'var(--bg-input)',
                          border: `1px solid ${estaSeleccionada ? '#fbbf24' : 'var(--border)'}`,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          color: '#ffffff'
                        }}
                      >
                        <input 
                          type="radio"
                          name={`preg_${p.id}`}
                          value={op}
                          checked={estaSeleccionada}
                          onChange={() => setRespuestas(prev => ({ ...prev, [p.id]: op }))}
                          style={{ accentColor: '#fbbf24', transform: 'scale(1.2)' }}
                        />
                        <span style={{ fontSize: '0.95rem' }}>
                          <strong style={{ color: estaSeleccionada ? '#fbbf24' : 'var(--text-muted)' }}>[{op}]</strong> {textoOpcion}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}

          <button 
            type="submit" 
            disabled={enviando}
            className="btn-pro" 
            style={{ 
              width: '100%', 
              padding: '1.1rem', 
              fontSize: '1.05rem', 
              fontWeight: '800',
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: '#090d16',
              marginBottom: '3rem'
            }}
          >
            <Swords size={20} /> {enviando ? 'Calculando daño crítico...' : '¡Lanzar Ataque Final y Terminar Evaluación!'}
          </button>
        </form>
      )}

    </div>
  );
}