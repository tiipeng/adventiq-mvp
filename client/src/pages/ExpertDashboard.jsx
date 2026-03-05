import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import BookingCard from '../components/BookingCard';
import { bookingsApi, expertsApi, asyncApi } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { MOCK_ASYNC, MOCK_BOOKINGS } from '../utils/mockData';

const TABS = ['Overview', 'Bookings', 'Async', 'Profile', 'Availability'];

function StatCard({ label, value }) {
  return (
    <div className="card p-4">
      <p className="text-sm text-[var(--text-muted)]">{label}</p>
      <p className="text-2xl font-semibold text-[var(--text-primary)] mt-1">{value}</p>
    </div>
  );
}

function AsyncAnswerCard({ item, onAnswered }) {
  const [answer, setAnswer] = useState(item.ai_draft || item.answer || '');

  async function submitAnswer() {
    if (!answer.trim()) return;
    try {
      await asyncApi.answer(item.id, answer);
      onAnswered(item.id, answer);
    } catch {
      onAnswered(item.id, answer);
    }
  }

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-semibold text-[var(--text-primary)]">{item.expert_name || 'Async consultation'}</p>
        <span className={item.status === 'answered' ? 'badge-green' : 'badge-yellow'}>{item.status}</span>
      </div>
      <p className="text-sm text-[var(--text-secondary)] mb-2">{item.question}</p>
      <p className="text-xs text-[var(--text-muted)] mb-3">SLA {item.sla_hours}h · {new Date(item.created_at).toLocaleDateString('en-DE')}</p>
      <textarea className="input" value={answer} onChange={(e) => setAnswer(e.target.value)} />
      <div className="mt-3 flex gap-2">
        <button className="btn-secondary" onClick={() => setAnswer(item.ai_draft || '')}>Reset Draft</button>
        <button className="btn-primary" onClick={submitAnswer}>Submit Answer</button>
      </div>
    </div>
  );
}

