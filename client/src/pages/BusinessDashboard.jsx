import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import BookingCard from '../components/BookingCard';
import { bookingsApi } from '../utils/api';
import { useAuth } from '../context/AuthContext';

function StatCard({ icon, label, value, sub, color = 'blue' }) {
  const colors = { blue: 'bg-blue-50 text-blue-600', green: 'bg-green-50 text-green-600', yellow: 'bg-yellow-50 text-yellow-600', purple: 'bg-purple-50 text-purple-600' };
  return (
    <div className="card p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${colors[color]}`}>{icon}</div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
        {sub && <p className="text-xs text-gray-400">{sub}</p>}
      </div>
    </div>
  );
}

export default function BusinessDashboard() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    bookingsApi.list().then(r => setBookings(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  async function handleStatusChange(bookingId, status) {
    try {
      await bookingsApi.updateStatus(bookingId, status);
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status } : b));
    } catch (e) {
      alert(e.response?.data?.error || 'Failed to update booking');
    }
  }

  const pending   = bookings.filter(b => b.status === 'pending').length;
  const confirmed = bookings.filter(b => b.status === 'confirmed').length;
  const completed = bookings.filter(b => b.status === 'completed').length;
  const totalSpend = bookings.filter(b => ['confirmed','completed'].includes(b.status)).reduce((s,b) => s + (b.total_price || 0), 0);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 p-6 max-w-5xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
            <p className="text-gray-500 mt-1">Here's an overview of your AdventIQ bookings.</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard icon="📋" label="Total bookings"   value={bookings.length} color="blue" />
            <StatCard icon="⏳" label="Pending"          value={pending}         color="yellow" />
            <StatCard icon="✅" label="Confirmed"        value={confirmed}       color="green" />
            <StatCard icon="💶" label="Total spend"      value={`€${totalSpend}`} sub={`${completed} completed`} color="purple" />
          </div>

          {/* Quick actions */}
          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            <Link to="/problem-form" className="card p-6 hover:shadow-md transition-shadow group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center text-2xl group-hover:bg-primary-600 group-hover:text-white transition-colors">🔍</div>
                <div>
                  <p className="font-semibold text-gray-900">Find Expert or Lab</p>
                  <p className="text-sm text-gray-500">Describe your problem — we'll suggest the best match</p>
                </div>
                <span className="ml-auto text-gray-300 group-hover:text-primary-600 transition-colors">→</span>
              </div>
            </Link>
            <Link to="/experts" className="card p-6 hover:shadow-md transition-shadow group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-2xl group-hover:bg-green-600 group-hover:text-white transition-colors">👤</div>
                <div>
                  <p className="font-semibold text-gray-900">Browse All Experts</p>
                  <p className="text-sm text-gray-500">Filter by expertise, price, and location</p>
                </div>
                <span className="ml-auto text-gray-300 group-hover:text-green-600 transition-colors">→</span>
              </div>
            </Link>
          </div>

          {/* Bookings */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Your bookings</h2>
            {loading ? (
              <div className="text-center py-12 text-gray-400">Loading bookings…</div>
            ) : bookings.length === 0 ? (
              <div className="card p-12 text-center">
                <p className="text-4xl mb-3">📭</p>
                <p className="text-gray-500 mb-4">No bookings yet.</p>
                <Link to="/problem-form" className="btn-primary">Find your first expert →</Link>
              </div>
            ) : (
              <div className="space-y-3">
                {bookings.map(b => (
                  <BookingCard
                    key={b.id}
                    booking={b}
                    actorRole="business"
                    showActions
                    onStatusChange={handleStatusChange}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
