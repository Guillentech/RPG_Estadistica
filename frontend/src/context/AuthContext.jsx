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
      const res = await fetch(`${API_URL}/api/estudiantes/${user.id}/perfil`);
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

// 💡 NUEVO: Función para guardar el Avatar comprimido
const actualizarAvatar = (file) => {
  if (!user || !file) return;

  const reader = new FileReader();
  reader.onloadend = () => {
    const img = new Image();
    img.onload = () => {
      // Crear canvas para comprimir
      const canvas = document.createElement('canvas');
      const MAX_SIZE = 200; // tamaño para avatar es más que suficiente
      
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > MAX_SIZE) {
          height *= MAX_SIZE / width;
          width = MAX_SIZE;
        }
      } else {
        if (height > MAX_SIZE) {
          width *= MAX_SIZE / height;
          height = MAX_SIZE;
        }
      }

      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      // Convertir a JPG comprimido (no PNG)
      const avatarBase64Comprimido = canvas.toDataURL('image/jpeg', 0.7);

      const updatedUser = { ...user, avatar: avatarBase64Comprimido };
      setUser(updatedUser);
      
      try {
        localStorage.setItem('usuario_lms', JSON.stringify(updatedUser));
        
        // Ya no necesitas guardar 2 veces lo mismo
        // Si lo necesitas separado, guarda el comprimido
        if (user.rol === 'profesor') {
          localStorage.setItem('avatar_lms_profesor', avatarBase64Comprimido);
        }
      } catch (e) {
        console.error("Sigue excediendo la cuota", e);
        // Plan B: no guardes el avatar en localStorage, solo en memoria
        // o usa IndexedDB
      }
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
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
      try {
        localStorage.setItem('usuario_lms', JSON.stringify(nuevaSesion));
      } catch {
        // El avatar ya quedó guardado en SQLite; la sesión sigue disponible en memoria.
      }
      return { ok: true, avatar: nuevaSesion.avatar };
    } catch {
      return { ok: false, error: 'No se pudo conectar con el servidor para guardar el avatar.' };
    }
  };

  // Cierre de sesión seguro en cliente y servidor (Req. 19 y 20)
  const logout = async () => {
    try {
      if (user?.sessionToken) {
        await fetch(`${API_URL}/api/auth/logout`, {
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