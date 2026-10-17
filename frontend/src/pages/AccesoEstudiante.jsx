import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { KeyRound, Swords, Sparkles, AlertCircle } from 'lucide-react';

export default function AccesoEstudiante() {
  const [codigo, setCodigo] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const { user, loginEstudiante } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.rol === 'estudiante') {
      navigate('/panel-estudiante');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const codigoLimpio = codigo.trim().toUpperCase();
    // Validación estricta de formato de token (Requisito 18)
    const tokenRegex = /^[A-Z0-9-]{4,15}$/;
    if (!codigoLimpio || !tokenRegex.test(codigoLimpio)) {
      setError('Ingresa un código de gremio válido (ejemplo: EST-F8AO).');
      return;
    }

    setCargando(true);
    try {
      const res = await fetch('http://localhost:4000/api/auth/estudiante', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codigo: codigoLimpio })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        loginEstudiante(data.estudiante);
        navigate('/panel-estudiante');
      } else {
        setError(data.error || 'Código inválido o no registrado en el Gremio.');
      }
    } catch {
      setError('Error al comunicarse con el servidor.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '450px', marginTop: '3rem' }}>
      <div className="card-pro" style={{ padding: '2.25rem', border: '2px solid #9333ea' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{
            width: '58px',
            height: '58px',
            borderRadius: '14px',
            background: 'rgba(168, 85, 247, 0.18)',
            border: '2px solid #c084fc',
            color: '#e9d5ff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem auto',
            boxShadow: '0 0 18px rgba(168, 85, 247, 0.35)'
          }}>
            <KeyRound size={28} />
          </div>
          <h2 className="pixel-font" style={{ fontSize: '1.05rem', color: '#fff' }}>PORTAL DEL GREMIO</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem', marginTop: '0.45rem' }}>
            Ingresa tu Token Único asignado por el Game Master para desplegar el Mapa del Semestre
          </p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.14)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            color: '#fca5a5',
            padding: '0.8rem',
            borderRadius: '10px',
            marginBottom: '1.2rem',
            fontSize: '0.86rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div style={{ marginBottom: '1.35rem' }}>
            <label className="input-label" style={{ textAlign: 'center' }}>Token / Código Único de Gremio:</label>
            <input
              type="text"
              className="input-pro"
              style={{ 
                textAlign: 'center', 
                letterSpacing: '3px', 
                fontWeight: '800', 
                fontSize: '1.15rem',
                fontFamily: 'JetBrains Mono, monospace',
                color: '#38bdf8'
              }}
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.toUpperCase())}
              placeholder="EST-XXXX"
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={cargando}
            className="btn-pro btn-pro-ai" 
            style={{ width: '100%', padding: '0.9rem' }}
          >
            <Swords size={18} />
            <span>{cargando ? 'Invocando Héroe...' : 'Entrar al Mapa del Semestre'}</span>
          </button>
        </form>

        {/* Accesos rápidos de prueba para demostración */}
        <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.5rem' }}>
            <Sparkles size={12} style={{ display: 'inline', marginRight: '4px' }} />
            Tokens rápidos de prueba:
          </span>
          <div style={{ display: 'flex', gap: '0.45rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {['EST-F8AO', 'EST-LEO1', 'EST-SOF2', 'EST-ANA3'].map(tok => (
              <button
                key={tok}
                type="button"
                onClick={() => setCodigo(tok)}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--border-light)',
                  color: '#c4b5fd',
                  padding: '0.3rem 0.6rem',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontFamily: 'monospace',
                  cursor: 'pointer'
                }}
              >
                {tok}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}