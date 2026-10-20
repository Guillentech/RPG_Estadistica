import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { AlertCircle, KeyRound, Sparkles } from 'lucide-react';

// 💡 Sprite Pixel Art 16-bit: El Grimorio del Game Master
const GrimoireSprite = () => (
  <svg width="64" height="64" viewBox="0 0 16 16" shapeRendering="crispEdges">
    <rect x="2" y="1" width="12" height="14" fill="#3b0764" />
    <rect x="3" y="2" width="10" height="12" fill="#6b21a8" />
    <rect x="5" y="4" width="6" height="8" fill="#9333ea" />
    <rect x="7" y="6" width="2" height="4" fill="#fde047" />
    <rect x="4" y="1" width="1" height="14" fill="#fbbf24" />
    <rect x="11" y="1" width="1" height="14" fill="#fbbf24" />
    <rect x="2" y="3" width="12" height="1" fill="#fbbf24" />
    <rect x="2" y="12" width="12" height="1" fill="#fbbf24" />
  </svg>
);

export default function LoginProfesor() {
  const [correo, setCorreo] = useState('admin@universidad.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const { user, loginProfesor } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.rol === 'profesor') navigate('/panel-profesor');
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!correo.trim() || !password.trim()) return setError('Todos los campos son obligatorios.');

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
    <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '82vh' }}>
      <div style={{
        background: 'linear-gradient(180deg, #13092b 0%, #0f172a 100%)',
        border: '3px solid #a855f7',
        borderRadius: '16px',
        padding: '2.5rem',
        maxWidth: '460px',
        width: '100%',
        boxShadow: '0 0 40px rgba(168, 85, 247, 0.25), inset 0 0 20px rgba(0,0,0,0.8)'
      }}>
        
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ display: 'inline-block', padding: '1rem', background: '#050811', border: '2px solid #c084fc', borderRadius: '14px', boxShadow: '0 0 20px rgba(192, 132, 252, 0.4)' }}>
            <GrimoireSprite />
          </div>
          <h2 className="pixel-font" style={{ color: '#fde047', fontSize: '0.9rem', marginTop: '1.2rem', textShadow: '2px 2px 0px #78350f', lineHeight: 1.4 }}>
            PORTAL DEL<br/>GAME MASTER
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '0.75rem' }}>
            Acceso restringido. Autentica tu identidad arcana para gestionar el Gremio y los Biomas.
          </p>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', color: '#fca5a5', padding: '0.85rem', borderRadius: '8px', fontSize: '0.86rem', display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
            <AlertCircle size={18} /><span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label" style={{ color: '#c084fc', fontWeight: 'bold' }}>Correo Institucional del Docente:</label>
            <input 
              type="email" 
              className="input-pro"
              style={{ background: '#050811', border: '1px solid #7e22ce', color: '#fff' }}
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label" style={{ color: '#c084fc', fontWeight: 'bold' }}>Contraseña de Seguridad:</label>
            <input 
              type="password" 
              className="input-pro"
              style={{ background: '#050811', border: '1px solid #7e22ce', color: '#fff' }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" disabled={cargando} className="btn-pro btn-pro-primary" style={{ width: '100%', padding: '0.95rem', marginTop: '0.5rem', fontWeight: '800', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
            {cargando ? 'Autenticando...' : <><KeyRound size={18} /> Entrar a la Consola Game Master</>}
          </button>
        </form>

        <div style={{ marginTop: '1.75rem', textAlign: 'center', fontSize: '0.84rem' }}>
          <Link to="/estudiante" style={{ color: '#fbbf24', textDecoration: 'none', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            <Sparkles size={14} /> ¿Eres estudiante? Ir al Mapa 2D
          </Link>
        </div>

      </div>
    </div>
  );
}