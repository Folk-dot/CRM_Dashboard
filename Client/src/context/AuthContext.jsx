import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/index.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount, verify token still valid and fetch current user
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { setLoading(false); return; }

    authService.me()
      .then((res) => setUser(res.data))
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await authService.login({ email, password });
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
