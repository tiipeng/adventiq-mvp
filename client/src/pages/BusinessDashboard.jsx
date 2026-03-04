import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import BookingCard from '../components/BookingCard';
import { bookingsApi, asyncApi } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { MOCK_ASYNC, MOCK_BOOKINGS } from '../utils/mockData';

const TABS = ['Overview', 'Expert Bookings', 'Lab Bookings', 'Async', 'Reports'];

function StatCard({ label, value, sub }) {
  return (
    <div className="card p-4">
      <p className="text-sm text-[var(--text-muted)]">{label}</p>
      <p className="text-2xl font-semibold text-[var(--text-primary)] mt-1">{value}</p>
      {sub ? <p className="text-xs text-[var(--text-muted)] mt-1">{sub}</p> : null}
    </div>
  );
}

function AsyncCard({ item }) {
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-semibold text-[var(--text-primary)]">{item.expert_name}</p>
        <span className={item.status === 'answered' ? 'badge-green' : 'badge-yellow'}>{item.status}</span>
      </div>
      <p className="text-sm text-[var(--text-secondary)] mb-2">{item.question}</p>
      <p className="text-xs text-[var(--text-muted)]">
        {new Date(item.created_at).toLocaleDateString('en-DE')} · SLA {item.sla_hours}h · €{item.price}
      </p>
      {item.answer ? <p className="text-sm text-[var(--text-secondary)] mt-3">{item.answer}</p> : null}
    </div>
  );
}

export default function BusinessDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState('Overview');
  const [bookings, setBookings] = useState([]);
  const [asyncQs, setAsyncQs] = useState([]);
  const [loadingB, setLoadingB] = useState(true);
  const [loadingA, setLoadingA] = useState(true);

  useEffect(() => {
    bookingsApi.list()
      .then((response) => {
        const bookingsList = response?.data ?? MOCK_BOOKINGS;
        setBookings(Array.isArray(bookingsList) ? bookingsList : MOCK_BOOKINGS);
      })
      .catch(() => setBookings(MOCK_BOOKINGS))
      .finally(() => setLoadingB(false));

    asyncApi.list()
      .then((response) => {
        const asyncList = response?.data ?? MOCK_ASYNC;
        setAsyncQs(Array.isArray(asyncList) ? asyncList : MOCK_ASYNC);
      })
      .catch(() => setAsyncQs(MOCK_ASYNC))
      .finally(() => setLoadingA(false));
  }, []);

  async function handleStatusChange(bookingId, status) {
    try {
      await bookingsApi.updateStatus(bookingId, status);
      setBookings((prev) => prev.map((booking) => (booking.id === bookingId ? { ...booking, status } : booking)));
    } catch {
      setBookings((prev) => prev.map((booking) => (booking.id === bookingId ? { ...booking, status } : booking)));
    }
  }

  const expertBookings = useMemo(() => bookings.filter((b) => b.provider_type === 'expert'), [bookings]);
  const labBookings = useMemo(() => bookings.filter((b) => b.provider_type === 'lab'), [bookings]);

  const pending = bookings.filter((b) => b.status === 'pending').length;
  const confirmed = bookings.filter((b) => b.status === 'confirmed').length;
  const completed = bookings.filter((b) => b.status === 'completed').length;
  const spend = bookings
    .filter((b) => ['confirmed', 'completed'].includes(b.status))
    .reduce((sum, booking) => sum + (booking.total_price || 0), 0);

  return (
    <div className="flex min-h-screen bg-[var(--bg-base)]">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <Navbar />

        <main className="container-app py-8">
          <h1 className="mb-1">Business Dashboard</h1>
          <p className="text-[var(--text-muted)] mb-6">Welcome back, {user?.name?.split(' ')[0] || 'Business User'}.</p>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            <StatCard label="Total bookings" value={bookings.length} />
            <StatCard label="Pending" value={pending} />
            <StatCard label="Confirmed" value={confirmed} />
            <StatCard label="Total spend" value={`€${spend}`} sub={`${completed} completed`} />
          </div>

          <div className="tabs-underline mb-6">
            {TABS.map((item) => (
              <button key={item} onClick={() => setTab(item)} className={`tab-item ${tab === item ? 'active' : ''}`}>
                {item}
              </button>
            ))}
          </div>

          {tab === 'Overview' && (
            <div className="space-y-3">
              <div className="flex gap-2">
                <Link to="/problem-form" className="btn-primary">Find Expert or Lab</Link>
                <Link to="/ai-recommend" className="btn-secondary">AI Expert Finder</Link>
              </div>
              {loadingB ? <p className="text-sm text-[var(--text-muted)]">Loading bookings...</p> : null}
              {(bookings ?? []).map((booking) => (
                <BookingCard key={booking.id} booking={booking} actorRole="business" showActions onStatusChange={handleStatusChange} />
              ))}
            </div>
          )}

          {tab === 'Expert Bookings' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-[var(--text-muted)]">{expertBookings.length} expert bookings</p>
                <Link to="/experts" className="btn-secondary">Browse Experts</Link>
              </div>
              {(expertBookings ?? []).map((booking) => (
                <BookingCard key={booking.id} booking={booking} actorRole="business" showActions onStatusChange={handleStatusChange} />
              ))}
            </div>
          )}

          {tab === 'Lab Bookings' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-[var(--text-muted)]">{labBookings.length} lab bookings</p>
                <Link to="/labs" className="btn-secondary">Browse Labs</Link>
              </div>
              {(labBookings ?? []).map((booking) => (
                <BookingCard key={booking.id} booking={booking} actorRole="business" showActions onStatusChange={handleStatusChange} />
              ))}
            </div>
          )}

          {tab === 'Async' && (
            <div className="space-y-3">
              {loadingA ? <p className="text-sm text-[var(--text-muted)]">Loading async consultations...</p> : null}
              {(asyncQs ?? []).map((item) => <AsyncCard key={item.id} item={item} />)}
            </div>
          )}

          {tab === 'Reports' && (
            <div className="card p-5">
              <p className="text-[var(--text-primary)] font-medium mb-2">Reports</p>
              <p className="text-sm text-[var(--text-muted)] mb-4">Reports are available as a secondary dashboard area.</p>
              <Link to="/reports" className="btn-secondary">Open Reports</Link>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
