import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function SidebarLink({ to, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => `block px-3 py-2 rounded-[10px] text-sm transition-colors ${
        isActive ? 'bg-[var(--accent-light)] text-[var(--accent)] font-medium' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]'
      }`}
    >
      {label}
    </NavLink>
  );
}

const navItems = {
  business: [
    { to: '/dashboard/business', label: 'Overview' },
    { to: '/problem-form', label: 'Find Experts & Labs' },
    { to: '/reports', label: 'Reports' },
  ],
  expert: [
    { to: '/dashboard/expert', label: 'Overview' },
    { to: '/reports', label: 'Reports' },
  ],
  lab: [
    { to: '/dashboard/lab', label: 'Overview' },
    { to: '/reports', label: 'Reports' },
  ],
  admin: [
    { to: '/dashboard/admin', label: 'Admin Panel' },
  ],
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  return (
    <aside className="w-60 bg-white border-r border-[var(--border)] min-h-screen hidden lg:flex flex-col">
      <div className="px-4 py-5 border-b border-[var(--border)]">
        <p className="text-[var(--text-primary)] font-semibold">AdventIQ</p>
        <p className="text-xs text-[var(--text-muted)] capitalize">{user.role} workspace</p>
      </div>

      <nav className="p-3 space-y-1 flex-1">
        {(navItems[user.role] ?? []).map((item) => <SidebarLink key={item.to} {...item} />)}
      </nav>

      <div className="p-3 border-t border-[var(--border)]">
        <button
          onClick={() => {
            logout();
            navigate('/');
          }}
          className="btn-ghost w-full"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
