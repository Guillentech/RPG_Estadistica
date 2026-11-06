import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AudioProvider } from './context/AudioContext';
import { AudioControls } from './components/rpg';
import { AvatarEstudiante } from './components/perfil/Avatares';
import useMediaQuery from './hooks/useMediaQuery';
import Home from './pages/Home';
import LoginProfesor from './pages/LoginProfesor';
import AccesoEstudiante from './pages/AccesoEstudiante';
import PanelProfesor from './pages/PanelProfesor';
import PanelEstudiante from './pages/PanelEstudiante';
import RendirEvaluacion from './pages/RendirEvaluacion';
import { 
  LogOut, Swords, ArrowLeft, Shield, Sun, Moon, Compass
} from 'lucide-react';

const BotonHud = ({ tono = 'violeta', className = '', children, ...props }) => {
  const TONOS = {
    violeta: { fondo: '#8a5cf6', luz: '#c4a7ff', sombra: '#4b2fa3', texto: '#fdf9ff' },
    rojo: { fondo: '#e8453c', luz: '#ff7a6b', sombra: '#8f1f2e', texto: '#fdf9ff' },
    oro: { fondo: '#ffd23f', luz: '#ffe08a', sombra: '#ff8a3d', texto: '#120c2b' },
  };
  const t = TONOS[tono] || TONOS.violeta;

  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-1.5 border-2 border-solid border-[#0a0718] px-2.5 py-1.5 text-[8px] leading-none shadow-[inset_0_2px_0_0_var(--luz),inset_0_-3px_0_0_var(--sombra),0_3px_0_0_#0a0718] hover:-translate-y-[1px] hover:brightness-110 active:translate-y-[2px] active:shadow-[inset_0_2px_0_0_var(--sombra)] ${className}`}
      style={{
        '--luz': t.luz,
        '--sombra': t.sombra,
        backgroundColor: t.fondo,
        color: t.texto,
        fontFamily: 'var(--font-px)',
      }}
      {...props}
    >
      {children}
    </button>
  );
};

