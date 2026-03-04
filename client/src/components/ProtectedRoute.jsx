import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const allowed = Array.isArray(role) ? role : [role];
  if (!allowed.includes(user.role)) {
    const dashMap = { business: '/dashboard/business', expert: '/dashboard/expert', lab: '/dashboard/lab', admin: '/dashboard/admin' };
    return <Navigate to={dashMap[user.role] || '/'} replace />;
  }

  return children;
}
