import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
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

// Components
import ProtectedRoute from './components/ProtectedRoute';

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
          <span className="text-gray-500 text-sm">Loading AdventIQ…</span>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public */}
      <Route path="/"        element={<Landing />} />
      <Route path="/login"   element={user ? <Navigate to={getDashboard(user.role)} replace /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to={getDashboard(user.role)} replace /> : <Register />} />

      {/* Browse (public-ish) */}
      <Route path="/experts"          element={<ExpertsList />} />
      <Route path="/experts/:id"      element={<ExpertProfile />} />
      <Route path="/labs"             element={<LabsList />} />
      <Route path="/labs/calendar"    element={<LabCalendar />} />
      <Route path="/labs/:id"         element={<LabProfile />} />
      <Route path="/ai-recommend"     element={<AIRecommend />} />

      {/* Async consultation (public view, auth for booking) */}
      <Route path="/async/:id"        element={<AsyncConsultation />} />

      {/* Business flows */}
      <Route path="/dashboard/business" element={
        <ProtectedRoute role="business"><BusinessDashboard /></ProtectedRoute>
      } />
      <Route path="/problem-form" element={
        <ProtectedRoute role="business"><ProblemForm /></ProtectedRoute>
      } />
      <Route path="/book/:type/:id" element={
        <ProtectedRoute role="business"><BookingCalendar /></ProtectedRoute>
      } />
      <Route path="/payment" element={
        <ProtectedRoute role="business"><Payment /></ProtectedRoute>
      } />
      <Route path="/booking-confirmation/:id" element={
        <ProtectedRoute role="business"><BookingConfirmation /></ProtectedRoute>
      } />

      {/* Expert / Lab shared */}
      <Route path="/reports/:bookingId" element={
        <ProtectedRoute role={['expert', 'lab', 'business']}><Reports /></ProtectedRoute>
      } />

      {/* Role dashboards */}
      <Route path="/dashboard/expert" element={
        <ProtectedRoute role="expert"><ExpertDashboard /></ProtectedRoute>
      } />
      <Route path="/dashboard/lab" element={
        <ProtectedRoute role="lab"><LabDashboard /></ProtectedRoute>
      } />
      <Route path="/dashboard/admin" element={
        <ProtectedRoute role="admin"><AdminPanel /></ProtectedRoute>
      } />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
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
