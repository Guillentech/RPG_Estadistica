import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const sesionGuardada = localStorage.getItem('usuario_lms');
    return sesionGuardada ? JSON.parse(sesionGuardada) : null;
  });

  const loginProfesor = (profesorData) => {
    const session = { ...profesorData, rol: 'profesor' };
    setUser(session);
    localStorage.setItem('usuario_lms', JSON.stringify(session));
  };

  const loginEstudiante = (estudianteData) => {
    const session = { ...estudianteData, rol: 'estudiante' };
    setUser(session);
    localStorage.setItem('usuario_lms', JSON.stringify(session));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('usuario_lms');
  };

  return (
    <AuthContext.Provider value={{ user, loginProfesor, loginEstudiante, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);