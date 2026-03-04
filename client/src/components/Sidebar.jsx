import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function SidebarLink({ to, icon, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
          isActive
            ? 'bg-primary-50 text-primary-700'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        }`
      }
    >
      <span className="text-lg">{icon}</span>
      {label}
    </NavLink>
  );
}

const navItems = {
  business: [
    { to: '/dashboard/business', icon: '📊', label: 'Overview' },
    { to: '/problem-form',        icon: '🔍', label: 'Find Expert / Lab' },
    { to: '/experts',             icon: '👤', label: 'Browse Experts' },
    { to: '/labs',                icon: '🔬', label: 'Browse Labs' },
  ],
  expert: [
    { to: '/dashboard/expert', icon: '📊', label: 'Overview' },
  ],
  lab: [
    { to: '/dashboard/lab', icon: '📊', label: 'Overview' },
  ],
  admin: [
    { to: '/dashboard/admin', icon: '⚙️', label: 'Admin Panel' },
    { to: '/experts',         icon: '👤', label: 'All Experts' },
    { to: '/labs',            icon: '🔬', label: 'All Labs' },
  ],
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const items = navItems[user.role] || [];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col min-h-screen">
      {/* Brand */}
      <div className="px-4 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">AQ</span>
          </div>
          <span className="font-bold text-gray-900">AdventIQ</span>
        </div>
        <p className="text-xs text-gray-400 mt-1 ml-10">We enable the Fast Forward.</p>
      </div>

      {/* User info */}
      <div className="px-4 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm font-semibold">{user.name.charAt(0).toUpperCase()}</span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
            <p className="text-xs text-gray-500 capitalize">{user.role}</p>
          </div>
        </div>
        {user.status === 'pending' && (
          <div className="mt-2 px-2 py-1.5 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs text-yellow-700">⏳ Account pending approval</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {items.map(item => (
          <SidebarLink key={item.to} {...item} />
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-gray-100">
        <button
          onClick={() => { logout(); navigate('/'); }}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors w-full"
        >
          <span className="text-lg">🚪</span>
          Sign out
        </button>
      </div>
    </aside>
  );
}
