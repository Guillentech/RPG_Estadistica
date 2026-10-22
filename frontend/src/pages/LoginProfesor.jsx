import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { AlertCircle, KeyRound, Sparkles } from 'lucide-react';

// 💡 Sprite Pixel Art 16-bit: El Grimorio del Game Master
const GrimoireSprite = () => (
  <svg width="64" height="64" viewBox="0 0 16 16" shapeRendering="crispEdges" className="pixel-sprite">
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
    <div className="auth-shell">
      <div className="auth-panel auth-panel--teacher">

        <div className="auth-head">
          <div className="auth-sprite auth-sprite--teacher">
            <GrimoireSprite />
          </div>
          <h2 className="pixel-font auth-title">
            PORTAL DEL<br />GAME MASTER
          </h2>
          <p className="auth-subtitle">
            Acceso restringido. Autentica tu identidad arcana para gestionar el Gremio y los Biomas.
          </p>
        </div>

        {error && (
          <div className="rpg-alert rpg-alert--error" role="alert">
            <AlertCircle size={18} /><span>{error}</span>
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
              required
            />
          </div>

          <button type="submit" disabled={cargando} className="btn-pro btn-pro--gold btn-block">
            {cargando ? 'Autenticando...' : <><KeyRound size={18} /> Entrar a la Consola Game Master</>}
          </button>
        </form>

        <div className="auth-footer">
          <Link to="/estudiante" className="auth-link">
            <Sparkles size={14} /> ¿Eres estudiante? Ir al Mapa 2D
          </Link>
        </div>

      </div>
    </div>
  );
}
