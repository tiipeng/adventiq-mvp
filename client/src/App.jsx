import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import BusinessDashboard from './pages/BusinessDashboard';
import ExpertDashboard from './pages/ExpertDashboard';
import LabDashboard from './pages/LabDashboard';
import AdminPanel from './pages/AdminPanel';
import ExpertsList from './pages/ExpertsList';
import LabsList from './pages/LabsList';
import ExpertProfile from './pages/ExpertProfile';
import LabProfile from './pages/LabProfile';
import ProblemForm from './pages/ProblemForm';
import BookingCalendar from './pages/BookingCalendar';
import Payment from './pages/Payment';
import BookingConfirmation from './pages/BookingConfirmation';
import Reports from './pages/Reports';
import LabCalendar from './pages/LabCalendar';
import AsyncConsultation from './pages/AsyncConsultation';
import AIRecommend from './pages/AIRecommend';
import FastConsult from './pages/FastConsult';
import ConsultWorkspace from './pages/ConsultWorkspace';
import BookingCenter from './pages/BookingCenter';
import ProfileOverview from './pages/ProfileOverview';
import ProfileSettings from './pages/ProfileSettings';
import ProfileSecurity from './pages/ProfileSecurity';
import ProfileNotifications from './pages/ProfileNotifications';

import ProtectedRoute from './components/ProtectedRoute';
import CommandPalette from './components/CommandPalette';

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading AdventIQ...</div>;
  }

  return (
    <>
      <CommandPalette />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={user ? <Navigate to={getDashboard(user.role)} replace /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to={getDashboard(user.role)} replace /> : <Register />} />

        <Route path="/experts" element={<ExpertsList />} />
        <Route path="/experts/:id" element={<ExpertProfile />} />
        <Route path="/labs" element={<LabsList />} />
        <Route path="/labs/calendar" element={<LabCalendar />} />
        <Route path="/labs/:id" element={<LabProfile />} />
        <Route path="/ai-recommend" element={<AIRecommend />} />

        <Route path="/async/:id" element={<AsyncConsultation />} />
        <Route path="/fast-consult/:id" element={<FastConsult />} />
        <Route path="/consult/:id" element={<ConsultWorkspace />} />

        <Route path="/dashboard/business" element={<ProtectedRoute role="business"><BusinessDashboard /></ProtectedRoute>} />
        <Route path="/booking" element={<ProtectedRoute role="business"><BookingCenter /></ProtectedRoute>} />
        <Route path="/problem-form" element={<ProtectedRoute role="business"><ProblemForm /></ProtectedRoute>} />
        <Route path="/book/:type/:id" element={<ProtectedRoute role="business"><BookingCalendar /></ProtectedRoute>} />
        <Route path="/payment" element={<ProtectedRoute role="business"><Payment /></ProtectedRoute>} />
        <Route path="/booking-confirmation/:id" element={<ProtectedRoute role="business"><BookingConfirmation /></ProtectedRoute>} />

        <Route path="/reports" element={<ProtectedRoute role={['expert', 'lab', 'business']}><Reports /></ProtectedRoute>} />
        <Route path="/reports/:bookingId" element={<ProtectedRoute role={['expert', 'lab', 'business']}><Reports /></ProtectedRoute>} />

        <Route path="/dashboard/expert" element={<ProtectedRoute role="expert"><ExpertDashboard /></ProtectedRoute>} />
        <Route path="/dashboard/lab" element={<ProtectedRoute role="lab"><LabDashboard /></ProtectedRoute>} />
        <Route path="/dashboard/admin" element={<ProtectedRoute role="admin"><AdminPanel /></ProtectedRoute>} />

        <Route path="/profile" element={<ProtectedRoute role={['business', 'expert', 'lab', 'admin']}><ProfileOverview /></ProtectedRoute>} />
        <Route path="/profile/settings" element={<ProtectedRoute role={['business', 'expert', 'lab', 'admin']}><ProfileSettings /></ProtectedRoute>} />
        <Route path="/profile/security" element={<ProtectedRoute role={['business', 'expert', 'lab', 'admin']}><ProfileSecurity /></ProtectedRoute>} />
        <Route path="/profile/notifications" element={<ProtectedRoute role={['business', 'expert', 'lab', 'admin']}><ProfileNotifications /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

function getDashboard(role) {
  const map = { business: '/dashboard/business', expert: '/dashboard/expert', lab: '/dashboard/lab', admin: '/dashboard/admin' };
  return map[role] || '/';
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