const HeaderGlobal = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const esMovil = useMediaQuery('(max-width: 639px)');

  // 📱 Ocultar el header al hacer scroll hacia abajo en móvil para liberar vista del body y el mapa 2D.
  const [headerOculto, setHeaderOculto] = useState(false);
  const ultimoScrollY = useRef(0);

  useEffect(() => {
    if (!esMovil) {
      setHeaderOculto(false);
      return;
    }

    const manejarScroll = () => {
      const y = window.scrollY;
      const bajando = y > ultimoScrollY.current;

      if (bajando && y > 40) {
        setHeaderOculto(true);
      } else if (!bajando || y === 0) {
        setHeaderOculto(false);
      }

      ultimoScrollY.current = y;
    };

    window.addEventListener('scroll', manejarScroll, { passive: true });
    return () => window.removeEventListener('scroll', manejarScroll);
  }, [esMovil]);

  const [theme, setTheme] = useState(() => localStorage.getItem('theme_lms') || 'dark');
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme_lms', theme);
  }, [theme]);
  const toggleTheme = () => setTheme(t => (t === 'dark' ? 'light' : 'dark'));

  const enInicio = location.pathname === '/';
  const enCombate = location.pathname.startsWith('/evaluacion/');
  const esPanelEstudiante = location.pathname === '/panel-estudiante';

  const obtenerTextoRetroceso = () => {
    if (enCombate) return 'Huir al Mapa 2D';
    if (location.pathname === '/profesor' || location.pathname === '/estudiante') return 'Volver al Inicio';
    if (location.pathname === '/panel-profesor' || location.pathname === '/panel-estudiante') return 'Ir a Portada';
    return 'Volver';
  };

  const manejarRetroceso = () => {
    if (enCombate) {
      if (window.confirm('⚠️ ¿Deseas retirarte del combate? Las respuestas no enviadas se perderán.')) {
        navigate('/panel-estudiante');
      }
      return;
    }
    navigate('/');
  };

  const handleCerrarSesion = () => {
    if (window.confirm('¿Deseas cerrar tu sesión actual de forma segura?')) {
      logout();
      navigate('/');
    }
  };

  // 📱 Header compacto: nivel, XP y Salir alineados en una sola fila.
  if (esMovil) {
    const nivelActual = user?.nivel || 1;
    const xpActual = user?.xp || 0;

    return (
      <header className={`header-pro header-pro--movil ${headerOculto ? 'header-pro--oculto' : ''}`}>
        <div className="flex min-w-0 items-center gap-2">
          {!enInicio && (
            <BotonHud
              onClick={manejarRetroceso}
              tono="violeta"
              title={obtenerTextoRetroceso()}
              aria-label={obtenerTextoRetroceso()}
              className="px-2 py-1.5"
            >
              <ArrowLeft size={14} />
            </BotonHud>
          )}

          <Link to="/" className="flex min-w-0 items-center gap-2" aria-label="Ir a la portada">
            <span className="brand-icon"><img src="/favicon.svg" alt="Saga Académica" style={{ width: '100%', height: '100%', objectFit: 'contain', imageRendering: 'pixelated', borderRadius: '6px' }} /></span>
          </Link>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <button
            className="btn-theme-toggle"
            onClick={toggleTheme}
            title="Cambiar tema claro/oscuro"
            aria-label="Cambiar tema"
          >
            {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
          </button>

          {user ? (
            <>
              {!esPanelEstudiante && (
                <>
                  <AvatarEstudiante avatar={user.avatar} size={24} className="shrink-0" />
                  <span className="pixel-font whitespace-nowrap text-[9px] text-gold">
                    NVL {nivelActual}
                  </span>
                  <span className="pixel-font whitespace-nowrap text-[9px] text-xp">
                    {xpActual} XP
                  </span>
                </>
              )}
              <BotonHud
                onClick={handleCerrarSesion}
                tono="rojo"
                title="Salir"
                aria-label="Cerrar sesión"
                className="px-2 py-1.5"
              >
                <LogOut size={14} /><span>Salir</span>
              </BotonHud>
            </>
          ) : (
            <div className="flex items-center gap-1">
              <Link to="/estudiante" className="btn-guest btn-guest-student" aria-label="Entrar al Gremio" title="Entrar al Gremio">
                <Swords size={14} />
              </Link>
              <Link to="/profesor" className="btn-guest btn-guest-teacher" aria-label="Acceso Game Master" title="Game Master">
                <Shield size={14} />
              </Link>
            </div>
          )}
        </div>
      </header>
    );
  }

  return (
    <header className={`header-pro ${headerOculto ? 'header-pro--oculto' : ''}`}>
      <div className="header-left">
        {!enInicio && (
          <BotonHud onClick={manejarRetroceso} tono="violeta" title="Regresar">
            <ArrowLeft size={16} /><span>{obtenerTextoRetroceso()}</span>
          </BotonHud>
        )}

        <Link to="/" className="brand-logo">
          <div className="brand-icon"><img src="/favicon.svg" alt="Saga Académica" style={{ width: '100%', height: '100%', objectFit: 'contain', imageRendering: 'pixelated', borderRadius: '6px' }} /></div>
          <div className="brand-text">
            <span className="brand-title">SAGA ACADÉMICA</span>
            <span className="brand-subtitle">LMS RPG 2D • GREMIO UNIVERSITARIO</span>
          </div>
        </Link>
      </div>

      <div className="header-right">
        <button className="btn-theme-toggle" onClick={toggleTheme} title="Cambiar tema claro/oscuro" aria-label="Cambiar tema">
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        {user ? (
          <div className="header-user">
            {enInicio && (
              <Link to={user.rol === 'profesor' ? '/panel-profesor' : '/panel-estudiante'} className="btn-guest btn-guest-student">
                <Compass size={16} /><span>{user.rol === 'profesor' ? 'Ir a Mi Consola' : 'Ir a Mi Mapa 2D'}</span>
              </Link>
            )}

            {!esPanelEstudiante && (
              <div className="user-profile-badge">
                
                {/* 💡 AQUÍ SE MUESTRA LA FOTO DE PERFIL EN TIEMPO REAL */}
                <div className="avatar-circle">
                  {user.rol === 'estudiante' ? (
                    <AvatarEstudiante avatar={user.avatar} size={34} />
                  ) : user.avatar ? (
                    <img src={user.avatar} alt="Perfil" className="avatar-img" />
                  ) : (
                    <Shield size={16} />
                  )}
                </div>

                <div className="user-info">
                  <span className="user-name">{user.nombre}</span>
                  <span className="user-role">
                    {user.rol === 'profesor' ? '🧙‍♂️ Game Master' : `🛡️ Nivel ${user.nivel || 1} • ${user.clase_rpg || 'Guerrero'}`}
                  </span>
                </div>
              </div>
            )}

            <BotonHud onClick={handleCerrarSesion} tono="rojo">
              <LogOut size={15} /><span>Salir</span>
            </BotonHud>
          </div>
        ) : (
          <div className="header-actions-guest">
            <Link to="/estudiante" className="btn-guest btn-guest-student">⚔️ Entrar al Gremio</Link>
            <Link to="/profesor" className="btn-guest btn-guest-teacher">🧙‍♂️ Game Master</Link>
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

/**
 * El panel del estudiante integra la runa musical dentro del HUD.
 * En el resto de páginas se conserva el reproductor flotante clásico.
 */
const AudioGlobal = () => {
  const { pathname } = useLocation();
  if (pathname === '/panel-estudiante') return null;
  return <AudioControls />;
};

export default function App() {
  return (
    <AuthProvider>
      <AudioProvider>
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
            <AudioGlobal />
          </div>
        </BrowserRouter>
      </AudioProvider>
    </AuthProvider>
  );
}