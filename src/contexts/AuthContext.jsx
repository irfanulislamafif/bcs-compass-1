import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  authApi,
  setAuth,
  clearAuth,
  getStoredUser,
  getAccessToken,
} from '../lib/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser());
  const [booting, setBooting] = useState(true);

  /* On first load, if we have a token, verify it with /me */
  useEffect(() => {
    let alive = true;
    async function verify() {
      if (!getAccessToken()) {
        if (alive) setBooting(false);
        return;
      }
      try {
        const data = await authApi.me();
        if (alive) setUser(data.user);
      } catch {
        clearAuth();
        if (alive) setUser(null);
      } finally {
        if (alive) setBooting(false);
      }
    }
    verify();
    return () => {
      alive = false;
    };
  }, []);

  const login = useCallback(async ({ email, password }) => {
    const data = await authApi.login({ email, password });
    setAuth({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      user: data.user,
    });
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async ({ name, email, password, targetExam }) => {
    const data = await authApi.register({
      name,
      email,
      password,
      targetExam,
    });
    setAuth({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      user: data.user,
    });
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    clearAuth();
    setUser(null);
  }, []);

  const value = {
    user,
    isAuthenticated: !!user,
    booting,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}