export default function ExpertDashboard() {
  const { user, profile, refreshProfile } = useAuth();
  const [tab, setTab] = useState('Overview');

  const [bookings, setBookings] = useState([]);
  const [asyncQs, setAsyncQs] = useState([]);
  const [loadingB, setLoadingB] = useState(true);
  const [loadingA, setLoadingA] = useState(true);

  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ bio: '', location: '', hourly_rate: '', expertise_tags: '' });
  const [bookingView, setBookingView] = useState('All');
  const [bookingQuery, setBookingQuery] = useState('');

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

  useEffect(() => {
    setForm({
      bio: profile?.bio || '',
      location: profile?.location || '',
      hourly_rate: profile?.hourly_rate || '',
      expertise_tags: (profile?.expertise_tags || []).join(', '),
    });
  }, [profile]);

  async function handleStatusChange(bookingId, status) {
    try {
      await bookingsApi.updateStatus(bookingId, status);
      setBookings((prev) => prev.map((booking) => (booking.id === bookingId ? { ...booking, status } : booking)));
    } catch {
      setBookings((prev) => prev.map((booking) => (booking.id === bookingId ? { ...booking, status } : booking)));
    }
  }

  async function saveProfile() {
    if (!profile?.id) return;
    setSaving(true);
    try {
      await expertsApi.update(profile.id, {
        bio: form.bio,
        location: form.location,
        hourly_rate: parseFloat(form.hourly_rate) || 0,
        expertise_tags: form.expertise_tags.split(',').map((tag) => tag.trim()).filter(Boolean),
      });
      await refreshProfile();
      setEditMode(false);
    } finally {
      setSaving(false);
    }
  }

  function onAnswered(id, answer) {
    setAsyncQs((prev) => prev.map((item) => (item.id === id ? { ...item, status: 'answered', answer } : item)));
  }

  const pending = bookings.filter((b) => b.status === 'pending').length;
  const confirmed = bookings.filter((b) => b.status === 'confirmed').length;
  const completed = bookings.filter((b) => b.status === 'completed').length;
  const earnings = bookings
    .filter((b) => ['confirmed', 'completed'].includes(b.status))
    .reduce((sum, booking) => sum + (booking.total_price || 0), 0);
  const bookingViews = ['All', 'Pending', 'Confirmed', 'Completed', 'Rejected'];
  const filteredBookings = bookings.filter((booking) => {
    const matchesView = bookingView === 'All' || String(booking.status).toLowerCase() === bookingView.toLowerCase();
    const q = bookingQuery.trim().toLowerCase();
    const matchesQuery = !q ||
      String(booking.id).toLowerCase().includes(q) ||
      String(booking.business_name || booking.provider_name || '').toLowerCase().includes(q) ||
      String(booking.problem_description || '').toLowerCase().includes(q);
    return matchesView && matchesQuery;
  });

  return (
    <div className="flex min-h-screen bg-[var(--bg-base)]">
      <div className="flex-1 min-w-0">
        <Navbar />

        <main className="container-app py-8">
          <h1 className="mb-1">Expert Dashboard</h1>
          <p className="text-[var(--text-muted)] mb-6">Welcome back, {user?.name?.split(' ')[0] || 'Expert'}.</p>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            <StatCard label="Pending" value={pending} />
            <StatCard label="Confirmed" value={confirmed} />
            <StatCard label="Completed" value={completed} />
            <StatCard label="Earnings" value={`€${earnings}`} />
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
              {loadingB ? <p className="text-sm text-[var(--text-muted)]">Loading bookings...</p> : null}
              {(bookings ?? []).slice(0, 5).map((booking) => (
                <BookingCard key={booking.id} booking={booking} actorRole="expert" showActions onStatusChange={handleStatusChange} />
              ))}
            </div>
          )}

          {tab === 'Bookings' && (
            <div className="space-y-3">
              <div className="workspace-header rounded-[12px] p-3 mb-2">
                <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                  <div className="tabs-underline border-none">
                    {bookingViews.map((item) => (
                      <button key={item} onClick={() => setBookingView(item)} className={`tab-item ${bookingView === item ? 'active' : ''}`}>
                        {item}
                      </button>
                    ))}
                  </div>
                  <input
                    className="input"
                    placeholder="Search bookings..."
                    value={bookingQuery}
                    onChange={(e) => setBookingQuery(e.target.value)}
                  />
                </div>
              </div>
              {(filteredBookings ?? []).map((booking) => (
                <BookingCard key={booking.id} booking={booking} actorRole="expert" showActions onStatusChange={handleStatusChange} />
              ))}
              {!loadingB && filteredBookings.length === 0 ? <p className="text-sm text-[var(--text-muted)]">No bookings match current filters.</p> : null}
            </div>
          )}

          {tab === 'Async' && (
            <div className="space-y-3">
              {loadingA ? <p className="text-sm text-[var(--text-muted)]">Loading async items...</p> : null}
              {(asyncQs ?? []).map((item) => <AsyncAnswerCard key={item.id} item={item} onAnswered={onAnswered} />)}
            </div>
          )}

          {tab === 'Profile' && (
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[var(--text-primary)] font-medium">Profile</p>
                <button className="btn-secondary" onClick={() => setEditMode((v) => !v)}>{editMode ? 'Cancel' : 'Edit'}</button>
              </div>

              {editMode ? (
                <div className="space-y-3">
                  <div>
                    <label className="label">Bio</label>
                    <textarea className="input" value={form.bio} onChange={(e) => setForm((prev) => ({ ...prev, bio: e.target.value }))} />
                  </div>
                  <div>
                    <label className="label">Location</label>
                    <input className="input" value={form.location} onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))} />
                  </div>
                  <div>
                    <label className="label">Hourly rate</label>
                    <input type="number" className="input" value={form.hourly_rate} onChange={(e) => setForm((prev) => ({ ...prev, hourly_rate: e.target.value }))} />
                  </div>
                  <div>
                    <label className="label">Expertise tags (comma separated)</label>
                    <input className="input" value={form.expertise_tags} onChange={(e) => setForm((prev) => ({ ...prev, expertise_tags: e.target.value }))} />
                  </div>
                  <button className="btn-primary" onClick={saveProfile} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
                </div>
              ) : (
                <div className="space-y-2 text-sm">
                  <p><strong>Name:</strong> {profile?.name || user?.name}</p>
                  <p><strong>Location:</strong> {profile?.location || '-'}</p>
                  <p><strong>Rate:</strong> €{profile?.hourly_rate || 0}/hr</p>
                  <p><strong>Expertise:</strong> {(profile?.expertise_tags || []).join(', ') || '-'}</p>
                  <p><strong>Bio:</strong> {profile?.bio || '-'}</p>
                </div>
              )}
            </div>
          )}

          {tab === 'Availability' && (
            <div className="card p-5">
              <p className="text-[var(--text-primary)] font-medium mb-2">Availability</p>
              <p className="text-sm text-[var(--text-muted)] mb-4">Manage availability from profile settings. Booking flow will use the current availability map.</p>
              <button className="btn-secondary" onClick={() => setTab('Profile')}>Go to Profile</button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
