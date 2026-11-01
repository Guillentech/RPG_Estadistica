import React, { createContext, useContext, useState, useCallback } from 'react';
import { API_URL } from '../config';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const sesionGuardada = localStorage.getItem('usuario_lms');
      return sesionGuardada ? JSON.parse(sesionGuardada) : null;
    } catch {
      return null;
    }
  });

  const loginProfesor = (profesorData) => {
    // 💡 Recupera la foto si ya la había guardado antes localmente
    const avatarGuardado = localStorage.getItem('avatar_lms_profesor');
    const session = { ...profesorData, rol: 'profesor', avatar: avatarGuardado };
    setUser(session);
    localStorage.setItem('usuario_lms', JSON.stringify(session));
  };

  const loginEstudiante = (estudianteData) => {
    const session = { ...estudianteData, rol: 'estudiante' };
    setUser(session);
    localStorage.setItem('usuario_lms', JSON.stringify(session));
  };

  // Permite actualizar XP, Nivel y HP del estudiante en tiempo real tras derrotar a un Jefe
  const refrescarEstudiante = useCallback(async () => {
    if (!user || user.rol !== 'estudiante' || !user.id) return;
    try {
      const res = await fetch(`http://localhost:4000/api/estudiantes/${user.id}/perfil`);
      if (res.ok) {
        const actualizado = await res.json();
        const nuevaSesion = { ...user, ...actualizado, rol: 'estudiante' };
        setUser(nuevaSesion);
        localStorage.setItem('usuario_lms', JSON.stringify(nuevaSesion));
      }
    } catch {
      // Silencioso si el servidor no responde momentáneamente
    }
  }, [user]);

  // 💡 NUEVO: Función para guardar el Avatar (Foto de perfil) en tiempo real
  const actualizarAvatar = (avatarBase64) => {
    if (user) {
      const updatedUser = { ...user, avatar: avatarBase64 };
      setUser(updatedUser);
      localStorage.setItem('usuario_lms', JSON.stringify(updatedUser));
      // Guardarlo de forma permanente para el profesor
      if (user.rol === 'profesor') {
        localStorage.setItem('avatar_lms_profesor', avatarBase64);
      }
    }
  };

  // 🛡️ Avatar del estudiante: persiste en SQLite para sobrevivir al cierre de sesión.
  const actualizarAvatarEstudiante = async (avatar) => {
    if (!user?.id || user.rol !== 'estudiante') {
      return { ok: false, error: 'Debes iniciar sesión como héroe para cambiar tu avatar.' };
    }
    try {
      const res = await fetch(`${API_URL}/api/estudiantes/${user.id}/avatar`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        return { ok: false, error: data.error || 'No se pudo guardar el avatar.' };
      }
      const nuevaSesion = { ...user, avatar: data.avatar ?? avatar };
      setUser(nuevaSesion);
      localStorage.setItem('usuario_lms', JSON.stringify(nuevaSesion));
      return { ok: true, avatar: nuevaSesion.avatar };
    } catch {
      return { ok: false, error: 'No se pudo conectar con el servidor para guardar el avatar.' };
    }
  };

  // Cierre de sesión seguro en cliente y servidor (Req. 19 y 20)
  const logout = async () => {
    try {
      if (user?.sessionToken) {
        await fetch('http://localhost:4000/api/auth/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: user.sessionToken })
        });
      }
    } catch {
      // Continúa limpiando la sesión local aunque el servidor esté apagado
    } finally {
      setUser(null);
      localStorage.removeItem('usuario_lms');
    }
  };

  return (
    // 💡 Asegúrate de incluir actualizarAvatar en el value del Provider
    <AuthContext.Provider value={{ user, loginProfesor, loginEstudiante, refrescarEstudiante, actualizarAvatar, actualizarAvatarEstudiante, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);