import React, { useMemo, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const dashMap = useMemo(() => ({
    business: '/dashboard/business',
    expert: '/dashboard/expert',
    lab: '/dashboard/lab',
    admin: '/dashboard/admin',
  }), []);

  const primaryAction = useMemo(() => {
    if (!user) return null;
    if (user.role === 'business') return { to: '/booking', label: 'New Booking' };
    if (user.role === 'expert' || user.role === 'lab') return { to: '/reports', label: 'Open Reports' };
    if (user.role === 'admin') return { to: '/dashboard/admin', label: 'Admin Panel' };
    return { to: dashMap[user.role] || '/', label: 'Dashboard' };
  }, [user, dashMap]);

  function handleLogout() {
    logout();
    setMobileOpen(false);
    navigate('/');
  }

  return (
    <header className="sticky top-0 z-40 h-16 border-b border-[var(--border)] bg-[rgba(8,13,23,0.72)] backdrop-blur-xl">
      <div className="container-app h-full">
        <div className="grid h-full grid-cols-[auto_1fr_auto] items-center gap-4">
          <Link to="/" className="flex items-center">
            <span className="text-[15px] font-semibold tracking-[-0.01em] text-[var(--text-primary)]">AdventIQ</span>
          </Link>

          <div className="hidden items-center justify-center gap-2 text-sm md:flex">
            <NavLink to="/experts" className={({ isActive }) => `app-nav-link ${isActive ? 'active' : ''}`}>Experts</NavLink>
            <NavLink to="/labs" className={({ isActive }) => `app-nav-link ${isActive ? 'active' : ''}`}>Labs</NavLink>
            <NavLink to="/ai-recommend" className={({ isActive }) => `app-nav-link ${isActive ? 'active' : ''}`}>AI Finder</NavLink>
          </div>

          <div className="flex items-center justify-end gap-2">
            <button
              className="hidden border border-[var(--border)] px-3 text-xs lg:inline-flex btn-ghost"
              type="button"
              aria-label="Open command palette"
              onClick={() => window.dispatchEvent(new Event('open-command-palette'))}
            >
              Cmd/Ctrl + K
            </button>
            <button
              className="btn-ghost border border-[var(--border)] px-2 md:hidden"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? 'Close' : 'Menu'}
            </button>

            {user ? (
              <div className="hidden items-center gap-2 md:flex">
                {primaryAction ? <Link to={primaryAction.to} className="btn-primary">{primaryAction.label}</Link> : null}
                <Link to={dashMap[user.role] || '/'} className="btn-secondary">Dashboard</Link>
                <Link to="/profile" className="btn-secondary">Profile</Link>
                <button onClick={handleLogout} className="btn-ghost">Sign out</button>
              </div>
            ) : (
              <div className="hidden items-center gap-2 md:flex">
                <Link to="/login" className="btn-secondary">Sign in</Link>
                <Link to="/register" className="btn-primary">Get Started</Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {mobileOpen ? (
        <div className="border-t border-[var(--border)] bg-[rgba(11,17,30,0.96)] backdrop-blur-xl md:hidden">
          <div className="container-app flex flex-col gap-1 py-3 text-sm text-[var(--text-secondary)]">
            <Link to="/experts" onClick={() => setMobileOpen(false)} className="rounded-[10px] px-2 py-2 hover:bg-[var(--bg-subtle)]">Experts</Link>
            <Link to="/labs" onClick={() => setMobileOpen(false)} className="rounded-[10px] px-2 py-2 hover:bg-[var(--bg-subtle)]">Labs</Link>
            <Link to="/ai-recommend" onClick={() => setMobileOpen(false)} className="rounded-[10px] px-2 py-2 hover:bg-[var(--bg-subtle)]">AI Finder</Link>
            <div className="mt-2 flex gap-2 border-t border-[var(--border)] pt-2">
              {user ? (
                <>
                  {primaryAction ? <Link to={primaryAction.to} onClick={() => setMobileOpen(false)} className="btn-primary flex-1">{primaryAction.label}</Link> : null}
                  <Link to={dashMap[user.role] || '/'} onClick={() => setMobileOpen(false)} className="btn-secondary flex-1">Dashboard</Link>
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
      ) : null}
    </header>
  );
}
