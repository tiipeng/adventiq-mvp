import React from 'react';
import { useAuth } from '../../context/AuthContext';
import LayoutSidebar from './Sidebar';
import Header from './Header';

export default function AppShell({ children }) {
  const { user } = useAuth();

  return (
    <div className="app-shell">
      {user ? (
        <div className="app-shell-content">
          <LayoutSidebar />
          <div className="app-main">
            <Header />
            {children}
          </div>
        </div>
      ) : (
        <>
          <Header />
          {children}
        </>
      )}
    </div>
  );
}
