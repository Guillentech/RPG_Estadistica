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
    <div className="auth-shell">
      <div className="auth-panel auth-panel--student">
        <div className="auth-head">
          <div className="auth-sprite auth-sprite--student">
            <KeyRound size={28} />
          </div>
          <h2 className="pixel-font auth-title">PORTAL DEL GREMIO</h2>
          <p className="auth-subtitle">
            Ingresa tu Token Único asignado por el Game Master para desplegar el Mapa del Semestre
          </p>
        </div>

        {error && (
          <div className="rpg-alert rpg-alert--error" role="alert">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="input-group">
            <label className="input-label" style={{ textAlign: 'center' }}>Token / Código Único de Gremio:</label>
            <input
              type="text"
              className="input-pro token-input"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.toUpperCase())}
              placeholder="EST-XXXX"
              autoComplete="off"
              spellCheck="false"
              required
            />
          </div>

          <button
            type="submit"
            disabled={cargando}
            className="btn-pro btn-pro-ai btn-block"
          >
            <Swords size={18} />
            <span>{cargando ? 'Invocando Héroe...' : 'Entrar al Mapa del Semestre'}</span>
          </button>
        </form>

        {/* Accesos rápidos de prueba para demostración */}
        <hr className="hud-divider" />
        <div>
          <span className="token-hint">
            <Sparkles size={12} style={{ display: 'inline', marginRight: '4px' }} />
            Tokens rápidos de prueba:
          </span>
          <div className="token-list">
            {['EST-F8AO', 'EST-LEO1', 'EST-SOF2', 'EST-ANA3'].map(tok => (
              <button
                key={tok}
                type="button"
                onClick={() => setCodigo(tok)}
                className="token-chip"
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
