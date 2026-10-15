import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';

export default function LoginProfesor() {
  const [correo, setCorreo] = useState('admin@universidad.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const { user, loginProfesor } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.rol === 'profesor') {
      navigate('/panel-profesor');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!correo.trim() || !password.trim()) {
      return setError('Todos los campos son obligatorios.');
    }

    setCargando(true);
    try {
      const res = await fetch('http://localhost:4000/api/auth/profesor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo: correo.trim(), password })
      });
      const data = await res.json();

      if (res.ok) {
        loginProfesor(data.profesor);
        navigate('/panel-profesor');
      } else {
        setError(data.error || 'Credenciales de Game Master incorrectas.');
      }
    } catch {
      setError('Error al conectar con el servidor.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '470px', marginTop: '3.5rem' }}>
      <div className="card-pro" style={{ padding: '2.5rem', border: '1px solid rgba(59, 130, 246, 0.4)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '14px',
            background: 'rgba(59, 130, 246, 0.15)',
            color: '#3b82f6',
            border: '2px solid rgba(59, 130, 246, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem auto'
          }}>
            <Shield size={28} />
          </div>

          <span style={{ fontSize: '0.75rem', color: '#60a5fa', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Administración Académica
          </span>
          <h2 style={{ fontSize: '1.6rem', fontWeight: '800', marginTop: '0.2rem' }}>
            Consola del Game Master
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.4rem' }}>
            Acceso exclusivo para docentes. Gestiona Biomas, Pergaminos, Jefes Finales y calificaciones.
          </p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            color: '#f87171',
            padding: '0.85rem',
            borderRadius: '10px',
            fontSize: '0.86rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            marginBottom: '1.5rem'
          }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label">Correo Institucional del Docente:</label>
            <input 
              type="email" 
              className="input-pro"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              placeholder="admin@universidad.com"
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label">Contraseña de Seguridad:</label>
            <input 
              type="password" 
              className="input-pro"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={cargando}
            className="btn-pro btn-pro-primary"
            style={{ width: '100%', padding: '0.95rem', marginTop: '0.5rem', fontWeight: '700' }}
          >
            <span>{cargando ? 'Autenticando...' : '🧙‍♂️ Entrar a la Consola Docente'}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        <div style={{ marginTop: '1.75rem', textAlign: 'center', fontSize: '0.84rem', color: 'var(--text-dim)' }}>
          ¿Eres estudiante? <Link to="/estudiante" style={{ color: '#fbbf24', textDecoration: 'none', fontWeight: '700' }}>Ir al Portal de Aventureros</Link>
        </div>
      </div>
    </div>
  );
}