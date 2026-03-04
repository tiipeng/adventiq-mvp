import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../utils/api';
import { MOCK_USERS, MOCK_EXPERTS, MOCK_LABS } from '../utils/mockData';

const AuthContext = createContext(null);

function mockError(msg) {
  return Object.assign(new Error(msg), { response: { data: { error: msg } } });
}

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
        if (res?.data?.user) {
          setUser(res.data.user);
          setProfile(res.data.profile);
        } else {
          // API returned HTML (Netlify) — restore from stored mock session
          const saved = localStorage.getItem('adventiq_user');
          if (saved) {
            try { const u = JSON.parse(saved); setUser(u); setProfile(u._profile ?? null); } catch {}
          } else {
            localStorage.removeItem('adventiq_token');
          }
        }
      })
      .catch(() => {
        const saved = localStorage.getItem('adventiq_user');
        if (saved) {
          try { const u = JSON.parse(saved); setUser(u); setProfile(u._profile ?? null); } catch {}
        } else {
          localStorage.removeItem('adventiq_token');
          localStorage.removeItem('adventiq_user');
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async ({ email, password }) => {
    try {
      const res = await authApi.login({ email, password });
      if (res?.data?.token && res?.data?.user) {
        const { token, user: u } = res.data;
        localStorage.setItem('adventiq_token', token);
        setUser(u);
        const me = await authApi.me();
        if (me?.data?.profile) setProfile(me.data.profile);
        return u;
      }
      // API returned non-JSON (HTML from Netlify) — fall through to mock
    } catch {
      // Network error or bad response — fall through to mock
    }

    // Mock auth fallback
    const mockUser = MOCK_USERS.find(u => u.email === email && u.password === password);
    if (!mockUser) throw mockError('Invalid email or password');
    const { password: _, ...u } = mockUser;
    let p = null;
    if (u.role === 'expert') p = MOCK_EXPERTS.find(e => e.user_id === u.id) ?? null;
    if (u.role === 'lab')    p = MOCK_LABS.find(l => l.user_id === u.id) ?? null;
    localStorage.setItem('adventiq_token', 'mock-token');
    localStorage.setItem('adventiq_user', JSON.stringify({ ...u, _profile: p }));
    setUser(u);
    setProfile(p);
    return u;
  }, []);

  const register = useCallback(async (formData) => {
    try {
      const res = await authApi.register(formData);
      if (res?.data?.token && res?.data?.user) {
        const { token, user: u } = res.data;
        localStorage.setItem('adventiq_token', token);
        setUser(u);
        const me = await authApi.me();
        if (me?.data?.profile) setProfile(me.data.profile);
        return u;
      }
    } catch {}
    throw mockError('Registration is unavailable in demo mode. Please use one of the demo accounts on the login page.');
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('adventiq_token');
    localStorage.removeItem('adventiq_user');
    setUser(null);
    setProfile(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    try {
      const res = await authApi.me();
      if (res?.data?.user) {
        setUser(res.data.user);
        setProfile(res.data.profile);
      }
    } catch {}
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
