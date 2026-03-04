import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage
  useEffect(() => {
    const token = localStorage.getItem('adventiq_token');
    if (!token) { setLoading(false); return; }

    authApi.me()
      .then(res => {
        setUser(res.data.user);
        setProfile(res.data.profile);
      })
      .catch(() => {
        localStorage.removeItem('adventiq_token');
        localStorage.removeItem('adventiq_user');
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async ({ email, password }) => {
    const res = await authApi.login({ email, password });
    const { token, user: u } = res.data;
    localStorage.setItem('adventiq_token', token);
    setUser(u);
    // Fetch full profile
    const me = await authApi.me();
    setProfile(me.data.profile);
    return u;
  }, []);

  const register = useCallback(async (formData) => {
    const res = await authApi.register(formData);
    const { token, user: u } = res.data;
    localStorage.setItem('adventiq_token', token);
    setUser(u);
    const me = await authApi.me();
    setProfile(me.data.profile);
    return u;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('adventiq_token');
    setUser(null);
    setProfile(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    const res = await authApi.me();
    setUser(res.data.user);
    setProfile(res.data.profile);
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, register, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
