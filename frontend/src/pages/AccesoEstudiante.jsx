import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Swords, ArrowRight, AlertCircle } from 'lucide-react';

export default function AccesoEstudiante() {
  const [codigo, setCodigo] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const { loginEstudiante } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const codigoLimpio = codigo.trim().toUpperCase();
    if (!codigoLimpio) {
      return setError('Ingresa tu código único de gremio (Ej: EST-XXXX).');
    }

    setCargando(true);
    try {
      const res = await fetch('http://localhost:4000/api/auth/estudiante', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codigo: codigoLimpio })
      });
      const data = await res.json();

      if (res.ok) {
        loginEstudiante(data.estudiante);
        navigate('/panel-estudiante');
      } else {
        setError(data.error || 'Token de gremio no encontrado.');
      }
    } catch {
      setError('Error al conectar con el servidor.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '460px', marginTop: '3.5rem' }}>
      <div className="rpg-box" style={{ padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '14px',
            background: 'rgba(251, 191, 36, 0.15)',
            color: '#fbbf24',
            border: '2px solid #fbbf24',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem auto'
          }}>
            <Swords size={28} />
          </div>
          <h2 className="font-pixel" style={{ fontSize: '1.15rem', color: '#fbbf24' }}>PORTAL DE AVENTUREROS</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
            Ingresa tu Token Único de Gremio asignado por el Game Master para entrar al Mapa 2D.
          </p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid #ef4444',
            color: '#f87171',
            padding: '0.85rem',
            borderRadius: '10px',
            fontSize: '0.86rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            marginBottom: '1.25rem'
          }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label">Código Único de Estudiante:</label>
            <input 
              type="text" 
              className="input-pro"
              placeholder="Ej: EST-F8A0"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.toUpperCase())}
              style={{ textAlign: 'center', fontFamily: 'monospace', fontSize: '1.2rem', fontWeight: '800', letterSpacing: '0.08em' }}
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={cargando}
            className="btn-pro"
            style={{ width: '100%', padding: '0.95rem', background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: '#090d16', fontWeight: '800' }}
          >
            <span>{cargando ? 'Abriendo portal...' : '⚔️ Entrar al Mundo 2D'}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.84rem', color: 'var(--text-dim)' }}>
          ¿Eres el docente? <Link to="/profesor" style={{ color: '#fbbf24', textDecoration: 'none', fontWeight: '700' }}>Ir a Consola Game Master</Link>
        </div>
      </div>
    </div>
  );
}