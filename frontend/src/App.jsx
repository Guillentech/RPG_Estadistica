import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Home from './pages/Home';
import LoginProfesor from './pages/LoginProfesor';
import AccesoEstudiante from './pages/AccesoEstudiante';
import PanelProfesor from './pages/PanelProfesor';
import PanelEstudiante from './pages/PanelEstudiante';
import RendirEvaluacion from './pages/RendirEvaluacion';
import { LogOut, Swords, ArrowLeft, User, Shield, Compass } from 'lucide-react';

const HeaderGlobal = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const enInicio = location.pathname === '/';
  const enCombate = location.pathname.startsWith('/evaluacion/');

  // Etiqueta adaptativa del botón de retroceso según la pantalla actual
  const obtenerTextoRetroceso = () => {
    if (enCombate) return 'Huir al Mapa 2D';
    if (location.pathname === '/profesor' || location.pathname === '/estudiante') return 'Volver al Inicio';
    if (location.pathname === '/panel-profesor' || location.pathname === '/panel-estudiante') return 'Ir a Portada';
    return 'Volver';
  };

  // Acción inteligente sin bucles de redirección
  const manejarRetroceso = () => {
    if (enCombate) {
      if (window.confirm('⚠️ ¿Deseas retirarte del combate? Las respuestas no enviadas se perderán.')) {
        navigate('/panel-estudiante');
      }
      return;
    }

    // Desde cualquier otra vista secundaria, regresar limpiamente a la portada principal
    navigate('/');
  };

  const handleCerrarSesion = () => {
    if (window.confirm('¿Deseas cerrar tu sesión actual de forma segura?')) {
      logout();
      navigate('/');
    }
  };

  return (
    <header className="header-pro">
      <div className="header-left">
        {!enInicio && (
          <button 
            onClick={manejarRetroceso} 
            className="btn-retroceso"
            title="Regresar a la pantalla anterior"
          >
            <ArrowLeft size={16} />
            <span>{obtenerTextoRetroceso()}</span>
          </button>
        )}

        <Link to="/" className="brand-logo">
          <div className="brand-icon">
            <Swords size={22} color="#090d16" />
          </div>
          <div className="brand-text">
            <span className="brand-title">SAGA ACADÉMICA</span>
            <span className="brand-subtitle">LMS RPG & Game Master Console</span>
          </div>
        </Link>
      </div>

      <div className="header-right">
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            {/* Si está en la portada pero ya tiene sesión, botón directo para volver a su panel */}
            {enInicio && (
              <Link 
                to={user.rol === 'profesor' ? '/panel-profesor' : '/panel-estudiante'} 
                className="btn-guest btn-guest-student"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Compass size={16} />
                <span>{user.rol === 'profesor' ? 'Ir a Mi Consola' : 'Ir a Mi Mapa 2D'}</span>
              </Link>
            )}

            <div className="user-profile-badge">
              <div className="avatar-circle">
                {user.rol === 'profesor' ? <Shield size={16} /> : <User size={16} />}
              </div>

              <div className="user-info">
                <span className="user-name">{user.nombre}</span>
                <span className="user-role">
                  {user.rol === 'profesor' ? '🧙‍♂️ Game Master' : `🛡️ Gremio: ${user.codigo_unico}`}
                </span>
              </div>

              <button onClick={handleCerrarSesion} className="btn-salir">
                <LogOut size={15} />
                <span>Salir</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="header-actions-guest">
            <Link to="/estudiante" className="btn-guest btn-guest-student">
              ⚔️ Acceso Aventurero
            </Link>
            <Link to="/profesor" className="btn-guest btn-guest-teacher">
              🧙‍♂️ Consola Game Master
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

const RutaProtegida = ({ children, rolRequerido }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  if (rolRequerido && user.rol !== rolRequerido) return <Navigate to="/" replace />;
  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app-wrapper">
          <HeaderGlobal />
          <main className="app-main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/profesor" element={<LoginProfesor />} />
              <Route path="/estudiante" element={<AccesoEstudiante />} />
              <Route path="/panel-profesor" element={
                <RutaProtegida rolRequerido="profesor">
                  <PanelProfesor />
                </RutaProtegida>
              } />
              <Route path="/panel-estudiante" element={
                <RutaProtegida rolRequerido="estudiante">
                  <PanelEstudiante />
                </RutaProtegida>
              } />
              <Route path="/evaluacion/:id" element={
                <RutaProtegida rolRequerido="estudiante">
                  <RendirEvaluacion />
                </RutaProtegida>
              } />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}