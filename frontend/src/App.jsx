import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Home from './pages/Home';
import LoginProfesor from './pages/LoginProfesor';
import AccesoEstudiante from './pages/AccesoEstudiante';
import PanelProfesor from './pages/PanelProfesor';
import PanelEstudiante from './pages/PanelEstudiante';
import RendirEvaluacion from './pages/RendirEvaluacion';
import { 
  LogOut, Swords, ArrowLeft, Sparkles, Shield, Crown, Sun, Moon 
} from 'lucide-react';

const HeaderGlobal = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Estado para Modo Claro / Modo Oscuro persistente
  const [tema, setTema] = useState(() => localStorage.getItem('saga_theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', tema);
    localStorage.setItem('saga_theme', tema);
  }, [tema]);

  const alternarTema = () => {
    setTema(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const mostrarBotonRegresar = location.pathname !== '/';

  const manejarRetroceso = () => {
    if (location.pathname.startsWith('/evaluacion/')) {
      if (!window.confirm('⚠️ ¿Deseas huir del combate contra el Jefe? El intento no enviado se perderá.')) {
        return;
      }
    }
    navigate(-1);
  };

  const handleCerrarSesion = async () => {
    if (window.confirm('¿Deseas cerrar tu sesión en Saga Académica de forma segura?')) {
      await logout();
      navigate('/');
    }
  };

  return (
    <header className="header-pro">
      <div className="header-left">
        {mostrarBotonRegresar && (
          <button 
            onClick={manejarRetroceso} 
            className="btn-retroceso" 
            title="Regresar a la pantalla anterior"
          >
            <ArrowLeft size={17} />
            <span>Mapa Anterior</span>
          </button>
        )}

        <Link to="/" className="brand-logo">
          <div className="brand-icon">
            <Swords size={22} color="#ffffff" />
          </div>
          <div className="brand-text">
            <span className="brand-title">SAGA ACADÉMICA</span>
            <span className="brand-subtitle">LMS RPG 2D • Gremio Universitario</span>
          </div>
        </Link>
      </div>

      <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {/* Botón de Modo Claro / Modo Oscuro */}
        <button
          onClick={alternarTema}
          className="btn-theme-toggle"
          title={tema === 'dark' ? 'Cambiar a Modo Claro (Día)' : 'Cambiar a Modo Oscuro (Noche)'}
        >
          {tema === 'dark' ? <Sun size={18} color="#fbbf24" /> : <Moon size={18} color="#6d28d9" />}
        </button>

        {user ? (
          <div className="user-profile-badge">
            <div className="avatar-circle">
              {user.rol === 'profesor' ? <Crown size={18} color="#fbbf24" /> : <Sparkles size={17} color="#c084fc" />}
            </div>

            <div className="user-info">
              <span className="user-name">
                {user.nombre} {user.rol === 'estudiante' && `• Nvl ${user.nivel || 1}`}
              </span>
              <span className="user-role">
                {user.rol === 'profesor' 
                  ? 'Consola Game Master' 
                  : `${user.clase_rpg || 'Mago de Código'} | ${user.xp || 150} XP | ${user.codigo_unico}`}
              </span>
            </div>

            <button 
              onClick={handleCerrarSesion} 
              className="btn-salir"
              title="Cerrar sesión de forma segura"
            >
              <LogOut size={15} />
              <span>Salir</span>
            </button>
          </div>
        ) : (
          <div className="header-actions-guest">
            <Link to="/estudiante" className="btn-guest btn-guest-student">
              <Swords size={15} /> Entrar al Gremio
            </Link>
            <Link to="/profesor" className="btn-guest btn-guest-teacher">
              <Shield size={15} /> Game Master
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

// Guardián de seguridad para rutas protegidas
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