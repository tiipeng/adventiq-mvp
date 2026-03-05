import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function SidebarLink({ to, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => `group flex items-center gap-2 rounded-[10px] px-3 py-2 text-sm transition-all ${
        isActive
          ? 'bg-[var(--accent-light)] text-[var(--text-primary)] border border-[var(--border-strong)] font-semibold shadow-[var(--shadow-1)]'
          : 'text-[var(--text-secondary)] hover:bg-[rgba(25,37,58,0.75)] hover:text-[var(--text-primary)] hover:border hover:border-[var(--border)]'
      }`}
    >
      <span>{label}</span>
    </NavLink>
  );
}

const navItems = {
  business: [
    {
      section: 'Workspace',
      items: [
        { to: '/dashboard/business', label: 'Overview' },
        { to: '/booking', label: 'Bookings' },
        { to: '/reports', label: 'Reports' },
      ],
    },
    {
      section: 'Discover',
      items: [
        { to: '/experts', label: 'Experts' },
        { to: '/labs', label: 'Labs' },
        { to: '/ai-recommend', label: 'AI Finder' },
      ],
    },
    {
      section: 'Account',
      items: [{ to: '/profile', label: 'Profile' }],
    },
  ],
  expert: [
    {
      section: 'Workspace',
      items: [
        { to: '/dashboard/expert', label: 'Overview' },
        { to: '/reports', label: 'Reports' },
      ],
    },
    {
      section: 'Account',
      items: [{ to: '/profile', label: 'Profile' }],
    },
  ],
  lab: [
    {
      section: 'Workspace',
      items: [
        { to: '/dashboard/lab', label: 'Overview' },
        { to: '/reports', label: 'Reports' },
      ],
    },
    {
      section: 'Account',
      items: [{ to: '/profile', label: 'Profile' }],
    },
  ],
  admin: [
    {
      section: 'Workspace',
      items: [{ to: '/dashboard/admin', label: 'Admin Panel' }],
    },
    {
      section: 'Account',
      items: [{ to: '/profile', label: 'Profile' }],
    },
  ],
};

export default function LayoutSidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  return (
    <aside className="hidden w-[272px] shrink-0 border-r border-[var(--border)] bg-[rgba(8,13,23,0.68)] backdrop-blur-xl lg:flex lg:flex-col">
      <div className="border-b border-[var(--border)] px-5 py-5">
        <div className="mb-2 flex items-center">
          <p className="text-sm font-semibold tracking-[-0.01em] text-[var(--text-primary)]">AdventIQ</p>
        </div>
        <p className="text-xs capitalize text-[var(--text-muted)]">{user.role} workspace</p>
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto p-4">
        {(navItems[user.role] ?? []).map((group) => (
          <div key={group.section}>
            <p className="mb-1 px-2 text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--text-muted)]">{group.section}</p>
            <div className="space-y-1">
              {group.items.map((item) => (
                <SidebarLink key={item.to} {...item} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-[var(--border)] p-4">
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
