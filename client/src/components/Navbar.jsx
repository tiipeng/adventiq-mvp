import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const dashMap = {
    business: '/dashboard/business',
    expert: '/dashboard/expert',
    lab: '/dashboard/lab',
    admin: '/dashboard/admin',
  };

  function handleLogout() {
    logout();
    navigate('/');
  }

  const roleColors = {
    business: 'bg-blue-100 text-blue-700',
    expert: 'bg-purple-100 text-purple-700',
    lab: 'bg-green-100 text-green-700',
    admin: 'bg-orange-100 text-orange-700',
  };

  function closeAll() {
    setOpen(false);
    setMobileOpen(false);
  }

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">AQ</span>
            </div>
            <span className="font-bold text-gray-900 text-lg">AdventIQ</span>
          </Link>

          {/* Center links — desktop */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/experts"       className="text-sm text-gray-600 hover:text-primary-600 transition-colors">Expert Consultants</Link>
            <Link to="/labs"          className="text-sm text-gray-600 hover:text-primary-600 transition-colors">Lab Rentals</Link>
            <Link to="/labs/calendar" className="text-sm text-gray-600 hover:text-primary-600 transition-colors">Lab Calendar</Link>
            <Link to="/ai-recommend"  className="text-sm text-gray-600 hover:text-primary-600 transition-colors">AI Matching</Link>
          </div>

          {/* Right */}
          <div className="flex items-center gap-2">
            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
              </svg>
            </button>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setOpen(!open)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-7 h-7 bg-primary-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-semibold">{user.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-800 hidden sm:block">{user.name.split(' ')[0]}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium hidden sm:block ${roleColors[user.role] || 'bg-gray-100 text-gray-600'}`}>
                    {user.role}
                  </span>
                  <svg className="w-4 h-4 text-gray-400 hidden sm:block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {open && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl border border-gray-200 shadow-lg py-1 z-50">
                    <Link to={dashMap[user.role] || '/'} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={closeAll}>
                      Dashboard
                    </Link>
                    {user.role === 'business' && (
                      <>
                        <Link to="/problem-form" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={closeAll}>
                          Find Expert / Lab
                        </Link>
                        <Link to="/ai-recommend" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={closeAll}>
                          🤖 AI Matching
                        </Link>
                      </>
                    )}
                    <div className="border-t border-gray-100 my-1" />
                    <button onClick={() => { handleLogout(); closeAll(); }} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link to="/login" className="btn-secondary text-sm">Sign in</Link>
                <Link to="/register" className="btn-primary text-sm">Get started</Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white py-3 px-4 space-y-1 z-40">
          <Link to="/experts"       className="block py-2 text-sm text-gray-700 hover:text-primary-600" onClick={closeAll}>Expert Consultants</Link>
          <Link to="/labs"          className="block py-2 text-sm text-gray-700 hover:text-primary-600" onClick={closeAll}>Lab Rentals</Link>
          <Link to="/labs/calendar" className="block py-2 text-sm text-gray-700 hover:text-primary-600" onClick={closeAll}>Lab Calendar</Link>
          <Link to="/ai-recommend"  className="block py-2 text-sm text-gray-700 hover:text-primary-600" onClick={closeAll}>AI Matching</Link>
          {!user && (
            <div className="flex gap-2 pt-3 border-t border-gray-100">
              <Link to="/login"    className="btn-secondary text-sm flex-1 justify-center" onClick={closeAll}>Sign in</Link>
              <Link to="/register" className="btn-primary  text-sm flex-1 justify-center" onClick={closeAll}>Get started</Link>
            </div>
          )}
        </div>
      )}

      {/* Click outside to close */}
      {(open || mobileOpen) && <div className="fixed inset-0 z-40" onClick={closeAll} />}
    </nav>
  );
}
