import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const dashMap = useMemo(() => ({
    business: '/dashboard/business',
    expert: '/dashboard/expert',
    lab: '/dashboard/lab',
    admin: '/dashboard/admin',
  }), []);

  function handleLogout() {
    logout();
    setMobileOpen(false);
    navigate('/');
  }

  return (
    <nav className="h-16 bg-white border-b border-[var(--border)] sticky top-0 z-50">
      <div className="container-app h-full">
        <div className="h-full grid grid-cols-[auto_1fr_auto] items-center gap-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-[10px] bg-[var(--accent)] text-white flex items-center justify-center text-xs font-semibold">AQ</div>
            <span className="text-[var(--text-primary)] font-semibold text-base">AdventIQ</span>
          </Link>

          <div className="hidden md:flex items-center justify-center gap-6 text-sm text-[var(--text-secondary)]">
            <Link to="/experts" className="hover:text-[var(--accent)]">Experts</Link>
            <Link to="/labs" className="hover:text-[var(--accent)]">Labs</Link>
            <Link to="/ai-recommend" className="hover:text-[var(--accent)]">AI Expert Finder</Link>
          </div>

          <div className="flex items-center justify-end gap-2">
            <button
              className="md:hidden btn-ghost px-2"
              onClick={() => setMobileOpen(v => !v)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? 'Close' : 'Menu'}
            </button>

            {user ? (
              <div className="hidden md:flex items-center gap-2">
                <Link to={dashMap[user.role] || '/'} className="btn-secondary text-sm">Dashboard</Link>
                <button onClick={handleLogout} className="btn-ghost text-sm">Sign out</button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link to="/login" className="btn-secondary text-sm">Sign in</Link>
                <Link to="/register" className="btn-primary text-sm">Get Started</Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-[var(--border)] bg-white">
          <div className="container-app py-3 flex flex-col gap-1 text-sm text-[var(--text-secondary)]">
            <Link to="/experts" onClick={() => setMobileOpen(false)} className="py-2">Experts</Link>
            <Link to="/labs" onClick={() => setMobileOpen(false)} className="py-2">Labs</Link>
            <Link to="/ai-recommend" onClick={() => setMobileOpen(false)} className="py-2">AI Expert Finder</Link>
            <div className="pt-2 mt-2 border-t border-[var(--border)] flex gap-2">
              {user ? (
                <>
                  <Link to={dashMap[user.role] || '/'} onClick={() => setMobileOpen(false)} className="btn-secondary flex-1">Dashboard</Link>
                  <button onClick={handleLogout} className="btn-ghost flex-1">Sign out</button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="btn-secondary flex-1">Sign in</Link>
                  <Link to="/register" onClick={() => setMobileOpen(false)} className="btn-primary flex-1">Get Started</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
